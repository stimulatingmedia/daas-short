#!/usr/bin/env node
/* QA contact sheet: captures the frame at each listed time and lays them out
   on one PNG (the sheet is composed in the browser, no image library needed).

   node scripts/keyframes.mjs [--times 0.5,2,4,...] [--out out/keyframes.png]
                              [--cols 6] [--skip-build] [--label]
   Default times sample every beat of every scene. */
import { build, preview } from 'vite';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = resolve(new URL('..', import.meta.url).pathname);
const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true] : [])).filter((x) => x.length));
const OUT = resolve(ROOT, args.out || 'out/keyframes.png');
const COLS = parseInt(args.cols || '6', 10);
/* --dist <dir> and --port <n> let several QA runs share one checkout (each builds
   and serves its own copy, so a build never clobbers a render in progress). */
const DIST = resolve(ROOT, args.dist || 'dist');
const PORT = parseInt(args.port || '4181', 10);
const DEFAULT_TIMES = [
  0, 0.6, 1.6, 3.2, 4.4, 6.5,            // S1 problem
  7, 7.6, 8.9, 10.2, 11.6, 13.5,         // S2 buried
  14, 14.7, 16.0, 17.2, 18.4, 20.5,      // S3 designers
  21, 21.7, 22.6, 23.4, 24.6, 26.5,      // S4 settle
  27.2, 27.5, 27.9, 28.6, 29.6, 30.4, 31.2, 31.6, 33, 34.5,  // S5 solution (cards one per beat 29.0–31.55, services from 31.55)
  35, 36.2, 39, 40.7, 41.4, 43, 45.5,    // S6 outcome
  46.3, 46.8, 47.6, 49.2, 50.6, 51.6, 52.8, 54.9, // S7 end card
];
const times = args.times ? String(args.times).split(',').map(Number) : DEFAULT_TIMES;

function loadPlaywright() {
  try { return require('playwright'); } catch { /* not local */ }
  return require(resolve(process.env.NODE_GLOBAL_ROOT || '/opt/node22/lib/node_modules', 'playwright'));
}

if (!args['skip-build']) { console.log('› vite build'); await build({ root: ROOT, logLevel: 'warn', build: { outDir: DIST, emptyOutDir: true } }); }
const server = await preview({ root: ROOT, build: { outDir: DIST }, preview: { port: PORT, strictPort: false, open: false }, logLevel: 'silent' });
const url = server.resolvedUrls.local[0] + '?render';
const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => window.__daas && window.__daas.ready);
await page.evaluate(() => window.__daas.ready);
const fps = await page.evaluate(() => window.__daas.fps);

const shots = [];
for (const t of times) {
  const tt = Math.round(t * fps) / fps;
  await page.evaluate((x) => window.__daas.seek(x), tt);
  const buf = await page.screenshot({ type: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: 1080, height: 1920 }, animations: 'disabled' });
  shots.push({ t: tt, f: Math.round(tt * fps), data: 'data:image/jpeg;base64,' + buf.toString('base64') });
  if (args.full) { // also keep each frame at full size for close inspection
    const dir = resolve(dirname(OUT), 'frames'); mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, `f${tt.toFixed(2)}.png`), await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 }, animations: 'disabled' }));
  }
  process.stdout.write(`\r  ${shots.length}/${times.length}  t=${tt.toFixed(2)}s   `);
}
process.stdout.write('\n');

// Compose the sheet in a second page.
const W = 270, H = 480, PAD = 10, LABEL = 26;
const rows = Math.ceil(shots.length / COLS);
const sheetW = COLS * (W + PAD) + PAD, sheetH = rows * (H + LABEL + PAD) + PAD;
const html = `<!doctype html><html><body style="margin:0;background:#111;font-family:system-ui;width:${sheetW}px;height:${sheetH}px;position:relative">
${shots.map((s, i) => { const x = PAD + (i % COLS) * (W + PAD), y = PAD + Math.floor(i / COLS) * (H + LABEL + PAD); return `<div style="position:absolute;left:${x}px;top:${y}px;width:${W}px"><img src="${s.data}" style="width:${W}px;height:${H}px;display:block"><div style="color:#ddd;font-size:14px;line-height:${LABEL}px;text-align:center">${s.t.toFixed(2)}s · f${s.f}</div></div>`; }).join('')}
</body></html>`;
const sheet = await browser.newPage({ viewport: { width: sheetW, height: sheetH }, deviceScaleFactor: 1 });
await sheet.setContent(html, { waitUntil: 'load' });
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, await sheet.screenshot({ type: 'png', fullPage: true }));
console.log(`✓ ${OUT}  (${shots.length} frames)`);
if (errors.length) { console.log('! page errors:'); errors.forEach((e) => console.log('  ' + e)); }
await browser.close();
await server.close();
process.exit(errors.length ? 1 : 0);

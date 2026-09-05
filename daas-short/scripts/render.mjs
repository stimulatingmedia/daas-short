#!/usr/bin/env node
/* Headless render: builds the app, serves dist/, opens it in Chromium at
   1080 x 1920 with ?render, steps the playhead one frame at a time through
   window.__daas.seek(t), and pipes each PNG frame into ffmpeg (libx264,
   yuv420p, faststart) — the file every social platform accepts.

   node scripts/render.mjs [--out out/daas-short.mp4] [--start 0] [--end 59]
                           [--crf 18] [--skip-build] [--poster out/poster.png]
   About 2–3 minutes for the full 59s cut on a laptop. */
import { build, preview } from 'vite';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = resolve(new URL('..', import.meta.url).pathname);
const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true] : [])).filter((x) => x.length));

const OUT = resolve(ROOT, args.out || 'out/daas-short-1080x1920.mp4');
const POSTER = resolve(ROOT, args.poster || 'out/poster.png');
const CRF = args.crf || '18';

function loadPlaywright() {
  try { return require('playwright'); } catch { /* not local */ }
  return require(resolve(process.env.NODE_GLOBAL_ROOT || '/opt/node22/lib/node_modules', 'playwright'));
}
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

if (!args['skip-build']) { console.log('› vite build'); await build({ root: ROOT, logLevel: 'warn' }); }
const server = await preview({ root: ROOT, preview: { port: 4180, strictPort: false, open: false }, logLevel: 'silent' });
const url = server.resolvedUrls.local[0] + '?render';

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => { console.error('page error:', e.message); });
page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => window.__daas && window.__daas.ready);
await page.evaluate(() => window.__daas.ready);
const { duration, fps } = await page.evaluate(() => ({ duration: window.__daas.duration, fps: window.__daas.fps }));

const start = Math.max(0, parseFloat(args.start ?? 0));
const end = Math.min(duration, parseFloat(args.end ?? duration));
const first = Math.round(start * fps), last = Math.round(end * fps); // [first, last)
const total = last - first;
console.log(`› rendering ${total} frames @ ${fps}fps (${start}s → ${end}s) → ${OUT}`);

mkdirSync(dirname(OUT), { recursive: true });
const ff = spawn(ffmpegPath, [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2',
  '-r', String(fps), '-movflags', '+faststart', OUT,
], { stdio: ['pipe', 'inherit', 'inherit'] });
const ffDone = new Promise((res, rej) => ff.on('close', (code) => (code === 0 ? res() : rej(new Error('ffmpeg exited ' + code)))));
const write = (buf) => new Promise((res) => (ff.stdin.write(buf) ? res() : ff.stdin.once('drain', res)));

const t0 = Date.now();
for (let f = first; f < last; f++) {
  const t = f / fps;
  await page.evaluate((tt) => window.__daas.seek(tt), t);
  const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 }, animations: 'disabled', caret: 'hide' });
  if (f === first) { mkdirSync(dirname(POSTER), { recursive: true }); writeFileSync(POSTER, png); }
  await write(png);
  if ((f - first) % Math.max(1, Math.round(fps)) === 0) {
    const done = f - first, rate = done / ((Date.now() - t0) / 1000 || 1);
    process.stdout.write(`\r  frame ${String(done).padStart(5)} / ${total}  (${t.toFixed(2)}s)  ${rate.toFixed(1)} fps   `);
  }
}
ff.stdin.end();
await ffDone;
process.stdout.write('\n');
console.log(`✓ ${OUT}\n✓ ${POSTER}\n  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
await browser.close();
await server.close();

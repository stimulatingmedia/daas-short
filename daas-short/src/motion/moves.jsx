/* Signature moves and primitives, time-driven. Each component reads the scene
   clock (useLocal().t, seconds since the scene started) and takes `at` — the
   scene-local time its move begins. Every duration, distance and curve is a
   token from ./tokens.js. Nothing here uses CSS animations or transitions:
   a frame is a pure function of t, which is what makes headless rendering
   exact. Spec: github.com/stimulatingmedia/motiondesign/MOTION-SPEC.md */
import React from 'react';
import { Sprite, useLocal, useTime } from '../engine/timeline.jsx';
import { T, D, E, SCALE, DEPTH, GLASS, delay, prog, lin, clamp01 } from './tokens.js';
import { C, FONT, TRACK, RADIUS, SHADOW } from '../brand/palette.js';
import { A } from '../brand/assets.js';
import { GLYPH } from '../brand/glyphs.js';
import { LOCKUP, LOCKUP_VIEWBOX, MARK_VIEWBOX, BLAST_SMALL, BLAST_LARGE } from '../brand/lockup.js';

/* Deterministic pseudo-random for stable scatter (same value every frame). */
export const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/* ── Scene ──────────────────────────────────────────────────────────────────
   A time window with a background that never moves and content that exits
   TOGETHER (principle 3: exits never stagger; principle 2: exits rise).
   exitAt is scene-local; by default the content leaves as the cloud band
   starts to rise, so it is gone before the band reaches it. */
export function Scene({ start, end, bg, exitAt, children }) {
  const dur = end - start;
  const ex = exitAt == null ? dur - T.reveal * 0.55 : exitAt;
  return (
    <Sprite start={start} end={end}>
      {({ t }) => {
        const p = prog(t, ex, T.exit, E.exit);
        return (
          <React.Fragment>
            {bg}
            <div style={{ position: 'absolute', inset: 0, opacity: 1 - p, transform: `translateY(${-p * D.riseSm}px)` }}>{children}</div>
          </React.Fragment>
        );
      }}
    </Sprite>
  );
}

export function Fill({ color, style }) {
  return <div style={{ position: 'absolute', inset: 0, background: color, ...style }} />;
}

/* ── Launch Rise ────────────────────────────────────────────────────────────
   The one entrance idiom: fade 0 -> 1 while rising `travel` px on `ease`
   over `dur`. Opacity always runs on glide so an overshoot curve on the
   position never pushes opacity past 1. `scaleFrom` < 1 adds the pop origin
   (props and the spring landing). Positioned absolutely at (x, y); `align`
   centers on x. */
export function Rise({
  at = 0, dur = T.enter, travel = D.rise, ease = E.glide, scaleFrom = 1,
  x = 540, y = 0, w, align = 'center', origin = 'center top', style, children, hold = true,
}) {
  const { t } = useLocal();
  if (t < at && !hold) return null;
  const u = clamp01((t - at) / dur);
  const py = ease(u), po = E.glide(u);
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  const s = scaleFrom + (1 - scaleFrom) * py;
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w,
      transform: `translate(${tx}, ${(1 - py) * travel}px) scale(${s})`, transformOrigin: origin,
      opacity: po, ...style,
    }}>{children}</div>
  );
}

/* ── Eyebrow ─────────────────────────────────────────────────────────────────
   Uppercase Montserrat Bold, 0.14em tracking. Rises rise-sm on glide. */
export function Eyebrow({ at, y, text, color = C.orange, size = 30, x = 540, align = 'center', rule = false }) {
  return (
    <Rise at={at} y={y} x={x} align={align} travel={D.riseSm} w={960}>
      <div style={{ display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', alignItems: 'center', gap: 18, fontFamily: FONT.display, fontWeight: 700, fontSize: size, letterSpacing: TRACK.overline, textTransform: 'uppercase', color, whiteSpace: 'nowrap' }}>
        {rule && <span style={{ width: 44, height: 4, borderRadius: 2, background: color }} />}
        {text}
      </div>
    </Rise>
  );
}

/* ── Kinetic Type ────────────────────────────────────────────────────────────
   The social-video headline: huge extra-bold lines rise line by line (never
   letter by letter) at the hero cadence (80ms, capped 400ms), rise-lg travel.
   Display type at this size is a graphic, so Expressive lands it on the
   spring; pass ease={E.glide} for a dead stop. `accent` colors one line. */
export function Kinetic({ at, y, lines, size = 76, color = C.navy, weight = 800, lh = 1.04, w = 960, ls = TRACK.tight, accent, ease = E.spring, travel = D.riseLg, align = 'center', x = 540 }) {
  const { t } = useLocal();
  const tx = align === 'center' ? '-50%' : '0';
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, transform: `translateX(${tx})`, textAlign: align, fontFamily: FONT.display, fontWeight: weight, fontSize: size, lineHeight: lh, letterSpacing: ls, color, textWrap: 'balance' }}>
      {lines.map((line, i) => {
        const u = clamp01((t - at - delay(i)) / T.enter);
        const py = ease(u), po = E.glide(u);
        return (
          <div key={i} style={{ transform: `translateY(${(1 - py) * travel}px)`, opacity: po, color: accent && accent.line === i ? accent.color : undefined, whiteSpace: 'nowrap' }}>{line}</div>
        );
      })}
    </div>
  );
}

/* ── Word rise ───────────────────────────────────────────────────────────────
   A sentence that lands word by word (the sanctioned unit of motion; the
   typewriter is banned). `segs` are chunks separated by a `pause` beat — the
   three-phrase build Ben asked for on the end card. The full sentence is in
   the layout from frame one (untyped words are just transparent), so nothing
   reflows while it builds. Returns its own landing time via onDone math:
   landing = at + sum(chunkDur + pause). */
export function wordRiseLanding(segs, pause = T.beat) {
  let tt = 0;
  segs.forEach((s, k) => { const n = s.trim().split(/\s+/).length; tt += delay(n - 1) + T.enter; if (k < segs.length - 1) tt += pause; });
  return tt;
}
export function WordRise({ at, y, segs, pause = T.beat, size = 52, color = C.navy, weight = 700, lh = 1.24, w = 880, font = FONT.display, ls = TRACK.tight, x = 540, travel = D.rise, ease = E.glide, align = 'center' }) {
  const { t } = useLocal();
  const words = [];
  let chunkStart = at;
  segs.forEach((seg, k) => {
    const ws = seg.trim().split(/\s+/);
    ws.forEach((wd, i) => words.push({ wd, start: chunkStart + delay(i) }));
    chunkStart += delay(ws.length - 1) + T.enter + (k < segs.length - 1 ? pause : 0);
  });
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, transform: align === 'center' ? 'translateX(-50%)' : 'none', textAlign: align, fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: lh, letterSpacing: ls, color }}>
      {words.map((wd, i) => {
        const u = clamp01((t - wd.start) / T.enter);
        return (
          <React.Fragment key={i}>
            <span style={{ display: 'inline-block', opacity: E.glide(u), transform: `translateY(${(1 - ease(u)) * travel}px)` }}>{wd.wd}</span>
            {i < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Marker (Caveat label) ───────────────────────────────────────────────────
   The hand-drawn aside. A marker does not fade in: the label WIPES left to
   right at full opacity (clip-path) on glide over fill. */
export function Marker({ at, x, y, text, size = 54, color = C.green, rot = -3, align = 'center', w, dur = T.fill, lh = 1.1, weight = 600 }) {
  const { t } = useLocal();
  if (t < at) return null;
  const p = prog(t, at, dur, E.glide);
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w,
      transform: `translateX(${tx}) rotate(${rot}deg)`, transformOrigin: align === 'center' ? 'center' : 'left center',
      // script glyphs overhang their advance box, so the wipe window is padded and dropped entirely once complete
      clipPath: p >= 1 ? 'none' : `inset(-0.3em calc(${(1 - p) * 100}% - 0.35em) -0.4em -0.15em)`,
      fontFamily: FONT.hand, fontWeight: weight, fontSize: size, color, lineHeight: lh, whiteSpace: w ? 'normal' : 'nowrap', textAlign: align === 'center' ? 'center' : 'left',
    }}>{text}</div>
  );
}

/* ── Connector (dashed draw-on) ─────────────────────────────────────────────
   A hand-drawn dashed connector from a marker to its subject. The SOLID pen
   path draws on inside a mask that reveals a STATIC dashed path, so the dash
   pattern never crawls. `draw` curve over `fill`. Full-frame SVG overlay. */
export function Connector({ at, d, color = C.navy, dur = T.fill, width = 3, dash = '8 7', arrow = false }) {
  const { t } = useLocal();
  const id = React.useId().replace(/:/g, '');
  if (t < at) return null;
  const p = prog(t, at, dur, E.draw);
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, pointerEvents: 'none', overflow: 'visible' }}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">
          <path d={d} fill="none" stroke="#fff" strokeWidth={width * 3} strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} />
        </mask>
      </defs>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} mask={`url(#${id})`} />
      {arrow && <ArrowHead d={d} color={color} width={width} p={p} />}
    </svg>
  );
}
/* Arrow head that pops (launch, fast) once the connector has drawn 92%. */
function ArrowHead({ d, color, width, p }) {
  const ref = React.useRef(null);
  const [end, setEnd] = React.useState(null);
  React.useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const L = el.getTotalLength(); const a = el.getPointAtLength(L), b = el.getPointAtLength(Math.max(0, L - 6));
    setEnd({ x: a.x, y: a.y, ang: (Math.atan2(a.y - b.y, a.x - b.x) * 180) / Math.PI });
  }, [d]);
  const s = E.launch(clamp01((p - 0.92) / 0.08));
  return (
    <g>
      <path ref={ref} d={d} fill="none" stroke="none" />
      {end && <path d="M-16 -11 L0 0 L-16 11" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${end.x} ${end.y}) rotate(${end.ang}) scale(${0.6 + 0.4 * s})`} opacity={s} />}
    </g>
  );
}

/* ── Counter ─────────────────────────────────────────────────────────────────
   Digits count on glide over `count` and stop dead at the value. */
export function useCount(at, to, { from = 0, dur = T.count } = {}) {
  const { t } = useLocal();
  return from + (to - from) * prog(t, at, dur, E.glide);
}
export const fmtMoney = (v) => '$' + Math.round(v).toLocaleString('en-US');

/* ── Progress fill ──────────────────────────────────────────────────────────
   A bar is a scaleX (label outside the scaled element), glide over fill. */
export function fillProgress(t, at, dur = T.fill) { return prog(t, at, dur, E.glide); }

/* ── Sparkle field ──────────────────────────────────────────────────────────
   The constellation of + marks and hollow rings in light Royal Dark Ube,
   at uneven resting opacities (near / mid / far). Nodes POP in last, after
   the headline lands (launch, 120ms, 30ms apart). At most three twinkle, on
   6-12s cycles, opacity only. Never over text: place nodes off to the sides.
   twinkle=false on end cards (nothing moves on an end card). */
export function Sparkles({ at = 0, nodes, color = C.ube50, seed = 0, twinkle = true, maxLit = 3 }) {
  const { t } = useLocal();
  const time = useTime();
  const lit = nodes.map((_, i) => i).filter((i) => rnd(seed + i * 7) > 0.5).slice(0, maxLit);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {nodes.map((n, i) => {
        const pop = E.launch(clamp01((t - at - i * 0.03) / T.fast));
        let o = n.rest ?? 0.35;
        if (twinkle && lit.includes(i)) {
          const cycle = 6 + rnd(seed + i * 13) * 6, phase = rnd(seed + i * 29) * cycle;
          const u = ((time + phase) % cycle) / cycle; // 0..1 over the cycle
          const swing = E.standard(1 - Math.abs(u * 2 - 1)); // rest -> 1 -> rest
          o = o + (1 - o) * swing;
        }
        const s = n.size ?? 16;
        return (
          <div key={i} style={{ position: 'absolute', left: n.x, top: n.y, width: s, height: s, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * pop})`, opacity: o * pop }}>
            {n.kind === 'ring'
              ? <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: `${Math.max(2, s * 0.14)}px solid ${color}` }} />
              : <React.Fragment>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: Math.max(2, s * 0.16), marginTop: -Math.max(1, s * 0.08), background: color, borderRadius: 2 }} />
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: Math.max(2, s * 0.16), marginLeft: -Math.max(1, s * 0.08), background: color, borderRadius: 2 }} />
                </React.Fragment>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Deep Space Blue backdrop ───────────────────────────────────────────────
   gradient-sky as a radial, a static starfield (three stars twinkle slowly),
   the dark cloud ceiling, and the brand's scalloped cloud band resting at the
   bottom of the frame: whatever sits above it is already in flight. */
export function DarkBg({ ceiling = false, footer = true, stars = 56, seed = 0 }) {
  const time = useTime();
  const pts = [];
  for (let i = 0; i < stars; i++) {
    const r = 1.2 + rnd(i + seed + 7) * 2.2;
    let o = 0.25 + rnd(i + seed + 3) * 0.5;
    if (i < 3) { const cycle = 6 + rnd(i + seed) * 6; const u = ((time + rnd(i) * cycle) % cycle) / cycle; o = o + (1 - o) * E.standard(1 - Math.abs(u * 2 - 1)); }
    pts.push(<circle key={i} cx={rnd(i + seed) * 1080} cy={rnd(i + seed + 99) * 1700} r={r} fill={C.ice} opacity={o} />);
  }
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(125% 75% at 50% 16%, ${C.sky3} 0%, ${C.sky2} 46%, ${C.sky1} 100%)` }} />
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>{pts}</svg>
      {/* The ceiling: the brand's Deep Space Blue cloud band (a footer shape) flipped so its scallops hang ~150px into the frame. */}
      {ceiling && <img src={A.cloudsNavy} alt="" style={{ position: 'absolute', top: -(838 - 150), left: 0, width: 1080, height: 838, transform: 'scaleY(-1)' }} />}
      {footer && <img src={A.cloudFooter} alt="" style={{ position: 'absolute', bottom: -2, left: 0, width: '100%' }} />}
    </div>
  );
}

/* ── Cloud Band Reveal ──────────────────────────────────────────────────────
   The scene transition. A sheet carrying the INCOMING background rises into
   the frame on thrust over reveal; its top edge is the scalloped cloud band
   (cloud-footer.svg as a mask), a Platinum Ice trail lags four frames behind.
   The incoming background is counter-translated so on screen it never moves:
   only the band does. Placed at the top level, windowed to [at - reveal, at].
   One wipe per six seconds; never combined with a zoom. */
const BAND_H = 540; // cloud-footer.svg is 800 x 400 -> 1080 x 540; the scallops fill its lower ~230px
/* Two mask layers (added): the scalloped SVG strip at the top, a solid fill below it. Longhands, prefixed, so Chromium applies them. */
const sheetMask = {
  WebkitMaskImage: `url(${A.cloudFooter}), linear-gradient(#000, #000)`, maskImage: `url(${A.cloudFooter}), linear-gradient(#000, #000)`,
  WebkitMaskSize: `1080px ${BAND_H}px, 100% calc(100% - ${BAND_H}px)`, maskSize: `1080px ${BAND_H}px, 100% calc(100% - ${BAND_H}px)`,
  WebkitMaskPosition: `top center, 0 ${BAND_H}px`, maskPosition: `top center, 0 ${BAND_H}px`,
  WebkitMaskRepeat: 'no-repeat, no-repeat', maskRepeat: 'no-repeat, no-repeat',
};
const trailMask = {
  WebkitMaskImage: `url(${A.cloudFooter})`, maskImage: `url(${A.cloudFooter})`,
  WebkitMaskSize: `1080px ${BAND_H}px`, maskSize: `1080px ${BAND_H}px`,
  WebkitMaskPosition: 'top center', maskPosition: 'top center',
  WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
};
export function CloudWipe({ at, bg }) {
  return (
    <Sprite start={at - T.reveal} end={at}>
      {({ t }) => {
        const p = E.thrust(clamp01(t / T.reveal));
        const pt = E.thrust(clamp01((t - 0.133) / T.reveal));
        const total = 1920 + BAND_H;
        const yMain = total * (1 - p), yTrail = total * (1 - pt);
        return (
          <React.Fragment>
            <div style={{ position: 'absolute', left: 0, top: -BAND_H, width: 1080, height: total, transform: `translateY(${yMain}px)`, ...sheetMask }}>
              <div style={{ position: 'absolute', left: 0, top: BAND_H, width: 1080, height: 1920, transform: `translateY(${-yMain}px)`, overflow: 'hidden' }}>{bg}</div>
            </div>
            {/* The trail: a Platinum Ice rim ~90px deep behind the edge (the scallops sit at 310–400px of the 540px band), fading out below. */}
            <div style={{ position: 'absolute', left: 0, top: -BAND_H, width: 1080, height: BAND_H, transform: `translateY(${yTrail}px)`, background: `linear-gradient(to bottom, ${C.ice} 0px, ${C.ice} 400px, rgba(221,230,240,0) 480px)`, opacity: 0.4, pointerEvents: 'none', ...trailMask }} />
          </React.Fragment>
        );
      }}
    </Sprite>
  );
}

/* ── Rocket mark (the sting parts) ─────────────────────────────────────────
   The S mark split into its animated parts: body (ink), small blast (always
   lit), boost (the large blast fill, swells up from the nozzle on spring) and
   flame (the large blast's Stimulating Green outline, draws on). Pass the
   progress of each part; the caller owns the timing so the same mark serves
   the blast-off in the Solution scene and the end-card sting. */
export function Mark({ width = 110, ink = C.white, flame = 1, boost = 1, style }) {
  const h = width * (162.15 / 70);
  return (
    <svg viewBox={MARK_VIEWBOX} width={width} height={h} style={{ display: 'block', overflow: 'visible', ...style }}>
      <path d={LOCKUP.body} fill={ink} />
      <path d={LOCKUP.blast} fill={BLAST_SMALL} />
      <path d={LOCKUP.boost} fill={BLAST_LARGE} opacity={boost} style={{ transformBox: 'fill-box', transformOrigin: '50% 0%', transform: `scale(${0.7 + 0.3 * boost}, ${0.4 + 0.6 * boost})` }} />
      <path d={LOCKUP.boost} fill="none" stroke={C.green} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - flame} opacity={flame > 0 ? 1 : 0} />
    </svg>
  );
}

/* ── Rocket Sting (full lockup) ─────────────────────────────────────────────
   The logo animation, and nothing around it. Expressive timeline (s from at):
   mark rises rise-xl on settle over enter (0.546); flame draws (draw over
   fill) from 40% of the rise; boost swells on spring from enter*0.4 +
   fill*0.35; the wordmark wipes left to right on glide over fill once the
   mark lands. Core complete at count (1.56s). Then it holds. */
export function Sting({ at, x = 540, y, width = 760, ink = C.cream }) {
  const { t } = useLocal();
  const h = width / (736.71 / 162.15);
  const u = clamp01((t - at) / T.enter);
  const rise = E.settle(u), fade = E.glide(u);
  const flame = prog(t, at + T.enter * 0.4, T.fill, E.draw);
  const boost = prog(t, at + T.enter * 0.4 + T.fill * 0.35, T.fill, E.spring);
  const wipe = prog(t, at + T.enter, T.fill, E.glide);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: h, transform: 'translateX(-50%)' }}>
      <svg viewBox={LOCKUP_VIEWBOX} width={width} height={h} style={{ display: 'block', overflow: 'visible' }}>
        <g style={{ transform: `translateY(${((1 - rise) * D.riseXl) / (width / 736.71)}px)`, opacity: fade }}>
          <path d={LOCKUP.body} fill={ink} />
          <path d={LOCKUP.blast} fill={BLAST_SMALL} />
          <path d={LOCKUP.boost} fill={BLAST_LARGE} opacity={boost} style={{ transformBox: 'fill-box', transformOrigin: '50% 0%', transform: `scale(${0.7 + 0.3 * boost}, ${0.4 + 0.6 * boost})` }} />
          <path d={LOCKUP.boost} fill="none" stroke={C.green} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - flame} />
        </g>
        <path d={LOCKUP.wordmark} fill={ink} style={{ clipPath: `inset(-5% ${(1 - wipe) * 100}% -5% 0)` }} />
      </svg>
    </div>
  );
}
export const STING_CORE = T.count;

/* ── Glass surface ───────────────────────────────────────────────────────────
   The reference's material: frosted cards floating over a soft gradient. The
   spec's Glass surface: 16px frost at 62% white (light) or 72% navy (dark), a
   hairline light edge, an inset top highlight, a navy-tinted shadow (never warm
   black). Blur is a surface property, not motion: it never animates and never
   sits inside a blurred Depth Field layer (a filtered layer is a backdrop root,
   so the frost would sample nothing). <Glass> adds the reference's sheen: a
   soft light sweep from the top-left corner, painted under the content. */
export const tint = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`; };
const frost = `blur(${GLASS.blur}px) saturate(1.2)`;
export const glassLight = {
  background: tint('#ffffff', GLASS.alpha),
  border: '1px solid rgba(255, 255, 255, 0.7)',
  boxShadow: `${SHADOW.lg}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
  backdropFilter: frost, WebkitBackdropFilter: frost,
  borderRadius: RADIUS.xl, color: C.navy,
};
export const glassDark = {
  background: tint(C.navy, GLASS.alphaDark),
  border: `1px solid ${tint(C.ice, 0.22)}`,
  boxShadow: `0 18px 48px ${tint(C.navy, 0.28)}, inset 0 1px 0 ${tint(C.ice, 0.18)}`,
  backdropFilter: frost, WebkitBackdropFilter: frost,
  borderRadius: RADIUS.lg, color: C.white,
};
/* Capsules: the same material at pill radius (role chips, task pills, the URL). */
export const glassPill = { ...glassLight, borderRadius: RADIUS.pill };
export const glassPillDark = { ...glassDark, borderRadius: RADIUS.pill };
/* Kept for the collage scenes that have not moved to glass. */
export const cardLight = {
  background: C.paper, border: `1.5px solid ${C.ice}`, borderRadius: RADIUS.xl, boxShadow: SHADOW.lg,
};
const SHEEN = {
  light: 'linear-gradient(155deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.18) 38%, rgba(255,255,255,0) 62%)',
  dark: `linear-gradient(155deg, ${tint(C.ice, 0.16)} 0%, ${tint(C.ice, 0.05)} 40%, ${tint(C.ice, 0)} 65%)`,
};
export function Glass({ dark = false, pill = false, sheen = true, style, children }) {
  const base = dark ? (pill ? glassPillDark : glassDark) : (pill ? glassPill : glassLight);
  return (
    <div style={{ position: 'relative', isolation: 'isolate', ...base, ...style }}>
      {sheen && <div style={{ position: 'absolute', inset: 0, zIndex: -1, borderRadius: 'inherit', background: dark ? SHEEN.dark : SHEEN.light, pointerEvents: 'none' }} />}
      {children}
    </div>
  );
}

/* ── Glow ───────────────────────────────────────────────────────────────────
   The soft gradient the reference floats its glass over. A large radial orb in
   one brand hue at low alpha, placed BEHIND glass so the frost has something to
   sample (on a flat illustration ground a glass card would otherwise read as a
   tinted card). Static; it fades up with the scene's default entrance. */
export function Glow({ at = 0, x, y, r = 300, color = C.nebula, alpha = 0.32 }) {
  const { t } = useLocal();
  const op = E.glide(clamp01((t - at) / T.enter));
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, transform: 'translate(-50%,-50%)', borderRadius: '50%',
      background: `radial-gradient(circle, ${tint(color, alpha)} 0%, ${tint(color, alpha * 0.45)} 38%, ${tint(color, 0)} 72%)`,
      opacity: op, pointerEvents: 'none',
    }} />
  );
}

/* ── Pose (Depth Field) ─────────────────────────────────────────────────────
   The reference's cards are tilted in perspective. In Expressive the field
   holds a static 12° pose: rotateX(+tilt) rotateY(−tilt) under a 1200px
   perspective. `layer` scales the tilt (front 1, mid 0.75, back 0.5) and, for
   the far layers, adds the depth cues: larger, dimmer, blurred. Copy stays on
   the front layer, so blur never touches text being read. A pose, never a wobble. */
export function Pose({ layer = 'front', x = 0, y = 0, w = 1080, h = 1920, origin = '50% 50%', style, children }) {
  const rate = DEPTH.rate[layer] ?? 1;
  const far = layer !== 'front';
  const scale = layer === 'back' ? DEPTH.scaleBack : layer === 'mid' ? DEPTH.scaleMid : 1;
  const blur = layer === 'back' ? DEPTH.blurBack : layer === 'mid' ? DEPTH.blurMid : 0;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, perspective: DEPTH.perspective, perspectiveOrigin: origin, pointerEvents: 'none', ...style }}>
      <div style={{
        position: 'absolute', inset: 0, transformOrigin: origin,
        transform: `scale(${scale}) rotateX(${DEPTH.tilt * rate}deg) rotateY(${-DEPTH.tilt * rate}deg)`,
        filter: far && blur ? `blur(${blur}px)` : 'none', opacity: layer === 'back' ? 0.75 : 1,
      }}>{children}</div>
    </div>
  );
}

/* ── Icon tile + glyph ──────────────────────────────────────────────────────
   The reference's rounded-square icon tiles. A lit tile is Nebula Blue on
   navy glass (the .sm-glass__dot.is-on idiom), the glyph a 2.2 stroke with
   round caps. The tile POPS on launch over fast (the icon-swap timing),
   scale 0.6 → 1 with opacity, once its card has landed. */
export function Glyph({ name, size = 30, color = C.navy, stroke = 2.2 }) {
  const d = GLYPH[name] || [];
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
      {d.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}
export function IconTile({ name, at, size = 56, radius = 16, tone = 'nebula', style }) {
  const { t } = useLocal();
  const pop = at == null ? 1 : E.launch(clamp01((t - at) / T.fast));
  const lit = tone === 'nebula';
  const bg = lit ? tint(C.nebula, 0.16) : tone === 'green' ? tint(C.green, 0.16) : tone === 'ube' ? tint(C.ube, 0.12) : tint(C.navy, 0.06);
  const edge = lit ? tint(C.nebula, 0.42) : tone === 'green' ? tint(C.green, 0.5) : tone === 'ube' ? tint(C.ube, 0.35) : tint(C.navy, 0.14);
  const ink = lit ? C.nebula : tone === 'green' ? C.green : tone === 'ube' ? C.ube : C.navy;
  return (
    <div style={{
      flex: 'none', width: size, height: size, borderRadius: radius, background: bg, border: `1px solid ${edge}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transform: `scale(${0.6 + 0.4 * pop})`, opacity: pop, ...style,
    }}>
      <Glyph name={name} size={Math.round(size * 0.52)} color={ink} />
    </div>
  );
}

/* Ambient bob for floating props after they land (Depth Field): 12px on a
   slow 6s-each-way cycle, standard ease, frozen until `from`. */
export function bob(time, from, amp = 12, halfCycle = 6) {
  if (time < from) return 0;
  const u = ((time - from) % (halfCycle * 2)) / halfCycle; // 0..2
  const k = u <= 1 ? u : 2 - u;
  return -amp * E.standard(k);
}

/* The Stimulating Media motion tokens, applied for video.
   Source of truth: vendor/sm-motion/tokens/motion.js (the numbers) and the
   spec at github.com/stimulatingmedia/motiondesign/MOTION-SPEC.md.

   Video runs the EXPRESSIVE profile: arrival durations x1.3, travel x2.5,
   ambient on, settle/spring unlocked on marks and props (never on running
   text). Everything here is derived from the tokens — no hand-typed ms/px.
   Times are converted to SECONDS because the timeline engine runs in s. */
import {
  easing, duration, distance, stagger as staggerTok, scale as scaleTok,
  applyProfile, exitDuration, fps as FPS_TOKEN, depth as depthTok, depthField as depthFieldTok, glass as glassTok,
} from '../../vendor/sm-motion/tokens/motion.js';
import { bezier } from './bezier.js';

export const PROFILE = 'expressive';
export const FPS = FPS_TOKEN; // 30. The duration ladder lands on whole frames at 30fps.

const dur = (token) => applyProfile(PROFILE, { durationMs: duration[token], token }).durationMs / 1000;
const px = (token) => applyProfile(PROFILE, { distancePx: distance[token], token }).distancePx;

/* Durations (s). Micro tier (fast/pop/base/drag) never scales; arrival tier does. */
export const T = {
  instant: 0,
  fast: dur('fast'),      // 0.12  press, icon swap, sparkle pop, check pop
  pop: dur('pop'),        // 0.18  popover
  base: dur('base'),      // 0.20  hover, scene background crossfade
  drag: dur('drag'),      // 0.26
  slow: dur('slow'),      // 0.468 in-place changes with travel (card flip)
  enter: dur('enter'),    // 0.546 Launch Rise, the default entrance
  fill: dur('fill'),      // 0.78  progress bars, marker draw-on, label wipe
  reveal: dur('reveal'),  // 1.04  cloud band, stat ring, chart draw, hero flight
  count: dur('count'),    // 1.56  counters, sting core, subject arrival
  exit: exitDuration(applyProfile(PROFILE, { durationMs: duration.enter, token: 'enter' }).durationMs) / 1000, // 0.328 = 0.6x enter
  exitFast: exitDuration(duration.base) / 1000, // 0.12
  beat: 0.4,              // the 12-frame beat grid (400ms): pauses between chunks, read holds
};

/* Distances (px on the 1080-wide comp). lift/nudge never scale. */
export const D = {
  lift: px('lift'),     // 2
  nudge: px('nudge'),   // 4
  riseSm: px('riseSm'), // 20  exits, eyebrows
  rise: px('rise'),     // 40  default Launch Rise: chips, cards, words
  riseLg: px('riseLg'), // 80  headline lines, deck builds
  riseXl: px('riseXl'), // 160 subjects, props, the sting mark
};

export const SCALE = { press: scaleTok.press, from: scaleTok.from, drag: scaleTok.drag, settle: scaleTok.settle };

/* Depth Field (the reference's floating glass world) in the Expressive profile:
   a STATIC pose, never a wobble. The front layer carries the full tilt, the
   middle three quarters, the back half; blur is a depth cue on far layers only. */
export const DEPTH = {
  perspective: depthTok.perspective,                       // 1200
  tilt: depthFieldTok.byProfile[PROFILE].tiltDeg,          // 12
  blurBack: depthFieldTok.byProfile[PROFILE].blurBackPx,   // 10
  blurMid: depthFieldTok.byProfile[PROFILE].blurMidPx,     // 3
  scaleBack: depthFieldTok.scaleBack,                      // 1.12
  scaleMid: depthFieldTok.scaleMid,                        // 1.04
  drift: depthFieldTok.driftPx,                            // 12
  rate: { back: 0.5, mid: 0.75, front: 1 },                // tilt rate by layer (sm-motion.css §20)
};

/* Glass surface material: frost 16px, 62% white (light) — navy glass runs 72%. */
export const GLASS = { blur: glassTok.blurPx, alpha: glassTok.alpha, alphaDark: 0.72 };

/* Stagger (s). One cadence per scene; every delay capped at 400ms with min(). */
export const CADENCE = { tight: staggerTok.tight / 1000, base: staggerTok.base / 1000, wide: staggerTok.wide / 1000 };
export const STAGGER_CAP = staggerTok.cap / 1000;
export const delay = (i, cadence = 'wide') => Math.min(i * CADENCE[cadence], STAGGER_CAP);

/* The nine curves as samplers f(x) -> y. */
const curve = (name) => bezier(...easing[name].bezier);
export const E = {
  launch: curve('launch'),     // UI entrances & state changes < 360ms; pops
  glide: curve('glide'),       // entrances >= 360ms, stagger sets, fills. The default.
  standard: curve('standard'), // in-place changes with no travel: color, opacity-only fades
  exit: curve('exit'),         // every exit, at 0.6x the entrance
  thrust: curve('thrust'),     // full-frame crossings only: the cloud band wipe
  draw: curve('draw'),         // stroke draw-on
  settle: curve('settle'),     // one 4.4% overshoot: the mark's landing (Expressive)
  spring: curve('spring'),     // ~10% overshoot: props, display type (Expressive only)
  linear: (t) => t,            // status loops
};

/* clamp + progress helpers */
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const clamp01 = (v) => clamp(v, 0, 1);
/* Eased progress of a move that starts at `start` and lasts `dur`, sampled at time t. */
export const prog = (t, start, dur, ease = E.glide) => (dur <= 0 ? (t >= start ? 1 : 0) : ease(clamp01((t - start) / dur)));
/* Linear (un-eased) progress. */
export const lin = (t, start, dur) => clamp01((t - start) / dur);

/* Frame helpers. Cuts land on whole frames. */
export const frames = (s) => Math.round(s * FPS);
export const snap = (s) => Math.round(s * FPS) / FPS;

/* Reading floor: 300ms + 200ms per word, video floor 1.2s. Returns seconds. */
export const readHold = (text) => Math.max(1.2, 0.3 + 0.2 * String(text).trim().split(/\s+/).length);

/* Stimulating Media — Motion tokens as data.
   The same numbers as tokens/motion.css, for JS animation libraries
   (Framer Motion, motion.dev, GSAP), Figma plugins, and AE scripting.
   Durations are milliseconds; distances are CSS pixels at 1x. */

export const easing = {
  launch:   { bezier: [0.22, 1, 0.36, 1],       css: 'cubic-bezier(0.22, 1, 0.36, 1)',       use: 'UI entrances and state changes under 360ms' },
  glide:    { bezier: [0.2, 0.7, 0.3, 1],       css: 'cubic-bezier(0.2, 0.7, 0.3, 1)',       use: 'entrances 360ms+, stagger sets, progress and ring fills' },
  standard: { bezier: [0.4, 0, 0.2, 1],         css: 'cubic-bezier(0.4, 0, 0.2, 1)',         use: 'in-place property changes with no travel' },
  exit:     { bezier: [0.5, 0, 0.85, 0.15],     css: 'cubic-bezier(0.5, 0, 0.85, 0.15)',     use: 'all exits, at 0.6x the entrance duration' },
  thrust:   { bezier: [0.7, 0, 0.2, 1],         css: 'cubic-bezier(0.7, 0, 0.2, 1)',         use: 'full-frame crossings only; never an entrance' },
  draw:     { bezier: [0.55, 0.05, 0.25, 1],    css: 'cubic-bezier(0.55, 0.05, 0.25, 1)',    use: 'stroke-dashoffset and AE Trim Paths' },
  settle:   { bezier: [0.2, 0.7, 0.3, 1.2],     css: 'cubic-bezier(0.2, 0.7, 0.3, 1.2)',     use: 'kanban drop and Expressive landings; ~4.4% overshoot', overshoot: 0.044 },
  spring:   { bezier: [0.34, 1.56, 0.64, 1],    css: 'cubic-bezier(0.34, 1.56, 0.64, 1)',    use: 'Expressive only: playful landings; ~10% overshoot', overshoot: 0.10 },
  linear:   { bezier: [0, 0, 1, 1],             css: 'linear',                               use: 'status loops' },
};

/* Base durations in ms. Frames are at 30fps, the video delivery rate. */
export const duration = {
  instant: 0, fast: 120, pop: 180, base: 200, drag: 260,
  slow: 360, enter: 420, fill: 600, reveal: 800, count: 1200, ambient: 8000,
};

export const frames30 = {
  instant: 0, fast: 4, pop: 5, base: 6, drag: 8,
  slow: 11, enter: 13, fill: 18, reveal: 24, count: 36,
};

/* Exits are computed, never authored: 0.6x the matching entrance. */
export const exitDuration = (enterMs) => Math.round(enterMs * 0.6);

export const distance = {
  lift: 2, nudge: 4, riseSm: 8, rise: 16, riseLg: 32, riseXl: 64,
};

export const scale = { press: 0.98, from: 0.96, drag: 1.04, settle: 1.04, magnetDip: 0.97 };

export const stagger = { tight: 30, base: 50, wide: 80, cap: 400 };

export const depth = { perspective: 1200, back: 0.25, mid: 0.5, front: 0.85, maxPx: 24, maxTiltDeg: 6 };

/* Depth Field compositions: far layers are larger, softer and dimmer.
   Blur is a depth cue on far layers only, never on text being read, and is
   0 in Crisp. Tilt is a static pose, not a wobble. Drift is the ambient bob. */
export const depthField = {
  scaleBack: 1.12, scaleMid: 1.04, driftPx: 12,
  byProfile: {
    crisp:      { blurBackPx: 0,  blurMidPx: 0, tiltDeg: 0 },
    fluid:      { blurBackPx: 6,  blurMidPx: 0, tiltDeg: 6 },
    expressive: { blurBackPx: 10, blurMidPx: 3, tiltDeg: 12 },
    still:      { blurBackPx: 0,  blurMidPx: 0, tiltDeg: 0 },
  },
};

export const glass = { blurPx: 16, alpha: 0.62 };

/* Springs for Framer Motion / motion.dev: { type: 'spring', ...springs.ui } */
export const springs = {
  ui:     { stiffness: 500, damping: 45, mass: 1,   dampingRatio: 1.01, overshoot: 0 },
  glide:  { stiffness: 300, damping: 30, mass: 1,   dampingRatio: 0.87, overshoot: 0.004 },
  drag:   { stiffness: 400, damping: 32, mass: 0.8, dampingRatio: 0.89, overshoot: 0.002 },
  hero:   { stiffness: 170, damping: 26, mass: 1.2, dampingRatio: 0.91, overshoot: 0.001 },
  settle: { stiffness: 340, damping: 26, mass: 1,   dampingRatio: 0.70, overshoot: 0.044 },
  pop:    { stiffness: 300, damping: 21, mass: 1,   dampingRatio: 0.61, overshoot: 0.091 },
};

/* Scalars only. Applying a profile means multiplying the arrival tier —
   never rewriting a token, never touching micro-timings or the 2px lift. */
export const profiles = {
  crisp:      { duration: 1,   distance: 1,   stagger: 1, ambient: 0, settle: false, defaultEase: 'glide',  use: 'client portal and product UI' },
  fluid:      { duration: 1.2, distance: 1.5, stagger: 1, ambient: 1, settle: false, defaultEase: 'glide',  use: 'marketing site and slide decks' },
  expressive: { duration: 1.3, distance: 2.5, stagger: 1, ambient: 1, settle: true,  defaultEase: 'glide',  use: 'social video, hero moments, brand film' },
  still:      { duration: 0.5, distance: 0,   stagger: 0, ambient: 0, settle: false, defaultEase: 'standard', use: 'reduced motion; auto under prefers-reduced-motion' },
};

/* After Effects keyframe values, derived from the beziers above.
   outgoing = first keyframe's Easy Ease influence/speed,
   incoming = last keyframe's. Speed is a percentage of average velocity. */
export const afterEffects = {
  launch:   { outgoing: { influence: 22, speed: 455 }, incoming: { influence: 64, speed: 0 } },
  glide:    { outgoing: { influence: 20, speed: 350 }, incoming: { influence: 70, speed: 0 } },
  standard: { outgoing: { influence: 40, speed: 0 },   incoming: { influence: 80, speed: 0 } },
  exit:     { outgoing: { influence: 50, speed: 0 },   incoming: { influence: 15, speed: 567 } },
  thrust:   { outgoing: { influence: 70, speed: 0 },   incoming: { influence: 80, speed: 0 } },
  draw:     { outgoing: { influence: 55, speed: 9 },   incoming: { influence: 75, speed: 0 } },
  /* settle and spring are three keyframes, not an expression:
     0% -> peak at 70% of the duration -> 100%. Peak is 104% (settle) or
     110% (spring) of the travel. */
  settle:   { keyframes: [0, 1.044, 1], peakAt: 0.7 },
  spring:   { keyframes: [0, 1.10, 1],  peakAt: 0.7 },
};

export const fps = 30;
export const msToFrames = (ms, rate = fps) => Math.round((ms / 1000) * rate);
export const framesToMs = (f, rate = fps) => Math.round((f / rate) * 1000);

/* Which tokens scale with the profile. Everything else is fixed. */
export const ARRIVAL_DURATIONS = ['slow', 'enter', 'fill', 'reveal', 'count']; /* ambient is governed by --sm-profile-ambient, not scaled */
export const SCALED_DISTANCES = ['riseSm', 'rise', 'riseLg', 'riseXl'];

/* Values tokens/motion.css pins in Still, regardless of the 0.5x scalar. */
const STILL_PINS = { slow: 200, enter: 200, fill: 200, reveal: 200, count: 0, drag: 120 };

/* Resolve a profile's applied value. Pass the token name so micro tiers stay
   fixed and Still matches the CSS exactly; without a name the value is
   treated as arrival tier (the pre-0.1 behaviour). */
export const applyProfile = (profileName, { durationMs, distancePx, token } = {}) => {
  const name = profiles[profileName] ? profileName : 'crisp';
  const p = profiles[name];
  const out = {};
  if (durationMs != null) {
    const scales = token == null || ARRIVAL_DURATIONS.includes(token);
    if (name === 'still') {
      out.durationMs = token in STILL_PINS ? STILL_PINS[token] : (scales ? Math.min(200, Math.round(durationMs * p.duration)) : durationMs);
    } else {
      out.durationMs = scales ? Math.round(durationMs * p.duration) : durationMs;
    }
  }
  if (distancePx != null) {
    const scales = token == null || SCALED_DISTANCES.includes(token);
    out.distancePx = scales ? Math.round(distancePx * p.distance) : (name === 'still' ? 0 : distancePx);
  }
  return out;
};

export default { easing, duration, frames30, exitDuration, distance, scale, stagger, depth, depthField, glass, springs, profiles, afterEffects, fps, msToFrames, framesToMs, applyProfile, ARRIVAL_DURATIONS, SCALED_DISTANCES };

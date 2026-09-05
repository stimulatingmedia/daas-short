/* Cubic-bezier solver (Newton with a bisection fallback), identical to the
   one in the motion runtime (sm-motion.js), so JS-driven frames share the
   CSS curves exactly. Returns f(x: 0..1) -> y. y may exceed 1 for the two
   overshoot curves (settle, spring); callers clamp opacity themselves. */
export function bezier(x1, y1, x2, y2) {
  const at = (a1, a2, t) => ((1 - 3 * a2 + 3 * a1) * t * t + (3 * a2 - 6 * a1) * t + 3 * a1) * t;
  const slope = (a1, a2, t) => 3 * (1 - 3 * a2 + 3 * a1) * t * t + 2 * (3 * a2 - 6 * a1) * t + 3 * a1;
  return function (x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = slope(x1, x2, t);
      if (Math.abs(d) < 1e-6) break;
      t -= (at(x1, x2, t) - x) / d;
    }
    if (t < 0 || t > 1 || Math.abs(at(x1, x2, t) - x) > 1e-4) {
      let lo = 0, hi = 1;
      for (let i = 0; i < 24; i++) { t = (lo + hi) / 2; if (at(x1, x2, t) < x) lo = t; else hi = t; }
    }
    return at(y1, y2, t);
  };
}

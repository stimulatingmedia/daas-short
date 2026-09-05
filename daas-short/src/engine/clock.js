/* External playhead store. The Stage subscribes with useSyncExternalStore;
   the headless renderer drives it through window.__daas.seek(t). Keeping the
   playhead outside React state means a seek is one synchronous write and one
   flushSync render, with nothing else (no rAF, no timers) in the loop. */
let time = 0;
const subs = new Set();
export const clock = {
  get: () => time,
  set: (t) => { time = t; subs.forEach((f) => f(time)); },
  subscribe: (f) => { subs.add(f); return () => subs.delete(f); },
};

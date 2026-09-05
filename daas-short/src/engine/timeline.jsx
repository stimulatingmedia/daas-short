/* Timeline engine: Stage (the comp), Sprite (a time window), and the preview
   PlaybackBar. Every frame is a pure function of the playhead, so the same
   tree renders live in the browser (rAF clock) and headlessly frame by frame
   (window.__daas.seek(t) writes the external clock; see main.jsx). */
import React from 'react';
import { clock } from './clock.js';
import { FPS, clamp } from '../motion/tokens.js';
import { C, FONT } from '../brand/palette.js';

export const TimelineContext = React.createContext({ time: 0, duration: 10, playing: false, fps: FPS });
export const useTime = () => React.useContext(TimelineContext).time;
export const useTimeline = () => React.useContext(TimelineContext);

/* ── Sprite ─────────────────────────────────────────────────────────────────
   Renders children while start <= time < end and provides the local clock:
   t (seconds since start), dur, start, end. Children may be a render fn. */
const SpriteContext = React.createContext({ t: 0, dur: 0, start: 0, end: 0, time: 0 });
export const useLocal = () => React.useContext(SpriteContext);

export function Sprite({ start = 0, end = Infinity, children }) {
  const { time } = useTimeline();
  if (time < start || time >= end) return null;
  const value = { t: time - start, dur: end - start, start, end, time };
  return (
    <SpriteContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </SpriteContext.Provider>
  );
}

/* ── Stage ──────────────────────────────────────────────────────────────────
   renderMode: no chrome, no clock of its own, scale 1 at (0,0) — the headless
   renderer drives the external clock. Otherwise: an rAF player that scales the
   comp to fit, with a transport bar, keyboard control and a persisted playhead. */
export function Stage({
  width = 1080, height = 1920, duration = 10, fps = FPS,
  background = C.white, renderMode = false, persistKey = 'sm-stage', markers = [], children,
}) {
  return renderMode
    ? <RenderStage width={width} height={height} duration={duration} fps={fps} background={background}>{children}</RenderStage>
    : <PlayerStage width={width} height={height} duration={duration} fps={fps} background={background} persistKey={persistKey} markers={markers}>{children}</PlayerStage>;
}

function RenderStage({ width, height, duration, fps, background, children }) {
  const time = React.useSyncExternalStore(clock.subscribe, clock.get, clock.get);
  const ctx = React.useMemo(() => ({ time, duration, playing: false, fps }), [time, duration, fps]);
  return (
    <div id="stage" style={{ position: 'absolute', left: 0, top: 0, width, height, background, overflow: 'hidden' }}>
      <TimelineContext.Provider value={ctx}>{children}</TimelineContext.Provider>
    </div>
  );
}

function PlayerStage({ width, height, duration, fps, background, persistKey, markers, children }) {
  const [time, setTime] = React.useState(() => {
    try { const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0'); return isFinite(v) ? clamp(v, 0, duration) : 0; } catch { return 0; }
  });
  const [playing, setPlaying] = React.useState(true);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);
  const [guides, setGuides] = React.useState(false);
  const wrapRef = React.useRef(null);
  const rafRef = React.useRef(0);
  const lastRef = React.useRef(null);

  React.useEffect(() => { try { localStorage.setItem(persistKey + ':t', String(time)); } catch { /* storage unavailable */ } }, [time, persistKey]);

  // Fit the comp to the viewport (minus the transport bar).
  React.useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const measure = () => setScale(Math.max(0.05, Math.min(el.clientWidth / width, (el.clientHeight - 56) / height)));
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  // The clock. Loops at the end so the end card's loop-safe frame can be checked.
  React.useEffect(() => {
    if (!playing) { lastRef.current = null; return; }
    const step = (ts) => {
      if (lastRef.current == null) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000; lastRef.current = ts;
      setTime((t) => { const n = t + dt; return n >= duration ? n % duration : n; });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(rafRef.current); lastRef.current = null; };
  }, [playing, duration]);

  // Keyboard: space play/pause · ←/→ one frame · shift+←/→ one second · 0/Home start · 1–9 jump to marker · g guides
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      const frame = 1 / fps;
      if (e.code === 'Space') { e.preventDefault(); setPlaying((p) => !p); }
      else if (e.code === 'ArrowLeft') { setPlaying(false); setTime((t) => clamp(Math.round((t - (e.shiftKey ? 1 : frame)) * fps) / fps, 0, duration - frame)); }
      else if (e.code === 'ArrowRight') { setPlaying(false); setTime((t) => clamp(Math.round((t + (e.shiftKey ? 1 : frame)) * fps) / fps, 0, duration - frame)); }
      else if (e.key === '0' || e.code === 'Home') setTime(0);
      else if (e.key === 'g') setGuides((g) => !g);
      else if (/^[1-9]$/.test(e.key) && markers[+e.key - 1]) setTime(markers[+e.key - 1].t);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration, fps, markers]);

  const shown = hoverTime != null ? hoverTime : time;
  const ctx = React.useMemo(() => ({ time: shown, duration, playing, fps }), [shown, duration, playing, fps]);

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0a0a0a', fontFamily: FONT.display }}> {/* palette-lint-ignore: preview chrome, outside the frame */}
      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minHeight: 0 }}>
        <div id="stage" style={{ width, height, background, position: 'relative', transform: `scale(${scale})`, transformOrigin: 'center', flexShrink: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          <TimelineContext.Provider value={ctx}>{children}</TimelineContext.Provider>
          {guides && <SafeZones width={width} height={height} />}
        </div>
      </div>
      <PlaybackBar
        time={shown} duration={duration} fps={fps} playing={playing} markers={markers}
        onPlayPause={() => setPlaying((p) => !p)}
        onReset={() => setTime(0)}
        onSeek={(t) => { setPlaying(false); setTime(t); }}
        onHover={setHoverTime}
        guides={guides} onGuides={() => setGuides((g) => !g)}
      />
    </div>
  );
}

/* Reels / TikTok / Shorts UI overlays (approximate, 2026 layouts): the right
   action column, the bottom caption stack, the top status strip. Toggle with g. */
function SafeZones({ width, height }) {
  const zone = (style, label) => (
    <div style={{ position: 'absolute', border: '2px dashed rgba(114,219,250,0.9)', background: 'rgba(114,219,250,0.10)', color: C.nebula, fontSize: 22, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: 8, ...style }}>{label}</div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {zone({ left: 0, right: 0, top: 0, height: 220 }, 'status / progress strip')}
      {zone({ right: 0, top: height * 0.52, width: 150, height: height * 0.32 }, 'actions')}
      {zone({ left: 0, right: 0, bottom: 0, height: height * 0.20 }, 'caption stack · 22% anchor above')}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1498, borderTop: `2px solid ${C.green}` }} />
    </div>
  );
}

/* ── Playback bar ───────────────────────────────────────────────────────── */
function PlaybackBar({ time, duration, fps, playing, markers, onPlayPause, onReset, onSeek, onHover, guides, onGuides }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const timeFromEvent = React.useCallback((e) => {
    const r = trackRef.current.getBoundingClientRect();
    return clamp((e.clientX - r.left) / r.width, 0, 1) * duration;
  }, [duration]);
  React.useEffect(() => {
    if (!dragging) return;
    const up = () => setDragging(false);
    const move = (e) => { if (trackRef.current) onSeek(timeFromEvent(e)); };
    window.addEventListener('mouseup', up); window.addEventListener('mousemove', move);
    return () => { window.removeEventListener('mouseup', up); window.removeEventListener('mousemove', move); };
  }, [dragging, timeFromEvent, onSeek]);

  const pct = duration > 0 ? (time / duration) * 100 : 0;
  const fmt = (t) => { const m = Math.floor(t / 60), s = Math.floor(t % 60), f = Math.floor((t * fps) % fps); return `${m}:${String(s).padStart(2, '0')}.${String(f).padStart(2, '0')}`; };
  const btn = { width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: C.white, cursor: 'pointer', padding: 0 };
  const mono = { fontFamily: FONT.display, fontSize: 12, fontVariantNumeric: 'tabular-nums', color: C.white, width: 62 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: 'rgba(20,20,20,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)', width: '100%', maxWidth: 760, borderRadius: 8, color: C.white, userSelect: 'none', flexShrink: 0, fontFamily: FONT.display }}>
      <button style={btn} onClick={onReset} title="Start (0)"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2v10M12 2L5 7l7 5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg></button>
      <button style={btn} onClick={onPlayPause} title="Play / pause (space)">
        {playing ? <svg width="14" height="14" viewBox="0 0 14 14"><rect x="3" y="2" width="3" height="10" fill="currentColor" /><rect x="8" y="2" width="3" height="10" fill="currentColor" /></svg>
          : <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 2l9 5-9 5V2z" fill="currentColor" /></svg>}
      </button>
      <div style={{ ...mono, textAlign: 'right' }}>{fmt(time)}</div>
      <div ref={trackRef} style={{ flex: 1, height: 26, position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        onMouseMove={(e) => (dragging ? onSeek(timeFromEvent(e)) : onHover(timeFromEvent(e)))}
        onMouseLeave={() => { if (!dragging) onHover(null); }}
        onMouseDown={(e) => { setDragging(true); onSeek(timeFromEvent(e)); onHover(null); }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.14)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: 4, background: C.green, borderRadius: 2 }} />
        {markers.map((m, i) => (
          <div key={i} title={m.label} style={{ position: 'absolute', left: `${(m.t / duration) * 100}%`, top: 2, width: 2, height: 8, background: C.nebula, opacity: 0.9 }} />
        ))}
        <div style={{ position: 'absolute', left: `${pct}%`, top: '50%', width: 12, height: 12, marginLeft: -6, marginTop: -6, background: '#fff', borderRadius: 6, boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
      </div>
      <div style={{ ...mono, color: 'rgba(248,248,243,0.55)' }}>{fmt(duration)}</div>
      <div style={{ fontSize: 11, color: 'rgba(248,248,243,0.55)', whiteSpace: 'nowrap' }}>f {String(Math.floor(time * fps)).padStart(4, '0')}</div>
      <button style={{ ...btn, width: 'auto', padding: '0 10px', fontSize: 11, letterSpacing: '0.08em', background: guides ? 'rgba(114,219,250,0.25)' : btn.background }} onClick={onGuides} title="Safe zones (g)">SAFE</button>
    </div>
  );
}

// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// animations.jsx
// Reusable animation starter: Stage, Timeline, Sprite, easing helpers.
// Exports (to window): Stage, Sprite, PlaybackBar, TextSprite, ImageSprite, RectSprite,
//   useTime, useTimeline, useSprite, Easing, interpolate, animate, clamp.
//
// Usage (in an HTML file that loads React + Babel):
//
//   <Stage width={1280} height={720} duration={10} background="#f6f4ef">
//     <MyScene />
//   </Stage>
//
// <Stage> auto-scales to the viewport and provides the scrubber, play/pause,
// ←/→ seek, space, and 0-to-reset controls, and persists the playhead.
// Inside <Stage>, any child can call useTime() to read the current
// playhead (seconds). Or wrap content in <Sprite start={1} end={4}>...</Sprite>
// to only render during that window -- children receive a `localTime` and
// `progress` via the useSprite() hook. Use Easing + interpolate()/animate()
// for tweens; TextSprite / ImageSprite / RectSprite have built-in entry/exit.
// Build YOUR scenes by composing Sprites inside a Stage.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

// ── Easing functions (hand-rolled, Popmotion-style) ─────────────────────────
// All easings take t ∈ [0,1] and return eased t ∈ [0,1] (may overshoot for back/elastic).
const Easing = {
  linear: (t) => t,

  // Quad
  easeInQuad:    (t) => t * t,
  easeOutQuad:   (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic
  easeInCubic:    (t) => t * t * t,
  easeOutCubic:   (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

  // Quart
  easeInQuart:    (t) => t * t * t * t,
  easeOutQuart:   (t) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t),

  // Expo
  easeInExpo:  (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },

  // Sine
  easeInSine:    (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine:   (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Back (overshoot)
  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158, c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  // Elastic
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

// ── Core interpolation helpers ──────────────────────────────────────────────

// Clamp a value to [min, max]
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// interpolate([0, 0.5, 1], [0, 100, 50], ease?) -> fn(t)
// Popmotion-style: linearly maps t across input keyframes to output values,
// with optional easing per segment (single fn or array of fns).
function interpolate(input, output, ease = Easing.linear) {
  return (t) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? (ease[i] || Easing.linear) : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}

// animate({from, to, start, end, ease})(t) — simpler single-segment tween.
// Returns `from` before `start`, `to` after `end`.
function animate({ from = 0, to = 1, start = 0, end = 1, ease = Easing.easeInOutCubic }) {
  return (t) => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}

// ── Timeline context ────────────────────────────────────────────────────────

const TimelineContext = React.createContext({ time: 0, duration: 10, playing: false });

const useTime = () => React.useContext(TimelineContext).time;
const useTimeline = () => React.useContext(TimelineContext);

// ── Sprite ──────────────────────────────────────────────────────────────────
// Renders children only when the playhead is inside [start, end]. Provides
// a sub-context with `localTime` (seconds since start) and `progress` (0..1).
//
//   <Sprite start={2} end={5}>
//     {({ localTime, progress }) => <Thing x={progress * 100} />}
//   </Sprite>
//
// Or as a plain wrapper — children can call useSprite() themselves.

const SpriteContext = React.createContext({ localTime: 0, progress: 0, duration: 0 });
const useSprite = () => React.useContext(SpriteContext);

function Sprite({ start = 0, end = Infinity, children, keepMounted = false }) {
  const { time } = useTimeline();
  const visible = time >= start && time <= end;
  if (!visible && !keepMounted) return null;

  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 && isFinite(duration)
    ? clamp(localTime / duration, 0, 1)
    : 0;

  const value = { localTime, progress, duration, visible };

  return (
    <SpriteContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </SpriteContext.Provider>
  );
}

// ── Sample sprite components ────────────────────────────────────────────────

// TextSprite: fades/slides text in on entry, holds, then fades out on exit.
// Props: text, x, y, size, color, font, entryDur, exitDur, align
function TextSprite({
  text,
  x = 0, y = 0,
  size = 48,
  color = '#111',
  font = 'Inter, system-ui, sans-serif',
  weight = 600,
  entryDur = 0.45,
  exitDur = 0.35,
  entryEase = Easing.easeOutBack,
  exitEase = Easing.easeInCubic,
  align = 'left',
  letterSpacing = '-0.01em',
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let ty = 0;

  if (localTime < entryDur) {
    const t = entryEase(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    ty = (1 - t) * 16;
  } else if (localTime > exitStart) {
    const t = exitEase(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    ty = -t * 8;
  }

  const translateX = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      transform: `translate(${translateX}, ${ty}px)`,
      opacity,
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing,
      whiteSpace: 'pre',
      lineHeight: 1.1,
      willChange: 'transform, opacity',
    }}>
      {text}
    </div>
  );
}

// ImageSprite: scales + fades in; optional Ken Burns drift during hold.
function ImageSprite({
  src,
  x = 0, y = 0,
  width = 400, height = 300,
  entryDur = 0.6,
  exitDur = 0.4,
  kenBurns = false,
  kenBurnsScale = 1.08,
  radius = 12,
  fit = 'cover',
  placeholder = null, // {label: string} for striped placeholder
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let scale = 1;

  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    scale = 0.96 + 0.04 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = (kenBurns ? kenBurnsScale : 1) + 0.02 * t;
  } else if (kenBurns) {
    const holdSpan = exitStart - entryDur;
    const holdT = holdSpan > 0 ? (localTime - entryDur) / holdSpan : 0;
    scale = 1 + (kenBurnsScale - 1) * holdT;
  }

  const content = placeholder ? (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'repeating-linear-gradient(135deg, #e9e6df 0 10px, #dcd8cf 10px 20px)',
      color: '#6b6458',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 13,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {placeholder.label || 'image'}
    </div>
  ) : (
    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }} />
  );

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      borderRadius: radius,
      overflow: 'hidden',
      willChange: 'transform, opacity',
    }}>
      {content}
    </div>
  );
}

// RectSprite: simple rectangle that animates position/size/color via props.
// Useful demo primitive — takes a `render` fn for per-frame customization.
function RectSprite({
  x = 0, y = 0,
  width = 100, height = 100,
  color = '#111',
  radius = 8,
  entryDur = 0.4,
  exitDur = 0.3,
  render, // optional: (ctx) => style overrides
}) {
  const spriteCtx = useSprite();
  const { localTime, duration } = spriteCtx;
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let scale = 1;

  if (localTime < entryDur) {
    const t = Easing.easeOutBack(clamp(localTime / entryDur, 0, 1));
    opacity = clamp(localTime / entryDur, 0, 1);
    scale = 0.4 + 0.6 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInQuad(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = 1 - 0.15 * t;
  }

  const overrides = render ? render(spriteCtx) : {};

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      background: color,
      borderRadius: radius,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      willChange: 'transform, opacity',
      ...overrides,
    }} />
  );
}


function Stage({
  width = 1280,
  height = 720,
  duration = 10,
  background = '#f6f4ef',
  fps = 60,
  loop = true,
  autoplay = true,
  persistKey = 'animstage',
  children,
}) {
  const [time, setTime] = React.useState(() => {
    try {
      const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0');
      return isFinite(v) ? clamp(v, 0, duration) : 0;
    } catch { return 0; }
  });
  const [playing, setPlaying] = React.useState(autoplay);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);

  const stageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);

  // Persist playhead
  React.useEffect(() => {
    try { localStorage.setItem(persistKey + ':t', String(time)); } catch {}
  }, [time, persistKey]);

  // Auto-scale to fit viewport
  React.useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const measure = () => {
      const barH = 44; // playback bar height
      const s = Math.min(
        el.clientWidth / width,
        (el.clientHeight - barH) / height
      );
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width, height]);

  // Animation loop
  React.useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      return;
    }
    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime((t) => {
        let next = t + dt;
        if (next >= duration) {
          if (loop) next = next % duration;
          else { next = duration; setPlaying(false); }
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing, duration, loop]);

  // Keyboard: space = play/pause, ← → = seek
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying(p => !p);
      } else if (e.code === 'ArrowLeft') {
        setTime(t => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.code === 'ArrowRight') {
        setTime(t => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.key === '0' || e.code === 'Home') {
        setTime(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);

  const displayTime = hoverTime != null ? hoverTime : time;

  const ctxValue = React.useMemo(
    () => ({ time: displayTime, duration, playing, setTime, setPlaying }),
    [displayTime, duration, playing]
  );

  return (
    <div
      ref={stageRef}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        background: '#0a0a0a',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Canvas area — vertically centered in remaining space */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <div
          ref={canvasRef}
          style={{
            width, height,
            background,
            position: 'relative',
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            flexShrink: 0,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}
        >
          <TimelineContext.Provider value={ctxValue}>
            {children}
          </TimelineContext.Provider>
        </div>
      </div>

      {/* Playback bar — stacked below canvas, never overlapping */}
      <PlaybackBar
        time={displayTime}
        actualTime={time}
        duration={duration}
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        onReset={() => { setTime(0); }}
        onSeek={(t) => setTime(t)}
        onHover={(t) => setHoverTime(t)}
      />
    </div>
  );
}

// ── Playback bar ────────────────────────────────────────────────────────────
// Play/pause, return-to-begin, scrub track, time display.
// Uses fixed-width time fields so layout doesn't thrash.

function PlaybackBar({ time, duration, playing, onPlayPause, onReset, onSeek, onHover }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);

  const timeFromEvent = React.useCallback((e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return x * duration;
  }, [duration]);

  const onTrackMove = (e) => {
    if (!trackRef.current) return;
    const t = timeFromEvent(e);
    if (dragging) {
      onSeek(t);
    } else {
      onHover(t);
    }
  };

  const onTrackLeave = () => {
    if (!dragging) onHover(null);
  };

  const onTrackDown = (e) => {
    setDragging(true);
    const t = timeFromEvent(e);
    onSeek(t);
    onHover(null);
  };

  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = (e) => {
      if (!trackRef.current) return;
      const t = timeFromEvent(e);
      onSeek(t);
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
    };
  }, [dragging, timeFromEvent, onSeek]);

  const pct = duration > 0 ? (time / duration) * 100 : 0;
  const fmt = (t) => {
    const total = Math.max(0, t);
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    const cs = Math.floor((total * 100) % 100);
    return `${String(m).padStart(1, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  const mono = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 16px',
      background: 'rgba(20,20,20,0.92)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      width: '100%',
      maxWidth: 680,
      alignSelf: 'center',

      borderRadius: 8,
      color: '#f6f4ef',
      fontFamily: 'Inter, system-ui, sans-serif',
      userSelect: 'none',
      flexShrink: 0,
    }}>
      <IconButton onClick={onReset} title="Return to start (0)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 2v10M12 2L5 7l7 5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
      </IconButton>
      <IconButton onClick={onPlayPause} title="Play/pause (space)">
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="3" y="2" width="3" height="10" fill="currentColor"/>
            <rect x="8" y="2" width="3" height="10" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 2l9 5-9 5V2z" fill="currentColor"/>
          </svg>
        )}
      </IconButton>

      {/* Current time: fixed width so it doesn't thrash */}
      <div style={{
        fontFamily: mono,
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        width: 64, textAlign: 'right',
        color: '#f6f4ef',
      }}>
        {fmt(time)}
      </div>

      {/* Scrub track */}
      <div
        ref={trackRef}
        onMouseMove={onTrackMove}
        onMouseLeave={onTrackLeave}
        onMouseDown={onTrackDown}
        style={{
          flex: 1,
          height: 22,
          position: 'relative',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        <div style={{
          position: 'absolute',
          left: 0, right: 0, height: 4,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 2,
        }}/>
        <div style={{
          position: 'absolute',
          left: 0, width: `${pct}%`, height: 4,
          background: 'oklch(72% 0.12 250)',
          borderRadius: 2,
        }}/>
        <div style={{
          position: 'absolute',
          left: `${pct}%`, top: '50%',
          width: 12, height: 12,
          marginLeft: -6, marginTop: -6,
          background: '#fff',
          borderRadius: 6,
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        }}/>
      </div>

      {/* Duration: fixed width */}
      <div style={{
        fontFamily: mono,
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        width: 64, textAlign: 'left',
        color: 'rgba(246,244,239,0.55)',
      }}>
        {fmt(duration)}
      </div>
    </div>
  );
}

function IconButton({ children, onClick, title }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6,
        color: '#f6f4ef',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 120ms',
      }}
    >
      {children}
    </button>
  );
}


Object.assign(window, {
  Easing, interpolate, animate, clamp,
  TimelineContext, useTime, useTimeline,
  Sprite, SpriteContext, useSprite,
  TextSprite, ImageSprite, RectSprite,
  Stage, PlaybackBar,
});

// ═══════════════════════════════════════════════════════════════════════════
// DaaS — social short (9:16, 30s). Scenes appended to the engine so all
// engine globals are in scope at render time.
// ═══════════════════════════════════════════════════════════════════════════

const FONT = '"Montserrat", system-ui, sans-serif';
const HAND = '"Caveat", "Comic Sans MS", cursive';
const MONO = FONT; // brand has no mono; labels use Montserrat

const COFFEE = 'assets/man-coffee-portrait.png';
const LOGO = 'assets/smedia-logo.png';
const MARK_W = 'assets/smedia-mark-white.png';
const CLOUDS_DARK = 'assets/dark-clouds.png';
const CLOUD_FOOTER = 'assets/cloud-footer.svg';
const CLOUD_BACKDROP = 'assets/cloud-logo-backdrop.png';
const BUDGET_PIE = 'assets/budget-pie.jpg';
const RUNNER = 'assets/runner-busywork.jpg';
const CALC = 'assets/calc-budget.jpg';
const WOMAN_BUDGET = 'assets/woman-budget.png';
const WOMAN = 'assets/woman-laptop.jpg';
const GEARS = 'assets/gear-hands.jpg';
const CREAM = '#fef1e1';
const JUMP = 'assets/jump-graph.jpg';
const PINK = '#ffe2f4';
const ROCKET = 'assets/rocket-man.png';
const CAPE = 'assets/cape-man.png';
const SKY = '#b9cbd9';
const GREIGE = '#eae5df';
const TAUPE = '#e0d9d1';

function pal(props) {
  props = props || {};
  return {
    bg: '#F8F8F3',      // Galaxy White
    navy: '#063141',    // Deep Space Blue
    ink: '#063141',     // headings
    body: '#3F4444',    // Space Gray
    sub: '#6E7373',     // muted
    line: '#DDE6F0',    // Platinum Ice
    accent: props.accent || '#922DB1',   // Royal Dark Ube (action)
    accent2: props.accent2 || '#72DBFA', // Nebula Blue
    orange: '#F0AB00',  // Cosmic Orange (eyebrow)
    green: '#C4D600',   // Stimulating Green (spark)
    cream: '#F7E2CF',   // warm peach — headings on dark
  };
}

// Deterministic pseudo-random for stable scatter
function rnd(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

// Centered, multi-line headline with entry/exit. Used for all text.
function Head({ start, end, y, text, size, weight = 700, color, font = FONT,
  ls = '-0.02em', lh = 1.04, width = 960 }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const inT = Easing.easeOutCubic(clamp(localTime / 0.5, 0, 1));
        const outT = clamp((duration - localTime) / 0.35, 0, 1);
        const ty = (1 - inT) * 26;
        return (
          <div style={{
            position: 'absolute', left: 540, top: y, width,
            transform: `translate(-50%, ${ty}px)`,
            opacity: Math.min(inT, outT),
            textAlign: 'center', fontFamily: font, fontSize: size,
            fontWeight: weight, color, letterSpacing: ls, lineHeight: lh,
            whiteSpace: 'pre-line', textWrap: 'balance',
          }}>{text}</div>
        );
      }}
    </Sprite>
  );
}

// Full-bleed colored panel with quick fade in/out (for the accent scene).
function Fill({ color, start, end, fade = 0.18 }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const o = clamp(localTime / fade, 0, 1) * clamp((duration - localTime) / fade, 0, 1);
        return <div style={{ position: 'absolute', inset: 0, background: color, opacity: o }} />;
      }}
    </Sprite>
  );
}

// ── Brand decoration ─────────────────────────────────────────────────────────

// Deep Space Blue backdrop: navy radial + twinkling starfield + dark cloud ceiling.
function DarkBg({ start, end, P, fade = 0.3, clouds = true, footer = false }) {
  const time = useTime();
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const o = clamp(localTime / fade, 0, 1) * clamp((duration - localTime) / fade, 0, 1);
        const stars = [];
        for (let i = 0; i < 70; i++) {
          const r = 1 + rnd(i + 7) * 2.4;
          const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 2 + i * 1.7));
          stars.push(<circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 99) * 1920} r={r} fill="#DDE6F0" opacity={tw * 0.75} />);
        }
        return (
          <div style={{ position: 'absolute', inset: 0, opacity: o }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(125% 75% at 50% 16%, #0d4a5d 0%, #063141 52%, #041d27 100%)' }} />
            <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>{stars}</svg>
            {clouds && <img src={CLOUDS_DARK} style={{ position: 'absolute', top: -2, left: 0, width: '100%', opacity: 0.55 }} />}
            {footer && <img src={CLOUD_FOOTER} style={{ position: 'absolute', bottom: -2, left: 0, width: '100%' }} />}
          </div>
        );
      }}
    </Sprite>
  );
}

// Sparkle field — brand "+" marks and "○" rings, scattered sparsely, twinkling.
function Sparkles({ count = 12, color, seed = 0, area = [50, 1030, 180, 1740] }) {
  const time = useTime();
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = area[0] + rnd(i + seed) * (area[1] - area[0]);
    const y = area[2] + rnd(i + seed + 50) * (area[3] - area[2]);
    const plus = rnd(i + seed + 9) > 0.5;
    const s = 14 + rnd(i + seed + 3) * 18;
    const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 1.6 + i * 1.3));
    out.push(
      <div key={i} style={{ position: 'absolute', left: x, top: y, opacity: tw }}>
        {plus
          ? <div style={{ width: s, height: s, position: 'relative' }}>
              <div style={{ position: 'absolute', left: '44%', top: 0, width: '12%', height: '100%', background: color, borderRadius: 2 }} />
              <div style={{ position: 'absolute', top: '44%', left: 0, height: '12%', width: '100%', background: color, borderRadius: 2 }} />
            </div>
          : <div style={{ width: s, height: s, borderRadius: '50%', border: `2.5px solid ${color}` }} />}
      </div>
    );
  }
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{out}</div>;
}

// Hand-drawn marker label (Caveat), pops in with a tilt — the brand's playful aside.
function MarkerText({ start, end, x, y, text, size = 54, color, rot = -3, align = 'center' }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const t = Easing.easeOutBack(clamp(localTime / 0.5, 0, 1));
        const outT = clamp((duration - localTime) / 0.3, 0, 1);
        const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
        return (
          <div style={{
            position: 'absolute', left: x, top: y,
            transform: `translate(${tx}, ${(1 - t) * 18}px) rotate(${rot}deg) scale(${0.8 + 0.2 * t})`,
            opacity: Math.min(clamp(localTime / 0.3, 0, 1), outT),
            fontFamily: HAND, fontWeight: 600, fontSize: size, color, whiteSpace: 'nowrap',
            lineHeight: 1, transformOrigin: align === 'center' ? 'center' : 'left',
          }}>{text}</div>
        );
      }}
    </Sprite>
  );
}

// ── Juggling-scene parts (the dark "constantly juggling" orbit, ref 1) ────────

function toolIcon(kind, c) {
  const st = { width: 30, height: 30, display: 'block' };
  if (kind === 'chat') return <svg viewBox="0 0 24 24" style={st} fill="none"><path d="M4 4h16v12H9l-5 4V4z" fill={c} /></svg>;
  if (kind === 'mail') return <svg viewBox="0 0 24 24" style={st} fill="none"><rect x="3" y="5" width="18" height="14" rx="2.5" fill={c} /><path d="M4 7.5l8 5.5 8-5.5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>;
  if (kind === 'tasks') return <svg viewBox="0 0 24 24" style={st}><rect x="3" y="4" width="5" height="16" rx="1.5" fill={c} /><rect x="9.5" y="4" width="5" height="11" rx="1.5" fill={c} /><rect x="16" y="4" width="5" height="14" rx="1.5" fill={c} /></svg>;
  if (kind === 'chart') return <svg viewBox="0 0 24 24" style={st} fill="none"><path d="M3 17l5-5 4 3 9-10" stroke={c} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (kind === 'doc') return <svg viewBox="0 0 24 24" style={st} fill="none"><path d="M6 3h8l4 4v14H6z" fill={c} /><path d="M9 12h6M9 16h5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /></svg>;
  if (kind === 'design') return <svg viewBox="0 0 24 24" style={st} fill="none"><path d="M12 3l9 6-9 6-9-6 9-6z" fill={c} /><path d="M3 15l9 6 9-6" stroke={c} strokeWidth="2" fill="none" strokeLinejoin="round" /></svg>;
  return null;
}

function ToolTile({ cx, cy, kind, title, color, delay, localTime, time }) {
  const t = Easing.easeOutBack(clamp((localTime - delay) / 0.55, 0, 1));
  const op = clamp((localTime - delay) / 0.3, 0, 1);
  const bob = Math.sin(time * 1.1 + cx * 0.01) * 8;
  return (
    <div style={{
      position: 'absolute', left: cx, top: cy + bob,
      transform: `translate(-50%,-50%) translateY(${(1 - t) * 26}px) scale(${0.7 + 0.3 * t})`,
      opacity: op, display: 'flex', alignItems: 'center', gap: 14,
      background: 'rgba(8,40,54,0.74)', backdropFilter: 'blur(4px)',
      border: '1.5px solid rgba(221,230,240,0.3)', borderRadius: 16,
      padding: '14px 24px 14px 14px', boxShadow: '0 18px 44px rgba(0,0,0,0.45)', whiteSpace: 'nowrap',
    }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{toolIcon(kind, color)}</div>
      <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 28, color: '#F7E2CF' }}>{title}</span>
    </div>
  );
}

// Floating task chip — a request bombarding the overwhelmed creative.
function TaskTile({ x, y, text, color, rot, delay, localTime, time }) {
  const t = Easing.easeOutBack(clamp((localTime - delay) / 0.55, 0, 1));
  const op = clamp((localTime - delay) / 0.3, 0, 1);
  const bob = Math.sin(time * 1.1 + x * 0.01) * 7;
  return (
    <div style={{
      position: 'absolute', left: x, top: y + bob,
      transform: `translate(-50%,-50%) translateY(${(1 - t) * 22}px) rotate(${rot}deg) scale(${0.7 + 0.3 * t})`,
      opacity: op, display: 'flex', alignItems: 'center', gap: 14,
      background: '#fff', border: '1.5px solid #DDE6F0', borderRadius: 16,
      padding: '16px 26px', boxShadow: '0 18px 44px rgba(6,49,65,0.20)', whiteSpace: 'nowrap',
    }}>
      <span style={{ flexShrink: 0, width: 13, height: 13, borderRadius: '50%', background: color }} />
      <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 30, color: '#063141' }}>{text}</span>
    </div>
  );
}

function TaskCloud({ localTime, time, P }) {
  const tasks = [
    { x: 335, y: 655, text: 'Polish presentation deck', color: P.accent, rot: -9, d: 0.5 },
    { x: 745, y: 685, text: 'New banner for website', color: P.accent2, rot: 3, d: 0.8 },
    { x: 300, y: 965, text: 'Infographics', color: P.green, rot: 4, d: 1.1 },
    { x: 760, y: 1075, text: 'Graphics for social post', color: P.orange, rot: -3, d: 1.4 },
    { x: 435, y: 1255, text: 'Video for pitch deck', color: P.accent, rot: -5, d: 1.7 },
  ];
  return tasks.map((t, i) => <TaskTile key={i} {...t} delay={t.d} localTime={localTime} time={time} />);
}

// Full figure illustration — centered, fades in and settles (no idle float).
function RunnerFigure({ localTime }) {
  const t = Easing.easeOutCubic(clamp(localTime / 0.7, 0, 1));
  return (
    <div style={{
      position: 'absolute', left: 540, top: 1000, width: 820,
      transform: `translate(-50%,-50%) translateY(${(1 - t) * 24}px) scale(${0.96 + 0.04 * t})`,
      opacity: clamp(localTime / 0.5, 0, 1),
    }}>
      <img src={WOMAN} style={{ width: '100%', display: 'block' }} alt="" />
    </div>
  );
}

// Animated segmented loading ring — overlays (and replaces) the static spinner
// where the woman's head would be, ticking around like a real loader.
function LoadingSpinner({ localTime, time }) {
  const op = clamp((localTime - 0.5) / 0.4, 0, 1);
  const spin = Math.floor(time * 12) * 30;
  const segs = [];
  for (let i = 0; i < 12; i++) {
    const g = Math.round(35 + (i / 11) * 198);
    segs.push(<rect key={i} x="46.5" y="6" width="7" height="20" rx="3.5" fill={`rgb(${g},${g},${g})`} transform={`rotate(${i * 30} 50 50)`} />);
  }
  return (
    <div style={{ position: 'absolute', left: 521, top: 817, width: 156, height: 156, transform: 'translate(-50%,-50%)', opacity: op, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: SKY }} />
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute', inset: 0, transform: `rotate(${spin}deg)` }}>{segs}</svg>
    </div>
  );
}

// Salary chip (label pill + value)
function Chip({ x, y, label, tag, P }) {
  const { localTime, duration } = useSprite();
  const t = Easing.easeOutBack(clamp(localTime / 0.5, 0, 1));
  const outT = clamp((duration - localTime) / 0.3, 0, 1);
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `translate(-50%, ${(1 - t) * 24}px) scale(${0.82 + 0.18 * t})`,
      opacity: Math.min(clamp(localTime / 0.3, 0, 1), outT),
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        fontFamily: MONO, fontSize: 26, letterSpacing: '0.03em',
        textTransform: 'uppercase', color: P.ink, background: '#fff',
        border: `2px solid ${P.line}`, borderRadius: 100, padding: '14px 26px',
        whiteSpace: 'nowrap',
      }}>{label}</div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: P.ink }}>{tag}</div>
    </div>
  );
}

// Ambition vs reality line chart
function LineGraph({ start, end, P }) {
  const L = 1000;
  const time = useTime();
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const draw = Easing.easeInOutCubic(clamp(localTime / 1.4, 0, 1));
        const inT = clamp(localTime / 0.45, 0, 1);
        const outT = clamp((duration - localTime) / 0.35, 0, 1);
        const off = (1 - draw) * L;
        // Position the rocket at the moving tip of the POTENTIAL line.
        const PTS = [[20, 300], [200, 250], [400, 160], [580, 80], [740, 38]];
        let segs = [], tot = 0;
        for (let i = 1; i < PTS.length; i++) { const l = Math.hypot(PTS[i][0] - PTS[i - 1][0], PTS[i][1] - PTS[i - 1][1]); segs.push(l); tot += l; }
        let dd = draw * tot, tip = PTS[0];
        for (let i = 0; i < segs.length; i++) { if (dd <= segs[i] || i === segs.length - 1) { const tt = segs[i] ? clamp(dd / segs[i], 0, 1) : 0; tip = [PTS[i][0] + (PTS[i + 1][0] - PTS[i][0]) * tt, PTS[i][1] + (PTS[i + 1][1] - PTS[i][1]) * tt]; break; } dd -= segs[i]; }
        const RW = 200, RH = RW / 1.51;
        const bob = Math.sin((time - start) * 1.8) * 4;
        const SCALE = 784 / 760;           // SVG units -> card-inner px
        const RWpx = RW * SCALE, RHpx = RH * SCALE;
        const rxPx = 38 + tip[0] * SCALE - 0.90 * RWpx;
        const ryPx = 36 + tip[1] * SCALE - 0.16 * RHpx + bob;
        const rocketOp = clamp((draw - 0.3) / 0.3, 0, 1) * outT;
        return (
          <div style={{
            position: 'absolute', left: 540, top: 880, width: 860,
            transform: 'translateX(-50%)', opacity: Math.min(inT, outT),
          }}>
            <div style={{
              position: 'relative',
              background: '#fff', border: `2px solid ${P.line}`, borderRadius: 28,
              padding: '36px 38px', boxShadow: '0 30px 60px rgba(33,30,24,0.07)',
            }}>
              <svg viewBox="0 0 760 360" width="100%" style={{ display: 'block' }}>
                <line x1="20" y1="320" x2="740" y2="320" stroke={P.line} strokeWidth="3" />
                <polyline points="20,300 200,250 400,160 580,80 740,38" fill="none"
                  stroke={P.accent} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray={L} strokeDashoffset={off} />
                <polyline points="20,300 200,296 400,288 580,290 740,282" fill="none"
                  stroke={P.sub} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray={L} strokeDashoffset={off} />
                <circle cx="740" cy="38" r="11" fill={P.accent} opacity={draw > 0.93 ? 1 : 0} />
                <circle cx="740" cy="282" r="11" fill={P.sub} opacity={draw > 0.93 ? 1 : 0} />
              </svg>
              <img src={ROCKET} alt="" style={{ position: 'absolute', left: rxPx, top: ryPx, width: RWpx, height: RHpx, opacity: rocketOp, pointerEvents: 'none', display: 'block' }} />
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: 20,
                fontFamily: FONT, fontWeight: 700, fontSize: 24, letterSpacing: '0.04em',
              }}>
                <span style={{ color: P.accent }}>● POTENTIAL</span>
                <span style={{ color: P.sub }}>● WHAT YOU SHIP</span>
              </div>
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// Big "DaaS" wordmark with pop entrance + a light shimmer sweep.
function BigWord({ start, end, P }) {
  const time = useTime();
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const pop = Easing.easeOutBack(clamp(localTime / 0.6, 0, 1));
        const outT = clamp((duration - localTime) / 0.35, 0, 1);
        const sweep = ((time - start) * 0.42) % 1;
        const bgPos = 150 - sweep * 200;
        return (
          <div style={{
            position: 'absolute', left: 540, top: 500,
            transform: `translate(-50%, 0) scale(${0.62 + 0.38 * pop})`,
            transformOrigin: 'center top',
            opacity: Math.min(clamp(localTime / 0.3, 0, 1), outT),
            fontFamily: FONT, fontWeight: 800, fontSize: 196,
            letterSpacing: '-0.03em', lineHeight: 1,
            backgroundImage: 'linear-gradient(100deg, #F0DAC0 0%, #F7E2CF 38%, #FFFFFF 50%, #F7E2CF 62%, #F0DAC0 100%)',
            backgroundSize: '250% 100%', backgroundPosition: `${bgPos}% 0`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            color: 'transparent', WebkitTextFillColor: 'transparent',
          }}>DaaS</div>
        );
      }}
    </Sprite>
  );
}

// Staggered pill row (S4 value points)
function PillRow({ start, end, items, P }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const outT = clamp((duration - localTime) / 0.35, 0, 1);
        return (
          <div style={{
            position: 'absolute', left: 540, top: 870, width: 940, transform: 'translateX(-50%)',
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '18px 16px', opacity: outT,
          }}>
            {items.map((it, i) => {
              const d = i * 0.18;
              const t = Easing.easeOutBack(clamp((localTime - d) / 0.5, 0, 1));
              return (
                <div key={i} style={{
                  transform: `translateY(${(1 - t) * 22}px) scale(${0.8 + 0.2 * t})`,
                  opacity: clamp((localTime - d) / 0.3, 0, 1),
                  fontFamily: MONO, fontSize: 29, letterSpacing: '0.01em', color: P.ink,
                  background: '#fff', border: `2px solid ${P.line}`, borderRadius: 100,
                  padding: '18px 28px', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <span style={{ width: 12, height: 12, borderRadius: 8, background: P.accent }} />{it}
                </div>
              );
            })}
          </div>
        );
      }}
    </Sprite>
  );
}

// 2x2 feature grid (on the accent reveal scene)
function FeatureGrid({ start, end, items, P }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const outT = clamp((duration - localTime) / 0.35, 0, 1);
        return (
          <div style={{
            position: 'absolute', left: 540, top: 940, width: 880,
            transform: 'translateX(-50%)', display: 'grid',
            gridTemplateColumns: '1fr 1fr', gap: 18, opacity: outT,
          }}>
            {items.map((it, i) => {
              const d = i * 0.22;
              const t = Easing.easeOutBack(clamp((localTime - d) / 0.5, 0, 1));
              return (
                <div key={i} style={{
                  transform: `translateY(${(1 - t) * 22}px) scale(${0.86 + 0.14 * t})`,
                  opacity: clamp((localTime - d) / 0.3, 0, 1),
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: 'rgba(255,255,255,0.15)',
                  border: '2px solid rgba(255,255,255,0.34)',
                  borderRadius: 20, padding: '20px 22px', minHeight: 84,
                  fontFamily: FONT, fontWeight: 600, fontSize: 28, color: '#F8F8F3', lineHeight: 1.12,
                }}>
                  <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 6, background: P.green }} />
                  {it}
                </div>
              );
            })}
          </div>
        );
      }}
    </Sprite>
  );
}

// Brand lockup — the real Stimulating Media horizontal logo.
function Logo({ start }) {
  return (
    <Sprite start={start} end={59}>
      {({ localTime }) => {
        const t = Easing.easeOutBack(clamp(localTime / 0.6, 0, 1));
        return (
          <div style={{
            position: 'absolute', left: 540, top: 500,
            transform: `translate(-50%, 0) scale(${0.8 + 0.2 * t})`,
            transformOrigin: 'center top', opacity: clamp(localTime / 0.4, 0, 1),
            width: 720,
          }}>
            <img src={LOGO} alt="" style={{ width: '100%', display: 'block' }} />
          </div>
        );
      }}
    </Sprite>
  );
}

// CTA url pill
function UrlPill({ start, end, P, url }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const t = Easing.easeOutBack(clamp(localTime / 0.5, 0, 1));
        const outT = clamp((duration - localTime) / 0.35, 0, 1);
        return (
          <div style={{
            position: 'absolute', left: 540, top: 1175,
            transform: `translate(-50%, ${(1 - t) * 16}px) scale(${0.86 + 0.14 * t})`,
            opacity: Math.min(clamp(localTime / 0.3, 0, 1), outT),
            fontFamily: FONT, fontSize: 38, fontWeight: 700, color: '#fff',
            background: P.accent, borderRadius: 100, padding: '26px 46px', whiteSpace: 'nowrap',
            boxShadow: '0 16px 40px rgba(146,45,177,0.4)',
          }}>{url}</div>
        );
      }}
    </Sprite>
  );
}

// ── Scenes ──────────────────────────────────────────────────────────────────

function ChipCluster({ start, end, items, P, y = 870 }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const outT = clamp((duration - localTime) / 0.35, 0, 1);
        return (
          <div style={{
            position: 'absolute', left: 540, top: y, width: 940,
            transform: 'translateX(-50%)', display: 'flex', flexWrap: 'wrap',
            justifyContent: 'center', gap: '26px 18px', opacity: outT,
          }}>
            {items.map((c, i) => {
              const d = i * 0.2;
              const t = Easing.easeOutBack(clamp((localTime - d) / 0.5, 0, 1));
              return (
                <div key={i} style={{
                  transform: `translateY(${(1 - t) * 22}px) scale(${0.8 + 0.2 * t})`,
                  opacity: clamp((localTime - d) / 0.3, 0, 1),
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                }}>
                  <div style={{
                    fontFamily: MONO, fontSize: 25, letterSpacing: '0.02em',
                    textTransform: 'uppercase', color: P.ink, background: '#fff',
                    border: `2px solid ${P.line}`, borderRadius: 100, padding: '13px 24px',
                    whiteSpace: 'nowrap',
                  }}>{c.label}</div>
                  <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: P.ink }}>{c.tag}</div>
                </div>
              );
            })}
          </div>
        );
      }}
    </Sprite>
  );
}

function SceneBuried({ P }) {
  const time = useTime();
  return (
    <Sprite start={7} end={14}>
      <Fill color={SKY} start={7} end={14} fade={0.25} />
      <Sprite start={7.6} end={13.9}>
        {({ localTime }) => (
          <React.Fragment>
            <RunnerFigure localTime={localTime} />
            <LoadingSpinner localTime={localTime} time={time} />
          </React.Fragment>
        )}
      </Sprite>
      <Head start={7.2} end={13.9} y={235} text="MEANWHILE…" size={30} weight={700} color={P.accent} font={FONT} ls="0.22em" />
      <Head start={7.35} end={13.9} y={305} text={"Your best people,\nburied in busywork."} size={74} weight={800} color={P.ink} width={960} />
      <Sprite start={7.6} end={13.9}>
        {({ localTime }) => <TaskCloud localTime={localTime} time={time} P={P} />}
      </Sprite>
      <MarkerText start={9.8} end={13.9} x={358} y={1535} text="constantly juggling" size={56} color={P.accent} rot={-4} />
      <MarkerText start={10.6} end={13.9} x={700} y={1600} text="multiple projects" size={56} color={'#063141'} rot={3} />
    </Sprite>
  );
}

function BudgetPie({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const t = Easing.easeOutCubic(clamp(localTime / 0.7, 0, 1));
        const inT = clamp(localTime / 0.5, 0, 1);
        const outT = clamp((duration - localTime) / 0.35, 0, 1);
        return (
          <div style={{
            position: 'absolute', left: 540, bottom: -10, height: 760,
            transform: `translateX(-50%) translateY(${(1 - t) * 40}px)`,
            opacity: Math.min(inT, outT),
          }}>
            <img src={WOMAN_BUDGET} alt="" style={{ height: '100%', width: 'auto', display: 'block' }} />
          </div>
        );
      }}
    </Sprite>
  );
}

function SceneProblem({ P }) {
  const roles = [
    { label: 'Graphic Designer', tag: '$95K' },
    { label: 'Motion Designer', tag: '$110K' },
    { label: 'Video Editor', tag: '$90K' },
    { label: 'Illustrator', tag: '$85K' },
  ];
  return (
    <Sprite start={0} end={7}>
      <Fill color={GREIGE} start={0} end={7} fade={0.25} />
      <BudgetPie start={4.0} end={6.9} />
      <Head start={0.3} end={6.9} y={240} text="THE PROBLEM" size={30} weight={700} color={P.accent} font={FONT} ls="0.22em" />
      <Head start={0.5} end={6.9} y={315} text={"No time or budget\nto build out your\ncreative team?"} size={76} weight={800} color={P.ink} width={920} />
      <ChipCluster start={1.6} end={6.9} items={roles} P={P} y={640} />
      <Head start={3.4} end={6.9} y={950} text="= $380,000 / year" size={92} weight={800} color={P.accent} ls="-0.01em" />
      <Head start={4.2} end={6.9} y={1055} text="A whole team you can’t justify hiring." size={60} weight={600} color={P.sub} font={HAND} ls="0" />
    </Sprite>
  );
}

function SceneCompromise({ P }) {
  return (
    <Sprite start={21} end={27}>
      <Sparkles count={7} color={'rgba(114,219,250,0.5)'} seed={31} />
      <Head start={21.2} end={26.9} y={470} text={"Don’t settle for\n“good enough.”"} size={88} weight={800} color={P.ink} />
      <LineGraph start={22.3} end={26.9} P={P} />
      <MarkerText start={24.0} end={26.9} x={760} y={870} text="your potential" size={50} color={'#5E7A00'} rot={-7} align="left" />
      <Head start={24.3} end={26.9} y={1520} text="That’s the untapped potential you’re leaving on the table." size={58} weight={600} color={P.sub} font={HAND} ls="0" width={920} />
    </Sprite>
  );
}

// Scrolling capability marquee (service words) on the accent scene
function Marquee({ start, end, words, P }) {
  const time = useTime();
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const inT = clamp(localTime / 0.5, 0, 1);
        const outT = clamp((duration - localTime) / 0.4, 0, 1);
        const x = -((time - start) * 80);
        const line = words.join('   •   ');
        const full = (line + '   •   ').repeat(2);
        return (
          <div style={{
            position: 'absolute', left: 0, top: 1440, width: 1080, overflow: 'hidden',
            opacity: Math.min(inT, outT),
            WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
            maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
          }}>
            <div style={{
              display: 'inline-flex', whiteSpace: 'nowrap', transform: `translateX(${x}px)`,
              fontFamily: MONO, fontSize: 30, color: 'rgba(255,255,255,0.94)', letterSpacing: '0.02em',
            }}>
              <span style={{ paddingLeft: 24 }}>{full}</span>
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// Jumping-man-over-graph collage — pops in from the baseline with an overshoot.
function JumpGraph({ start, end }) {
  const IMGH = 720;
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const t = Easing.easeOutBack(clamp(localTime / 0.55, 0, 1));
        const outT = clamp((duration - localTime) / 0.35, 0, 1);
        return (
          <div style={{
            position: 'absolute', left: 0, bottom: 0, width: 1080, height: IMGH,
            transformOrigin: 'center bottom',
            transform: `scale(${0.6 + 0.4 * t})`,
            opacity: Math.min(clamp(localTime / 0.3, 0, 1), outT),
          }}>
            <img src={JUMP} alt="" style={{ width: 1080, display: 'block' }} />
          </div>
        );
      }}
    </Sprite>
  );
}

// Gains & losses — diverging bars from a center axis
function GainsLosses({ start, end, P }) {
  const GBAR = '#C4D600';   // Stimulating Green bar fill
  const GTXT = '#5E7A00';   // readable deep green for text
  const items = [
    { label: 'Lost to design busywork', val: '−8 hrs / week', dir: -1, mag: 0.82, bar: P.accent, txt: P.accent },
    { label: 'Gained for high-value work', val: '+ full potential', dir: 1, mag: 1.0, bar: GBAR, txt: GTXT },
  ];
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const inT = clamp(localTime / 0.4, 0, 1);
        const outT = clamp((duration - localTime) / 0.35, 0, 1);
        return (
          <div style={{ position: 'absolute', left: 540, top: 640, width: 860, transform: 'translateX(-50%)', opacity: Math.min(inT, outT) }}>
            <div style={{ background: '#fff', border: `1.5px solid ${P.line}`, borderRadius: 28, padding: '30px 38px 34px', boxShadow: '0 18px 48px rgba(6,49,65,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', marginBottom: 22 }}>
                <span style={{ color: P.accent }}>◀ LOSS</span>
                <span style={{ color: GTXT }}>GAIN ▶</span>
              </div>
              {items.map((r, i) => {
                const d = i * 0.45;
                const g = Easing.easeOutCubic(clamp((localTime - 0.5 - d) / 0.85, 0, 1));
                const bw = g * r.mag * 50;
                return (
                  <div key={i} style={{ marginTop: i === 0 ? 0 : 26 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                      <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 26, color: P.ink }}>{r.label}</span>
                      <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 28, color: r.txt }}>{r.val}</span>
                    </div>
                    <div style={{ position: 'relative', height: 30 }}>
                      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: P.line, transform: 'translateY(-50%)' }} />
                      <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 3, background: P.ink, opacity: 0.16, transform: 'translateX(-50%)' }} />
                      <div style={{
                        position: 'absolute', top: '50%', height: 30, transform: 'translateY(-50%)', borderRadius: 8,
                        background: r.bar, width: `${bw}%`,
                        ...(r.dir < 0 ? { right: '50%' } : { left: '50%' }),
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

function SceneWaste({ P }) {
  return (
    <Sprite start={14} end={21}>
      <Fill color={PINK} start={14} end={21} fade={0.25} />
      <Sparkles count={7} color={'rgba(146,45,177,0.3)'} seed={21} />
      <Head start={14.3} end={20.9} y={360} text={"Let designers\ndesign."} size={92} weight={800} color={P.ink} />
      <GainsLosses start={15.5} end={20.9} P={P} />
      <Head start={16.9} end={20.9} y={1000} text="And let your team do what they do best." size={60} weight={600} color={P.sub} font={HAND} ls="0" width={920} />
      <JumpGraph start={17.8} end={20.9} />
    </Sprite>
  );
}

// Logo blasts up from the footer clouds, breaking through them with a fading
// streak, then settles at the top.
function BlastLogo({ start, end }) {
  const LOGO_W = 96, LOGO_H = LOGO_W * 1297 / 533;
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const outT = clamp((duration - localTime) / 0.35, 0, 1);
        const blastDur = 1.2;
        const p = clamp(localTime / blastDur, 0, 1);
        const startY = 1900, settleY = 150, launchX = 360, settleX = 540;
        const ey = Easing.easeOutCubic(p);
        const ex = 1 - Math.pow(1 - p, 1.4);
        const logoY = startY + (settleY - startY) * ey;
        const logoX = launchX + (settleX - launchX) * ex;
        // visual lean along the launch — leans right (matching the rocket mark), settles upright
        const velAng = (1 - ey) * 17;
        const speed = clamp((0.82 - p) / 0.82, 0, 1);
        const stretch = 1 + speed * 0.3;
        const op = clamp(localTime / 0.1, 0, 1) * outT;
        const streakOp = speed * outT;
        const burstT = clamp(localTime / 0.7, 0, 1);
        const burstOp = (1 - burstT) * clamp(localTime / 0.05, 0, 1) * outT;
        const puffs = [];
        for (let k = 0; k < 9; k++) {
          const ang = (k / 9) * Math.PI * 2;
          const dist = burstT * (110 + (k % 3) * 75);
          const px = Math.cos(ang) * dist;
          const py = -Math.abs(Math.sin(ang)) * dist * 0.6 - burstT * 50;
          const sz = 40 + (k % 4) * 18 + burstT * 34;
          puffs.push(<div key={k} style={{ position: 'absolute', left: launchX + px, top: 1815 + py, width: sz, height: sz * 0.72, borderRadius: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(244,247,251,0.95)', filter: 'blur(5px)', opacity: burstOp }} />);
        }
        return (
          <React.Fragment>
            {puffs}
            <div style={{ position: 'absolute', left: launchX, top: 1815, width: burstT * 360, height: burstT * 360, borderRadius: '50%', transform: 'translate(-50%,-50%)', border: '3px solid rgba(255,255,255,0.45)', opacity: burstOp * 0.8 }} />
            <div style={{ position: 'absolute', left: logoX, top: logoY + LOGO_H * 0.45, width: 130, height: 560, transform: `translateX(-50%) rotate(${velAng}deg)`, transformOrigin: 'center top', opacity: streakOp, pointerEvents: 'none' }}>
              {[0, 1, 2, 3, 4].map((k) => {
                const sx = (k - 2) * 25;
                const len = 320 + (k % 3) * 130;
                const col = k % 2 ? 'rgba(196,214,0,0.85)' : 'rgba(255,255,255,0.85)';
                return <div key={k} style={{ position: 'absolute', left: `calc(50% + ${sx}px)`, top: 0, width: k % 2 ? 5 : 8, height: len, borderRadius: 6, transform: 'translateX(-50%)', background: `linear-gradient(to bottom, ${col}, rgba(196,214,0,0))` }} />;
              })}
            </div>
            <img src={MARK_W} alt="" style={{ position: 'absolute', left: logoX, top: logoY, width: LOGO_W, transform: `translateX(-50%) rotate(${velAng * 0.8}deg) scaleY(${stretch})`, transformOrigin: 'center bottom', opacity: op, zIndex: 3 }} />
          </React.Fragment>
        );
      }}
    </Sprite>
  );
}

function SceneSolution({ P }) {
  return (
    <Sprite start={27} end={39}>
      <DarkBg start={27} end={39} P={P} footer={true} />
      <BlastLogo start={27.4} end={38.9} />
      <Head start={27.4} end={38.9} y={432} text="THE SOLUTION" size={30} weight={700} color={P.green} font={FONT} ls="0.22em" />
      <BigWord start={27.4} end={38.9} P={P} />
      <TypeSentence start={28.7} end={38.9} y={715} segs={['Design as a Service']} size={72} width={1000} color={P.cream} weight={700} ct={0.05} cursorColor={P.green} />
      <FeatureGrid start={30.4} end={38.9} items={['One intelligent platform', 'AI-accelerated workflow', 'Human creative direction', 'Client portal + asset hub', 'No hourly overages', 'Simplified billing']} P={P} />
      <Marquee start={32.6} end={38.9} words={['Presentation design', 'Email campaigns', 'Infographics', 'Social media content', 'Video editing', 'E-learning content', 'Explainer videos', 'Interactive SOPs']} P={P} />
    </Sprite>
  );
}

// Outcomes — pains load first, the caped hero flies up flipping each to its win.
function OutcomeGrid({ start, end, P }) {
  const time = useTime();
  const OUTCOMES = [
    { pain: 'Messy email threads', win: 'Streamlined design requests' },
    { pain: 'Weeks of waiting', win: 'Projects done in days, not weeks' },
    { pain: 'No one to design it', win: 'A full creative team on demand' },
    { pain: 'Stuck in a queue', win: 'No more design bottlenecks' },
    { pain: 'Files scattered everywhere', win: 'Brand assets in one place' },
    { pain: 'Off-brand, inconsistent', win: 'Total brand consistency' },
  ];
  const COL_W = 426, ROW_H = 312, GAP = 28, GX = 110, GY = 710;
  const faceStyle = {
    position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
    background: '#fff', border: `1.5px solid ${P.line}`, borderRadius: 26, padding: '34px 32px',
    display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18,
    boxShadow: '0 18px 44px rgba(6,49,65,0.1)', boxSizing: 'border-box',
  };
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const outT = clamp((duration - localTime) / 0.35, 0, 1);
        const manStart = 4.0, manDur = 1.4;
        const IMGW = 360, IMGH = IMGW * 1356 / 1371, FEET = 0.913;
        const startTop = 1660, settleTop = 432 - FEET * IMGH;
        const mT = Easing.easeOutCubic(clamp((localTime - manStart) / manDur, 0, 1));
        const manTop = startTop + (settleTop - startTop) * mT;
        const manCenterY = manTop + IMGH / 2;
        const manOp = clamp((localTime - manStart) / 0.22, 0, 1);
        const settled = clamp((localTime - (manStart + manDur)) / 0.2, 0, 1);
        const bob = Math.sin((time - start) * 1.6) * 4 * settled;
        const capeWave = (Math.sin((time - start) * 2.4) * 1.7 + Math.sin((time - start) * 3.7 + 1) * 0.7) * settled;
        const speed = clamp((0.92 - mT) / 0.92, 0, 1);
        const streakOp = manOp * speed * (1 - settled) * outT;
        const manBodyX = 540 - (0.5 - 0.28) * IMGW;
        const feetY = manTop + FEET * IMGH + bob;
        return (
          <React.Fragment>
            {OUTCOMES.map((o, i) => {
              const col = i % 2, row = Math.floor(i / 2);
              const left = GX + col * (COL_W + GAP), top = GY + row * (ROW_H + GAP);
              const cardCenterY = top + ROW_H / 2;
              const painIn = Easing.easeOutCubic(clamp((localTime - (0.3 + i * 0.16)) / 0.4, 0, 1));
              // smooth, eased flip — staggered by row, timed to when the hero passes
              const flipStart = [4.35, 4.2, 4.05][row];
              const flip = Easing.easeInOutCubic(clamp((localTime - flipStart) / 0.6, 0, 1));
              const checkPop = Easing.easeOutBack(clamp((flip - 0.7) / 0.3, 0, 1));
              const showWin = flip >= 0.5;
              const flipSY = Math.abs(flip - 0.5) * 2;
              return (
                <div key={i} style={{
                  position: 'absolute', left, top, width: COL_W, height: ROW_H,
                  opacity: painIn * outT,
                }}>
                  <div style={{
                    width: '100%', height: '100%', transformOrigin: 'center center',
                    transform: `translateY(${(1 - painIn) * 26}px) scaleY(${flipSY})`,
                  }}>
                    <div style={{ ...faceStyle, position: 'relative', width: '100%', height: '100%' }}>
                      {showWin ? (
                        <React.Fragment>
                          <div style={{
                            flex: 'none', width: 64, height: 64, borderRadius: '50%', background: P.green,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 10px 24px rgba(6,49,65,0.14)', transform: `scale(${checkPop})`,
                          }}>
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                              <path d="M5 12.5l4.2 4.2L19 6.5" stroke={P.navy} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 38, color: P.ink, lineHeight: 1.08 }}>{o.win}</div>
                          <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 22, color: P.sub, textDecoration: 'line-through', textDecorationColor: P.accent2, opacity: 0.85 }}>{o.pain}</div>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <div style={{ flex: 'none', width: 64, height: 64, borderRadius: '50%', border: `4px solid ${P.accent2}`, opacity: 0.55 }} />
                          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 38, color: P.ink, lineHeight: 1.08 }}>{o.pain}</div>
                        </React.Fragment>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ position: 'absolute', left: manBodyX, top: feetY - 24, width: 180, height: 260, transform: 'translateX(-50%)', opacity: streakOp, pointerEvents: 'none', zIndex: 4 }}>
              {[0, 1, 2, 3, 4, 5].map((k) => {
                const sx = (k - 2.5) * 27;
                const len = 150 + (k % 3) * 64;
                const col = k % 2 ? 'rgba(232,56,7,0.9)' : 'rgba(240,171,0,0.85)';
                return <div key={k} style={{ position: 'absolute', left: `calc(50% + ${sx}px)`, top: 0, width: k % 2 ? 6 : 9, height: len, borderRadius: 6, transform: 'translateX(-50%)', background: `linear-gradient(to bottom, ${col}, rgba(232,56,7,0))` }} />;
              })}
            </div>
            <img src={CAPE} alt="" style={{
              position: 'absolute', left: 540, top: manTop + bob, width: IMGW,
              transform: `translateX(-50%) skewY(${capeWave}deg)`, transformOrigin: '32% 52%',
              opacity: manOp * outT,
              pointerEvents: 'none', zIndex: 5,
            }} />
          </React.Fragment>
        );
      }}
    </Sprite>
  );
}

function SceneSystem({ P }) {
  return (
    <Sprite start={39} end={50}>
      <Sparkles count={6} color={'rgba(146,45,177,0.26)'} seed={51} area={[60, 1020, 200, 760]} />
      <Head start={45.2} end={49.9} y={430} text="THE OUTCOME" size={30} weight={700} color={P.accent} font={FONT} ls="0.22em" />
      <Head start={39.5} end={49.9} y={508} text={"Every bottleneck,\nbehind you."} size={80} weight={800} color={P.ink} width={960} />
      <OutcomeGrid start={40.3} end={49.9} P={P} />
    </Sprite>
  );
}

// Typewriter CTA sentence — types in three chunks with pauses between.
// Typewriter sentence — every character is always in the layout (untyped ones
// just invisible) and the caret is drawn with box-shadow, so nothing reflows.
function TypeSentence({ start, end, y, segs, size = 56, width = 880, color, weight = 700, ct = 0.034, pause = 0.4, cursorColor = '#922DB1' }) {
  const full = segs.join('');
  const chars = full.split('');
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const outT = clamp((duration - localTime) / 0.35, 0, 1);
        let t = localTime, base = 0, nShow = 0;
        for (let s = 0; s < segs.length; s++) {
          const L = segs[s].length, dur = L * ct;
          if (t < dur) { nShow = base + Math.max(0, Math.floor(t / ct)); break; }
          t -= dur; base += L; nShow = base;
          if (s < segs.length - 1) {
            if (t < pause) break;
            t -= pause;
          }
        }
        nShow = clamp(nShow, 0, full.length);
        const done = nShow >= full.length;
        const caretOn = Math.floor(localTime * 2.6) % 2 === 0;
        return (
          <div style={{
            position: 'absolute', left: 540, top: y, width,
            transform: 'translateX(-50%)', textAlign: 'center',
            fontFamily: FONT, fontSize: size, fontWeight: weight, color,
            lineHeight: 1.22, letterSpacing: '-0.01em',
            opacity: Math.min(clamp(localTime / 0.15, 0, 1), outT),
          }}>
            {chars.map((ch, i) => {
              const visible = i < nShow;
              const isCaret = !done && caretOn && i === nShow - 1;
              return (
                <span key={i} style={{
                  opacity: visible ? 1 : 0,
                  boxShadow: isCaret ? `0.16em 0 0 0 ${cursorColor}` : 'none',
                }}>{ch}</span>
              );
            })}
          </div>
        );
      }}
    </Sprite>
  );
}

function SceneCTA({ P, brand, url }) {
  return (
    <Sprite start={50} end={59}>
      <Sparkles count={8} color={'rgba(146,45,177,0.3)'} seed={61} />
      <Sprite start={50.4} end={59}>
        {({ localTime }) => <img src={CLOUD_BACKDROP} alt="" style={{ position: 'absolute', left: 540, top: 480, width: 1000, transform: 'translate(-50%,0)', opacity: clamp(localTime / 0.7, 0, 1) * 0.95 }} />}
      </Sprite>
      <Logo start={50.4} />
      <TypeSentence start={50.8} end={59} y={720} segs={['We streamline Design Operations at AI speed,', ' on one platform,', ' at a fraction of the cost of hiring.']} size={56} width={880} color={P.ink} cursorColor={P.accent} ct={0.028} pause={0.3} />
      <UrlPill start={54.3} end={59} P={P} url={url} />
      <MarkerText start={54.9} end={59} x={540} y={1385} text="…or drop us a DM →" size={50} color={P.sub} rot={2} />
    </Sprite>
  );
}

// Persistent brand watermark (top) — adapts color on the dark scenes
function Watermark({ P, brand }) {
  const t = useTime();
  const onDark = (t >= 7 && t < 14) || (t >= 27 && t < 39);
  return (
    <div style={{
      position: 'absolute', left: 60, top: 62,
      fontFamily: FONT, fontWeight: 700, fontSize: 22, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: onDark ? 'rgba(247,226,207,0.92)' : P.sub,
    }}>{brand} · DaaS</div>
  );
}

// Persistent bottom progress bar
function ProgressBar({ P }) {
  const t = useTime();
  const onDark = (t >= 7 && t < 14) || (t >= 27 && t < 39);
  const pct = clamp(t / 56, 0, 1) * 100;
  return (
    <div style={{
      position: 'absolute', left: 0, bottom: 0, width: '100%', height: 10,
      background: onDark ? 'rgba(255,255,255,0.22)' : P.line,
    }}>
      <div style={{ height: '100%', width: `${pct}%`, background: onDark ? P.green : P.accent }} />
    </div>
  );
}

function DaaSVideo(props) {
  props = props || {};
  const P = pal(props);
  const brand = props.brand || 'Stimulating Media';
  const url = props.url || 'stimulatingmedia.com/daas';
  return (
    <Stage width={1080} height={1920} duration={59} background={P.bg} persistKey="daas-short">
      <SceneProblem P={P} />
      <SceneBuried P={P} />
      <SceneCompromise P={P} />
      <SceneWaste P={P} />
      <SceneSolution P={P} />
      <SceneSystem P={P} />
      <SceneCTA P={P} brand={brand} url={url} />
      <Watermark P={P} brand={brand} />
      <ProgressBar P={P} />
    </Stage>
  );
}

window.DaaSVideo = DaaSVideo;


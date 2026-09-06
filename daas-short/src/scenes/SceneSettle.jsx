/* Scene 4 — Don't settle for "good enough" (21–27s). Galaxy White, with the
   piece's one dark-glass surface: the chart card.
   Headline, then the potential-vs-shipped chart draws on (draw curve over
   reveal) with the rocket-man riding the tip of the POTENTIAL line and
   parking at its peak, the "your potential" marker draws a connector to that
   peak and wipes in, and the hand-written closer wipes in below. */
import React from 'react';
import { useLocal, useTime } from '../engine/timeline.jsx';
import { Scene, Fill, Kinetic, Rise, Marker, Connector, Sparkles, Glass, Glow, Pose, project, tint, bob } from '../motion/moves.jsx';
import { T, E, prog, clamp01 } from '../motion/tokens.js';
import { C, FONT, TRACK } from '../brand/palette.js';
import { A } from '../brand/assets.js';
import { SCENE } from './plan.js';

const B = { headline: 0, sparkles: 0.7, card: 0.7, draw: 1.3, marker: 2.4, closer: 2.6 };

/* Narrowed and shifted left from 110/860 so the posed card's right edge and its
   legend clear the platform action column (x > 930). */
const CARD = { x: 90, y: 880, w: 820, pad: 38, padTop: 36 };        // frame px
const SVG = { w: 760, h: 360 };                                     // chart units
const SCALEU = (CARD.w - CARD.pad * 2) / SVG.w;                     // chart unit -> frame px
const PTS = [[20, 300], [200, 250], [400, 160], [580, 80], [740, 38]];
const PEAK = { x: CARD.x + CARD.pad + 740 * SCALEU, y: CARD.y + CARD.padTop + 38 * SCALEU }; // frame px of the potential peak
const PIVOT = { cx: 500, cy: 1117 };                                // the posed plane pivots on the card's center
const PEAK_P = project(PEAK.x, PEAK.y, PIVOT);                      // where that peak actually lands once posed

function LineGraph({ at, drawAt }) {
  const { t, start } = useLocal();
  const time = useTime();
  const L = 1000;
  const draw = prog(t, drawAt, T.reveal, E.draw);
  const off = (1 - draw) * L;
  // rocket at the moving tip of the POTENTIAL line
  let segs = [], tot = 0;
  for (let i = 1; i < PTS.length; i++) { const l = Math.hypot(PTS[i][0] - PTS[i - 1][0], PTS[i][1] - PTS[i - 1][1]); segs.push(l); tot += l; }
  let dd = draw * tot, tip = PTS[0];
  for (let i = 0; i < segs.length; i++) {
    if (dd <= segs[i] || i === segs.length - 1) { const tt = segs[i] ? clamp01(dd / segs[i]) : 0; tip = [PTS[i][0] + (PTS[i + 1][0] - PTS[i][0]) * tt, PTS[i][1] + (PTS[i + 1][1] - PTS[i][1]) * tt]; break; }
    dd -= segs[i];
  }
  const RW = 200, RH = RW * (344 / 520);
  const RWpx = RW * SCALEU, RHpx = RH * SCALEU;
  const parked = draw >= 1 ? bob(time, start + drawAt + T.reveal, 8, 6) : 0;
  const rx = CARD.pad + tip[0] * SCALEU - 0.9 * RWpx;
  const ry = CARD.padTop + tip[1] * SCALEU - 0.16 * RHpx + parked;
  const rocketOp = E.launch(clamp01((draw - 0.05) / 0.2));
  const dot = E.launch(clamp01((draw - 0.93) / 0.07));
  const potential = PTS.map((p) => p.join(',')).join(' ');
  /* The chart card is the piece's one DARK glass surface on a light scene — the
     reference sets light and dark glass side by side, and it is what makes the
     spec's "Stimulating Green as the single neon line on gradient-sky" literally
     true: lime on white measures ~1.5:1, lime on navy glass ~9:1. The neon line
     carries a soft glow (a blurred twin of the stroke; the blur is a static
     material, only the dash draws on). What you ship stays flat and dim. */
  return (
    <React.Fragment>
    <Glow at={at} x={540} y={1117} r={400} color={C.nebula} alpha={0.22} />
    <Pose origin={`${PIVOT.cx}px ${PIVOT.cy}px`}>
    <Rise at={at} x={CARD.x} align="left" y={CARD.y} w={CARD.w}>
      <Glass dark style={{ padding: `${CARD.padTop}px ${CARD.pad}px 36px` }}>
        <svg viewBox={`0 0 ${SVG.w} ${SVG.h}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
          {[80, 160, 240].map((gy) => <line key={gy} x1="20" y1={gy} x2="740" y2={gy} stroke={tint(C.ice, 0.18)} strokeWidth="2" />)}
          <line x1="20" y1="320" x2="740" y2="320" stroke={tint(C.ice, 0.34)} strokeWidth="3" />
          {/* The glow sits just under the stroke rather than dead behind it, so the line reads as a lit tube and not a highlighter mark. */}
          <polyline points={potential} transform="translate(0 7)" fill="none" stroke={C.green} strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={off} opacity="0.45" style={{ filter: 'blur(10px)' }} />
          <polyline points={potential} fill="none" stroke={C.green} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={off} />
          <polyline points="20,300 200,296 400,288 580,290 740,282" fill="none" stroke={tint(C.ice, 0.5)} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={off} />
          <circle cx="740" cy="38" r={11 * dot} fill={C.green} />
          <circle cx="740" cy="282" r={9 * dot} fill={tint(C.ice, 0.5)} />
        </svg>
        <img src={A.rocketMan} alt="" style={{ position: 'absolute', left: rx, top: ry, width: RWpx, height: RHpx, opacity: rocketOp, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, fontFamily: FONT.display, fontWeight: 700, fontSize: 26, letterSpacing: TRACK.wide }}>
          <span style={{ color: C.cream }}><span style={{ color: C.green }}>●</span> POTENTIAL</span>
          <span style={{ color: tint(C.ice, 0.72) }}>● WHAT YOU SHIP</span>
        </div>
      </Glass>
    </Rise>
    </Pose>
    </React.Fragment>
  );
}

const SPARKS = [
  { x: 80, y: 340, kind: 'plus', size: 22, rest: 0.5 }, { x: 1000, y: 300, kind: 'ring', size: 20, rest: 0.35 },
  { x: 60, y: 760, kind: 'ring', size: 16, rest: 0.14 }, { x: 1020, y: 1380, kind: 'plus', size: 18, rest: 0.35 },
  { x: 96, y: 1420, kind: 'plus', size: 16, rest: 0.14 }, { x: 980, y: 1680, kind: 'ring', size: 24, rest: 0.5 },
];

export default function SceneSettle() {
  const { start, end } = SCENE.settle;
  return (
    <Scene start={start} end={end} bg={<Fill color={C.white} />}>
      <Sparkles at={B.sparkles} nodes={SPARKS} seed={31} />
      <Kinetic at={B.headline} y={470} size={88} lines={['Don’t settle for', '“good enough.”']} />
      <LineGraph at={B.card} drawAt={B.draw} />
      {/* The aside: a short dashed connector draws down to where the peak actually
          lands once the card is posed, then the marker wipes in. Royal Dark Ube,
          not Stimulating Green: green script on Galaxy White measures ~1.5:1. */}
      <Connector at={B.marker} d={`M 828 830 C 856 858, ${PEAK_P.x - 6} ${PEAK_P.y - 58}, ${PEAK_P.x - 2} ${PEAK_P.y - 20}`} color={C.navy} arrow />
      <Marker at={B.marker + T.fill * 0.6} x={646} y={764} text="your potential" size={50} color={C.ube} rot={-6} align="left" />
      <Marker at={B.closer} x={540} y={1520} w={920} text="That’s the untapped potential you’re leaving on the table." size={58} color={C.muted} rot={0} />
    </Scene>
  );
}

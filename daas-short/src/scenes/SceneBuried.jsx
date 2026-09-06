/* Scene 2 — Meanwhile (7–14s). Sky-blue ground matched to the collage.
   Kinetic headline, then the subject (the jumping woman with the loading-
   spinner head) arrives slower behind it, the five task pills stagger in
   around her and float, her spinner ticks, and two marker asides draw on with
   hand-drawn dashed connectors tethered to her (the brand's collage motif). */
import React from 'react';
import { useLocal, useTime } from '../engine/timeline.jsx';
import { Scene, Fill, Eyebrow, Kinetic, Rise, Marker, Connector, Glass, bob } from '../motion/moves.jsx';
import { T, D, E, delay, clamp01 } from '../motion/tokens.js';
import { C, ILLO, FONT } from '../brand/palette.js';
import { A } from '../brand/assets.js';
import { SCENE } from './plan.js';

const B = {
  eyebrow: 0,
  headline: 0.08,
  figure: 0.24,        // subject: glide over count (1.56s), rise-xl -> lands 1.8
  spinner: 1.9,
  pills: 1.6,          // 5 pills, wide cadence -> last lands 1.6 + 0.32 + 0.546 = 2.47
  marker1: 2.9,        // connector draws (fill), label wipes at 60% of the arrow
  marker2: 3.5,
};

const TASKS = [
  { x: 335, y: 655, text: 'Polish presentation deck', color: C.ube, rot: -9 },
  { x: 745, y: 685, text: 'New banner for website', color: C.nebula, rot: 3 },
  { x: 300, y: 965, text: 'Infographics', color: C.green, rot: 4 },
  { x: 700, y: 1075, text: 'Graphics for social post', color: C.orange, rot: -3 },
  { x: 435, y: 1255, text: 'Video for pitch deck', color: C.ube, rot: -5 },
];

function TaskCloud({ at }) {
  const { t, start } = useLocal();
  const time = useTime();
  return TASKS.map((k, i) => {
    const d = at + delay(i);
    const u = clamp01((t - d) / T.enter);
    const y = k.y + bobPhase(time, start + d + T.enter, i);
    // Light glass pills frosting the collage behind them; the colored dot is the
    // system's 18px rounded-square icon square (.sm-glass__dot) in the task's hue.
    return (
      <div key={i} style={{
        position: 'absolute', left: k.x, top: y,
        transform: `translate(-50%,-50%) translateY(${(1 - E.glide(u)) * D.rise}px) rotate(${k.rot}deg)`,
        opacity: E.glide(u),
      }}>
        {/* 0.78 rather than the 0.62 page value: these pills frost a photograph,
            and at 0.62 the navy label drops to about 5.5:1 over her laptop. */}
        <Glass pill style={{ background: 'rgba(255,255,255,0.78)', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 28px 16px 22px', whiteSpace: 'nowrap', boxShadow: '0 18px 44px rgba(6,49,65,0.20), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
          <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 6, background: k.color }} />
          <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 30, color: C.navy }}>{k.text}</span>
        </Glass>
      </div>
    );
  });
}
/* Each pill bobs 12px on the slow ambient cycle, phase-shifted so they don't move as one block. */
function bobPhase(time, from, i) { return bob(time + i * 1.7, from, 12, 6); }

/* Animated segmented loading ring over the static spinner in the artwork. A status loop: linear, stepped. */
function Spinner({ at }) {
  const { t } = useLocal();
  const time = useTime();
  const op = E.launch(clamp01((t - at) / T.fast));
  const spin = Math.floor(time * 12) * 30;
  const segs = [];
  for (let i = 0; i < 12; i++) {
    const g = Math.round(35 + (i / 11) * 198);
    segs.push(<rect key={i} x="46.5" y="6" width="7" height="20" rx="3.5" fill={`rgb(${g},${g},${g})`} transform={`rotate(${i * 30} 50 50)`} />);
  }
  return (
    <div style={{ position: 'absolute', left: 521, top: 817, width: 156, height: 156, transform: 'translate(-50%,-50%)', opacity: op, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: ILLO.sky }} />
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute', inset: 0, transform: `rotate(${spin}deg)` }}>{segs}</svg>
    </div>
  );
}

export default function SceneBuried() {
  const { start, end } = SCENE.buried;
  const IMG_W = 820, IMG_H = IMG_W * 1.5;
  return (
    <Scene start={start} end={end} bg={<Fill color={ILLO.sky} />}>
      {/* Subject: arrives last and slower (glide over count), behind the headline so the words settle before she covers them. */}
      <Rise at={B.figure} dur={T.count} travel={D.riseXl} x={540} y={1000 - IMG_H / 2} w={IMG_W}>
        <img src={A.womanLaptop} alt="" style={{ width: IMG_W, height: IMG_H }} />
      </Rise>
      <Spinner at={B.spinner} />
      <Eyebrow at={B.eyebrow} y={235} text="Meanwhile…" color={C.ube} />
      <Kinetic at={B.headline} y={305} size={74} lines={['Your best people,', 'buried in busywork.']} />
      <TaskCloud at={B.pills} />
      {/* Marker asides tethered to the subject. Connector draws on (draw over fill); label wipes at 60% of the arrow. */}
      <Connector at={B.marker1} d="M 372 1500 C 322 1410, 360 1350, 455 1330" color={C.navy} arrow />
      <Marker at={B.marker1 + T.fill * 0.6} x={358} y={1535} text="constantly juggling" size={56} color={C.ube} rot={-4} />
      <Connector at={B.marker2} d="M 700 1565 C 770 1470, 705 1410, 630 1360" color={C.navy} arrow />
      <Marker at={B.marker2 + T.fill * 0.6} x={700} y={1600} text="multiple projects" size={56} color={C.navy} rot={3} />
    </Scene>
  );
}

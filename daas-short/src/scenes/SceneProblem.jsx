/* Scene 1 — The problem (0–7s). Greige ground matched to the collage.
   Eyebrow is landed on frame 0 (frame 0 is never empty), the headline rises
   line by line, the four roles stagger in, the yearly total COUNTS up to
   $380,000, the woman-with-money-bag cut-out springs up from the bottom, and
   the hand-written aside wipes in last. */
import React from 'react';
import { useLocal } from '../engine/timeline.jsx';
import { Scene, Fill, Eyebrow, Kinetic, Rise, Marker, Glass, Glow, Pose, useCount, fmtMoney } from '../motion/moves.jsx';
import { T, D, E, delay, clamp01 } from '../motion/tokens.js';
import { C, ILLO, FONT, TRACK } from '../brand/palette.js';
import { A } from '../brand/assets.js';
import { SCENE } from './plan.js';

const ROLES = [
  { label: 'Graphic Designer', tag: '$95K' },
  { label: 'Motion Designer', tag: '$110K' },
  { label: 'Video Editor', tag: '$90K' },
  { label: 'Illustrator', tag: '$85K' },
];
const TOTAL = 380000;

/* Beat sheet (scene-local seconds) */
const B = {
  headline: 0.1,
  chips: 1.0,                 // 4 chips, wide cadence -> last lands 1.0 + 0.24 + 0.546
  total: 1.9,                 // counter runs over `count` (1.56s) -> 3.46
  figure: 3.6,                // prop: spring from the bottom
  aside: 4.3,                 // marker wipe over `fill`
};

/* Role chips: light glass capsules on the reference's floating pose, over a
   soft glow so the frost has something to sample — light Royal Dark Ube here,
   because Nebula Blue goes grey-green on the greige collage ground and the
   lavender sits with the ube eyebrow and total. */
function ChipCluster({ at, y }) {
  const { t } = useLocal();
  return (
    <React.Fragment>
      <Glow at={at} x={540} y={y + 90} r={380} color={C.ube50} alpha={0.20} />
      <Pose origin={`540px ${y + 90}px`}>
        <div style={{ position: 'absolute', left: 540, top: y, width: 940, transform: 'translateX(-50%)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '26px 18px' }}>
          {ROLES.map((c, i) => {
            const u = clamp01((t - at - delay(i)) / T.enter);
            return (
              <div key={i} style={{ transform: `translateY(${(1 - E.glide(u)) * D.rise}px)`, opacity: E.glide(u), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Glass pill style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 27, letterSpacing: TRACK.wide, textTransform: 'uppercase', color: C.navy, padding: '13px 26px', whiteSpace: 'nowrap' }}>{c.label}</Glass>
                <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 36, color: C.navy }}>{c.tag}</div>
              </div>
            );
          })}
        </div>
      </Pose>
    </React.Fragment>
  );
}

function Total({ at, y }) {
  const v = useCount(at, TOTAL);
  return (
    <Rise at={at} y={y} w={1000}>
      <div style={{ textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 92, color: C.ube, letterSpacing: '-0.01em', lineHeight: 1.04, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        = {fmtMoney(v)} <span style={{ fontWeight: 700, fontSize: 64, color: C.navy }}>/ year</span>
      </div>
    </Rise>
  );
}

export default function SceneProblem() {
  const { start, end } = SCENE.problem;
  const IMG_H = 760, IMG_W = Math.round(IMG_H * (1006 / 1140));
  return (
    <Scene start={start} end={end} bg={<Fill color={ILLO.greige} />}>
      {/* The cut-out sits behind the copy; it springs up from below the frame. */}
      <Rise at={B.figure} y={1920 - IMG_H + 10} x={540} w={IMG_W} travel={D.riseXl} ease={E.spring} scaleFrom={0.96} origin="center bottom">
        <img src={A.womanBudget} alt="" style={{ width: IMG_W, height: IMG_H }} />
      </Rise>
      <Eyebrow at={-1} y={240} text="The problem" color={C.ube} />
      <Kinetic at={B.headline} y={315} size={76} lines={['No time or budget', 'to build out your', 'creative team?']} />
      <ChipCluster at={B.chips} y={640} />
      <Total at={B.total} y={950} />
      <Marker at={B.aside} x={540} y={1055} text="A whole team you can’t justify hiring." size={60} color={C.navy} rot={0} />
    </Scene>
  );
}

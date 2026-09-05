/* Scene 3 — Let designers design (14–21s). Pink ground matched to the
   collage. Headline, then the gains & losses card whose bars FILL (scaleX on
   glide over fill), the hand-written line wipes in, and the man-leaping-the-
   bar-chart collage springs up from the bottom last. Sparkles pop after the
   headline lands and sit off to the sides. */
import React from 'react';
import { useLocal } from '../engine/timeline.jsx';
import { Scene, Fill, Kinetic, Rise, Marker, Sparkles, cardLight, fillProgress } from '../motion/moves.jsx';
import { T, D, E, delay } from '../motion/tokens.js';
import { C, ILLO, FONT, TRACK } from '../brand/palette.js';
import { A } from '../brand/assets.js';
import { SCENE } from './plan.js';

const B = { headline: 0, sparkles: 0.7, card: 0.7, bars: 1.3, aside: 2.2, figure: 3.1 };

const ROWS = [
  { label: 'Lost to design busywork', val: '−8 hrs / week', dir: -1, mag: 0.82, bar: C.ube, txt: C.ube },
  { label: 'Gained for high-value work', val: '+ full potential', dir: 1, mag: 1.0, bar: C.green, txt: C.navy },
];

function GainsLosses({ at, barsAt }) {
  const { t } = useLocal();
  return (
    <Rise at={at} y={640} w={860}>
      <div style={{ ...cardLight, padding: '30px 38px 34px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT.display, fontWeight: 700, fontSize: 20, letterSpacing: TRACK.overline, marginBottom: 22 }}>
          <span style={{ color: C.ube }}>◀ LOSS</span>
          <span style={{ color: C.navy }}>GAIN ▶</span>
        </div>
        {ROWS.map((r, i) => {
          const g = fillProgress(t, barsAt + delay(i));
          return (
            <div key={i} style={{ marginTop: i === 0 ? 0 : 26 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 26, color: C.navy }}>{r.label}</span>
                <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 28, color: r.txt, opacity: E.glide(g) }}>{r.val}</span>
              </div>
              <div style={{ position: 'relative', height: 30 }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: C.ice, transform: 'translateY(-50%)' }} />
                <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 3, background: C.navy, opacity: 0.16, transform: 'translateX(-50%)' }} />
                {/* The bar is a scaleX from the center axis; the label above sits outside the scaled element. */}
                <div style={{
                  position: 'absolute', top: 0, height: 30, borderRadius: 8, background: r.bar, width: `${r.mag * 50}%`,
                  transform: `scaleX(${g})`, transformOrigin: r.dir < 0 ? 'right center' : 'left center',
                  ...(r.dir < 0 ? { right: '50%' } : { left: '50%' }),
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </Rise>
  );
}

const SPARKS = [
  { x: 92, y: 300, kind: 'plus', size: 22, rest: 0.5 }, { x: 990, y: 260, kind: 'ring', size: 18, rest: 0.35 },
  { x: 1010, y: 560, kind: 'plus', size: 16, rest: 0.14 }, { x: 70, y: 590, kind: 'ring', size: 26, rest: 0.35 },
  { x: 130, y: 1140, kind: 'plus', size: 18, rest: 0.35 }, { x: 960, y: 1120, kind: 'plus', size: 24, rest: 0.5 },
  { x: 1000, y: 1180, kind: 'ring', size: 14, rest: 0.14 },
];

export default function SceneDesigners() {
  const { start, end } = SCENE.designers;
  const IMG_W = 1080, IMG_H = Math.round(1080 * (867 / 1300));
  return (
    <Scene start={start} end={end} bg={<Fill color={ILLO.pink} />}>
      <Sparkles at={B.sparkles} nodes={SPARKS} seed={21} />
      <Kinetic at={B.headline} y={360} size={92} lines={['Let designers', 'design.']} />
      <GainsLosses at={B.card} barsAt={B.bars} />
      <Marker at={B.aside} x={540} y={1000} text="And let your team do what they do best." size={60} color={C.navy} rot={0} />
      {/* Collage prop: springs up from the baseline (rise-xl + 0.96 origin), one overshoot, then rests. */}
      <Rise at={B.figure} x={0} align="left" y={1920 - IMG_H} w={IMG_W} travel={D.riseXl} ease={E.spring} scaleFrom={0.96} origin="center bottom">
        <img src={A.jumpGraph} alt="" style={{ width: IMG_W, height: IMG_H }} />
      </Rise>
    </Scene>
  );
}

/* Scene 7 — End card (50–59s). Deep Space Blue, cloud band at the foot,
   sparkles at rest (nothing twinkles on an end card). The Rocket Sting plays
   once: mark rises on settle, flame draws, boost swells, wordmark wipes. The
   closing line lands word by word in the three phrases Ben asked for, with a
   beat between each; every word is in the layout from the start so nothing
   shifts. Then the URL pill rises and the marker aside draws its arrow to it.
   Fully static for the last 2.3s: loop-safe. */
import React from 'react';
import { useLocal } from '../engine/timeline.jsx';
import { Scene, DarkBg, Sting, WordRise, wordRiseLanding, Rise, Marker, Connector, Sparkles } from '../motion/moves.jsx';
import { T, E, clamp01 } from '../motion/tokens.js';
import { C, FONT, SHADOW } from '../brand/palette.js';
import { SCENE } from './plan.js';

const SEGS = ['We streamline Design Operations at AI speed,', ' on one platform,', ' at a fraction of the cost of hiring.'];
const B = { sting: 0, sparkles: 0.3, line: 1.3 };
B.url = B.line + wordRiseLanding(SEGS) + 0.1;   // 4.80 — rises once the sentence has landed
B.aside = B.url + T.enter;                     // 5.35
B.arrow = B.aside + 0.3;                       // 5.65 -> drawn by 6.43; static from ~6.5

const SPARKS = [
  { x: 130, y: 380, kind: 'plus', size: 22, rest: 0.5 }, { x: 930, y: 330, kind: 'ring', size: 18, rest: 0.35 },
  { x: 990, y: 900, kind: 'plus', size: 16, rest: 0.35 }, { x: 80, y: 1000, kind: 'ring', size: 24, rest: 0.35 },
];

function UrlPill({ at, url }) {
  return (
    <Rise at={at} y={1175} w={800}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18, fontFamily: FONT.display, fontSize: 38, fontWeight: 700, color: '#fff', background: C.ube, borderRadius: 100, padding: '24px 46px 24px 38px', whiteSpace: 'nowrap', boxShadow: SHADOW.action }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {url}
        </div>
      </div>
    </Rise>
  );
}

export default function SceneCTA({ url }) {
  const { start, end } = SCENE.cta;
  return (
    <Scene start={start} end={end} exitAt={Infinity} bg={<DarkBg footer seed={9} />}>
      <Sparkles at={B.sparkles} nodes={SPARKS} seed={61} twinkle={false} />
      <Sting at={B.sting} y={470} width={760} ink={C.cream} />
      <WordRise at={B.line} y={720} segs={SEGS} size={56} weight={800} color={C.cream} w={880} lh={1.22} />
      <UrlPill at={B.url} url={url} />
      <Marker at={B.aside} x={470} y={1385} text="…or drop us a DM" size={52} color={C.green} rot={2} />
      <Connector at={B.arrow} d="M 720 1400 C 810 1395, 850 1350, 820 1290" color={C.green} arrow />
    </Scene>
  );
}

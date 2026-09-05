/* Scene 6 — The outcome (39–50s). Galaxy White. Headline, then six PAIN
   cards stagger in (no checks yet). After ~2.5s of reading time the caped
   hero blasts up from below the frame on `settle` (one overshoot, a mark/prop
   landing), Cosmic Orange + Stimulating Green streaks trailing with his
   speed; each row FLIPS to its outcome as his feet pass it (scaleY 1->0 on
   exit, 0->1 on launch, over `slow`), the check pops (launch, fast), and
   "THE OUTCOME" eyebrow reveals only as he lands standing on it. His cape
   flutters gently once he is settled. */
import React from 'react';
import { useLocal, useTime } from '../engine/timeline.jsx';
import { Scene, Fill, Eyebrow, Kinetic, Sparkles, cardLight } from '../motion/moves.jsx';
import { T, D, E, delay, clamp01 } from '../motion/tokens.js';
import { C, FONT } from '../brand/palette.js';
import { A } from '../brand/assets.js';
import { SCENE } from './plan.js';

const B = { headline: 0, sparkles: 0.7, cards: 0.8, hero: 4.3 };

const OUTCOMES = [
  { pain: 'Messy email threads', win: 'Streamlined design requests' },
  { pain: 'Weeks of waiting', win: 'Projects done in days, not weeks' },
  { pain: 'No one to design it', win: 'A full creative team on demand' },
  { pain: 'Stuck in a queue', win: 'No more design bottlenecks' },
  { pain: 'Files scattered everywhere', win: 'Brand assets in one place' },
  { pain: 'Off-brand, inconsistent', win: 'Total brand consistency' },
];
const COL_W = 426, ROW_H = 312, GAP = 28, GX = 110, GY = 710;
const IMGW = 360, IMGH = IMGW * (712 / 720), FEET = 0.913;
const START_TOP = 1660, SETTLE_TOP = 432 - FEET * IMGH;
const feetY = (u) => START_TOP + (SETTLE_TOP - START_TOP) * E.settle(u) + FEET * IMGH;

/* Flip a row as the hero's feet pass its center: solve the flight curve for
   the crossing once (the curve is monotonic on the way up). */
function crossing(rowCenterY) {
  let lo = 0, hi = 0.7;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (feetY(m) > rowCenterY) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
const FLIP_AT = [0, 1, 2].map((row) => B.hero + T.reveal * crossing(GY + row * (ROW_H + GAP) + ROW_H / 2) - T.slow * 0.35);

function OutcomeGrid({ cardsAt, heroAt }) {
  const { t, start } = useLocal();
  const time = useTime();
  const u = clamp01((t - heroAt) / T.reveal);
  const manTop = START_TOP + (SETTLE_TOP - START_TOP) * E.settle(u);
  const manOp = E.launch(clamp01((t - heroAt) / T.fast));
  const settled = clamp01((t - heroAt - T.reveal) / T.base);
  const capeWave = (Math.sin((time - start) * 2.4) * 1.7 + Math.sin((time - start) * 3.7 + 1) * 0.7) * settled;
  const speed = clamp01((0.92 - u) / 0.92);
  const streakOp = manOp * speed * (1 - settled);
  const manBodyX = 540 - (0.5 - 0.28) * IMGW;
  const feet = manTop + FEET * IMGH;
  return (
    <React.Fragment>
      {OUTCOMES.map((o, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const left = GX + col * (COL_W + GAP), top = GY + row * (ROW_H + GAP);
        const pu = clamp01((t - cardsAt - delay(i)) / T.enter);
        const painIn = E.glide(pu);
        // the flip: compress on exit, expand on launch, content swaps at the midpoint
        const f = clamp01((t - FLIP_AT[row]) / T.slow);
        const sy = f < 0.5 ? 1 - E.exit(f * 2) : E.launch((f - 0.5) * 2);
        const showWin = f >= 0.5;
        const check = E.launch(clamp01((t - FLIP_AT[row] - T.slow) / T.fast));
        return (
          <div key={i} style={{ position: 'absolute', left, top, width: COL_W, height: ROW_H, opacity: painIn }}>
            <div style={{ width: '100%', height: '100%', transformOrigin: 'center center', transform: `translateY(${(1 - painIn) * D.rise}px) scaleY(${Math.max(0.001, sy)})` }}>
              <div style={{ ...cardLight, position: 'relative', width: '100%', height: '100%', borderRadius: 26, padding: '34px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, boxSizing: 'border-box' }}>
                {showWin ? (
                  <React.Fragment>
                    <div style={{ flex: 'none', width: 64, height: 64, borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(6,49,65,0.14)', transform: `scale(${0.6 + 0.4 * check})`, opacity: check }}>
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.2 4.2L19 6.5" stroke={C.navy} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 38, color: C.navy, lineHeight: 1.08 }}>{o.win}</div>
                    <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: C.muted, textDecoration: 'line-through', textDecorationColor: C.nebula, opacity: 0.85 }}>{o.pain}</div>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <div style={{ flex: 'none', width: 64, height: 64, borderRadius: '50%', border: `4px solid ${C.nebula}`, opacity: 0.55 }} />
                    <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 38, color: C.navy, lineHeight: 1.08 }}>{o.pain}</div>
                  </React.Fragment>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {/* speed streaks behind the hero: Cosmic Orange and Stimulating Green */}
      <div style={{ position: 'absolute', left: manBodyX, top: feet - 24, width: 180, height: 260, transform: 'translateX(-50%)', opacity: streakOp, pointerEvents: 'none', zIndex: 4 }}>
        {[0, 1, 2, 3, 4, 5].map((k) => {
          const sx = (k - 2.5) * 27, len = 150 + (k % 3) * 64;
          const col = k % 2 ? 'rgba(196,214,0,0.9)' : 'rgba(240,171,0,0.9)';
          return <div key={k} style={{ position: 'absolute', left: `calc(50% + ${sx}px)`, top: 0, width: k % 2 ? 6 : 9, height: len, borderRadius: 6, transform: 'translateX(-50%)', background: `linear-gradient(to bottom, ${col}, rgba(240,171,0,0))` }} />;
        })}
      </div>
      <img src={A.capeMan} alt="" style={{ position: 'absolute', left: 540, top: manTop, width: IMGW, height: IMGH, transform: `translateX(-50%) skewY(${capeWave}deg)`, transformOrigin: '32% 52%', opacity: manOp, pointerEvents: 'none', zIndex: 5 }} />
    </React.Fragment>
  );
}

const SPARKS = [
  { x: 96, y: 330, kind: 'plus', size: 22, rest: 0.5 }, { x: 1000, y: 290, kind: 'ring', size: 18, rest: 0.35 },
  { x: 60, y: 600, kind: 'ring', size: 20, rest: 0.14 }, { x: 1020, y: 640, kind: 'plus', size: 16, rest: 0.35 },
  { x: 120, y: 1760, kind: 'plus', size: 18, rest: 0.35 }, { x: 960, y: 1790, kind: 'ring', size: 26, rest: 0.5 },
];

export default function SceneOutcome() {
  const { start, end } = SCENE.outcome;
  return (
    <Scene start={start} end={end} bg={<Fill color={C.white} />}>
      <Sparkles at={B.sparkles} nodes={SPARKS} seed={51} />
      <Eyebrow at={B.hero + T.reveal * 0.88} y={430} text="The outcome" color={C.ube} />
      <Kinetic at={B.headline} y={508} size={80} lines={['Every bottleneck,', 'behind you.']} />
      <OutcomeGrid cardsAt={B.cards} heroAt={B.hero} />
    </Scene>
  );
}

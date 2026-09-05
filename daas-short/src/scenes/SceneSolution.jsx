/* Scene 5 — The solution (27–39s). Deep Space Blue sky, cloud band at the
   foot. The rocket mark BLASTS out of the clouds one third in from the left,
   arcs to the top center leaning into its velocity and lands on `settle`
   (Expressive's one sanctioned overshoot on a mark); the flame outline draws
   on at 40% of the flight and the boost swells from the nozzle on `spring`.
   "DaaS" springs in as display type with a slow shimmer; "Design as a
   Service" lands word by word once the mark has settled; six glass cards
   stagger in; the service marquee runs last. */
import React from 'react';
import { useLocal, useTime } from '../engine/timeline.jsx';
import { Scene, DarkBg, Eyebrow, Rise, WordRise, Mark, glassDark } from '../motion/moves.jsx';
import { T, D, E, delay, prog, clamp01 } from '../motion/tokens.js';
import { C, FONT } from '../brand/palette.js';
import { SCENE } from './plan.js';

const B = { blast: 0, eyebrow: 0.2, daas: 0.3, tagline: 1.2, grid: 2.2, marquee: 3.4 };

const FEATURES = ['One intelligent platform', 'AI-accelerated workflow', 'Human creative direction', 'Client portal + asset hub', 'No hourly overages', 'Simplified billing'];
const SERVICES = ['Presentation design', 'Email campaigns', 'Infographics', 'Social media content', 'Video editing', 'E-learning content', 'Explainer videos', 'Interactive SOPs'];

/* The blast-off. Flight over `reveal` (1.04s): y on settle (fast start,
   one overshoot past the top, back to rest), x on launch (the arc), lean
   proportional to the remaining travel, streaks that fade with speed. */
function Blast({ at }) {
  const { t } = useLocal();
  const W = 110, H = W * (162.15 / 70);
  const startY = 1900, settleY = 150, launchX = 360, settleX = 540;
  const u = clamp01((t - at) / T.reveal);
  const ey = E.settle(u), ex = E.launch(u);
  const y = startY + (settleY - startY) * ey;
  const x = launchX + (settleX - launchX) * ex;
  const lean = (1 - ey) * 17;                       // leans right along the launch, settles upright (slightly past on the overshoot)
  const speed = clamp01((0.82 - u) / 0.82);
  const stretch = 1 + speed * 0.3;
  const op = E.launch(clamp01((t - at) / T.fast));
  const flame = prog(t, at + T.reveal * 0.4, T.fill, E.draw);
  const boost = prog(t, at + T.reveal * 0.4 + T.fill * 0.35, T.fill, E.spring);
  // cloud burst at the launch point: puffs on launch, fading on exit
  const bu = clamp01((t - at) / T.fill);
  const burstP = E.launch(bu), burstOp = (1 - E.exit(bu)) * op;
  const puffs = [];
  for (let k = 0; k < 9; k++) {
    const ang = (k / 9) * Math.PI * 2, dist = burstP * (110 + (k % 3) * 75);
    const px = Math.cos(ang) * dist, py = -Math.abs(Math.sin(ang)) * dist * 0.6 - burstP * 50;
    const sz = 40 + (k % 4) * 18 + burstP * 34;
    puffs.push(<div key={k} style={{ position: 'absolute', left: launchX + px, top: 1815 + py, width: sz, height: sz * 0.72, borderRadius: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(248,248,243,0.95)', filter: 'blur(5px)', opacity: burstOp }} />);
  }
  return (
    <React.Fragment>
      {puffs}
      <div style={{ position: 'absolute', left: launchX, top: 1815, width: burstP * 360, height: burstP * 360, borderRadius: '50%', transform: 'translate(-50%,-50%)', border: '3px solid rgba(248,248,243,0.45)', opacity: burstOp * 0.8 }} />
      {/* exhaust streaks: Stimulating Green and Galaxy White, fading with speed */}
      <div style={{ position: 'absolute', left: x, top: y + H * 0.45, width: 130, height: 560, transform: `translateX(-50%) rotate(${lean}deg)`, transformOrigin: 'center top', opacity: speed * op, pointerEvents: 'none' }}>
        {[0, 1, 2, 3, 4].map((k) => {
          const sx = (k - 2) * 25, len = 320 + (k % 3) * 130;
          const col = k % 2 ? 'rgba(196,214,0,0.85)' : 'rgba(248,248,243,0.85)';
          return <div key={k} style={{ position: 'absolute', left: `calc(50% + ${sx}px)`, top: 0, width: k % 2 ? 5 : 8, height: len, borderRadius: 6, transform: 'translateX(-50%)', background: `linear-gradient(to bottom, ${col}, rgba(196,214,0,0))` }} />;
        })}
      </div>
      <div style={{ position: 'absolute', left: x, top: y, width: W, transform: `translateX(-50%) rotate(${lean * 0.8}deg) scaleY(${stretch})`, transformOrigin: 'center bottom', opacity: op, zIndex: 3 }}>
        <Mark width={W} ink={C.white} flame={flame} boost={boost} />
      </div>
    </React.Fragment>
  );
}

/* Big "DaaS" wordmark: display type springs in (rise-lg, 0.96 origin), then a slow shimmer sweep (a linear status loop). */
function BigWord({ at }) {
  const time = useTime();
  const { start } = useLocal();
  const sweep = ((time - start) / (T.count * 2)) % 1;
  const bgPos = 150 - sweep * 200;
  return (
    <Rise at={at} y={500} w={800} travel={D.riseLg} ease={E.spring} scaleFrom={0.96}>
      <div style={{
        textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 196, letterSpacing: '-0.03em', lineHeight: 1,
        backgroundImage: `linear-gradient(100deg, ${C.cream} 0%, ${C.cream} 38%, #ffffff 50%, ${C.cream} 62%, ${C.cream} 100%)`,
        backgroundSize: '250% 100%', backgroundPosition: `${bgPos}% 0`,
        WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent',
      }}>DaaS</div>
    </Rise>
  );
}

function FeatureGrid({ at }) {
  const { t } = useLocal();
  return (
    <div style={{ position: 'absolute', left: 540, top: 940, width: 880, transform: 'translateX(-50%)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      {FEATURES.map((it, i) => {
        const u = clamp01((t - at - delay(i)) / T.enter);
        return (
          <div key={i} style={{
            ...glassDark, transform: `translateY(${(1 - E.glide(u)) * D.rise}px)`, opacity: E.glide(u),
            display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px', minHeight: 84,
            fontFamily: FONT.display, fontWeight: 600, fontSize: 28, color: C.cream, lineHeight: 1.12,
          }}>
            <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 6, background: C.green }} />
            {it}
          </div>
        );
      })}
    </div>
  );
}

/* Reading-order horizontal motion on `linear`: the one loop in the piece, and it is the content, not behind it. */
function Marquee({ at }) {
  const { t } = useLocal();
  const op = E.standard(clamp01((t - at) / T.base));
  const x = -Math.max(0, t - at) * 80;
  const line = SERVICES.join('   •   ');
  const full = (line + '   •   ').repeat(2);
  return (
    <div style={{ position: 'absolute', left: 0, top: 1440, width: 1080, overflow: 'hidden', opacity: op, WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)', maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
      <div style={{ display: 'inline-flex', whiteSpace: 'nowrap', transform: `translateX(${x}px)`, fontFamily: FONT.display, fontWeight: 500, fontSize: 30, color: 'rgba(248,248,243,0.94)', letterSpacing: '0.02em' }}>
        <span style={{ paddingLeft: 24 }}>{full}</span>
      </div>
    </div>
  );
}

export default function SceneSolution() {
  const { start, end } = SCENE.solution;
  return (
    <Scene start={start} end={end} bg={<DarkBg ceiling footer seed={5} />}>
      <Blast at={B.blast} />
      <Eyebrow at={B.eyebrow} y={432} text="The solution" color={C.green} />
      <BigWord at={B.daas} />
      <WordRise at={B.tagline} y={715} segs={['Design as a Service']} size={72} weight={700} color={C.cream} w={1000} />
      <FeatureGrid at={B.grid} />
      <Marquee at={B.marquee} />
    </Scene>
  );
}

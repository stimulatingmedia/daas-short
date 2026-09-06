/* Scene 5 — The solution (27–35s). Deep Space Blue sky, open at the top (the
   cloud ceiling is gone), cloud band at the foot. The rocket mark BLASTS out
   of the clouds one third in from the left, arcs to the top center leaning
   into its velocity and lands on `settle` (Expressive's one sanctioned
   overshoot on a mark); the flame outline draws on at 40% of the flight and
   the boost swells from the nozzle on `spring`. "DaaS" springs in as display
   type with a slow shimmer; "Design as a Service" lands word by word once the
   mark has settled. Then the six feature cards — navy glass in the reference's
   floating 12° pose over two soft glows — land ONE AT A TIME on the 12-frame
   beat grid: card i starts at 2.0 + i × T.beat (0.4s, so every start is a
   whole frame), by which point the card before it is 97% of the way down; the
   icon tile pops on `launch` over `fast` at 40% of its card's entrance
   (container before content). Six beats, not a stagger: Ben asked for one at
   a time. The service marquee (the one ambient loop) starts only after the
   last card has landed. Cut from 12s to 8s so the scene moves on. */
import React from 'react';
import { useLocal, useTime } from '../engine/timeline.jsx';
import { Scene, DarkBg, Eyebrow, Rise, WordRise, Mark, Glass, Glow, Pose, IconTile } from '../motion/moves.jsx';
import { T, D, E, prog, clamp01 } from '../motion/tokens.js';
import { C, FONT } from '../brand/palette.js';
import { SCENE } from './plan.js';

const B = { blast: 0, eyebrow: 0.2, daas: 0.3, tagline: 1.2, cards: 2.0 };
const cardAt = (i) => B.cards + i * T.beat;         // one per beat: 2.0, 2.4, 2.8, 3.2, 3.6, 4.0
const iconAt = (i) => cardAt(i) + T.enter * 0.4;    // the tile pops at 40% of its card's entrance
B.marquee = cardAt(5) + T.enter;                    // 4.546 — after the last card has landed

const FEATURES = [
  { l1: 'One intelligent', l2: 'platform', icon: 'layers' },
  { l1: 'AI-accelerated', l2: 'workflow', icon: 'sparkles' },
  { l1: 'Human creative', l2: 'direction', icon: 'pen' },
  { l1: 'Client portal', l2: '+ asset hub', icon: 'grid' },
  { l1: 'No hourly', l2: 'overages', icon: 'clock' },
  { l1: 'Simplified', l2: 'billing', icon: 'receipt' },
];
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

/* The feature field: a 2 x 3 grid of navy glass cards on one posed plane
   (the reference's tilted glass), each with a lit icon tile and a two-line
   label. Cards land one at a time on the Launch Rise (glide, rise-40). */
const COL_W = 400, ROW_H = 128, GAP = 24, GRID_W = COL_W * 2 + GAP, GRID_H = ROW_H * 3 + GAP * 2;
const GX = 540 - GRID_W / 2, GY = 850, PAD = 60; // PAD: room around the grid for the pose

function FeatureField() {
  const { t } = useLocal();
  return (
    <Pose layer="front" x={GX - PAD} y={GY - PAD} w={GRID_W + PAD * 2} h={GRID_H + PAD * 2}>
      {FEATURES.map((f, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const u = clamp01((t - cardAt(i)) / T.enter);
        return (
          <div key={i} style={{ position: 'absolute', left: PAD + col * (COL_W + GAP), top: PAD + row * (ROW_H + GAP), width: COL_W, height: ROW_H, transform: `translateY(${(1 - E.glide(u)) * D.rise}px)`, opacity: E.glide(u) }}>
            <Glass dark style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px' }}>
              <IconTile name={f.icon} at={iconAt(i)} />
              <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 27, lineHeight: 1.14, color: C.cream, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                <div>{f.l1}</div>
                <div>{f.l2}</div>
              </div>
            </Glass>
          </div>
        );
      })}
    </Pose>
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
    <div style={{ position: 'absolute', left: 0, top: 1400, width: 1080, overflow: 'hidden', opacity: op, WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)', maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
      <div style={{ display: 'inline-flex', whiteSpace: 'nowrap', transform: `translateX(${x}px)`, fontFamily: FONT.display, fontWeight: 500, fontSize: 30, color: 'rgba(248,248,243,0.94)', letterSpacing: '0.02em' }}>
        <span style={{ paddingLeft: 24 }}>{full}</span>
      </div>
    </div>
  );
}

export default function SceneSolution() {
  const { start, end } = SCENE.solution;
  return (
    <Scene start={start} end={end} bg={<DarkBg footer seed={5} />}>
      <Blast at={B.blast} />
      <Eyebrow at={B.eyebrow} y={432} text="The solution" color={C.green} />
      <BigWord at={B.daas} />
      <WordRise at={B.tagline} y={715} segs={['Design as a Service']} size={72} weight={700} color={C.cream} w={1000} />
      {/* The soft gradient the glass floats over: two orbs behind the field, Nebula Blue and Royal Dark Ube. */}
      <Glow at={B.cards} x={330} y={980} r={330} color={C.nebula} alpha={0.30} />
      <Glow at={B.cards} x={800} y={1190} r={340} color={C.ube} alpha={0.30} />
      <FeatureField />
      <Marquee at={B.marquee} />
    </Scene>
  );
}

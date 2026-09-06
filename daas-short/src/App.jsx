/* The DaaS short: seven scenes on one 55s stage, cloud-band wipes between
   them, a persistent watermark and progress bar. Tweak copy/URL here. */
import React from 'react';
import { Stage, useTime } from './engine/timeline.jsx';
import { CloudWipe, Fill, DarkBg } from './motion/moves.jsx';
import { C, ILLO, FONT, TRACK } from './brand/palette.js';
import { clamp01 } from './motion/tokens.js';
import { SCENE, DURATION, MARKERS } from './scenes/plan.js';
import SceneProblem from './scenes/SceneProblem.jsx';
import SceneBuried from './scenes/SceneBuried.jsx';
import SceneDesigners from './scenes/SceneDesigners.jsx';
import SceneSettle from './scenes/SceneSettle.jsx';
import SceneSolution from './scenes/SceneSolution.jsx';
import SceneOutcome from './scenes/SceneOutcome.jsx';
import SceneCTA from './scenes/SceneCTA.jsx';

export { DURATION };

const BRAND = 'Stimulating Media';
const URL = 'stimulatingmedia.com/daas';

/* Scenes whose upper frame is night sky: only the watermark swaps to its
   dark-surface color. The progress bar never does — it rests on the Galaxy
   White cloud footer in those scenes too, so its light palette is correct
   everywhere and it no longer snaps color at a cut. */
const onDark = (t) => (t >= SCENE.solution.start && t < SCENE.solution.end) || t >= SCENE.cta.start;

function Watermark() {
  const t = useTime();
  return (
    /* Below the platform's status / header strip (the top ~140px), not inside it. */
    <div style={{ position: 'absolute', left: 60, top: 156, fontFamily: FONT.display, fontWeight: 700, fontSize: 24, letterSpacing: TRACK.overline, textTransform: 'uppercase', color: onDark(t) ? 'rgba(243,231,211,0.92)' : C.muted }}>
      {BRAND} · DaaS
    </div>
  );
}

/* Progress: a scaleX, never a width. Reaches 100% exactly on the last frame, so the loop point is a resting frame. */
function ProgressBar() {
  const t = useTime();
  return (
    <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 10, background: C.ice }}>
      <div style={{ height: '100%', width: '100%', transformOrigin: 'left center', transform: `scaleX(${clamp01(t / DURATION)})`, background: C.ube }} />
    </div>
  );
}

export default function App({ renderMode = false }) {
  return (
    <Stage width={1080} height={1920} duration={DURATION} background={ILLO.greige} renderMode={renderMode} persistKey="daas-short" markers={MARKERS}>
      <SceneProblem />
      <SceneBuried />
      <SceneDesigners />
      <SceneSettle />
      <SceneSolution />
      <SceneOutcome />
      <SceneCTA url={URL} />
      {/* Cloud Band Reveal into each scene: the incoming background rides in under the scalloped edge. One wipe per scene, none under 6s apart. */}
      <CloudWipe at={SCENE.buried.start} bg={<Fill color={ILLO.sky} />} />
      <CloudWipe at={SCENE.designers.start} bg={<Fill color={ILLO.pink} />} />
      <CloudWipe at={SCENE.settle.start} bg={<Fill color={C.white} />} />
      <CloudWipe at={SCENE.solution.start} bg={<DarkBg footer seed={5} />} />
      <CloudWipe at={SCENE.outcome.start} bg={<Fill color={C.white} />} />
      <CloudWipe at={SCENE.cta.start} bg={<DarkBg footer seed={9} twinkle={false} />} />
      <Watermark />
      <ProgressBar />
    </Stage>
  );
}

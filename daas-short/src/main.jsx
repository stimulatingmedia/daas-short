import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import App, { DURATION } from './App.jsx';
import { clock } from './engine/clock.js';
import { FPS } from './motion/tokens.js';
import { ALL_ASSETS, FONT_FACES } from './brand/assets.js';
import './styles.css';

/* ?render puts the stage in headless mode: 1080 x 1920 at (0,0), no chrome,
   playhead driven from outside through window.__daas. scripts/render.mjs uses
   this to capture one frame per 1/30s and pipe them into ffmpeg. */
const params = new URLSearchParams(location.search);
const RENDER = params.has('render');

const root = createRoot(document.getElementById('root'));
root.render(<App renderMode={RENDER} />);

if (RENDER) {
  document.documentElement.classList.add('render');
  const nextPaint = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const decode = (src) => new Promise((res) => { const i = new Image(); i.onload = () => (i.decode ? i.decode().then(res, res) : res()); i.onerror = res; i.src = src; });
  const ready = Promise.all([
    ...ALL_ASSETS.map(decode),
    ...FONT_FACES.map((f) => document.fonts.load(f).catch(() => null)),
    document.fonts.ready,
  ]).then(() => nextPaint());
  window.__daas = {
    duration: DURATION,
    fps: FPS,
    ready,
    /* Seek to an absolute time (s). Resolves after the frame has painted. */
    seek: async (t) => { flushSync(() => clock.set(t)); await nextPaint(); return t; },
  };
}

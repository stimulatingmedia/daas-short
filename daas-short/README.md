# DaaS Short — Stimulating Media

A 55-second 9:16 social short (Reels / TikTok / Shorts) telling the DaaS story: *the problem → buried in busywork → let designers design → don't settle → the solution → the outcome → end card.* Built on the [Stimulating Media motion design system](https://github.com/stimulatingmedia/motiondesign) in its **Expressive** profile and rendered headlessly to MP4.

The design was authored in Claude Design (see `../chats/` and `../project/`); this folder is the production implementation. The UI elements (chips, pills, cards, the chart) follow Ben's glass-UI style reference: frosted cards floating in a 12° pose over soft glows, one neon line in the chart, rounded-square icon tiles — the translation the motion spec itself gives that reference (Glass surface + Depth Field).

## Quick start

```sh
npm install
npm run dev        # preview player at http://localhost:5173 — space play/pause, ←/→ frame step, 1–7 jump to a scene, g safe zones
npm run render     # → out/daas-short-1080x1920.mp4 + out/poster.png  (≈2–3 min)
npm run keyframes  # → out/keyframes.png, a contact sheet of every beat for review
```

`npm run render` builds, serves `dist/`, opens it in headless Chromium at 1080 × 1920, steps the playhead one frame at a time and pipes PNG frames into ffmpeg (H.264, yuv420p, faststart). Frames are captured, not screen-recorded, so timing is exact and the encode is clean.

## How it is built

**Every frame is a pure function of the playhead.** Scenes are React components that read a scene-local clock (`useLocal().t`) and compute position, opacity, clip, dash-offset — nothing uses CSS animations, transitions or wall-clock time. That is what lets the same tree play live in the browser (`src/engine/timeline.jsx`, an rAF player) and render frame-exact headlessly (`window.__daas.seek(t)` from `scripts/render.mjs`).

**Every number is a motion token.** `src/motion/tokens.js` imports `vendor/sm-motion/tokens/motion.js` (the motion system's numbers), applies the Expressive profile (durations ×1.3, travel ×2.5), and exposes:

| | |
|---|---|
| `T.*` | durations in seconds — `enter` 0.546, `fill` 0.78, `reveal` 1.04, `count` 1.56, `exit` 0.328 (0.6 × enter), `fast` 0.12, `slow` 0.468, `beat` 0.4 |
| `D.*` | travel in px — `riseSm` 20, `rise` 40, `riseLg` 80, `riseXl` 160 |
| `E.*` | the nine curves as samplers — `launch`, `glide`, `standard`, `exit`, `thrust`, `draw`, `settle`, `spring`, `linear` |
| `delay(i)` | the 80ms hero cadence, capped at 400ms |

`src/motion/moves.jsx` implements the signature moves as time-driven components: **Launch Rise** (`Rise`), **Kinetic Type** (`Kinetic`), word-by-word sentence build (`WordRise`), **Marker Draw-On** (`Marker` wipe + `Connector` dashed draw-on), **Sparkle Field**, **Cloud Band Reveal** (`CloudWipe`, the scene transition), **Rocket Sting** (`Sting`, `Mark` — split from the real lockup SVG), counters, progress fills, the Depth-Field bob, and the glass world: **Glass surface** (`Glass`, light/dark/pill, with the reference's top-left sheen), **Glow** (the soft gradient orb the frost samples), **Pose** (the Depth Field's static 12° perspective pose by layer), **IconTile** + **Glyph** (rounded-square tiles with 24-viewBox stroke glyphs from `src/brand/glyphs.js`, popping on `launch` over `fast`).

## Where the motion system shows up

- **Already in flight.** Entrances on `glide` (≥360ms) or `launch` (<360ms), exits on `exit` at 0.6× — everything in a scene exits *together*, rising. Nothing eases in to arrive; nothing falls.
- **Overshoot is earned.** `spring` only on display type (headline lines, "DaaS") and collage props (the cut-outs); `settle` on the rocket mark's landing and the hero's landing. Running text, pills and cards land dead on `glide`.
- **One cadence per scene:** 80ms, capped at 400ms.
- **Spark, not flood.** Sparkles pop *after* the headline lands (120ms, 30ms apart), rest at uneven opacities off to the sides, at most three twinkle on 6–12s cycles. None twinkle on the end card. Stimulating Green is the flame, the marker script, the check — never a flood.
- **Cloud Band Reveal** between scenes: the incoming background rides in under the scalloped edge on `thrust` over `reveal`, Platinum Ice trail four frames behind. The clouds always rest at the bottom of the dark scenes.
- **Rocket Sting** twice: the blast-off out of the clouds in *The solution* (Ben's choreography, retimed to tokens: flight on `settle`, flame draws at 40%, boost swells on `spring`) and the full lockup on the end card (mark rises, flame draws, boost swells, wordmark wipes).
- **Glass surface + Depth Field pose** (the style reference): every UI element is frosted glass — 16px frost at 62% white or 72% navy, hairline edge, inset highlight, navy-tinted shadow — floating in the Expressive profile's static 12° pose (`rotateX(12°) rotateY(−12°)`, 1200px perspective) over soft Nebula Blue / Royal Dark Ube glows so the frost has something to sample. Copy stays on the front layer; blur is a material, never a motion. The S4 chart carries the reference's *one* neon line in Stimulating Green (a static blurred twin under the stroke; only the dash draws on). Icons sit in rounded-square tiles and pop on `launch` over `fast` once their card has landed.
- **One at a time in *The solution*:** the six feature cards land sequentially, each starting as the one before it lands (`T.enter` apart), two-line labels with an icon each; the scene was cut from 12s to 8s and the cloud ceiling removed so the sky is open above the rocket.
- **Kinetic Type**, not typewriter. The system bans letter-by-letter text, so the end-card sentence lands **word by word in the three phrases Ben asked for** with a beat between each; every word is in the layout from frame one so nothing reflows. Same for "Design as a Service".
- **Video rules:** 30fps beat grid, frame 0 is never empty (eyebrow + ground landed), the end card is fully static for its last 2.3s and loop-safe, the progress bar reaches 100% on the last frame.
- **Palette:** only brand hues (`src/brand/palette.js` mirrors `brand.css`), plus three illustration-matched grounds that extend the collage artwork (marked `palette-lint-ignore`).

## Layout

```
daas-short/
├─ index.html · vite.config.js · package.json
├─ public/
│  ├─ assets/     optimized WebP cut-outs and collages (11 MB → 0.4 MB), cloud band SVG
│  └─ fonts/      self-hosted Montserrat / Roboto / Caveat (deterministic headless renders)
├─ src/
│  ├─ App.jsx           the cut: seven scenes, six cloud wipes, watermark, progress
│  ├─ engine/           timeline.jsx (Stage, Sprite, player), clock.js (external playhead)
│  ├─ motion/           tokens.js (profile-applied numbers), bezier.js, moves.jsx (signature moves)
│  ├─ brand/            palette.js, assets.js, glyphs.js (icon paths), lockup.js (generated from the brand SVG)
│  └─ scenes/           plan.js (boundaries) + one file per scene, each with its beat sheet at the top
├─ scripts/
│  ├─ render.mjs         frames → ffmpeg → MP4 (+ poster)
│  ├─ keyframes.mjs      QA contact sheet (--full keeps full-size frames)
│  ├─ optimize-assets.py 5000px sources → render-size WebP (needs Pillow)
│  └─ build-lockup.mjs   splits the lockup SVG into sting parts → src/brand/lockup.js
└─ vendor/sm-motion/     tokens + brand assets vendored from stimulatingmedia/motiondesign (see VERSION.md)
```

## Editing

- **Copy / URL:** `src/App.jsx` (brand, URL) and each `src/scenes/*.jsx` (text). Each scene file opens with a `B = { … }` beat sheet in scene-local seconds — retime there.
- **Scene lengths:** `src/scenes/plan.js`. Keep boundaries on whole frames (multiples of 1/30 s).
- **A new move:** compose `Rise` / `Kinetic` / `Marker` / `Connector` with `T`, `D`, `E`, `delay`. Don't type a millisecond or a pixel; if a value isn't on the ladder, the motion spec says it's a bug.
- **A new card or pill:** wrap it in `<Glass>` (`dark` on navy, `pill` for capsules), put a `<Glow>` behind it, and sit it inside a `<Pose origin="…">` pivoting on the card's center. Icons: add a 24-viewBox path list to `src/brand/glyphs.js` and use `<IconTile name at>`.
- **Re-vendoring the motion system:** copy the files listed in `vendor/sm-motion/VERSION.md`, then `npm run lockup`.

## Render options

```sh
node scripts/render.mjs --start 27 --end 35          # one scene
node scripts/render.mjs --crf 16 --out out/master.mp4
node scripts/keyframes.mjs --times 0,3.2,6.5 --full  # specific frames, full size in out/frames/
node scripts/keyframes.mjs --dist dist-qa --port 4310 # build/serve a private copy (several QA runs can share one checkout)
```

Requirements: Node 22, Playwright's Chromium (the scripts pick up a global `playwright` install), ffmpeg via `@ffmpeg-installer/ffmpeg` (installed with `npm install`), Python 3 + Pillow only for `optimize-assets.py`.

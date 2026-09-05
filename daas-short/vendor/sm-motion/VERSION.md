# Vendored from stimulatingmedia/motiondesign

Source: https://github.com/stimulatingmedia/motiondesign
Commit: 165df144c85201e7ac9dfef751fa6f989c3adfa4
Vendored: 2026-09-05

Files: tokens/motion.js (the numbers), tokens/motion.css, tokens/brand.css,
assets/smedia-full.svg (the lockup the Rocket Sting is split from),
assets/cloud-footer*.svg, assets/clouds-navy.png.

The motion repo README says: "Until it is on a registry, reference the repo
path or vendor the five files." This app is a time-driven renderer (every
frame is a pure function of the playhead), so it consumes tokens/motion.js
directly and re-implements the curves as samplers; it does not load
sm-motion.css / sm-motion.js. Do not edit these files here; re-vendor.

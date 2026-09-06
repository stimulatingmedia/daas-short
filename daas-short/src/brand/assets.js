/* Every bitmap/vector the comp loads. The renderer decodes all of them before
   the first frame so no frame is ever captured with a half-loaded image.
   Files are produced by scripts/optimize-assets.py into public/assets. */
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const asset = (f) => `${base}assets/${f}`;

export const A = {
  womanBudget: asset('woman-budget.webp'), // S1 — woman, money bag, arrow (cut-out)
  womanLaptop: asset('woman-laptop.webp'), // S2 — jumping woman with laptop and spinner head
  jumpGraph: asset('jump-graph.webp'),     // S3 — man leaping the orange bar chart
  rocketMan: asset('rocket-man.webp'),     // S4 — rides the potential line (cut-out)
  capeMan: asset('cape-man.webp'),         // S6 — the hero (cut-out)
  cloudFooter: asset('cloud-footer.svg'),  // S5/S7 — the brand's scalloped cloud band (Galaxy White)
};
export const ALL_ASSETS = Object.values(A);

/* Font faces to force-load before rendering (self-hosted in public/fonts). */
export const FONT_FACES = [
  '400 40px "Montserrat"', '600 40px "Montserrat"', '700 40px "Montserrat"', '800 40px "Montserrat"',
  'italic 400 40px "Montserrat"', '400 40px "Roboto"', '600 40px "Caveat"', '700 40px "Caveat"',
];

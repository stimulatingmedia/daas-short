/* Icon glyphs: 24 x 24 viewBox, stroke-based, 2.2 stroke, round caps and
   joins (the CTA's leading-icon style, from the motion system). Drawn here so
   the headless render never fetches an icon font. Each entry is a list of
   path `d` strings; <Glyph name="layers" /> in moves.jsx draws them. */
export const GLYPH = {
  // one intelligent platform: three stacked layers
  layers: ['M12 3 21 8 12 13 3 8 12 3z', 'M3 12.5 12 17.5 21 12.5', 'M3 17 12 22 21 17'],
  // AI-accelerated workflow: a four-point spark with a small companion spark
  sparkles: ['M11 3c.55 4.9 3.1 7.45 8 8-4.9.55-7.45 3.1-8 8-.55-4.9-3.1-7.45-8-8 4.9-.55 7.45-3.1 8-8z', 'M19 15c.25 2 1.25 3 3.25 3.25-2 .25-3 1.25-3.25 3.25-.25-2-1.25-3-3.25-3.25 2-.25 3-1.25 3.25-3.25z'],
  // human creative direction: the pen tool
  pen: ['M12 19 19 12l3 3-7 7-3-3z', 'M18 13 16.5 5.5 2 2l3.5 14.5L13 18l5-5z', 'M2 2l7.6 7.6', 'M11 11a1.5 1.5 0 1 0 0 .01'],
  // client portal + asset hub: the portal's dashboard grid
  grid: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  // no hourly overages: the clock
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 7v5l3.5 2'],
  // simplified billing: one receipt
  receipt: ['M5 2.5v19l2.3-1.3 2.4 1.3 2.3-1.3 2.3 1.3 2.4-1.3L19 21.5v-19l-2.3 1.3-2.4-1.3L12 3.8 9.7 2.5 7.3 3.8 5 2.5z', 'M9 8h6', 'M9 12h6', 'M9 16h4'],
  // the check (outcome cards) and the arrow (CTA)
  check: ['M5 12.5l4.2 4.2L19 6.5'],
  arrow: ['M5 12h14', 'M13 6l6 6-6 6'],
};

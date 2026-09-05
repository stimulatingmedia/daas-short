/* Brand colors, mirrored from vendor/sm-motion/tokens/brand.css so inline
   styles (the comp is authored in absolute pixels) can read them as JS.
   Only brand hues live here, plus three illustration-matched backgrounds. */
export const C = {
  // core
  navy: '#063141',        // Deep Space Blue — headings, dark surfaces
  green: '#C4D600',       // Stimulating Green — the spark: flame, marker script, small highlights
  ice: '#DDE6F0',         // Platinum Ice — hairlines, tracks, the cloud trail
  // accent
  ube: '#922DB1',         // Royal Dark Ube — the action color, eyebrows the user set to purple
  orange: '#F0AB00',      // Cosmic Orange — eyebrow default, one stat color
  nebula: '#72DBFA',      // Nebula Blue — info, focus, the pain-card ring
  // neutral
  gray: '#3F4444',        // Space Gray — body text
  white: '#F8F8F3',       // Galaxy White — page background
  paper: '#ffffff',       // card surface
  cream: '#F3E7D3',       // headings on dark surfaces
  muted: '#656969',       // space-gray-80: 5.3:1 on white; the 65 tint fails AA below 18px
  ube50: '#c896d8',       // sparkle field color (light Royal Dark Ube)
  navy80: '#385a67',
  navy90: '#1f4654',
  // gradient-sky stops (brand.css --gradient-sky)
  sky1: '#063141', sky2: '#0c4456', sky3: '#155366',
};

/* Illustration-matched backgrounds. These extend the collage artwork so the
   square image edges disappear (Ben's direction in the design chats); they
   are illustration colors, not UI tokens. */
export const ILLO = {
  greige: '#eae5df', // palette-lint-ignore: sampled from woman-budget / calc collage ground
  sky: '#b9cbd9',    // palette-lint-ignore: sampled from woman-laptop collage ground
  pink: '#ffe2f4',   // palette-lint-ignore: sampled from jump-graph collage ground
};

/* Shadows (navy-tinted, never warm black) and radii, from brand.css */
export const SHADOW = {
  sm: '0 2px 8px rgba(6, 49, 65, 0.08)',
  md: '0 8px 24px rgba(6, 49, 65, 0.10)',
  lg: '0 18px 48px rgba(6, 49, 65, 0.14)',
  action: '0 8px 24px rgba(146, 45, 177, 0.28)',
};
export const RADIUS = { sm: 8, md: 12, lg: 18, xl: 28, pill: 999 };

export const FONT = {
  display: '"Montserrat", system-ui, sans-serif',
  body: '"Roboto", system-ui, sans-serif',
  hand: '"Caveat", "Comic Sans MS", cursive',
};
export const TRACK = { tight: '-0.02em', overline: '0.14em', wide: '0.04em' };

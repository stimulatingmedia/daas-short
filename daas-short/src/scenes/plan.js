/* The cut. Seven beats, 59s, boundaries on whole seconds (all on the 30fps
   grid). Between scenes the Cloud Band Reveal rises over the last 1.04s of
   the outgoing scene; the outgoing content exits together just before it. */
export const SCENE = {
  problem:   { start: 0,  end: 7,  label: 'The problem' },
  buried:    { start: 7,  end: 14, label: 'Meanwhile: buried in busywork' },
  designers: { start: 14, end: 21, label: 'Let designers design' },
  settle:    { start: 21, end: 27, label: "Don't settle for good enough" },
  solution:  { start: 27, end: 39, label: 'The solution: DaaS' },
  outcome:   { start: 39, end: 50, label: 'The outcome' },
  cta:       { start: 50, end: 59, label: 'End card' },
};
export const DURATION = SCENE.cta.end;
export const MARKERS = Object.values(SCENE).map((s) => ({ t: s.start, label: s.label }));

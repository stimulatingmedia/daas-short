/* The cut. Seven beats, 55s, boundaries on whole seconds (all on the 30fps
   grid). Between scenes the Cloud Band Reveal rises over the last 1.04s of
   the outgoing scene; the outgoing content exits together just before it.
   The solution scene was cut from 12s to 8s (Ben: it took too long to move
   on); its six cards now land one at a time, T.enter apart. */
export const SCENE = {
  problem:   { start: 0,  end: 7,  label: 'The problem' },
  buried:    { start: 7,  end: 14, label: 'Meanwhile: buried in busywork' },
  designers: { start: 14, end: 21, label: 'Let designers design' },
  settle:    { start: 21, end: 27, label: "Don't settle for good enough" },
  solution:  { start: 27, end: 35, label: 'The solution: DaaS' },
  outcome:   { start: 35, end: 46, label: 'The outcome' },
  cta:       { start: 46, end: 55, label: 'End card' },
};
export const DURATION = SCENE.cta.end;
export const MARKERS = Object.values(SCENE).map((s) => ({ t: s.start, label: s.label }));

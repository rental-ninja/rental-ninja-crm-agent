// Starter scenes in the Rental Ninja house style. Replace with the film's own; reference/film5/js has 24 worked scenes.
// 1 — opening on the street: the host steps out of the door (with the red banner on the facade) and waves.
scene(1, 1, {
  bg: C.sky, cam: [1.0, 1.06, 1060, 570],
  build() {
    const T = this.T = { open: B(1) + .4, host: w(1, 'first') };
    this.b1 = bush(11, 560, 520, { n: 11 }); this.b2 = bush(23, 440, 400, { n: 9, fronds: .6 });
    cue(T.open, 'slide', { g: .5 }); cue(T.host, 'pop', { g: .5 });
  },
  draw(x, t) {
    const T = this.T, open = E.inOut(prog(t, T.open, .5));
    street(x, t, { open });
    if (t >= T.host - .1) {
      const p = E.out(prog(t, T.host - .1, .7));
      person(x, lerp(1285, 1060, p), 930, { who: 'host', s: lerp(.9, 1, p), dir: -1, walk: p < 1 ? p * 6 : null, armF: p >= 1 ? POSE.wave(t) : undefined, a: clamp((t - T.host + .1) * 6) });
    }
    drawBush(x, this.b1, 120, 1100, t, 1, { s: 1.15 }); drawBush(x, this.b2, 1980, 1120, t, 2, { s: 1.2 });
  }
});
endCardScene(2, { wipe: 'right' });

// Starter scenes: one per narration line range. Replace with the film's own (see reference/film3/js for full examples).
// Beats come from word times: w(line, 'word', n). Never type absolute seconds.

// 1 — opening line
scene(1, 1, {
  bg: '#F3E3C8', seed: 3, cam: [1.0, 1.05, 960, 560],
  build() {
    const T = this.T = { title: LN(1).start + .1, ninja: LN(1).start + .5 };
    this.title = paperText(VO.vo[0].text, { size: 64, weight: 600, color: P.ink, backing: '#FFFDF8', border: 18 });
    cue(T.title, 'land', { g: .6 }); cue(T.ninja, 'boing', { g: .4 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t);
    dropIn(ctx, this.title, 960, 360, t, T.title, { id: 'title', rot: -.015 });
    if (t >= T.ninja) { const p = prog(t, T.ninja, .45); drawNinja(ctx, 960, lerp(1300, 700, E.back(p)), { t: st, s: 1.1, eyes: 'happy', rot: Math.sin(st * 2.2) * .04 }); }
  }
});

// last line — the series end card
endCardScene(VO.vo.length, () => {
  const n = VO.vo.length, last = LN(n);
  return { logo: last.start - .2, tag: last.start + (last.end - last.start) * .45, cta: last.end + .45, wink: last.end + 1.9 };
});

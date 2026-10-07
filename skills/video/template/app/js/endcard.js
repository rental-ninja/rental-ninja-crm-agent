// Series end card: dark sheet, the ninja bouncing in, the logo letters dropping, tagline, CTA and URL (film.yml end_card).
function buildEndCard() {
  const c = FILM.endCard || {};
  A.tagline = paperText(c.tagline || 'Your whole rental business, in one place.', { size: 56, weight: 600, color: P.ink, backing: '#FFFDF8', border: 17 });
  A.btnCta = cardSprite(440, 116, P.red, { r: 58, elev: 0, elevS: 1.6, draw: (x) => ink(x, c.cta || 'Book a demo', 220, 76, { size: 52, weight: 700, color: '#fff', align: 'center', a: 1 }) });
  A.url = chip(c.url || 'rental-ninja.com', '#FFFDF8', { size: 34, h: 74, color: P.ink, weight: 700, elevS: 1, padX: 56 });
}
// the last narration line says the brand name and the tagline: T = { logo, tag, cta, wink } in film seconds
function endCardScene(line, T) {
  scene(line, line, {
    bg: '#26313B', seed: 49, tex: .45, wipe: 'right', cam: [1.0, 1.045, 960, 540],
    build() {
      this.T = T();
      const t = this.T;
      cue(t.logo + .3, 'thud', { g: .55 }); for (let i = 0; i < 11; i++) cue(t.logo + .18 + i / 12, 'tap', { g: .3, p: 1.2 + i * .03 });
      cue(t.logo + .4, 'sparkle', { g: .5 }); cue(t.tag, 'land', { g: .6 }); cue(t.cta, 'sticker', { g: .6, pan: -.2 }); cue(t.cta + .12, 'sticker', { g: .5, p: 1.15, pan: .3 }); cue(t.wink, 'blink', { g: .6, p: 1.1 });
    },
    draw(ctx, t) {
      const T = this.T, st = step(t);
      if (t < T.logo) return;
      const p = prog(t, T.logo, .45), winked = t >= T.wink && t < T.wink + .5, x0 = 690, mid = x0 + A.brandTot / 2;
      drawNinja(ctx, 490, lerp(-300, 450, E.bounce(p)), { t: st, s: 1.35, eyes: winked ? 'wink' : 'happy', rot: Math.sin(st * 2.2) * .04 });
      drawBrand(ctx, x0, 470, t, T.logo + .1, 1, 'brEnd');
      dropIn(ctx, A.tagline, mid + 20, 650, t, T.tag, { id: 'tagl', rot: -.012 });
      dropIn(ctx, A.btnCta, mid - 170, 822, t, T.cta, { id: 'bcta', rot: -.02, d: .3 }); dropIn(ctx, A.url, mid + 250, 826, t, T.cta + .12, { id: 'url', rot: .015, d: .3 });
      sparks(ctx, [[400, 170, 1.0], [790, 250, .7], [1560, 270, .85], [1730, 560, 1.0], [250, 640, .7], [1180, 180, .6]], t, T.logo + .35, st, 'fs');
    }
  });
}

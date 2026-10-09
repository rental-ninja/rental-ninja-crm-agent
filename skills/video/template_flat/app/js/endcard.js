// The series end card on navy: the official ninja drops in, the name pops letter by letter on the voice,
// tagline, CTA pill and URL. Usage in scenes.js: endCardScene(lastLine, { wipe: 'right' }).
// 16:9 draws on the stage; every other format gets its own centred stack, larger in portrait (drawFmt).
const EC16 = { cx: 960, from: -200, drop: 300, r: 108, brandY: 520, size: 150, tagY: 650 - 46 * .36, tagSize: 46, ctaY: 800, ctaSize: 46, urlY: 920 - 34 * .36, urlSize: 34, u: 1, bush: [[40, 1180], [1880, 1180]] };
function ecLayout(ec) {
  const r = 150, size = 150, tagSize = 56, ctaSize = 58, urlSize = 42, g = 64;
  const bw = [...'RentalNinja'].reduce((a, c) => a + textW(c, size, 500, F.brand), 0) + size * .12;
  const tag = wrapText(ec.tagline || '', tagSize, SAFE.w / Math.min(1, SAFE.w / bw), 600);
  const hs = 2 * r + g + size + g + tag.length * tagSize * 1.25 + g * .8 + ctaSize * 1.7 + g * .9 + urlSize;
  const u = Math.min(1, SAFE.h * .82 / hs, SAFE.w / bw), y0 = SAFE.cy - hs * u / 2;
  const drop = y0 + r * u, brandY = drop + (r + g + size / 2) * u, tagY = brandY + (size / 2 + g + tagSize * .5) * u, ctaY = tagY + ((tag.length - .5) * tagSize * 1.25 + g * .8 + ctaSize * .85) * u;
  return { cx: FMT.w / 2, from: -2 * r * u, drop, r: r * u, brandY, size: size * u, tag, tagY, tagSize: tagSize * u, ctaY, ctaSize: ctaSize * u,
    urlY: ctaY + (ctaSize * .85 + g * .9 + urlSize * .5) * u, urlSize: urlSize * u, u, bush: [[FMT.w * .04, FMT.h + 100], [FMT.w * .96, FMT.h + 100]] };
}
function endCardScene(line, o = {}) {
  const ec = FILM.endCard || {};
  scene(line, line, {
    bg: C.navy, wipe: o.wipe || 'right', noMark: true, noCaps: true, cam: [1.0, 1.03, 960, 540],
    build() {
      const L = LN(line), r0 = w(line, 'rental'), n0 = w(line, 'ninja'), tag = w(line, (ec.tagline || 'your').split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, ''));
      const letters = [...Array(6)].map((_, i) => r0 + i * .045).concat([...Array(5)].map((_, i) => n0 + i * .045));
      this.T = { drop: B(line) + .25, letters, tag, cta: L.end + .35, url: L.end + .55 };
      this.b1 = bush(181, 600, 640, { n: 13, col: C.navyD }); this.b2 = bush(183, 560, 600, { n: 12, col: C.navyD, fronds: .6 });
      if (!FMT.wide) this.L = ecLayout(ec);
      cue(this.T.drop + .3, 'thud', { g: .7 }); letters.forEach((t, i) => i % 2 || cue(t, 'tap', { g: .35, p: 1.2 }));
      cue(tag, 'land', { g: .4 }); cue(this.T.cta, 'sticker', { g: .6 }); cue(this.T.url, 'pop', { g: .4 });
    },
    draw(x, t, L = EC16) {
      const T = this.T, k = clamp(prog(t, T.drop, .3)), bounce = t > T.drop + .3 ? Math.sin((t - T.drop - .3) * 22) * 10 * Math.max(0, 1 - (t - T.drop - .3) * 3) : 0;
      const dy = lerp(L.from, L.drop, E.out(k)) + bounce * L.u;
      drawBush(x, this.b1, ...L.bush[0], t, 1); drawBush(x, this.b2, ...L.bush[1], t, 2);
      if (t > T.drop) { circ(x, L.cx, dy, L.r, C.white); logoImg(x, 'iso', L.cx, dy, L.r * 1.76); }
      brand(x, L.cx, L.brandY, L.size, t, T.letters);
      if (t >= T.tag) (L.tag || [ec.tagline || '']).forEach((s, i) => txt(x, s, L.cx, L.tagY + i * L.tagSize * 1.25 + L.tagSize * .36, { size: L.tagSize, weight: 600, color: C.white, align: 'center', a: E.out(prog(t, T.tag, .5)) }));
      if (t >= T.cta) pill(x, ec.cta || 'Book a demo', L.cx, L.ctaY, { size: L.ctaSize, s: popS(t, T.cta, .35), bg: C.red, sh: C.navyD });
      if (t >= T.url) txt(x, ec.url || 'rental-ninja.com', L.cx, L.urlY + L.urlSize * .36, { size: L.urlSize, weight: 700, color: C.tealL, align: 'center', a: E.out(prog(t, T.url, .4)) });
    },
    drawFmt(x, t) {
      const z = lerp(1, 1.03, E.sine(prog(t, this.start, this.end - this.start)));
      x.translate(FMT.w / 2, SAFE.cy); x.scale(z, z); x.translate(-FMT.w / 2, -SAFE.cy); this.draw(x, t, this.L);
    }
  });
}

// Act 4 — who already runs on it, how you start, what you get. And the logo.

// 21 — More than twelve thousand properties already run on Rental Ninja.
scene(21, 21, {
  bg: '#CCE5F1', seed: 43, wipe: 'top', cam: [1.0, 1.04, 960, 560],
  build() {
    const T = this.T = { houses: w(21, 'more') - .2, num: w(21, '12') - .12, lbl: w(21, 'properties') - .1, r: [w(21, 'already') - .1, w(21, 'run') - .05], ninja: w(21, 'rental') - .1 };
    const R = mulberry(7); this.hs = [];
    for (let k = 0; k < 3; k++) for (let i = 0; i < [26, 24, 22][k]; i++) { const x = 40 + (i + R() * .7) * (1860 / [26, 24, 22][k]); this.hs.push({ k, x, s: [.62, .82, 1.05][k] * (.85 + R() * .3), v: Math.floor(R() * 7), d: R() }); }
    for (let i = 0; i < 14; i++) cue(T.houses + i * .13, 'sticker', { g: .3, p: .9 + (i % 5) * .12, pan: -.8 + (i * .37 % 1.6) });
    cue(T.num + .04, 'thud', { g: .8 }); cue(T.num + .06, 'stamp', { g: .7 }); cue(T.lbl + .1, 'stamp', { g: .5 });
    T.r.forEach((r, i) => { cue(r, 'pop', { g: .7, p: 1 + i * .15, pan: i ? .6 : -.6 }); cue(r + .08, 'sparkle', { g: .35, p: 1.3, pan: i ? .6 : -.6 }); }); cue(T.ninja, 'boing', { g: .35 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), HY = [610, 730, 860];
    put(ctx, A.sun, 1760, 150, { rot: st * .08, id: 'sun21', s: .75 }); put(ctx, A.cloud1, 190 + st * 7, 140, { id: 'c211', s: .8 });
    [0, 1, 2].forEach(k => {
      put(ctx, A.hills[k], -140, HY[k], { id: 'hill' + k, boil: .2, elev: 1.2 });
      this.hs.forEach((h, i) => { if (h.k !== k) return; const t0 = T.houses + h.d * 1.9 + k * .15; popIn(ctx, A.tiny[h.v], h.x, HY[k] + A.hillY(k, h.x) + 14, t, t0, { id: 'th' + i, s: h.s, d: .25, boil: .25 }); });
    });
    if (t >= T.ninja) { const p = prog(t, T.ninja, .4); drawNinja(ctx, 640, lerp(330, 118, E.back(p)), { t: st, s: .78, eyes: 'happy', rot: -.08 + Math.sin(st * 2.4) * .04, id: 'n21' }); }
    if (t >= T.num - .12) { const p = prog(t, T.num - .12, .16); put(ctx, A.bigNum, 960, 290, { id: 'bn', rot: -.015, s: lerp(2, 1, E.in(p)), a: clamp(p * 3), elev: 1.2 + 6 * (1 - p) }); }

    dropIn(ctx, A.lblProps, 960, 480, t, T.lbl, { id: 'lprops', rot: -.015 });
    popIn(ctx, A.rate[0], 270, 395, t, T.r[0], { id: 'rt0', d: .3, rot: -.1 + Math.sin(st * 2) * .02 }); popIn(ctx, A.rate[1], 1650, 420, t, T.r[1], { id: 'rt1', d: .3, rot: .1 + Math.sin(st * 2 + 1) * .02 });
  }
});

// 22 — Getting started takes a day or two, and our team helps you move in.
scene(22, 22, {
  bg: '#D2EAD5', seed: 45, wipe: 'right', cam: [1.0, 1.035, 960, 580],
  build() {
    const T = this.T = { win: this.start - 1, d: [w(22, 'day') - .15, w(22, 'two') - .05], lbl: w(22, 'two') + .15, ninja: w(22, 'our') - .2, b: [w(22, 'helps') - .1, w(22, 'move') - .15, w(22, 'in') - .05], free: w(22, 'in') + .25 };
    T.d.forEach((d, i) => { cue(d, 'land', { g: .7, p: 1 + i * .1, pan: -.6 }); cue(d + .3, 'tick', { g: .6, p: 1 + i * .15, pan: -.6 }); }); cue(T.lbl + .1, 'stamp', { g: .5, pan: -.5 });
    cue(T.ninja, 'pop', { g: .6, pan: -.1 }); T.b.forEach((b, i) => { cue(b, 'slide', { g: .5, p: .9 + i * .1, pan: 0 }); cue(b + .42, 'land', { g: .7, p: 1 + i * .08, pan: .4 }); cue(b + .5, 'pop', { g: .5, p: 1.2, pan: .4 }); });
    cue(T.free, 'sticker', { g: .7, pan: .1 }); cue(T.free + .05, 'sparkle', { g: .5 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), WX = 1370, WY = 520;
    T.d.forEach((d, i) => { dropIn(ctx, A.dayPage[i], 250 + i * 270, 330 + i * 20, t, d, { id: 'dp' + i, rot: i ? .04 : -.05, d: .34 }); popIn(ctx, A.check, 340 + i * 270, 222 + i * 20, t, d + .3, { id: 'dck' + i, d: .22, s: 1.2 }); });
    dropIn(ctx, A.lblDays, 400, 545, t, T.lbl, { id: 'ldays', rot: -.03 });
    if (dropIn(ctx, A.acctWin, WX, WY, t, T.win, { id: 'aw', rot: .006, d: .36 })) {
      T.b.forEach((b, i) => { const tx = WX - 470 + 270 + i * 250, ty = WY + 20, ta = b + .45; if (t < ta) put(ctx, A.slotRing, tx, ty, { id: 'sr' + i, boil: .4, elev: 0 }); else { popIn(ctx, A.hubB[i], tx, ty, t, ta, { id: 'mb' + i, d: .28 }); put(ctx, A.hubL[i], tx, ty + 150, { id: 'ml' + i, boil: .3, elev: 0, s: .8, a: clamp((t - ta - .1) * 8) }); popIn(ctx, A.check, tx + 70, ty - 78, t, ta + .2, { id: 'mck' + i, d: .2, s: .8 }); } });
    }
    // boxes are carried over and unpacked
    T.b.forEach((b, i) => { const q = prog(t, b, .45); if (q <= 0 || q >= 1) return; const tx = WX - 470 + 270 + i * 250; put(ctx, A.box[i], lerp(700, tx, E.inOut(q)), lerp(1010, WY + 110, E.inOut(q)) - Math.sin(q * Math.PI) * 120, { id: 'bx' + i, rot: Math.sin(q * Math.PI) * .12, s: lerp(1, .7, q), elev: 1.4 + 3 * Math.sin(q * Math.PI) }); });
    T.b.forEach((b, i) => { if (t < b) put(ctx, A.box[i], 640 + i * 46, 1040 - i * 8, { id: 'bxw' + i, rot: (i - 1) * .04, s: t >= T.ninja - .1 ? E.back(prog(t, T.ninja - .1 + i * .08, .3)) : 0 }); });
    if (t >= T.ninja) { const p = prog(t, T.ninja, .4); let hop = 0; T.b.forEach(b => { if (t >= b && t < b + .45) hop = Math.sin(prog(t, b, .45) * Math.PI) * 40; }); drawNinja(ctx, 960, lerp(1300, 880, E.back(p)) - hop, { t: st, s: 1.05, eyes: t >= T.free ? 'happy' : 'open', look: 1, headset: true, rot: Math.sin(st * 2.4) * .05, id: 'n22' }); }
    popIn(ctx, A.chipFree, 1370, 930, t, T.free, { id: 'cfree', d: .3, rot: -.03 });
    { drawPerson(ctx, 185, 1045, { kind: 'host', s: 1.1, eyes: 'happy', look: 1, armR: t >= T.free ? -2.4 + Math.sin(st * 10) * .25 : -.14, id: 'host22' }); }
    if (t >= T.free) sparks(ctx, [[1830, 240, .6], [900, 250, .5], [1830, 900, .45]], t, T.free + .05, st, 's22');
  }
});

// 23 — Less busywork. Happier guests. More bookings.
scene(23, 23, {
  bg: '#F4ECDD', seed: 47, wipe: 'bottom', cam: [1.0, 1.04, 960, 540],
  build() {
    const T = this.T = { c: [w(23, 'less') - .2, w(23, 'happier') - .2, w(23, 'more') - .2] };
    T.c.forEach((c, i) => { cue(c + .16, 'stamp', { g: .7, p: 1 + i * .06 }); cue(c + .3, 'pop', { g: .6, p: 1 + i * .12, pan: -.6 }); }); cue(T.c[2] + .45, 'sparkle', { g: .55 }); cue(T.c[2] + .5, 'ding', { g: .35 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), ys = [270, 540, 810];
    A.claims.forEach((S, i) => {
      const x = 1040, ix = x - S.w / 2 - 120;
      dropIn(ctx, S, x, ys[i], t, T.c[i], { id: 'cl' + i, rot: [-.02, .015, -.015][i], d: .38 });
      popIn(ctx, A.claimIco[i], ix, ys[i], t, T.c[i] + .14, { id: 'ci23' + i, d: .3, rot: (i % 2 ? .08 : -.08) + Math.sin(st * 2 + i) * .02 });
    });
    if (t >= T.c[2] + .45) sparks(ctx, [[180, 180, .7], [1760, 230, .6], [1790, 900, .5], [150, 940, .55], [960, 100, .4]], t, T.c[2] + .45, st, 's23');
  }
});

// 24 — Rental Ninja. Your whole rental business, in one place.
scene(24, 24, {
  bg: '#26313B', seed: 49, tex: .45, wipe: 'right', cam: [1.0, 1.045, 960, 540],
  build() {
    const T = this.T = { logo: w(24, 'rental') - .2, tag: w(24, 'your') - .15, cta: w(24, 'place') + .45, host: w(24, 'place') + .9, wink: w(24, 'place') + 1.9 };
    cue(T.logo + .3, 'thud', { g: .55 }); for (let i = 0; i < 11; i++) cue(T.logo + .1 + i / 12 + .08, 'tap', { g: .3, p: 1.2 + i * .03 });
    cue(T.logo + .4, 'sparkle', { g: .5 }); cue(T.tag, 'land', { g: .6 }); cue(T.cta, 'sticker', { g: .6, pan: -.2 }); cue(T.cta + .12, 'sticker', { g: .5, p: 1.15, pan: .3 }); cue(T.host, 'pop', { g: .5, pan: -.6 }); cue(T.host + .15, 'pop', { g: .5, p: 1.15, pan: .6 }); cue(T.wink, 'blink', { g: .6, p: 1.1 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t);
    if (t < T.logo) return;
    const p = prog(t, T.logo, .45), winked = t >= T.wink && t < T.wink + .5, x0 = 690, mid = x0 + A.brandTot / 2;
    drawNinja(ctx, 490, lerp(-300, 450, E.bounce(p)), { t: st, s: 1.35, eyes: winked ? 'wink' : 'happy', rot: Math.sin(st * 2.2) * .04 });
    drawBrand(ctx, x0, 470, t, T.logo + .1, 1, 'br24');
    dropIn(ctx, A.tagline, mid + 20, 650, t, T.tag, { id: 'tagl', rot: -.012 });
    dropIn(ctx, A.btnDemo, mid - 170, 822, t, T.cta, { id: 'bdemo', rot: -.02, d: .3 }); dropIn(ctx, A.url, mid + 250, 826, t, T.cta + .12, { id: 'url', rot: .015, d: .3 });
    if (t >= T.host) { const q = prog(t, T.host, .4); drawPerson(ctx, 300, lerp(1750, 1100, E.back(q)), { kind: 'host', s: 1.15, eyes: 'happy', armR: -2.4 + Math.sin(st * 10) * .28, id: 'host24' }); }
    if (t >= T.host + .15) { const q = prog(t, T.host + .15, .4); drawPerson(ctx, 1790, lerp(1750, 1105, E.back(q)), { kind: 'g1', flip: true, s: 1.12, eyes: 'happy', armR: -2.4 + Math.sin(st * 10 + 1) * .28, id: 'g24b' }); }
    sparks(ctx, [[400, 170, 1.0], [790, 250, .7], [1560, 270, .85], [1730, 560, 1.0], [250, 640, .7], [1180, 180, .6]], t, T.logo + .35, st, 'fs');
  }
});

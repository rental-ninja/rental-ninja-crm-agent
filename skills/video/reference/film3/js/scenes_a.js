// Act 1 — why you started, and what the job became. Act 2 — Rental Ninja.

// 1 — You started hosting to welcome people.
scene(1, 1, {
  bg: '#CCE5F1', seed: 3, wipe: null, cam: [1.1, 1.17, 1020, 900],
  build() {
    const T = this.T = { door: .75, host: 1.0, walk: .35, arrive: w(1, 'welcome') - .1, wave: w(1, 'welcome') + .05, heart: w(1, 'people') + .1 };
    cue(.05, 'rustle', { g: .25 }); cue(T.door, 'slide', { g: .5, p: .8, pan: .4 }); cue(T.host + .3, 'pop', { g: .5, pan: .5 });
    for (let i = 0; i < 9; i++) cue(T.walk + .25 + i * .3, 'tap', { g: .28, p: 1 + (i % 2) * .15, pan: -.7 + i * .07 });
    cue(T.heart, 'pop', { g: .7, p: 1.3 }); cue(T.heart + .08, 'sparkle', { g: .45 }); cue(T.heart + .5, 'pop', { g: .4, p: 1.5, pan: -.2 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), HX = 1300, HY = 930;
    put(ctx, A.sun, 250, 190, { rot: st * .08, id: 'sun', s: .9 });
    put(ctx, A.cloud3, 900 + st * 6, 130, { id: 'c3' }); put(ctx, A.cloud1, 1640 + st * 8, 210, { id: 'c1', s: .8 }); put(ctx, A.cloud2, 520 + st * 4, 300, { id: 'c2', s: .7 });
    put(ctx, A.ground, -140, 810, { id: 'gr', boil: .2 });
    put(ctx, A.path, 330, 975, { id: 'pa', boil: .2, elev: .3 });
    put(ctx, A.bushD, 1000, 938, { id: 'b1' });
    put(ctx, A.house, HX, HY, { id: 'house', boil: .3 });
    const dx = HX - 310 + 368, open = E.inOut(prog(t, T.door, .4));
    if (open > 0) put(ctx, A.glow, dx, HY, { boil: 0, elev: 0, a: open });
    // the host steps out and waves
    if (t >= T.host) {
      const p = E.out(prog(t, T.host, .5)), wv = t >= T.wave - 1.2 ? Math.sin(st * 10) * .32 : 0;
      drawPerson(ctx, lerp(dx + 62, 1535, p), HY + 34 - Math.sin(p * Math.PI) * 14, { kind: 'host', s: lerp(.8, .98, p), eyes: 'happy', armR: t >= T.host + .45 ? -2.5 + wv : -.14, look: -1, id: 'host1' });
    }
    put(ctx, A.door, dx, HY, { sx: lerp(1, .2, open), boil: 0, elev: .6 + open });
    put(ctx, A.bush, 1730, 950, { id: 'b2' }); put(ctx, A.signCasa, 985, 1000, { id: 'sign', rot: -.03 });
    // two guests arrive with their cases
    [['g2', -330, 560, A.case2, .1], ['g1', -150, 745, A.case1, 0]].forEach(([k, x0, x1, C, lag], i) => {
      const wk = walk(t, T.walk + lag, T.arrive + lag, x0, x1), arrived = wk.p >= 1;
      put(ctx, C, wk.x - 96, 1010 + wk.bob * .4, { id: 'case' + i, rot: arrived ? 0 : -.1, boil: .3 });
      drawPerson(ctx, wk.x, 1012 + wk.bob, { kind: k, s: .98, rot: wk.lean, eyes: 'happy', look: 1, armR: arrived && i ? -2.4 + Math.sin(st * 10 + 1) * .3 : -.14 + Math.sin((t - T.walk) * 9) * .3 * (arrived ? 0 : 1), armL: .14 - Math.sin((t - T.walk) * 9) * .3 * (arrived ? 0 : 1), id: 'gst' + i });
    });
    [[1010, 640, 1.25, 0], [900, 560, .75, .45], [1110, 540, .6, .75]].forEach(([hx, hy, s, d], i) => { if (t >= T.heart + d) popIn(ctx, A.heart, hx, hy - (t - T.heart - d) * 38, t, T.heart + d, { s, rot: Math.sin(st * 3 + i) * .15, id: 'hrt' + i }); });
  }
});

// 2 — …the job became browser tabs, spreadsheets, and a phone that never stops.
scene(2, 2, {
  bg: '#D9D2E3', seed: 5, wipe: 'right', cam: [1.0, 1.05, 960, 600],
  build() {
    const T = this.T = { tabs: w(2, 'browser') - .12, sheet: w(2, 'spreadsheets') - .1, phone: w(2, 'phone') - .15, buzz: w(2, 'phone') + .2, never: w(2, 'never'), stops: w(2, 'stops') };
    this.tabPos = [[300, 330, -.07], [640, 250, .04], [980, 320, -.03], [430, 560, .06], [800, 540, -.05], [1130, 570, .05]];
    this.tabPos.forEach((_, i) => { cue(T.tabs + i * .14, 'popup', { g: .6, p: 1 + i * .07, pan: -.6 + i * .2 }); });
    cue(T.sheet - .2, 'swoosh', { g: .4, pan: .5 }); cue(T.sheet, 'land', { g: .9, pan: .5 });
    cue(T.phone, 'tap', { g: .7, pan: .7 }); for (let i = 0; i < 9; i++) cue(T.buzz + i * .22, 'rustle', { g: .22, p: 1.6, pan: .7 });
    [0, 1, 2].forEach(i => cue(T.buzz + .1 + i * .42, 'pop', { g: .55, p: 1.2 + i * .15, pan: .7 }));
    [0, 1, 2, 3].forEach(i => cue(T.never + .1 + i * .16, 'sticker', { g: .45, p: 1 + i * .08, pan: -.3 + i * .2 }));
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), DY = 905;
    put(ctx, A.cloudG, 1500 + st * 5, 130, { id: 'cg1', s: 1.1 }); put(ctx, A.cloudG, 120 + st * 7, 110, { id: 'cg2', s: .8 });
    // the host, behind the desk
    const stage = t < T.tabs ? 0 : t < T.sheet ? 1 : t < T.phone ? 2 : 3, fraz = stage === 3 ? Math.sin(st * 14) * .02 : 0;
    drawPerson(ctx, 1450, 1075, { kind: 'host', s: 1.32, eyes: ['happy', 'wide', 'wide', 'worried'][stage], mouth: ['smile', 'open', 'flat', 'wavy'][stage], look: [-1, -1, 0, 1][stage], headRot: fraz + [0, -.05, .04, .05][stage], armL: stage >= 2 ? 2.5 : .14, armR: stage >= 3 ? -2.5 : -.14, id: 'host2' });
    if (stage === 3) [[1350, 610], [1552, 600]].forEach(([sx, sy], i) => popIn(ctx, A.sweat, sx, sy + ((t - T.phone) * 60 + i * 20) % 50, t, T.phone + .2 + i * .25, { id: 'sw' + i, s: .9, rot: i ? .2 : -.2 }));
    if (t < T.tabs + .5) { put(ctx, A.framePic, 470, 380, { id: 'fpic', rot: -.02 }); put(ctx, A.wallCal, 1010, 360, { id: 'wcal', rot: .025 }); }
    put(ctx, A.desk, -140, DY, { id: 'desk', boil: .2 });
    put(ctx, A.mug, 1255, DY + 6, { id: 'mug', s: 1.3 });
    put(ctx, A.laptop, 640, DY + 12, { id: 'lap' }); put(ctx, A.plant, 170, DY + 8, { id: 'plant', rot: Math.sin(st * 1.5) * .01 });
    // tabs multiply
    const jit = t >= T.never ? 1 : 0;
    this.tabPos.forEach(([x, y, r], i) => popIn(ctx, A.tabs[i], x + jit * (rnd('tj', i, FRAME) - .5) * 5, y + jit * (rnd('tk', i, FRAME) - .5) * 5, t, T.tabs + i * .14, { id: 'tab' + i, rot: r + jit * Math.sin(st * 9 + i) * .012, d: .3, s: 1.02 }));
    // the spreadsheet
    if (t >= T.sheet - .25) { const p = prog(t, T.sheet - .25, .25); put(ctx, A.sheetX, 1530, lerp(-260, 300, E.in(p)), { id: 'xls', rot: lerp(-.3, .07, p), elev: 1.5 + 4 * (1 - p) }); }
    // the phone
    if (dropIn(ctx, A.phoneBuzz, 1730 + (t >= T.buzz ? (rnd('pb', FRAME) - .5) * 8 : 0), 800, t, T.phone, { id: 'phb', rot: .12 + (t >= T.buzz ? Math.sin(t * 60) * .035 : 0), d: .3 })) {
      if (t >= T.buzz) { put(ctx, A.buzz, 1838, 730, { id: 'bz' + FRAME % 3, boil: 1.2, rot: -.2 }); put(ctx, A.buzz, 1622, 730, { id: 'by' + FRAME % 3, boil: 1.2, rot: Math.PI + .2 }); }
      const k = t < T.buzz + .52 ? 0 : t < T.buzz + .94 ? 1 : 2, tk = T.buzz + .1 + k * .42;
      popIn(ctx, A.counts[k], 1806, 640, t, tk, { id: 'cnt' + k, d: .2, rot: .1, s: 1 + k * .12 });
    }
    [[300, 985, -.06], [900, 990, .05], [1140, 980, -.04], [1560, 990, .04]].forEach(([x, y, r], i) => dropIn(ctx, A.sticky[i], x, y, t, T.never + .1 + i * .16, { id: 'stk' + i, rot: r, d: .25, s: .9 }));
  }
});

// 3 — Prices to update. Messages at midnight. Cleaners to chase. Owners waiting.
scene(3, 3, {
  bg: '#E7DAC9', seed: 7, wipe: 'bottom', cam: [1.0, 1.04, 960, 600],
  build() {
    const T = this.T = { c: [w(3, 'prices') - .15, w(3, 'messages') - .15, w(3, 'cleaners') - .15, w(3, 'owners') - .15] };
    this.pos = [[420, 292, -.025], [1500, 292, .02], [420, 772, .02], [1500, 772, -.02]];
    T.c.forEach((c, i) => { cue(c - .18, 'swoosh', { g: .35, pan: i % 2 ? .6 : -.6 }); cue(c + .05, 'land', { g: .85, p: 1 + i * .04, pan: i % 2 ? .6 : -.6 }); });
    cue(T.c[1] + .3, 'blink', { g: .3, p: .8, pan: .5 }); cue(T.c[3] + .9, 'boing', { g: .3 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t);
    let k = -1; T.c.forEach((c, i) => { if (t >= c) k = i; });
    const p = 1, over = k >= 1;
    drawPerson(ctx, 960, lerp(1750, 1090, E.back(p)), { kind: 'host', s: 1.45, eyes: k < 0 ? 'open' : k >= 2 ? 'worried' : 'wide', mouth: k < 0 ? 'flat' : k >= 3 ? 'frown' : 'wavy', look: k < 0 ? 0 : (k % 2 ? 1 : -1), headRot: k < 0 ? 0 : (k % 2 ? .06 : -.06) + Math.sin(st * 12) * (k >= 2 ? .02 : 0), armL: over ? 2.55 : .14, armR: k >= 3 ? -2.55 : -.14, hy: k >= 2 ? 6 : 0, id: 'host3' });
    if (k >= 1) [[868, 600], [1056, 590], [1012, 548]].forEach(([sx, sy], i) => popIn(ctx, A.sweat, sx, sy + ((t - T.c[1]) * 55 + i * 17) % 46, t, T.c[1] + .3 + i * .5, { id: 'sw3' + i, s: .9, rot: i ? .2 : -.2 }));
    this.pos.forEach(([x, y, r], i) => dropIn(ctx, A.vig[i], x, y, t, T.c[i], { id: 'vig' + i, rot: r, d: .4, dy: -60, s: 1.3 }));
  }
});

// 4 — One missed update means two guests at the same door.
scene(4, 4, {
  bg: '#F1C3B2', seed: 9, wipe: 'left', cam: [1.0, 1.05, 960, 640],
  build() {
    const T = this.T = { s1: w(4, 'one') - .1, s2: w(4, 'missed') + .15, walk: w(4, 'means') - .3, arrive: w(4, 'guests') + .1, door: w(4, 'guests') + .3, stamp: w(4, 'same') + .05 };
    cue(T.s1, 'land', { g: .7, pan: -.6 }); cue(T.s2, 'land', { g: .7, p: 1.1, pan: .6 });
    for (let i = 0; i < 5; i++) { cue(T.walk + .1 + i * .24, 'tap', { g: .3, pan: -.7 }); cue(T.walk + .2 + i * .24, 'tap', { g: .3, p: 1.2, pan: .7 }); }
    cue(T.door, 'slide', { g: .5, p: .8 }); cue(T.arrive + .25, 'pop', { g: .6, p: .8, pan: -.4 }); cue(T.arrive + .4, 'pop', { g: .6, p: .9, pan: .4 });
    cue(T.stamp, 'thud', { g: 1 }); cue(T.stamp + .02, 'stamp', { g: .9 }); cue(T.stamp + .5, 'boing', { g: .35, p: .8 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), HX = 960, HY = 970, HS = 1.14, dx = HX + (368 - 310) * HS;
    put(ctx, A.cloudG, 260 + st * 5, 120, { id: 'cg4', s: .9 }); put(ctx, A.cloudG, 1660 + st * 4, 150, { id: 'cg5', s: .7 });
    put(ctx, A.ground, -140, 850, { id: 'gr4', boil: .2 });
    put(ctx, A.house, HX, HY, { id: 'house4', boil: .3, s: HS });
    const open = E.inOut(prog(t, T.door, .3));
    if (open > 0) { put(ctx, A.glow, dx, HY, { boil: 0, elev: 0, a: open, s: HS }); drawPerson(ctx, dx + 74, HY + 8, { kind: 'host', s: .92, eyes: 'wide', mouth: 'open', look: Math.sin(st * 6) > 0 ? 1 : -1, armL: 2.5, armR: -2.5, id: 'host4' }); }
    put(ctx, A.door, dx, HY, { sx: lerp(1, .2, open), s: HS, boil: 0, elev: .6 + open });
    // two parties, one front door
    const A1 = walk(t, T.walk, T.arrive, -260, 470), B1 = walk(t, T.walk + .1, T.arrive + .1, 2180, 1470), there = t >= T.arrive + .1;
    [['g2', A1.x - 150, false, A.case2, 'a'], ['g1', A1.x, false, A.case1, 'b'], ['g3', B1.x, true, A.case1, 'c'], ['g4', B1.x + 150, true, A.case2, 'd']].forEach(([k, x, flip, C, id], i) => {
      const wk = i < 2 ? A1 : B1;
      put(ctx, C, x + (flip ? 100 : -100), 1030 + wk.bob * .4, { id: 'cs4' + id, boil: .3 });
      drawPerson(ctx, x, 1032 + wk.bob, { kind: k, flip, s: 1.02, rot: wk.lean, eyes: there ? 'wide' : 'happy', mouth: there ? (i % 2 ? 'open' : 'flat') : 'smile', look: 1, headRot: there ? Math.sin(st * 5 + i) * .04 : 0, id: 'g4' + id });
    });
    if (there) { popIn(ctx, A.qmark, 390, 520, t, T.arrive + .25, { id: 'qm', rot: -.15 + Math.sin(st * 4) * .05, s: .9 }); popIn(ctx, A.emark, 1560, 510, t, T.arrive + .4, { id: 'em', rot: .15 + Math.sin(st * 4 + 1) * .05, s: .9 }); }
    dropIn(ctx, A.slip[0], 310, 215, t, T.s1, { id: 'sl0', rot: -.05, d: .35 }); dropIn(ctx, A.slip[1], 1610, 215, t, T.s2, { id: 'sl1', rot: .05, d: .35 });
    if (t >= T.stamp - .12) { const p = prog(t, T.stamp - .12, .12); put(ctx, A.stampDB, 960, 200, { id: 'stmp', rot: -.06, s: lerp(2.2, .8, E.in(p)), a: clamp(p * 3), elev: 1.2 + 6 * (1 - p) }); }
  }
});

// 5 — There is a calmer way to run it.
scene(5, 5, {
  bg: '#CFE8F0', seed: 11, wipe: 'top', cam: [1.04, 1.0, 960, 560],
  build() {
    const T = this.T = { dash: w(5, 'calmer') - .42, land: w(5, 'calmer') + .25, lbl: w(5, 'way') - .1, sigh: w(5, 'run') };
    const R = mulberry(42);
    this.items = [...A.tabs.map(S => [S, .8]), [A.sheetX, .8], [A.phoneBuzz, .8], [A.slip[0], .8], [A.slip[1], .8], ...A.sticky.map(S => [S, .9])].map(([S, s], i) => ({ S, s, x: 190 + (i % 5) * 385 + R() * 70, y: 190 + Math.floor(i / 5) * 340 + R() * 120, r: (R() - .5) * .5 }));
    cue(T.dash, 'whoosh', { g: 1, p: .9 }); this.items.forEach((it, i) => cue(T.dash + it.x / 1920 * .42, 'rustle', { g: .22, p: 1.3, pan: it.x / 960 - 1 }));
    cue(T.land, 'land', { g: .7 }); cue(T.land + .1, 'sparkle', { g: .6 }); cue(T.lbl + .1, 'stamp', { g: .55 }); cue(T.sigh, 'swoosh', { g: .3, p: .7, pan: .5 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t);
    const dp = prog(t, T.dash, .42), nx = lerp(-300, 2300, dp);
    // calm arrives: the sun behind, the clutter gone
    if (t >= T.land - .2) { const p = E.out(prog(t, T.land - .2, .6)); put(ctx, A.sun, 960, lerp(1300, 470, p), { rot: st * .1, id: 'sun5', s: 1.9, a: p }); put(ctx, A.cloud1, 330 + st * 6, 250, { id: 'c51', a: p }); put(ctx, A.cloud3, 1560 + st * 4, 200, { id: 'c52', a: p }); }
    this.items.forEach((it, i) => {
      const tt = T.dash + clamp((it.x + 300) / 2600) * .42 + Math.abs(it.y - 540) / 3000;
      if (t < tt) put(ctx, it.S, it.x, it.y, { id: 'cl' + i, rot: it.r + (t >= T.dash - .4 ? Math.sin(st * 20 + i) * .01 : 0), s: it.s, boil: .5 });
      else flyOut(ctx, it.S, it.x, it.y, t, tt, { to: [1500, -500 + (i % 5) * 220], spin: 2.2 * (i % 2 ? 1 : -1), rot: it.r, s: it.s, d: .4 });
    });
    if (dp > 0 && dp < 1) { [0, 1, 2].forEach(i => put(ctx, A.streak, nx - 90, 470 + i * 70, { id: 'strk' + i, boil: 0, a: .8, sx: 1 + i * .3 })); drawNinja(ctx, nx, 540, { t: st, s: 1.5, eyes: 'open', rot: .18, id: 'n5a' }); }
    if (t >= T.land - .25) { const p = prog(t, T.land - .25, .4); drawNinja(ctx, 960, lerp(-300, 470, E.bounce(p)), { t: st, s: 1.5, eyes: t < T.sigh + .3 ? 'closed' : 'happy', rot: Math.sin(st * 2) * .03, id: 'n5' }); }
    dropIn(ctx, A.lblCalm, 960, 790, t, T.lbl, { id: 'lcalm', rot: -.025 });
    if (t >= T.land) { const p = prog(t, T.land, .45); drawPerson(ctx, 1560, lerp(1750, 1040, E.back(p)), { kind: 'host', s: 1.25, eyes: 'closed', mouth: 'smile', hy: Math.sin(prog(t, T.sigh, .8) * Math.PI) * -10, id: 'host5' }); }
    if (t >= T.land) sparks(ctx, [[560, 330, .7], [1360, 300, .6], [420, 700, .5], [1420, 640, .45]], t, T.land + .1, st, 's5');
  }
});

// 6 — Rental Ninja. One place for your listings, bookings, guests, team and money.
scene(6, 6, {
  bg: '#26313B', seed: 13, tex: .45, wipe: 'right', cam: [1.0, 1.04, 960, 560],
  build() {
    const T = this.T = { logo: w(6, 'rental') - .25, hub: w(6, 'one') - .1, lbl: w(6, 'place') - .08, b: [w(6, 'listings'), w(6, 'bookings'), w(6, 'guests'), w(6, 'team'), w(6, 'money')].map(v => v - .08) };
    cue(T.logo + .3, 'thud', { g: .5 }); for (let i = 0; i < 11; i++) cue(T.logo + .1 + i / 12 + .08, 'tap', { g: .3, p: 1.2 + i * .03 }); cue(T.logo + .45, 'sparkle', { g: .5 });
    cue(T.hub, 'slide', { g: .8 }); cue(T.hub + .42, 'land', { g: .9 }); cue(T.lbl + .1, 'stamp', { g: .5, pan: -.5 });
    T.b.forEach((b, i) => { cue(b, 'pop', { g: .8, p: .9 + i * .08, pan: -.6 + i * .3 }); cue(b + .06, 'tap', { g: .5, p: 1 + i * .06, pan: -.6 + i * .3 }); });
    cue(T.b[4] + .25, 'sparkle', { g: .55 }); cue(T.b[4] + .3, 'ding', { g: .3 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), s = .82, x0 = 960 - (A.brandTot * s) / 2 + 105;
    if (t >= T.logo) { const p = prog(t, T.logo, .45); drawNinja(ctx, x0 - 175, lerp(-300, 236, E.bounce(p)), { t: st, s: 1.06, eyes: 'happy', rot: Math.sin(st * 2.2) * .04, id: 'n6' }); }
    drawBrand(ctx, x0, 250, t, T.logo + .1, s, 'br6');
    if (slideIn(ctx, A.hub, 960, 720, t, T.hub, { from: [0, 700], id: 'hub', spin: .03, d: .5, rot: -.004 })) {
      const xs = i => 960 + (i - 2) * 300, done = prog(t, T.b[4] + .25, .3);
      strokePath(ctx, [[xs(0), 690], [xs(4), 690]], prog(t, T.b[0], T.b[4] - T.b[0]), { dash: [2, 18], w: 7, a: .35 });
      A.hubB.forEach((S, i) => {
        popIn(ctx, S, xs(i), 690 - Math.sin(done * Math.PI) * 18 * (i % 2 ? 1 : .6), t, T.b[i], { id: 'hb' + i, d: .3, rot: (i % 2 ? .04 : -.04), s: 1.12 });
        if (t >= T.b[i] + .08) put(ctx, A.hubL[i], xs(i), 868, { id: 'hl' + i, boil: .3, elev: 0, a: clamp((t - T.b[i] - .08) * 8) });
      });
      dropIn(ctx, A.lblOne, 330, 470, t, T.lbl, { id: 'lone', rot: -.05 });
      if (t >= T.b[4] + .25) sparks(ctx, [[200, 620, .6], [1730, 600, .7], [1700, 900, .45], [230, 930, .5]], t, T.b[4] + .25, st, 's6');
    }
  }
});

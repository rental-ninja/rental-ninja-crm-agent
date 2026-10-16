// Act 4: reports, desk and pocket, proof, onboarding, benefits, the end card.

// 19 — And clear reports show how every home is performing.
scene(19, 19, {
  bg: C.wallL, wipe: 'bottom', cam: [1.0, 1.04, 960, 540],
  build() { this.T = { k: w(19, 'clear') - .05, bars: hitsIn('slide', 139.3, 139.9), line: hit('scribble', 140.45), up: hit('pop', 141.1) }; this.b1 = bush(141, 420, 460, { n: 10 }); this.b2 = bush(143, 400, 440, { n: 9, fronds: .6 }); },
  draw(x, t) {
    const T = this.T;
    rr(x, -200, -200, 2400, 1500, 0, C.wallL); rr(x, -200, 950, 2400, 400, 0, C.navy);
    at(x, 960, 500, {}, (x) => {
      x.save(); x.globalAlpha *= .9; rr(x, -760 + 20, -400 + 20, 1520, 800, 40, C.navy); x.restore();
      rr(x, -760, -400, 1520, 800, 40, C.greyL); rr(x, -730, -370, 1460, 740, 24, C.navy); rr(x, -710, -350, 1420, 700, 14, C.white);
      txt(x, 'Reports', -670, -290, { size: 38, weight: 700 }); txt(x, 'March', -510, -290, { size: 28, color: C.mute });
      const kp = E.out(prog(t, T.k, .9));
      [['Occupancy', Math.round(82 * kp) + '%', C.green], ['Revenue', '€' + (Math.round(48200 * kp / 100) * 100).toLocaleString('en-US'), C.blue], ['Avg. nightly rate', '€' + Math.round(164 * kp), C.purple]].forEach(([a, b, col], i) => {
        const cx = -670 + i * 470; rr(x, cx, -250, 440, 160, 18, C.white); rr(x, cx, -250, 10, 160, 5, col);
        txt(x, a, cx + 34, -196, { size: 24, weight: 700, color: C.mute }); txt(x, b, cx + 34, -128, { size: 52, weight: 700 });
      });
      rr(x, -670, -60, 760, 390, 18, C.white); txt(x, 'Revenue per home', -640, -14, { size: 24, weight: 700, color: C.mute });
      [['Casa Marina', .92, '€16.4k'], ['Villa Sol', .74, '€13.1k'], ['Loft Centro', .5, '€8.9k'], ['Casa Azul', .55, '€9.8k']].forEach(([n, v, l], i) => {
        const p = E.out(prog(t, (T.bars[i] ?? T.bars[0]) - .1, .4)), y = 30 + i * 72;
        txt(x, n, -640, y + 30, { size: 22, weight: 700 }); rr(x, -470, y + 6, 470 * v * p, 36, 18, [C.coral, C.mustard, C.blue, C.green][i]);
        if (p > .9) txt(x, l, -470 + 470 * v + 12, y + 33, { size: 20, weight: 700, color: C.mute });
      });
      rr(x, 130, -60, 540, 390, 18, C.white); txt(x, 'Bookings', 160, -14, { size: 24, weight: 700, color: C.mute });
      const pts = [[170, 270], [250, 230], [330, 245], [410, 170], [490, 150], [570, 90], [640, 40]], k = prog(t, T.line - .3, .9);
      const n = Math.max(1, Math.floor(k * (pts.length - 1) * 10) / 10);
      const seg = []; for (let i = 0; i <= n && i < pts.length; i++) seg.push(pts[Math.floor(i)]);
      const fi = Math.floor(n), fr = n - fi; if (fi < pts.length - 1) seg.push([lerp(pts[fi][0], pts[fi + 1][0], fr), lerp(pts[fi][1], pts[fi + 1][1], fr)]);
      if (k > 0) strokeL(x, seg, 10, C.teal);
      if (t >= T.up) at(x, 590, 0, { s: popS(t, T.up, .35) }, (x) => { rr(x, -70, -30, 140, 60, 30, C.green); txt(x, '+12%', 0, 11, { size: 28, weight: 700, color: '#fff', align: 'center' }); });
    });
    drawBush(x, this.b1, 30, 1100, t, 1, { s: .9 }); drawBush(x, this.b2, 1900, 1100, t, 2, { s: .9 });
  }
});

// 20 — All of it at your desk, or in your pocket.
scene(20, 20, {
  bg: C.teal, wipe: 'left', cam: [1.0, 1.03, 960, 540],
  build() { this.T = { desk: hit('stamp', 143.54), boing: hit('boing', 143.96), slide: hit('slide', 144.88), tap: hit('tap', 145.3), lbl: hit('stamp', 145.38) }; this.b1 = bush(151, 460, 500, { n: 11 }); this.plant = bush(153, 300, 380, { n: 9, fronds: .3 }); },
  dash(x, w, h, small) {
    rr(x, 0, 0, w, h, 0, C.white); rr(x, 0, 0, w, small ? 70 : 54, 0, C.navyL); txt(x, 'Rental Ninja', 22, small ? 46 : 37, { size: small ? 24 : 22, weight: 700, color: '#fff' });
    const cols = small ? 1 : 3;
    for (let i = 0; i < (small ? 3 : 3); i++) { const cw = (w - 20 * (cols + 1)) / cols, cx = 20 + (i % cols) * (cw + 20), cy = (small ? 90 + i * 130 : 74); rr(x, cx, cy, cw, small ? 110 : 90, 12, C.white); rr(x, cx, cy, 8, small ? 110 : 90, 4, [C.green, C.blue, C.purple][i]); bars(x, cx + 24, cy + 26, [cw * .4, cw * .6], { h: 12, gap: 30 }); }
    if (!small) [.4, .6, .5, .8, .7, .95, .85].forEach((v, i) => rr(x, 30 + i * ((w - 60) / 7), h - 20 - 150 * v, (w - 60) / 7 - 14, 150 * v, 8, i === 5 ? C.teal : C.tealXL));
  },
  draw(x, t) {
    const T = this.T;
    // split: the desk on the left, the street on the right
    rr(x, -200, -200, 1180, 1500, 0, C.teal); [0, 1].forEach(i => rr(x, 200 + i * 220, 70, 130, 300, 0, C.tealL)); rr(x, -200, 860, 1180, 400, 0, C.navy);
    drawBush(x, this.plant, 160, 860, t, 1, { s: .6 }); poly(x, [[110, 780], [210, 780], [198, 860], [122, 860]], C.mustard);
    laptop(x, 560, 850, 640, 400, (x, w, h) => this.dash(x, w, h, false));
    const sp = E.out(prog(t, T.slide - .2, .5)), edge = lerp(1950, 980, sp);
    rr(x, edge, -200, 1300, 1500, 0, C.sky); rr(x, edge, 940, 1300, 400, 0, C.navy);
    poly(x, [[edge - 40, -200], [edge + 30, -200], [edge + 50, 1300], [edge - 20, 1300]], C.navy);
    if (sp > 0) {
      person(x, edge + 300, 940, { who: 'host', s: 1.1, dir: 1, walk: t * 7.5, armF: POSE.phone, hold: 'phone' });
      phone(x, edge + 640, 520, 300, 600, (x, w, h) => this.dash(x, w, h, true), { rot: .04, s: t >= T.tap && t < T.tap + .12 ? .97 : 1 });
      drawBush(x, this.b1, edge + 1000, 1080, t, 2, { s: .9 });
    }
    stampPill(x, 'At your desk', 480, 220, t, T.desk, { bg: C.navy, sh: C.tealD, size: 50, rot: -.04 + (t > T.boing ? Math.sin((t - T.boing) * 20) * .04 * Math.max(0, 1 - (t - T.boing) * 2) : 0) });
    stampPill(x, 'or in your pocket', 1460, 140, t, T.lbl, { bg: C.coral, size: 50 });
  }
});

// 21 — More than twelve thousand properties already run on Rental Ninja.
scene(21, 21, {
  bg: C.sky, wipe: 'top', cam: [1.0, 1.05, 960, 560],
  build() {
    this.T = { houses: hitsIn('sticker', 147.1, 148.9), num: hit('stamp', 147.75), lbl: hit('stamp', 148.95), r: [hit('pop', 149.43), hit('pop', 150.04)], ninja: hit('boing', 150.57) };
    const R = mulberry(5); this.hs = [];
    for (let k = 0; k < 3; k++) { const n = [16, 13, 11][k]; for (let i = 0; i < n; i++) this.hs.push({ k, x: 40 + (i + .2 + R() * .6) * 1840 / n, s: [.22, .3, .4][k] * (.85 + R() * .3), roof: [C.coral, C.mustard, C.tealD, C.blue, C.pink][Math.floor(R() * 5)], d: R() }); }
  },
  draw(x, t) {
    const T = this.T, hs = T.houses, h0 = hs[0], h1 = hs[hs.length - 1];
    rr(x, -200, -200, 2400, 1500, 0, C.sky);
    const hills = [[C.tealL, 700], [C.teal, 800], [C.tealD, 900]];
    hills.forEach(([col, y], k) => { x.beginPath(); x.moveTo(-200, 1300); for (let i = 0; i <= 24; i++) { const px = -200 + i * 100; x.lineTo(px, y + Math.sin(i * .7 + k * 2) * 26); } x.lineTo(2200, 1300); x.closePath(); x.fillStyle = col; x.fill();
      this.hs.filter(h => h.k === k).forEach((h, i) => { const t0 = lerp(h0, h1, h.d), s = popS(t, t0, .3); if (s > 0) home(x, h.x, y + Math.sin((h.x + 200) / 100 * .7 + k * 2) * 26 + 6, h.s * s, { roof: h.roof, lit: .6 }); }); });
    rr(x, -200, 1000, 2400, 300, 0, C.navy);
    if (t >= T.num - .1) { const p = prog(t, T.num - .1, .12); at(x, 960, 270, { s: lerp(2, 1, E.in(p)), a: clamp(p * 3) }, (x) => { txt(x, '12,500+', 0, 60, { size: 190, weight: 700, color: C.navy, align: 'center' }); }); }
    stampPill(x, 'properties', 960, 430, t, T.lbl, { bg: C.coral, size: 56 });
    [['G2', '4.9'], ['Capterra', '4.8']].forEach(([n, v], i) => { if (t < T.r[i]) return; at(x, 420 + i * 1080, 300, { s: popS(t, T.r[i], .35) }, (x) => { softCard(x, -170, -80, 340, 160, 24, C.white); txt(x, n, 0, -24, { size: 30, weight: 700, color: C.mute, align: 'center' }); [0, 1, 2, 3, 4].forEach(j => icon(x, 'star', -84 + j * 42, 20, 34, C.mustard)); txt(x, v, 0, 66, { size: 34, weight: 700, align: 'center' }); }); });
    if (t >= T.ninja - .3) ninja(x, 960, lerp(1250, 900, E.back(prog(t, T.ninja - .3, .4))), 90, { t, eyes: 'happy' });
  }
});

// 22 — Getting started takes a day or two, and our team helps you move in.
scene(22, 22, {
  bg: C.teal, wipe: 'right', cam: [1.0, 1.03, 960, 540],
  build() {
    this.T = { d: [hit('land', 153.99), hit('land', 154.37)], tk: [hit('tick', 154.29), hit('tick', 154.67)], lbl: hit('stamp', 154.67), team: hit('pop', 155.04), boxes: [hit('land', 155.94), hit('land', 156.49), hit('land', 156.81)], free: hit('sparkle', 156.74) };
    this.b1 = bush(161, 460, 500, { n: 11 });
  },
  draw(x, t) {
    const T = this.T, GY = 940;
    room(x, { win: [], fy: GY, edge: false });
    poly(x, [[-200, -200], [80, -200], [130, 1300], [-200, 1300]], C.navy);
    ['Day 1', 'Day 2'].forEach((n, i) => {
      const ly = landY(t, T.d[i], .3, -700); if (ly === null) return;
      at(x, 380 + i * 330, 300 + ly, { rot: (i ? .04 : -.04) }, (x) => {
        softCard(x, -130, -140, 260, 280, 20, C.white); rr(x, -130, -140, 260, 70, 20, C.coral); rr(x, -130, -94, 260, 24, 0, C.coral);
        txt(x, n, 0, -88, { size: 34, weight: 700, color: '#fff', align: 'center' });
        if (t >= T.tk[i]) at(x, 0, 40, { s: popS(t, T.tk[i], .3) }, (x) => { circ(x, 0, 0, 60, C.green); check(x, 0, 0, 56); });
      });
    });
    stampPill(x, 'Live in 24–48 h', 545, 560, t, T.lbl, { bg: C.navy, sh: C.tealD, size: 50 });
    // the new home, and the team carrying the boxes in
    home(x, 1500, GY, 1.05, { roof: C.coral, lit: .8 });
    if (t >= T.team - .2) {
      const p = popS(t, T.team - .2, .35);
      ninja(x, 1050, 460, 70 * p, { t, eyes: 'happy' });
      person(x, lerp(800, 1180, prog(t, T.team, 1.6)), GY, { who: 'tech', s: .9, dir: 1, walk: t < T.team + 1.6 ? t * 8 : null, armF: [1.1, .9], armB: [1.1, .9], a: clamp(p * 2) });
    }
    [['Listings', C.mustard], ['Calendars', C.blue], ['Guests', C.purple]].forEach(([n, col], i) => {
      const ly = landY(t, T.boxes[i], .35, -500); if (ly === null) return;
      at(x, 1770, GY - 60 - i * 104 + ly, { rot: (i - 1) * .04 }, (x) => { rr(x, -110, -52, 220, 104, 10, C.kraft); rr(x, -110, -52, 220, 22, 6, C.kraftD); txt(x, n, 0, 26, { size: 26, weight: 700, color: C.navy, align: 'center' }); });
    });
    if (t >= T.free) at(x, 1500, 380, { s: popS(t, T.free, .35) }, (x) => pill(x, 'We move you in', 0, 0, { size: 40, bg: C.white, fg: C.tealD, sh: C.navy }));
    drawBush(x, this.b1, 1100, 1080, t, 2, { s: .8 });
  }
});

// 23 — Less busywork. Happier guests. More bookings.
scene(23, 23, {
  bg: C.wallL, wipe: 'bottom', cam: [1.0, 1.04, 960, 540],
  build() { this.T = { c: [hit('stamp', 158.27), hit('stamp', 159.73), hit('stamp', 161.61)], done: hit('ding', 161.95) }; this.b1 = bush(171, 460, 500, { n: 11 }); this.b2 = bush(173, 420, 480, { n: 10, fronds: .6 }); },
  draw(x, t) {
    const T = this.T;
    rr(x, -200, -200, 2400, 1500, 0, C.wallL); rr(x, -200, 960, 2400, 400, 0, C.navy);
    [['broom', 'Less busywork', C.tealD, 'host'], ['heart', 'Happier guests', C.coral, 'ginger'], ['calendar', 'More bookings', C.green, 'owner']].forEach(([k, n, col, who], i) => {
      const t0 = T.c[i]; if (t < t0 - .15) return;
      const p = prog(t, t0 - .15, .15), cx = 340 + i * 620;
      at(x, cx, 360, { s: lerp(1.6, 1, E.in(p)) * .85, a: clamp(p * 3), rot: (i - 1) * .03 }, (x) => {
        x.save(); x.globalAlpha *= .9; rr(x, -260 + 14, -260 + 14, 520, 520, 34, C.navy); x.restore();
        rr(x, -260, -260, 520, 520, 34, col);
        badge(x, k, 0, -110, 80, '#FFFFFF', {});
        icon(x, k, 0, -110, 84, col, '#fff');
        txt(x, n, 0, 140, { size: 52, weight: 700, color: '#fff', align: 'center' });
      });
      person(x, cx, 960, { who, s: .58, dir: i === 2 ? -1 : 1, mood: 'happy', armF: t >= T.done ? POSE.up : POSE.hang, a: clamp((t - t0) * 4) });
    });
    drawBush(x, this.b1, 30, 1100, t, 1, { s: .9 }); drawBush(x, this.b2, 1900, 1100, t, 2, { s: .9 });
  }
});

// 24 — Rental Ninja. Your whole rental business, in one place. (the series end card, dark)
scene(24, 24, {
  bg: C.navy, wipe: 'right', noMark: true, cam: [1.0, 1.03, 960, 540],
  build() { this.T = { taps: hitsIn('tap', 164.3, 165.3), thud: hit('thud', 164.5), tag: hit('land', 165.5), cta: hit('sticker', 168.28), url: hit('sticker', 168.4), pops: [hit('pop', 168.72), hit('pop', 168.88)], wink: hit('blink', 169.72) }; this.b1 = bush(181, 600, 640, { n: 13, col: C.navyD }); this.b2 = bush(183, 560, 600, { n: 12, col: C.navyD, fronds: .6 }); },
  draw(x, t) {
    const T = this.T;
    drawBush(x, this.b1, 40, 1180, t, 1, { s: 1 }); drawBush(x, this.b2, 1880, 1180, t, 2, { s: 1 });
    const np = prog(t, T.thud - .3, .3);
    if (t > T.thud - .3) ninja(x, 960, lerp(-200, 300, E.out(np)) + (t > T.thud ? Math.sin((t - T.thud) * 22) * 10 * Math.max(0, 1 - (t - T.thud) * 3) : 0), 96, { t, eyes: t >= T.wink && t < T.wink + .5 ? 'wink' : 'happy' });
    brand(x, 960, 520, 150, t, T.taps);
    if (t >= T.tag) txt(x, 'Your whole rental business, in one place.', 960, 650, { size: 46, weight: 600, color: C.white, align: 'center', a: E.out(prog(t, T.tag, .5)) });
    if (t >= T.cta) pill(x, 'Book a demo', 960, 800, { size: 46, s: popS(t, T.cta, .35), bg: C.coral, sh: C.navyD });
    if (t >= T.url) txt(x, 'rental-ninja.com', 960, 920, { size: 34, weight: 700, color: C.tealL, align: 'center', a: E.out(prog(t, T.url, .4)) });
    T.pops.forEach((p0, i) => { const s = popS(t, p0, .3) * (1 - prog(t, p0 + .6, .5)); if (s > 0) icon(x, 'spark', [660, 1260][i], [780, 790][i], 46 * s, C.mustard); });
  }
});

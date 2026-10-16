// Act 3, second half: arrival, extras, the team, accounting, owners, the direct booking website.

// 13 — On the day, a door code lets them in, and a digital guidebook answers the small questions.
scene(13, 13, {
  bg: C.sky, wipe: 'top',
  camAt(t) {
    const T = this.T, zin = E.inOut(prog(t, T.code - .45, .45)), zout = E.inOut(prog(t, T.open - .1, .6));
    const k = zin * (1 - zout);
    return [lerp(1.0, 2.6, k), lerp(1000, 1475, k), lerp(560, 690, k)];
  },
  build() {
    const T = this.T = { lbl: hit('stamp', 94.97), code: hit('popup', 95.61), digits: hitsIn('type', 95.7, 96.3), led: hit('blink', 96.25), open: hit('slide', 96.64), boing: hit('boing', 96.94), guide: hit('land', 97.92), q: hitsIn('popup', 98.1, 98.6), a: hitsIn('tick', 99.2, 99.8) };
    this.b1 = bush(83, 520, 480, { n: 10 }); this.b2 = bush(89, 460, 440, { n: 10, fronds: .5 });
  },
  draw(x, t) {
    const T = this.T, open = E.inOut(prog(t, T.open, .4)), n = T.digits.filter(d => t >= d).length;
    street(x, t, { open, lock: false });
    at(x, 1475, 700, { s: .45 }, (x) => keypad(x, 0, 0, 1, { code: '4827'.slice(0, n) + (n < 4 && t > T.code ? '_' : ''), press: n > 0 && t < T.digits[n - 1] + .12 ? [3, 7, 1, 6][n - 1] : -1, screen: t >= T.led ? C.green : C.teal, unlocked: t >= T.led }));
    const wv = t > T.boing;
    person(x, lerp(980, 1200, open), 945, { who: 'dad', s: 1.0, dir: 1, walk: open > 0 && open < 1 ? t * 8 : null, armF: wv ? POSE.wave(t) : POSE.reach, mood: t >= T.led ? 'happy' : 'smile' });
    person(x, 820, 948, { who: 'blonde', s: .95, dir: 1, hold: 'case', caseCol: C.blue, mood: t >= T.led ? 'happy' : 'smile' });
    if (t >= T.open) { const s = popS(t, T.open + .2, .35); if (s > 0) icon(x, 'spark', 1480, 470, 50 * s, C.mustard); }
    drawBush(x, this.b1, 120, 1110, t, 1, { s: 1.1 }); drawBush(x, this.b2, 2000, 1120, t, 2, { s: 1.1 });
    stampPill(x, 'On the day', 330, 210, t, T.lbl, { bg: C.navy, sh: C.grey, size: 54 });
    // the guidebook rises on a phone
    if (t >= T.guide - .45) {
      const p = E.back(prog(t, T.guide - .45, .45));
      phone(x, 1640, lerp(1500, 520, p), 380, 700, (x, w, h) => {
        rr(x, 0, 0, w, h, 0, C.white); rr(x, 0, 0, w, 76, 0, C.tealD); icon(x, 'doc', 36, 38, 30, '#fff', C.tealD); txt(x, 'Guidebook', 64, 50, { size: 26, weight: 700, color: '#fff' });
        [['wifi', 'Wi-Fi password?', 'NinjaGuest · 2024sun'], ['pin', 'Where to park?', 'Free spot, street left'], ['clock', 'Pool hours?', '9 am – 9 pm']].forEach(([k, q, a], i) => {
          if (t < T.q[i]) return; const s = popS(t, T.q[i], .3), y = 110 + i * 190;
          at(x, w / 2, y + 80, { s }, (x) => {
            rr(x, -160, -80, 320, 160, 18, C.white); badge(x, k, -112, -36, 30, [C.blue, C.mustard, C.purple][i]);
            txt(x, q, -70, -28, { size: 21, weight: 700 });
            if (t >= T.a[i]) { txt(x, a, -130, 34, { size: 19, weight: 600, color: C.tealD }); circ(x, 130, 34, 15, C.green); check(x, 130, 34, 14); }
          });
        });
      }, { rot: .03 });
    }
  }
});

// 14 — Extras, like a late check-out, are one tap away.
scene(14, 14, {
  bg: C.teal, wipe: 'right', cam: [1.0, 1.03, 960, 540],
  build() { this.T = { clock: hit('pop', 102.38), ticks: hitsIn('tick', 102.5, 103.2), lbl: hit('stamp', 102.85), hand: hit('slide', 103.79), tap: hit('button', 104.28), done: hit('ding', 104.7) }; this.b1 = bush(91, 460, 520, { n: 11 }); },
  draw(x, t) {
    const T = this.T;
    room(x, { wx: 1180, win: [0, 1, 2], fy: 980, edge: false });
    poly(x, [[1800, -200], [2200, -200], [2200, 1300], [1760, 1300]], C.navy);
    // wall clock: the hands slide from 11 to 2
    at(x, 1480, 560, { s: 1 + (t >= T.clock ? Math.sin(prog(t, T.clock, .3) * Math.PI) * .08 : 0) }, (x) => {
      circ(x, 0, 0, 190, C.navy); circ(x, 0, 0, 168, C.white);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; strokeL(x, [[Math.sin(a) * 140, -Math.cos(a) * 140], [Math.sin(a) * 156, -Math.cos(a) * 156]], i % 3 ? 5 : 9, C.navy); }
      const k = T.ticks.filter(v => t >= v).length / T.ticks.length, ok = t >= T.done ? 1 : 0;
      const hr = lerp(11, 14, Math.max(k * .6, ok)), ha = hr / 12 * Math.PI * 2, ma = (hr % 1) * Math.PI * 2;
      strokeL(x, [[0, 0], [Math.sin(ha) * 90, -Math.cos(ha) * 90]], 14, C.navy); strokeL(x, [[0, 0], [Math.sin(ma) * 130, -Math.cos(ma) * 130]], 8, C.coral); circ(x, 0, 0, 14, C.navy);
    });
    stampPill(x, 'Late check-out', 1480, 230, t, T.lbl, { bg: C.orange, size: 56 });
    handPhone2(x, 620, lerp(1500, 600, E.out(prog(t, T.hand - .7, .7))), { s: 1.05, rot: .02, skin: '#F4CDB0', sleeve: C.white, ...thumbTrack(t, [[T.tap, [150, 200]]]) }, (x, w, h) => {
      rr(x, 0, 0, w, h, 0, C.white); rr(x, 0, 0, w, 70, 0, C.orange); txt(x, 'Extras', 22, 48, { size: 28, weight: 700, color: '#fff' });
      [['clock', 'Late check-out', 'until 2 pm · €25'], ['heart', 'Welcome basket', 'wine & local treats'], ['house', 'Early check-in', 'from 11 am · €20']].forEach(([k, a, b], i) => {
        const y = 92 + i * 150; rr(x, 12, y, w - 24, 134, 16, i === 0 && t >= T.tap ? C.coralXL : C.white);
        badge(x, k, 56, y + 46, 28, [C.orange, C.pink, C.tealD][i]); txt(x, a, 96, y + 44, { size: 21, weight: 700 }); txt(x, b, 96, y + 72, { size: 17, color: C.mute });
        if (i === 0) { const on = t >= T.tap, s = t >= T.tap && t < T.tap + .12 ? .9 : 1; at(x, w / 2, y + 108, { s }, (x) => { rr(x, -110, -18, 220, 36, 18, on ? C.green : C.orange); if (on) check(x, -50, 0, 16); txt(x, on ? 'Added' : 'Add · 1 tap', on ? 10 : 0, 7, { size: 18, weight: 700, color: '#fff', align: 'center' }); }); }
      });
    });
    if (t >= T.tap && t < T.tap + .5) { const p = prog(t, T.tap, .5); x.save(); x.globalAlpha = 1 - p; x.lineWidth = 8; x.strokeStyle = C.orange; x.beginPath(); x.arc(620, 600 + (-310 + 92 + 108) * 1.05, 30 + p * 90, 0, 7); x.stroke(); x.restore(); }
    drawBush(x, this.b1, 60, 1120, t, 3, { s: 1 });
  }
});

// 15 — Cleanings and check-ins schedule themselves; the team gets every job on their phone, and sends back photos.
scene(15, 15, {
  bg: C.wallL, wipe: 'bottom', cam: [1.0, 1.04, 960, 560],
  build() {
    this.T = { j: [hit('pop', 107.37), hit('pop', 108.27)], self: hit('fan', 108.74), steps: hitsIn('tap', 110.4, 110.8), phone: hit('land', 111.27), buzz: hit('blink', 112.68), rep: hit('land', 113.65), shots: hitsIn('click', 114, 114.5), done: hit('stamp', 114.92) };
    this.b1 = bush(101, 420, 460, { n: 10 });
  },
  draw(x, t) {
    const T = this.T;
    rr(x, -200, -200, 2400, 1500, 0, C.wallL); rr(x, 980, -200, 1300, 1500, 0, C.teal);
    [0, 1, 2].forEach(i => rr(x, 1180 + i * 220, 70, 130, 300, 0, C.tealL)); rr(x, 980, 940, 1300, 400, 0, C.tealD); rr(x, -200, 940, 1180, 400, 0, C.navy);
    // the schedule fills itself
    softCard(x, 100, 150, 760, 700, 26, C.white, { sa: .12 });
    txt(x, 'Today · Casa Marina', 140, 220, { size: 34, weight: 700 });
    if (t >= T.self) at(x, 760, 205, { s: popS(t, T.self, .3) }, (x) => { rr(x, -80, -26, 160, 52, 26, C.purple); icon(x, 'spark', -48, 0, 22, '#fff'); txt(x, 'Auto', 16, 9, { size: 24, weight: 700, color: '#fff', align: 'center' }); });
    [['broom', 'Cleaning', '11:00 · Marta', C.tealD], ['key', 'Check-in', '16:00 · Meyer family', C.green]].forEach(([k, a, b, col], i) => {
      if (t < T.j[i]) return; const s = popS(t, T.j[i], .3), y = 280 + i * 170;
      at(x, 480, y + 70, { s }, (x) => {
        rr(x, -350, -70, 700, 140, 18, C.greyL); badge(x, k, -270, 0, 44, col); txt(x, a, -205, -8, { size: 32, weight: 700 }); txt(x, b, -205, 30, { size: 24, color: C.mute });
        if (i === 0 && t >= T.done) at(x, 250, 0, { s: popS(t, T.done, .3), rot: -.08 }, (x) => { rr(x, -76, -30, 152, 60, 30, C.green); check(x, -36, 0, 22); txt(x, 'Done', 18, 10, { size: 26, weight: 700, color: '#fff', align: 'center' }); });
      });
    });
    // photos arrive under the job
    T.shots.forEach((st, i) => { const p = E.out(prog(t, st, .35)); if (t < st) return; at(x, lerp(1400, 260 + i * 200, p), lerp(560, 760, p), { s: lerp(.4, 1, p), rot: (i - 1) * .05 }, (x) => { rr(x, -84, -64, 168, 128, 10, C.white); thumb(x, -74, -54, 148, 108, { r: 6, sky: C.greyL, sea: C.wallD, roof: C.mustard }); }); });
    // the cleaner walks in, gets the job on her phone, takes the photos
    const st = T.steps, wk = t < st[st.length - 1] + .2, px = lerp(2150, 1450, E.out(prog(t, st[0] - .6, st[st.length - 1] - st[0] + .8)));
    const hasPhone = t >= T.phone - .2;
    person(x, px, 945, { who: 'cleaner', s: 1.08, dir: -1, walk: wk ? stepPhase(t, st[0], .13) : null, armF: hasPhone ? POSE.phone : undefined, hold: hasPhone ? 'phone' : undefined, screen: t >= T.buzz && t < T.buzz + .3 ? '#FFFFFF' : C.teal, mood: t >= T.done ? 'happy' : 'smile' });
    if (t >= T.phone - .2 && t < T.rep) { const s = popS(t, T.phone - .2, .3); at(x, 1640, 300, { s }, (x) => { softCard(x, -170, -70, 340, 140, 20, C.white); badge(x, 'broom', -110, 0, 36, C.tealD); txt(x, 'New job', -60, -8, { size: 26, weight: 700 }); txt(x, 'Casa Marina · 11:00', -60, 26, { size: 18, color: C.mute }); }); }
    T.shots.forEach(st2 => { if (t >= st2 && t < st2 + .12) { x.save(); x.globalAlpha = .7; circ(x, 1395, 560, 70, '#FFFFFF'); x.restore(); } });
    drawBush(x, this.b1, 1980, 1060, t, 2, { s: 1 });
  }
});

// 16 — At the end of the month, the accounting is already done: statements, commissions, invoices.
scene(16, 16, {
  bg: C.teal, wipe: 'left', cam: [1.0, 1.03, 960, 540],
  build() {
    this.T = { flip: hit('flip', 116.99), st: hit('land', 117.87), rows: hitsIn('type', 118, 118.6), pay: hit('stamp', 119.21), tick: hit('tick', 119.46), d: [hit('land', 120.42), hit('land', 121.68), hit('land', 122.7)], calc: hit('stamp', 123.99) };
    this.plant = bush(111, 300, 380, { n: 9, fronds: .3 });
  },
  draw(x, t) {
    const T = this.T;
    room(x, { wx: 1220, win: [0, 1, 2], fy: 2000 });
    rr(x, -200, 860, 2400, 400, 0, C.navy); rr(x, -200, 846, 2400, 18, 6, C.navyL);
    person(x, 1760, 1030, { who: 'host', s: 1.2, dir: -1, sit: true, armF: POSE.phone, hold: 'phone', armB: [.4, .4], mood: t >= T.pay ? 'happy' : 'smile' });
    rr(x, -200, 860, 2400, 400, 0, C.navy); rr(x, -200, 846, 2400, 18, 6, C.navyL);
    // a desk calendar flips to the month end
    at(x, 1400, 760, {}, (x) => { rr(x, -110, -150, 220, 170, 14, C.white); rr(x, -110, -150, 220, 50, 14, C.coral); rr(x, -110, -115, 220, 15, 0, C.coral); const f = t >= T.flip; txt(x, f ? '31' : '30', 0, -10 + (f ? 0 : 0), { size: 70, weight: 700, align: 'center' }); txt(x, 'MARCH', 0, -112, { size: 22, weight: 700, color: '#fff', align: 'center' }); });
    drawBush(x, this.plant, 1010, 850, t, 1, { s: .65 }); poly(x, [[960, 760], [1060, 760], [1048, 850], [972, 850]], C.mustard);
    // the statement lands and fills itself
    const ly = landY(t, T.st, .4, -900);
    if (ly !== null) at(x, 560, 470 + ly, { rot: -.02 }, (x) => {
      softCard(x, -330, -380, 660, 760, 20, C.white);
      txt(x, 'Owner statement', -290, -310, { size: 36, weight: 700 }); txt(x, 'Casa Marina · March', -290, -270, { size: 24, color: C.mute });
      [['Bookings', '€6,480'], ['Cleaning', '–€540'], ['Commission 20%', '–€1,296'], ['Owner payout', '€4,644']].forEach(([a, b], i) => {
        if (t < (T.rows[i] ?? T.rows[T.rows.length - 1])) return;
        const y = -190 + i * 90; rr(x, -290, y - 34, 580, 66, 10, i === 3 ? C.greenL : C.greyL);
        txt(x, a, -266, y + 10, { size: 26, weight: i === 3 ? 700 : 600 }); txt(x, b, 266, y + 10, { size: 28, weight: 700, align: 'right', color: i === 3 ? C.green : C.ink });
      });
      if (t >= T.pay - .1) { const p = prog(t, T.pay - .1, .1); pill(x, 'PAID', 130, 260, { size: 60, s: lerp(2, 1, E.in(p)), a: clamp(p * 3), rot: -.12, bg: C.green, sh: C.navy }); }
    });
    [['doc', 'Owner statements', C.blue], ['percent', 'Commissions', C.purple], ['card', 'Invoices', C.orange]].forEach(([k, n, col], i) => {
      const ly2 = landY(t, T.d[i], .2, -300); if (ly2 === null) return;
      at(x, 1300, 230 + i * 170 + ly2, { rot: (i - 1) * .02 }, (x) => { softCard(x, -240, -62, 480, 124, 20, C.white); badge(x, k === 'percent' ? 'chart' : k, -170, 0, 40, col); txt(x, n, -110, 11, { size: 32, weight: 700 }); circ(x, 196, 0, 22, C.green); check(x, 196, 0, 22); });
    });
    stampPill(x, 'Calculated for you', 1300, 770, t, T.calc, { bg: C.navy, sh: C.tealD, size: 46 });
  }
});

// 17 — Owners follow their bookings with a login of their own.
scene(17, 17, {
  bg: C.wallL, wipe: 'top', cam: [1.0, 1.04, 960, 560],
  build() { this.T = { bars: hitsIn('tap', 126.5, 126.9), c: [hit('sticker', 127.09), hit('sticker', 128.19), hit('sticker', 128.68)], lbl: hit('stamp', 127.99), tap: hit('click', 128.68) }; this.plant = bush(121, 340, 420, { n: 9 }); },
  draw(x, t) {
    const T = this.T;
    rr(x, -200, -200, 2400, 1500, 0, C.sand); rr(x, -200, 930, 2400, 400, 0, C.navy);
    [0, 1].forEach(i => rr(x, 200 + i * 240, 90, 150, 330, 0, C.white));
    // armchair and the owner with his phone
    rr(x, 160, 560, 520, 200, 50, C.orangeD); rr(x, 120, 680, 600, 170, 46, C.orange); rr(x, 110, 640, 110, 230, 40, C.orangeD); rr(x, 620, 640, 110, 230, 40, C.orangeD);
    rr(x, 190, 850, 24, 80, 0, C.navyL); rr(x, 630, 850, 24, 80, 0, C.navyL);
    person(x, 450, 850, { who: 'owner', s: 1.02, dir: 1, sit: true, armF: POSE.phone, hold: 'phone', armB: [.3, .5], mood: t >= T.c[2] ? 'happy' : 'smile' });
    drawBush(x, this.plant, 860, 930, t, 1, { s: .9 });
    phone(x, 1420, 590, 430, 820, (x, w, h) => {
      rr(x, 0, 0, w, h, 0, C.white); rr(x, 0, 0, w, 90, 0, C.green); txt(x, 'Hi, Pedro', 26, 58, { size: 30, weight: 700, color: '#fff' }); circ(x, w - 46, 45, 24, '#fff'); icon(x, 'person', w - 46, 45, 26, C.green);
      rr(x, 16, 110, w - 32, 220, 18, C.white); txt(x, 'This month', 36, 150, { size: 22, weight: 700, color: C.mute }); txt(x, '€4,644', 36, 196, { size: 40, weight: 700 });
      [.5, .7, .45, .85, .62, .95].forEach((v, i) => { const s = clamp((t - (T.bars[0] ?? this.start) + .2 - i * .06) * 4); rr(x, 40 + i * 52, 310 - 100 * v * s, 34, 100 * v * s, 6, i === 5 ? C.green : C.tealXL); });
      [['Anna', '14 – 17 Aug', C.airbnb], ['Meyer', '18 – 24 Aug', C.booking], ['Owner stay', '28 – 30 Aug', C.green]].forEach(([n, d, col], i) => {
        if (t < T.c[i]) return; const s = popS(t, T.c[i], .28), y = 360 + i * 120;
        at(x, w / 2, y + 50, { s }, (x) => { rr(x, -(w - 32) / 2, -50, w - 32, 100, 16, C.white); rr(x, -(w - 32) / 2, -50, 12, 100, 6, col); txt(x, n, -(w - 32) / 2 + 30, -6, { size: 24, weight: 700 }); txt(x, d, -(w - 32) / 2 + 30, 26, { size: 20, color: C.mute }); });
      });
    }, { rot: .02 });
    stampPill(x, 'A login of their own', 820, 180, t, T.lbl, { bg: C.green, size: 44 });
  }
});

// 18 — Your own booking website brings guests straight to you, with no channel commission to pay.
scene(18, 18, {
  bg: C.teal, wipe: 'right', cam: [1.0, 1.03, 960, 540],
  build() {
    this.T = { lbl: hit('stamp', 131.41), steps: hitsIn('tap', 132, 133.1), arrow: hit('scribble', 132.9), click: hit('click', 133.71), booked: hit('pop', 133.81), fee: hit('stamp', 134.56), off: hit('whoosh', 135.94), zero: hit('stamp', 136.24) };
    this.b1 = bush(131, 460, 480, { n: 10 });
  },
  draw(x, t) {
    const T = this.T, GY = 960;
    room(x, { win: [], fy: GY, edge: false });
    // the browser on the wall
    softCard(x, 840, 150, 1000, 640, 24, C.white, { sa: .2 });
    rr(x, 840, 150, 1000, 56, 24, C.greyL); rr(x, 840, 180, 1000, 26, 0, C.greyL); [0, 1, 2].forEach(i => circ(x, 876 + i * 26, 178, 8, [C.coral, C.mustard, C.green][i]));
    rr(x, 960, 162, 520, 34, 17, C.white); txt(x, 'casamarina.com', 1220, 186, { size: 20, weight: 700, color: C.mute, align: 'center' });
    thumb(x, 870, 226, 940, 300, { r: 14, hs: .2 });
    txt(x, 'Casa Marina', 880, 590, { size: 44, weight: 700 }); txt(x, 'Sea view · Sleeps 4 · from €180', 880, 634, { size: 24, color: C.mute });
    const clicked = t >= T.click, s = clicked && t < T.click + .12 ? .92 : 1;
    at(x, 1640, 690, { s }, (x) => { rr(x, -150, -40, 300, 80, 40, clicked ? C.green : C.coral); if (clicked) check(x, -70, 0, 26); txt(x, clicked ? 'Booked' : 'Book now', clicked ? 18 : 0, 12, { size: 30, weight: 700, color: '#fff', align: 'center' }); });
    if (t >= T.booked) at(x, 1640, 300, { s: popS(t, T.booked, .35) }, (x) => { pill(x, 'Direct booking', 0, 0, { size: 32, bg: C.green, sh: C.navy }); });
    // the guests walk straight to it
    const st = T.steps, moving = t < st[st.length - 1] + .1, px = lerp(-200, 560, prog(t, st[0] - .3, st[st.length - 1] - st[0] + .4)), ph = moving ? stepPhase(t, st[0], .24) : null;
    person(x, px - 150, GY, { who: 'beard', s: .95, walk: ph, hold: 'case', caseCol: C.mustard });
    person(x, px, GY + 3, { who: 'ginger', s: .9, walk: ph === null ? null : ph + 1.2, armF: !moving ? POSE.point : undefined });
    if (t >= T.arrow - .4) { const k = prog(t, T.arrow - .4, .6); x.save(); x.setLineDash([2, 22]); strokeL(x, [[640, 470], [lerp(640, 800, k), 470]], 12, C.white); x.restore(); if (k >= 1) poly(x, [[830, 470], [796, 444], [796, 496]], C.white); }
    // the channel fee, gone
    if (t >= T.fee - .1) {
      const g = E.in(prog(t, T.off, .5)), p = prog(t, T.fee - .1, .1);
      at(x, lerp(1000, 2400, g), lerp(870, 700, g), { rot: -.06 + g * 1.4, a: 1 - g }, (x) => { pill(x, 'Channel fee 15%', 0, 0, { size: 44, s: lerp(1.8, 1, E.in(p)), a: clamp(p * 3), bg: C.white, fg: C.coral, sh: C.navy }); });
    }
    stampPill(x, '0% commission', 1340, 880, t, T.zero, { bg: C.green, size: 56 });
    stampPill(x, 'Your own website', 400, 220, t, T.lbl, { bg: C.navy, sh: C.tealD, size: 50 });
    drawBush(x, this.b1, 1980, 1100, t, 2, { s: 1 });
  }
});

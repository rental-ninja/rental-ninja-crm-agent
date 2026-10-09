// Act 1 — why you started, and what the job became. Act 2 — Rental Ninja.
const shake = (t, t0, amp = 14, d = .35) => t < t0 || t > t0 + d ? [0, 0] : [Math.sin((t - t0) * 70) * amp * (1 - (t - t0) / d), Math.cos((t - t0) * 55) * amp * .6 * (1 - (t - t0) / d)];
// footsteps on the mixed taps: plant a foot on each hit
const stepPhase = (t, t0, period) => Math.PI / 2 + Math.PI * (t - t0) / period;

// 1 — You started hosting to welcome people.
scene(1, 1, {
  bg: C.sky, cam: [1.0, 1.07, 1060, 570],
  build() {
    const T = this.T = { open: hit('slide', .75), host: hit('pop', 1.3), steps: hitsIn('tap', .8, 3.1), heart: hit('pop', 3.44), heart2: hit('pop', 3.94) };
    this.b1 = bush(11, 560, 520, { n: 11 }); this.b2 = bush(23, 440, 400, { n: 9, fronds: .6 });
  },
  draw(x, t) {
    const T = this.T, open = E.inOut(prog(t, T.open, .5));
    street(x, t, { open });
    // the host steps out of the door and waves
    if (t >= T.host - .1) {
      const p = E.out(prog(t, T.host - .1, .7)), wv = t > T.host + .7;
      person(x, lerp(1285, 1060, p), 930, { who: 'host', s: lerp(.9, 1, p), dir: -1, walk: p < 1 ? p * 6 : null, armF: wv ? POSE.wave(t) : undefined, mood: 'smile', a: clamp((t - T.host + .1) * 6) });
    }
    // two guests arrive with a suitcase, one step per tap
    const t0 = T.steps[0], t1 = T.steps[T.steps.length - 1], per = (t1 - t0) / (T.steps.length - 1);
    const moving = t < t1 + .1, ph = moving ? stepPhase(t, t0, per) : null, px = lerp(-220, 780, E.out(prog(t, t0 - .3, t1 - t0 + .4)) * .15 + prog(t, t0 - .3, t1 - t0 + .4) * .85);
    const arrived = !moving;
    person(x, px - 250, 940, { who: 'beard', s: 1.02, walk: ph === null ? null : ph + 1.2, hold: 'case', caseCol: C.mustard, armF: arrived ? POSE.hold : undefined, mood: 'smile' });
    person(x, px, 945, { who: 'ginger', s: .98, walk: ph, armF: arrived && t > T.heart - .3 ? POSE.wave(t + .4) : undefined, mood: arrived ? 'happy' : 'smile' });
    [[T.heart, px - 40, 380, 46], [T.heart2, 1040, 330, 34]].forEach(([th, hx, hy, r], i) => { const s = popS(t, th, .4); if (s > 0) badge(x, 'heart', hx, hy - (t - th) * 22, r, C.coral, { s, rot: sway(t, i, .12, 3) }); });
    drawBush(x, this.b1, 120, 1100, t, 1, { s: 1.15 }); drawBush(x, this.b2, 1980, 1120, t, 2, { s: 1.2 });
  }
});

// 2 — …the job became browser tabs, spreadsheets, and a phone that never stops.
scene(2, 2, {
  bg: C.teal, wipe: 'right', cam: [1.0, 1.05, 960, 560],
  build() {
    const T = this.T = { tabs: hitsIn('popup', 7.9, 8.8), sheet: hit('land', 9.76), phone: hit('tap', 11.09), buzz: 11.44, counts: hitsIn('pop', 11.5, 12.45), stick: hitsIn('sticker', 12.1, 12.65) };
    this.tabs = [['Airbnb', C.airbnb], ['Booking.com', C.booking], ['Vrbo', C.vrbo], ['Prices', C.green], ['Calendar', C.mustard], ['Messages', C.purple]];
    this.pos = [[330, 300, -.04], [640, 220, .03], [930, 300, -.02], [280, 560, .05], [600, 520, -.03], [930, 560, .04]];
    this.plant = bush(5, 300, 360, { n: 8, fronds: .2 });
  },
  draw(x, t) {
    const T = this.T, DY = 820;
    [0, 1, 2, 3].forEach(i => rr(x, 220 + i * 230, 60, 120, 300, 0, C.tealL));
    poly(x, [[-100, -100], [130, -100], [190, 1200], [-100, 1200]], C.navy);
    const stage = t < T.tabs[0] ? 0 : t < T.sheet ? 1 : t < T.phone ? 2 : 3;
    person(x, 1430, 1050, { who: 'host', s: 1.28, dir: -1, sit: true, armF: stage >= 3 ? POSE.chin : POSE.tap, armB: POSE.tap, mood: ['smile', 'wide', 'wide', 'worried'][stage], headTilt: stage === 3 ? Math.sin(t * 9) * .03 : 0 });
    // desk, laptop, monitor, plant
    rr(x, 130, DY, 1700, 400, 0, C.navy); rr(x, 130, DY - 14, 1700, 18, 6, C.navyL);
    rr(x, 1150, DY - 26, 190, 14, 6, C.greyD); poly(x, [[1160, DY - 24], [1176, DY - 24], [1236, DY - 190], [1220, DY - 196]], C.navyL);
    drawBush(x, this.plant, 1760, DY - 70, t, 0, { s: .8 }); rr(x, 1710, DY - 110, 100, 110, 10, C.orange);
    at(x, 720, 560, {}, (x) => { rr(x, -330, -230, 660, 400, 20, C.navy); rr(x, -310, -210, 620, 360, 8, C.white); bars(x, -270, -170, [380, 300, 340, 220], { h: 18, gap: 46 }); rr(x, -40, 170, 80, 60, 0, C.navyL); rr(x, -130, 222, 260, 20, 10, C.navyL); });
    // tabs multiply over the monitor
    const jit = t > 12 ? 1 : 0;
    this.pos.forEach(([px, py, r], i) => {
      const s = popS(t, T.tabs[i], .3); if (s <= 0) return;
      at(x, px + jit * Math.sin(t * 40 + i) * 3, py, { s, rot: r }, (x) => {
        const [title, col] = this.tabs[i];
        softCard(x, -170, -110, 340, 220, 14, C.white);
        rr(x, -170, -110, 340, 50, 14, col); rr(x, -170, -76, 340, 16, 0, col);
        txt(x, title, -150, -74, { size: 24, weight: 700, color: '#fff' });
        if (i === 4) calGrid(x, -150, -40, 7, 3, 36, 36, { 3: C.coralL, 4: C.coralL, 10: C.tealL, 11: C.tealL });
        else if (i === 5) [0, 1, 2].forEach(k => { avatar(x, -128, -20 + k * 46, 16, [C.mustard, C.coral, C.blue][k]); bars(x, -100, -26 + k * 46, [190 - k * 40]); circ(x, 140, -20 + k * 46, 8, C.coral); });
        else if (i === 3) ['Site 1', 'Site 2', 'Site 3'].forEach((sname, k) => { txt(x, sname, -150, -14 + k * 42, { size: 22, color: C.mute }); txt(x, ['€120', '€135', '€129'][k], 150, -14 + k * 42, { size: 24, weight: 700, align: 'right', color: k === 1 ? C.coral : C.ink }); });
        else { thumb(x, -150, -40, 130, 100, { r: 8 }); bars(x, 0, -30, [130, 100]); txt(x, ['€120', '€135', '€129'][i], 0, 50, { size: 34, weight: 700 }); }
      });
    });
    // the spreadsheet drops in from above
    const ly = landY(t, T.sheet, .22, -900);
    if (ly !== null) at(x, 1300, 330 + ly, { rot: .06 }, (x) => {
      softCard(x, -230, -150, 460, 300, 12, C.white);
      rr(x, -230, -150, 460, 52, 12, C.green); rr(x, -230, -114, 460, 16, 0, C.green);
      txt(x, 'bookings_FINAL_v7.xlsx', -210, -112, { size: 22, weight: 700, color: '#fff', font: F.mono });
      for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) rr(x, -218 + i * 88, -82 + j * 44, 84, 40, 3, (i === 3 && j === 2) ? C.coralL : j === 0 ? C.greenL : C.greyL);
      txt(x, '#REF!', 92 + 42, 27, { size: 20, weight: 700, color: C.coral, font: F.mono, align: 'center' });
    });
    // the phone on the desk that never stops
    const ps = popS(t, T.phone - .1, .3);
    if (ps > 0) {
      const bz = t > T.buzz ? Math.sin(t * 70) * 4 : 0;
      phone(x, 1600 + bz, DY - 120, 120, 220, (x, w, h) => { [0, 1, 2].forEach(k => { rr(x, 10, 26 + k * 58, w - 20, 48, 10, C.greyL); circ(x, 30, 50 + k * 58, 10, [C.coral, C.blue, C.mustard][k]); }); }, { s: ps, rot: .1 + (t > T.buzz ? Math.sin(t * 60) * .03 : 0) });
      if (t > T.buzz) [-1, 1].forEach(sd => { x.save(); x.globalAlpha = .5 + .5 * Math.sin(t * 30); strokeL(x, [[1600 + sd * 90, DY - 170], [1600 + sd * 110, DY - 120], [1600 + sd * 90, DY - 70]], 6, C.navy); x.restore(); });
      const k = T.counts.filter(c => t >= c).length - 1;
      if (k >= 0) { const s = popS(t, T.counts[k], .25); at(x, 1660, DY - 240, { s: s * (1 + k * .15) }, (x) => { circ(x, 0, 0, 38, C.coral); txt(x, ['3', '12', '27'][k], 0, 14, { size: 38, weight: 700, color: '#fff', align: 'center' }); }); }
    }
    // sticky notes slap onto the monitor
    [['update prices!', C.glow, 470, 760, -.06], ['call the cleaner', C.orangeL, 820, 770, .05], ['reply to Anna', C.greenL, 1100, 760, -.04], ['owner report??', C.coralL, 1480, 950, .06]].forEach(([s, col, px, py, r], i) => {
      const sc = popS(t, T.stick[i], .22); if (sc <= 0) return;
      at(x, px, py, { s: lerp(1.4, 1, Math.min(1, sc)), rot: r, a: clamp(sc * 3) }, (x) => { rr(x, -105, -70, 210, 140, 4, col); rr(x, -105, -70, 210, 22, 0, 'rgba(0,0,0,.08)'); txt(x, s, 0, 18, { size: 26, weight: 700, align: 'center' }); });
    });
  }
});

// 3 — Prices to update. Messages at midnight. Cleaners to chase. Owners waiting.
scene(3, 3, {
  bg: C.wall, wipe: 'bottom', cam: [1.0, 1.03, 960, 540],
  build() { this.T = { c: [hit('land', 14.21), hit('land', 16.81), hit('land', 18.81), hit('land', 20.35)], blink: hit('blink', 17.06), boing: hit('boing', 21.2) }; },
  draw(x, t) {
    const T = this.T, PW = 860, PH = 450, pos = [[490, 285], [1430, 285], [490, 795], [1430, 795]], from = [[-1, 0], [1, 0], [-1, 0], [1, 0]];
    pos.forEach(([cx, cy], i) => {
      const p = E.out(prog(t, T.c[i] - .3, .3)); if (t < T.c[i] - .3) return;
      const ox = from[i][0] * (1 - p) * 1200;
      at(x, cx + ox, cy, {}, (x) => {
        x.save(); x.globalAlpha *= .9; rr(x, -PW / 2 + 14, -PH / 2 + 14, PW, PH, 26, C.navy); x.restore();
        x.save(); rrPath(x, -PW / 2, -PH / 2, PW, PH, 26); x.clip();
        this.panel[i].call(this, x, t, T);
        x.restore();
      });
    });
  },
  panel: [
    function (x, t) { // three sites, three prices
      rr(x, -430, -225, 860, 450, 0, C.tealXL);
      [[C.airbnb, 'Airbnb', '€120'], [C.booking, 'Booking.com', '€135'], [C.vrbo, 'Vrbo', '€129']].forEach(([col, n, p], i) => {
        const cx = -270 + i * 270; rr(x, cx - 115, -170, 230, 250, 16, C.white); rr(x, cx - 115, -170, 230, 46, 16, col); rr(x, cx - 115, -140, 230, 16, 0, col);
        txt(x, n, cx, -137, { size: 22, weight: 700, color: '#fff', align: 'center' }); thumb(x, cx - 95, -110, 190, 100, { r: 8 });
        txt(x, p, cx, 50, { size: 44, weight: 700, align: 'center', color: i === 1 ? C.coral : C.ink });
      });
      txt(x, 'three sites, three prices', 0, 170, { size: 40, weight: 700, align: 'center', color: C.navy });
    },
    function (x, t, T) { // messages at midnight
      rr(x, -430, -225, 860, 450, 0, C.night);
      icon(x, 'moon', 340, -150, 70, C.glow, C.night);
      [[-330, -170], [-200, -120], [120, -190], [220, -110]].forEach(([sx, sy]) => icon(x, 'spark', sx, sy, 16, C.glow));
      const lit = t >= T.blink && t < T.blink + .25 ? 1 : 0;
      handPhone2(x, -200, 70, { s: .56, rot: -.06, skin: '#C98E6B', sleeve: C.navyL, scroll: prog(t, T.c[1] + 1.2, 1.2) }, (x, w, h) => {
        rr(x, 0, 0, w, h, 0, lit ? '#FFFFFF' : C.wallL); rr(x, 0, 0, w, 70, 0, C.purple); txt(x, 'Guests', 22, 46, { size: 30, weight: 700, color: '#fff' });
        [['Where is', 'the key??', 0], ['Wi-Fi', 'password?', .35], ['Check-in', 'at 2 am?', .7]].forEach(([a, b, d], k) => { const s = popS(t, T.c[1] - .1 + d, .25); if (s <= 0) return; at(x, 150, 150 + k * 130, { s }, (x) => { rr(x, -130, -50, 240, 100, 20, C.tealL); txt(x, a, -110, -8, { size: 30, weight: 700 }); txt(x, b, -110, 30, { size: 30, weight: 700 }); }); });
      });
      txt(x, '00:47', 170, 40, { size: 84, weight: 700, color: C.glow, align: 'center', font: F.mono });
      txt(x, 'at midnight…', 170, 150, { size: 38, weight: 700, color: C.glow, align: 'center' });
    },
    function (x, t) { // cleaners to chase
      rr(x, -430, -225, 860, 450, 0, C.tealXL);
      person(x, -250, 230, { who: 'cleaner', s: .72, dir: 1, walk: t * 7, armF: POSE.hold });
      icon(x, 'broom', -110, 150, 80, C.navyL);
      at(x, 170, -40, {}, (x) => {
        rr(x, -190, -130, 380, 210, 22, C.white);
        avatar(x, -120, -60, 40, C.tealD, 'M'); txt(x, 'Calling Marta…', -60, -66, { size: 28, weight: 700 }); txt(x, 'no answer', -60, -28, { size: 26, weight: 700, color: C.coral });
        circ(x, 0, 30, 32, C.coral); icon(x, 'phone', 0, 30, 34, '#fff', C.coral);
      });
      txt(x, 'is it clean yet?', 170, 170, { size: 38, weight: 700, align: 'center', color: C.navy });
    },
    function (x, t, T) { // owners waiting for their numbers
      rr(x, -430, -225, 860, 450, 0, C.cream);
      const bo = t > T.boing ? Math.sin((t - T.boing) * 18) * 14 * Math.max(0, 1 - (t - T.boing) * 1.5) : 0;
      person(x, -240, 300, { who: 'owner', s: .95, dir: 1, armF: POSE.hang, armB: POSE.hang, mood: 'worried', headTilt: .06 });
      at(x, 120, -120 + bo, {}, (x) => { rr(x, -200, -50, 400, 100, 30, C.white); poly(x, [[-150, 40], [-190, 80], [-110, 46]], C.white); txt(x, 'My statement?', 0, 14, { size: 36, weight: 700, align: 'center' }); });
      at(x, 140, 70, {}, (x) => { rr(x, -170, -70, 340, 150, 12, C.white); for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) rr(x, -158 + i * 80, -58 + j * 44, 74, 38, 4, j === 0 ? C.greenL : C.greyL); txt(x, '?', 120, 60, { size: 44, weight: 700, color: C.coral }); txt(x, '?', -40, 16, { size: 44, weight: 700, color: C.coral }); });
      txt(x, 'numbers, by Friday', 140, 195, { size: 36, weight: 700, align: 'center', color: C.navy });
    },
  ],
});

// 4 — One missed update means two guests at the same door.
scene(4, 4, {
  bg: C.sky, wipe: 'left', camAt(t) { const T = this.T, z = lerp(1.0, 1.06, E.sine(prog(t, this.start, this.end - this.start))), [sx, sy] = shake(t, T.stamp, 18, .4); return [z, 1080 + sx, 575 + sy]; },
  build() {
    const T = this.T = { s1: hit('land', 23.97), s2: hit('land', 24.5), steps: hitsIn('tap', 24.85, 26), open: hit('slide', 26.35), q: hit('pop', 26.4), e: hit('pop', 26.55), stamp: hit('stamp', 27.08), boing: hit('boing', 27.56) };
    this.b1 = bush(31, 520, 480, { n: 10 }); this.b2 = bush(37, 480, 460, { n: 10, fronds: .5 });
  },
  draw(x, t) {
    const T = this.T, open = E.inOut(prog(t, T.open, .35)), dx = 1180;
    const red = t >= T.stamp ? .9 : 0;
    street(x, t, { open, sky: red ? C.coralXL : C.sky });
    if (open > 0) person(x, dx + 105, 930, { who: 'host', s: .86, dir: -1, armF: POSE.up, armB: [2.6, .2], mood: 'wide', a: open });
    const t0 = T.steps[0], t1 = T.steps[T.steps.length - 1], moving = t < t1 + .1, ph = moving ? stepPhase(t, t0, .24) : null;
    const pa = prog(t, t0 - .2, t1 - t0 + .3), L = lerp(-260, 860, pa), R = lerp(2200, 1560, pa), there = t > t1;
    const mood = there ? 'wide' : 'smile';
    person(x, L - 140, 945, { who: 'beard', s: 1, walk: ph, hold: 'case', caseCol: C.mustard, mood });
    person(x, L, 948, { who: 'ginger', s: .96, walk: ph === null ? null : ph + 1.1, mood });
    person(x, R, 948, { who: 'blonde', s: .97, dir: -1, walk: ph === null ? null : ph + .5, mood, hold: 'case', caseCol: C.blue });
    person(x, R + 150, 945, { who: 'dad', s: 1.03, dir: -1, walk: ph === null ? null : ph + 1.7, mood });
    [[T.q, L - 70, '?'], [T.e, R + 75, '!']].forEach(([tt, px, ch], i) => { const s = popS(t, tt, .3); if (s > 0) at(x, px, 330, { s, rot: (i ? .15 : -.15) + sway(t, i, .06, 4) }, (x) => { circ(x, 0, 0, 56, C.coral); txt(x, ch, 0, 26, { size: 76, weight: 700, color: '#fff', align: 'center' }); }); });
    // the two confirmations, same dates
    [[T.s1, 420, 'Airbnb', C.airbnb, 'Anna + 1'], [T.s2, 1740, 'Booking.com', C.booking, 'The Meyer family']].forEach(([tt, px, ch, col, who], i) => {
      const ly = landY(t, tt, .25, -500); if (ly === null) return;
      at(x, px, 250 + ly, { rot: i ? .04 : -.04 }, (x) => {
        softCard(x, -220, -105, 440, 210, 18, C.white);
        rr(x, -220, -105, 440, 54, 18, col); rr(x, -220, -70, 440, 19, 0, col);
        txt(x, 'Booking · ' + ch, -196, -68, { size: 26, weight: 700, color: '#fff' });
        txt(x, 'Casa Marina', -196, -6, { size: 32, weight: 700 }); txt(x, who, -196, 30, { size: 24, color: C.mute });
        rr(x, -196, 50, 230, 44, 22, C.glow); txt(x, '14 – 17 Aug', -81, 81, { size: 26, weight: 700, align: 'center', color: C.ink });
        circ(x, 170, 70, 24, C.green); check(x, 170, 70, 26);
      });
    });
    drawBush(x, this.b1, 90, 1110, t, 3, { s: 1.1 }); drawBush(x, this.b2, 2030, 1110, t, 4, { s: 1.1 });
    if (t >= T.stamp - .1) {
      const p = prog(t, T.stamp - .1, .1), wob = t > T.boing ? Math.sin((t - T.boing) * 20) * .05 * Math.max(0, 1 - (t - T.boing) * 2) : 0;
      x.save(); x.globalAlpha = .18 * clamp(p * 2); rr(x, -200, -200, 2400, 1500, 0, C.coral); x.restore();
      pill(x, 'DOUBLE BOOKING', 1080, 560, { size: 92, s: lerp(2.4, 1, E.in(p)), a: clamp(p * 3), rot: -.06 + wob, bg: C.coral, sh: C.navy });
    }
  }
});

// 5 — There is a calmer way to run it.
scene(5, 5, {
  bg: C.teal, wipe: 'top', cam: [1.04, 1.0, 960, 540],
  build() {
    const T = this.T = { sweep: hit('whoosh', 30.34), land: hit('land', 31.01), spark: hit('sparkle', 31.11), lbl: hit('stamp', 31.32), sigh: hit('swoosh', 31.84) };
    const R = mulberry(9); this.junk = Array.from({ length: 14 }, (_, i) => ({ x: 150 + (i % 5) * 400 + R() * 80, y: 170 + Math.floor(i / 5) * 340 + R() * 90, r: (R() - .5) * .4, k: i % 4 }));
    this.sweeper = bush(77, 900, 1300, { n: 15, fronds: .5 }); this.plant = bush(3, 340, 420, { n: 9, fronds: .3 });
  },
  calm(x, t) {
    const T = this.T;
    rr(x, -100, -100, 2200, 1300, 0, C.teal);
    [0, 1, 2, 3].forEach(i => rr(x, 820 + i * 220, 90, 130, 330, 0, C.tealL));
    poly(x, [[-100, -100], [240, -100], [300, 1200], [-100, 1200]], C.navy);
    rr(x, -100, 930, 2200, 300, 0, C.tealD);
    // sofa, side table, plant
    rr(x, 700, 640, 860, 120, 40, C.orangeD); rr(x, 660, 720, 940, 150, 40, C.orange); rr(x, 640, 690, 90, 200, 36, C.orangeD); rr(x, 1530, 690, 90, 200, 36, C.orangeD);
    rr(x, 700, 870, 26, 60, 0, C.navyL); rr(x, 1530, 870, 26, 60, 0, C.navyL);
    rr(x, 330, 760, 260, 18, 4, C.navy); rr(x, 350, 776, 14, 160, 0, C.navy); rr(x, 556, 776, 14, 160, 0, C.navy);
    drawBush(x, this.plant, 460, 640, t, 1, { s: .9 }); poly(x, [[400, 640], [520, 640], [505, 760], [415, 760]], C.navy);
    const lean = E.inOut(prog(t, T.sigh, .8));
    person(x, 1120, 905, { who: 'host', s: 1.08, dir: -1, sit: true, lean: lerp(0, .08, lean), armF: POSE.phone, hold: 'phone', armB: [.4, .3], mood: t > T.sigh ? 'happy' : 'smile' });
    if (t >= T.spark) [[980, 300], [1440, 260], [1610, 470]].forEach(([sx, sy], i) => { const s = popS(t, T.spark + i * .08, .3) * (1 - prog(t, T.spark + .8 + i * .1, .5)); if (s > 0) icon(x, 'spark', sx, sy, 40 * s, '#FFFFFF'); });
  },
  draw(x, t) {
    const T = this.T, sp = prog(t, T.sweep - .1, T.land - T.sweep + .1), edge = lerp(-500, 2500, E.inOut(sp));
    // behind the sweep: the calm room; ahead of it: what the job had become
    x.save(); x.beginPath(); x.rect(-200, -200, edge + 200, 1600); x.clip(); this.calm(x, t); x.restore();
    x.save(); x.beginPath(); x.rect(edge, -200, 2600, 1600); x.clip();
    rr(x, -100, -100, 2200, 1300, 0, C.tealD);
    this.junk.forEach((j, i) => {
      const push = clamp((edge - j.x + 260) / 300);
      at(x, j.x + push * 600, j.y - push * 200, { rot: j.r + push * 1.5 * (i % 2 ? 1 : -1), a: 1 - push }, (x) => {
        softCard(x, -150, -95, 300, 190, 14, C.white);
        rr(x, -150, -95, 300, 44, 14, [C.airbnb, C.booking, C.green, C.purple][j.k]); rr(x, -150, -66, 300, 15, 0, [C.airbnb, C.booking, C.green, C.purple][j.k]);
        bars(x, -126, -20, [220, 170, 200], { gap: 30 }); circ(x, 120, -72, 12, C.coral);
      });
    });
    x.restore();
    if (sp > 0 && sp < 1) put(x, this.sweeper, edge - 80, 1300, { rot: .25 });
    if (t >= T.lbl - .1) { const p = prog(t, T.lbl - .1, .1); pill(x, 'A calmer way', 1120, 250, { size: 64, s: lerp(1.8, 1, E.in(p)), a: clamp(p * 3), rot: -.03, bg: C.navy, sh: C.tealD }); }
  }
});

// 6 — Rental Ninja. One place for your listings, bookings, guests, team and money.
scene(6, 6, {
  bg: C.navy, wipe: 'right', noMark: true, cam: [1.0, 1.03, 960, 560],
  build() {
    const T = this.T = { taps: hitsIn('tap', 33.9, 34.8), thud: hit('thud', 34.06), slide: hit('slide', 35.31), land: hit('land', 35.73), lbl: hit('stamp', 35.79), b: [hit('pop', 36.45), hit('pop', 37.53), hit('pop', 38.65), hit('pop', 39.81), hit('pop', 41.41)], done: hit('sparkle', 41.66) };
    this.b1 = bush(41, 560, 620, { n: 12, col: C.navyD }); this.b2 = bush(43, 520, 580, { n: 11, col: C.navyD, fronds: .6 });
  },
  draw(x, t) {
    const T = this.T;
    const np = prog(t, T.thud - .3, .3);
    const bw = [...'RentalNinja'].reduce((a, c) => a + textW(c, 118, 500, F.brand), 0) + 14;
    if (t > T.thud - .3) ninja(x, 1060 - bw / 2 - 100, lerp(-200, 190, E.out(np)) + (t > T.thud ? Math.sin((t - T.thud) * 22) * 10 * Math.max(0, 1 - (t - T.thud) * 3) : 0), 78, { t, eyes: 'happy' });
    brand(x, 1060, 190, 118, t, T.taps);
    // the hub: a wall tablet, the reference's welcome screen
    const sp = E.back(prog(t, T.slide, T.land - T.slide + .05)), dy = lerp(900, 0, sp);
    if (t >= T.slide) at(x, 960, 660 + dy, {}, (x) => {
      x.save(); x.globalAlpha *= .9; rr(x, -640 + 22, -270 + 22, 1280, 540, 46, C.navyD); x.restore();
      rr(x, -640, -270, 1280, 540, 46, C.greyL); rr(x, -600, -232, 1200, 464, 26, C.navy); rr(x, -580, -212, 1160, 424, 16, C.teal);
      txt(x, 'Welcome!', 0, -132, { size: 52, weight: 700, color: '#fff', align: 'center' });
      const xs = i => (i - 2) * 220;
      [['house', 'Listings'], ['calendar', 'Bookings'], ['person', 'Guests'], ['team', 'Team'], ['coin', 'Money']].forEach(([k, n], i) => {
        const s = popS(t, T.b[i], .32); if (s <= 0) return;
        const lift = t > T.done ? Math.sin(prog(t, T.done, .5) * Math.PI) * -16 : 0;
        at(x, xs(i), 10 + lift, { s }, (x) => { circ(x, 0, 0, 74, '#fff'); circ(x, 0, 0, 62, C.tealD); icon(x, k, 0, 0, 62, '#fff', C.tealD); });
        txt(x, n, xs(i), 136, { size: 34, weight: 700, color: '#fff', align: 'center', a: clamp((t - T.b[i]) * 6) });
      });
    });
    if (t >= T.lbl - .1) { const p = prog(t, T.lbl - .1, .1); pill(x, 'One place', 330, 420, { size: 54, s: lerp(1.8, 1, E.in(p)), a: clamp(p * 3), rot: -.05, bg: C.coral, sh: C.navyD }); }
    drawBush(x, this.b1, 60, 1150, t, 1, { s: 1 }); drawBush(x, this.b2, 1880, 1150, t, 2, { s: 1 });
  }
});

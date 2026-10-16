// Act 3, first half: channels, the shared calendar, the inbox, automations, smart pricing, online check-in.
const CHN = [['Airbnb', C.airbnb], ['Booking.com', C.booking], ['Vrbo', C.vrbo]];
// a room with the reference's teal wall, high window strips and a navy wall edge
function room(x, o = {}) {
  rr(x, -200, -200, 2400, 1500, 0, o.wall || C.teal);
  (o.win || [0, 1, 2, 3]).forEach(i => rr(x, (o.wx ?? 760) + i * 220, 70, 130, 320, 0, o.winCol || C.tealL));
  if (o.edge !== false) poly(x, [[-200, -200], [o.ex ?? 120, -200], [(o.ex ?? 120) + 60, 1300], [-200, 1300]], C.navy);
  if (o.floor !== false) rr(x, -200, o.fy ?? 960, 2400, 400, 0, o.floorCol || C.tealD);
}
function stampPill(x, s, px, py, t, t0, o = {}) {
  if (t < t0 - .1) return; const p = prog(t, t0 - .1, .1);
  pill(x, s, px, py, { size: o.size ?? 52, s: lerp(1.8, 1, E.in(p)), a: clamp(p * 3), rot: o.rot ?? -.04, bg: o.bg || C.coral, fg: o.fg, sh: o.sh || C.navy });
}
function chanCard(x, i, w = 440, h = 160) {
  const [n, col] = CHN[i];
  softCard(x, -w / 2, -h / 2, w, h, 18, C.white);
  rr(x, -w / 2, -h / 2, w, 52, 18, col); rr(x, -w / 2, -h / 2 + 34, w, 18, 0, col);
  txt(x, n, -w / 2 + 22, -h / 2 + 37, { size: 28, weight: 700, color: '#fff' });
  thumb(x, -w / 2 + 18, -h / 2 + 66, 110, 80, { r: 8 });
  txt(x, 'Casa Marina', -w / 2 + 146, -h / 2 + 100, { size: 28, weight: 700 }); txt(x, '€180 / night', -w / 2 + 146, -h / 2 + 134, { size: 22, color: C.mute });
}

// 7 — Create a listing once, publish it to Airbnb, Booking.com, Vrbo and 50+ channels.
scene(7, 7, {
  bg: C.teal, wipe: 'bottom', cam: [1.0, 1.04, 960, 540],
  build() {
    this.T = { photo: w(7, 'create') - .05, text: w(7, 'listing') - .05, price: w(7, 'once') - .12, lbl: w(7, 'once') + .3, btn: w(7, 'publish') - .5, press: w(7, 'publish') + .12, ch: [w(7, 'airbnb') - .1, w(7, 'booking') - .1, w(7, 'verbo') - .1], more: w(7, 'more') - .05, fifty: w(7, '50') + .02 };
    this.ys = [190, 400, 610]; this.plant = bush(13, 300, 380, { n: 9 });
  },
  draw(x, t) {
    const T = this.T;
    room(x, { wx: 1060, win: [0, 1, 2], fy: 900 });
    rr(x, 150, 880, 1000, 30, 8, C.navy); rr(x, 200, 905, 30, 200, 0, C.navy); rr(x, 1070, 905, 30, 200, 0, C.navy);
    drawBush(x, this.plant, 1050, 880, t, 2, { s: .7 }); poly(x, [[990, 790], [1110, 790], [1095, 880], [1005, 880]], C.mustard);
    laptop(x, 600, 870, 780, 500, (x, w, h) => {
      rr(x, 0, 0, w, h, 0, C.white); appBar(x, w, 'New listing', C.navyL);
      if (t >= T.photo) at(x, 190, 190, { s: popS(t, T.photo, .3) }, (x) => thumb(x, -160, -100, 320, 200, { r: 12, hs: .32 }));
      if (t >= T.text) { const a = clamp((t - T.text) * 5); x.globalAlpha = a; txt(x, 'Casa Marina', 380, 130, { size: 38, weight: 700 }); txt(x, 'Sleeps 4 · 2 bedrooms', 380, 172, { size: 22, color: C.mute }); ['Wi-Fi', 'Pool', 'Sea view'].forEach((c, i) => { rr(x, 380 + i * 104, 196, 96, 34, 17, C.tealXL); txt(x, c, 428 + i * 104, 220, { size: 18, weight: 700, color: C.tealD, align: 'center' }); }); x.globalAlpha = 1; }
      if (t >= T.price) at(x, 380, 280, { s: popS(t, T.price, .3) }, (x) => { txt(x, '€180', 0, 22, { size: 44, weight: 700 }); txt(x, '/ night', 116, 20, { size: 22, color: C.mute }); });
      if (t >= T.btn) { const live = t >= T.press, ps = popS(t, T.btn, .3) * (t >= T.press && t < T.press + .12 ? .92 : 1); at(x, w / 2, h - 60, { s: ps }, (x) => { rr(x, -110, -32, 220, 64, 32, live ? C.green : C.coral); if (live) check(x, -56, 0, 24); txt(x, live ? 'Live' : 'Publish', live ? 16 : 0, 10, { size: 28, weight: 700, color: '#fff', align: 'center' }); }); }
    });
    stampPill(x, 'Create it once', 560, 250, t, T.lbl, { size: 54 });
    // the same listing lands on each channel
    T.ch.forEach((c, i) => {
      if (t < c - .32) return;
      const p = E.out(prog(t, c - .32, .32)), sx = lerp(820, 1480, p), sy = lerp(700, this.ys[i], p);
      at(x, sx, sy, { s: lerp(.3, 1, p), rot: lerp(.3, i % 2 ? .02 : -.02, p) }, (x) => { chanCard(x, i); if (t >= c + .28) at(x, 170, -50, { s: popS(t, c + .28, .3) }, (x) => { rr(x, -54, -22, 108, 44, 22, C.green); txt(x, 'Live', 0, 9, { size: 24, weight: 700, color: '#fff', align: 'center' }); }); });
    });
    const small = ['Expedia', 'Google', 'Agoda', 'Holidu', 'Trip.com', 'HomeToGo', 'Despegar', 'Whimstay', 'Hopper'], cols = [C.mustard, C.blue, C.coral, C.orange, C.booking, C.green, C.purple, C.pink, C.navyL];
    small.forEach((n, i) => { const s = popS(t, T.more + i * .075, .28); if (s > 0) pill(x, n, 1260 + (i % 3) * 230, 730 + Math.floor(i / 3) * 66, { size: 24, s, bg: C.white, fg: cols[i], sh: C.tealD }); });
    stampPill(x, '50+ channels', 1490, 960, t, T.fifty, { size: 70, bg: C.booking, rot: -.05 });
  }
});

// 8 — Rates and availability sync in real time; every calendar agrees, double bookings stay in the past.
scene(8, 8, {
  bg: C.wallL, wipe: 'left', cam: [1.0, 1.03, 960, 540],
  build() {
    this.T = { rate: w(8, 'rates') + .05, avail: w(8, 'availability') + .2, sync: w(8, 'sink'), rt: w(8, 'real') - .02, agree: w(8, 'agrees') - .2, stamp: w(8, 'double') - .05, strike: w(8, 'stay') - .05, gone: w(8, 'past') - .05 };
    this.my = [250, 530, 810];
    this.rows = ['Casa Marina', 'Villa Sol', 'Loft Centro', 'Casa Azul'];
    this.bk = [[0, 2, 5, C.airbnb, 'Anna'], [1, 1, 4, C.booking, 'Meyer'], [1, 8, 13, C.vrbo, 'Rossi'], [2, 4, 9, C.airbnb, 'Dubois'], [3, 6, 8, C.booking, 'Kim'], [3, 11, 14, C.airbnb, 'Silva']];
  },
  draw(x, t) {
    const T = this.T, BX = 80, BY = 250, DW = 58, RH = 120, X0 = BX + 250;
    rr(x, -200, -200, 2400, 1500, 0, C.wallL);
    poly(x, [[1250, -200], [2200, -200], [2200, 1300], [1300, 1300]], C.teal);
    // the board
    softCard(x, BX, BY - 120, 1110, 640, 26, C.white, { sa: .12 });
    txt(x, 'Calendar', BX + 30, BY - 60, { size: 38, weight: 700 }); txt(x, 'August', BX + 210, BY - 60, { size: 28, color: C.mute });
    for (let d = 0; d < 14; d++) txt(x, String(d + 1), X0 + d * DW + DW / 2, BY - 8, { size: 22, weight: 700, color: d % 7 >= 5 ? C.coral : C.mute, align: 'center' });
    this.rows.forEach((n, r) => {
      const y = BY + 14 + r * RH; thumb(x, BX + 24, y + 18, 84, 70, { r: 8, roof: [C.coral, C.mustard, C.blue, C.green][r] }); txt(x, n.split(' ')[0], BX + 122, y + 48, { size: 24, weight: 700 }); txt(x, n.split(' ')[1], BX + 122, y + 78, { size: 24, weight: 700 });
      for (let d = 0; d < 14; d++) rr(x, X0 + d * DW + 3, y + 14, DW - 6, RH - 28, 8, d % 7 >= 5 ? C.cream : C.greyL);
    });
    const bar = (row, d0, d1, col, name, k = 1) => at(x, X0 + (d0 - 1) * DW + 3, BY + 14 + row * RH + 26, { s: k }, (x) => { rr(x, 0, 0, (d1 - d0) * DW - 6, 66, 33, col); txt(x, name, 22, 43, { size: 24, weight: 700, color: '#fff' }); });
    this.bk.forEach(b => bar(...b));
    // a new booking drops in and every channel blocks the same nights
    const ly = landY(t, T.avail, .3, -400);
    if (ly !== null) at(x, 0, ly, {}, (x) => bar(0, 9, 12, C.booking, 'Lopez'));
    [0, 1, 2].forEach(i => {
      const y = this.my[i], fl = t >= T.rate + .3 + i * .12 ? 1 : 0;
      at(x, 1600, y, {}, (x) => {
        softCard(x, -230, -110, 460, 220, 20, C.white);
        rr(x, -230, -110, 460, 54, 20, CHN[i][1]); rr(x, -230, -74, 460, 18, 0, CHN[i][1]);
        txt(x, CHN[i][0], -206, -72, { size: 26, weight: 700, color: '#fff' });
        txt(x, fl ? '€195' : '€180', 200, -72, { size: 26, weight: 700, color: '#fff', align: 'right' });
        for (let d = 0; d < 14; d++) { const blocked = (d >= 1 && d < 4) || (t >= T.sync + .15 + i * .13 && d >= 8 && d < 11); rr(x, -206 + d * 30, -20, 24, 70, 6, blocked ? C.grey : C.greenL); }
        if (t >= T.agree + i * .12) at(x, 196, 80, { s: popS(t, T.agree + i * .12, .3) }, (x) => { circ(x, 0, 0, 26, C.green); check(x, 0, 0, 26); });
      });
      // a pulse travels from the board to each channel
      const pp = prog(t, T.sync - .2 + i * .13, .35);
      if (pp > 0 && pp < 1) { const px = lerp(1190, 1370, E.inOut(pp)), py = lerp(400, y, E.inOut(pp)); circ(x, px, py, 30, C.mustard); icon(x, 'bolt', px, py, 36, '#fff'); }
    });
    stampPill(x, 'in real time', 640, 1000, t, T.rt, { bg: C.green, size: 50 });
    // the double booking, crossed out and blown away
    if (t >= T.stamp) {
      const g = prog(t, T.gone, .5), sp = popS(t, T.stamp, .3);
      at(x, lerp(760, 2400, E.in(g)), lerp(470, 200, E.in(g)), { rot: -.05 + g * 1.2, a: 1 - g }, (x) => {
        pill(x, 'DOUBLE BOOKING', 0, 0, { size: 60, s: sp, bg: C.coral, sh: C.navy });
        const k = prog(t, T.strike, .3); if (k > 0) strokeL(x, [[-320, 8], [lerp(-320, 320, k), -12]], 14, C.navy);
      });
    }
  }
});

// 9 — Every guest message lands in one inbox. AI drafts the reply. You just press send.
scene(9, 9, {
  bg: C.teal, wipe: 'top', cam: [1.0, 1.02, 960, 540],
  build() {
    const T = this.T = { rows: w(9, 'message') - .12, lbl: w(9, 'one') - .02, open: w(9, 'inbox') - .05, draft: w(9, 'ai') - .22, type: w(9, 'drafts') - .08, btn: w(9, 'you') - .12, hand: w(9, 'press') - .2, press: w(9, 'send') - .02 };
    T.type2 = T.type + .68; T.sent = T.press + .2;
    this.rows = [['Anna', 'Airbnb', C.airbnb, C.mustard], ['Marc', 'Booking.com', C.booking, C.coral], ['Yuki', 'Vrbo', C.vrbo, C.purple], ['Lena', 'Website', C.green, C.blue]];
  },
  draw(x, t) {
    const T = this.T;
    rr(x, -200, -200, 2400, 1500, 0, C.teal);
    rr(x, 1220, -200, 1000, 1500, 0, C.white);
    poly(x, [[1180, -200], [1260, -200], [1300, 1300], [1220, 1300]], C.navy);
    // the channels' envelopes fly into one inbox
    this.rows.forEach(([n, ch, col], i) => {
      const t0 = T.rows + i * .17 - .1, p = prog(t, t0, .3); if (t < t0 || p >= 1) return;
      const px = lerp(260, 960, E.in(p)), py = lerp(220 + i * 190, 500, E.in(p));
      at(x, px, py, { s: lerp(1, .5, p) }, (x) => { rr(x, -70, -46, 140, 92, 12, col); strokeL(x, [[-62, -38], [0, 8], [62, -38]], 8, 'rgba(255,255,255,.8)'); });
    });
    [['Airbnb', C.airbnb], ['Booking.com', C.booking], ['Vrbo', C.vrbo], ['Website', C.green]].forEach(([n, col], i) => pill(x, n, 220, 230 + i * 190, { size: 30, bg: col, sh: C.tealD, a: clamp((t - this.start) * 3) }));
    stampPill(x, 'One inbox', 1600, 160, t, T.lbl + .1, { bg: C.purple, size: 56 });
    handPhone2(x, 960, 560, { s: 1.14, rot: -.03, skin: '#F2C6A0', sleeve: C.pink, ...thumbTrack(t, [[T.open, [150, 136]], [T.press, [150, 520]]]) }, (x, w, h) => {
      rr(x, 0, 0, w, h, 0, C.white); rr(x, 0, 0, w, 70, 0, C.purple); txt(x, t < T.open ? 'Inbox' : '‹  Anna', 22, 50, { size: 26, weight: 700, color: '#fff' });
      if (t < T.open) {
        this.rows.forEach(([n, ch, col, av], i) => {
          const s = t >= T.rows + i * .17 + .2 ? 1 : 0; if (!s) return;
          const y = 90 + i * 104; rr(x, 10, y, w - 20, 92, 14, i === 0 ? C.purpleXL : C.white);
          avatar(x, 52, y + 46, 28, av, n[0]); txt(x, n, 92, y + 38, { size: 22, weight: 700 }); rr(x, 92, y + 52, 110, 24, 12, col); txt(x, ch, 147, y + 70, { size: 14, weight: 700, color: '#fff', align: 'center' }); circ(x, w - 34, y + 46, 9, C.coral);
        });
      } else {
        at(x, 0, 0, { a: clamp((t - T.open) * 5) }, (x) => {
          rr(x, 14, 96, 236, 92, 18, C.white); txt(x, 'Hi! What time', 32, 134, { size: 20, weight: 600 }); txt(x, 'can we check in?', 32, 164, { size: 20, weight: 600 });
          if (t >= T.draft) {
            const ds = popS(t, T.draft, .3); at(x, w / 2, 330, { s: ds }, (x) => {
              rr(x, -136, -110, 272, 220, 18, C.purpleXL); x.save(); x.setLineDash([4, 10]); x.lineWidth = 4; x.strokeStyle = C.purple; x.beginPath(); x.roundRect(-128, -102, 256, 204, 14); x.stroke(); x.restore();
              rr(x, -118, -94, 150, 34, 17, C.purple); icon(x, 'spark', -100, -77, 18, '#fff'); txt(x, 'AI draft', -84, -70, { size: 18, weight: 700, color: '#fff' });
              const l1 = 'Hi Anna! Check-in is', l2 = 'from 3 pm. Your door', l3 = 'code comes Friday.';
              const n1 = Math.floor(clamp((t - T.type) / .6) * 41), n2 = Math.floor(clamp((t - T.type2) / .75) * 18);
              txt(x, (l1 + ' ' + l2).slice(0, n1).slice(0, l1.length), -118, -20, { size: 19, weight: 600 }); if (n1 > l1.length) txt(x, (l1 + ' ' + l2).slice(l1.length + 1, n1), -118, 10, { size: 19, weight: 600 });
              if (n2 > 0) txt(x, l3.slice(0, n2), -118, 40, { size: 19, weight: 600 });
            });
          }
          if (t >= T.btn) { const sent = t >= T.sent, ps = popS(t, T.btn, .3) * (t >= T.press && t < T.press + .1 ? .9 : 1); at(x, w / 2, 520, { s: ps }, (x) => { rr(x, -90, -32, 180, 64, 32, sent ? C.green : C.coral); if (sent) check(x, -42, 0, 22); txt(x, sent ? 'Sent' : 'Send', sent ? 14 : 0, 10, { size: 26, weight: 700, color: '#fff', align: 'center' }); }); }
        });
      }
    });
    // a ripple where the thumb presses send
    if (t >= T.press && t < T.press + .5) { const p = prog(t, T.press, .5); x.save(); x.globalAlpha = 1 - p; x.lineWidth = 8; x.strokeStyle = C.coral; x.beginPath(); x.arc(960 + (150 - 150) * 1.14, 560 + (-310 + 520) * 1.14, 40 + p * 90, 0, 7); x.stroke(); x.restore(); }
    stampPill(x, 'AI drafts the reply', 1640, 520, t, T.draft + .1, { bg: C.purple, size: 40, rot: .03 });
    if (t >= T.sent) { const p = E.out(prog(t, T.sent - .05, .5)); icon(x, 'plane', lerp(1080, 1700, p), lerp(800, 300, p), 70, C.purple); }
  }
});

// 10 — Automations: confirmation, directions, review request, each at the right moment.
scene(10, 10, {
  bg: C.wallL, wipe: 'right', cam: [1.02, 1.0, 960, 540],
  build() {
    this.T = { title: this.start + .25, m: [w(10, 'confirmation') - .1, w(10, 'directions') - .1, w(10, 'review') - .1], send: w(10, 'sent') - .1, moment: w(10, 'right') - .1 };
    this.xs = [250, 752, 1010, 1264, 1630]; this.b1 = bush(55, 420, 420, { n: 10 }); this.b2 = bush(57, 380, 400, { n: 9, fronds: .6 });
  },
  draw(x, t) {
    const T = this.T, TY = 560, GY = 900, xs = this.xs;
    rr(x, -200, -200, 2400, 1500, 0, C.wallL); rr(x, -200, GY, 2400, 400, 0, C.navy);
    stampPill(x, 'Automations', 960, 120, t, T.title, { bg: C.orange, size: 64 });
    // the stay as a road, with five moments on it
    const reveal = prog(t, this.start, .6);
    rr(x, 160, TY - 7, lerp(0, 1560, E.out(reveal)), 14, 7, C.grey);
    [['calendar', 'Booked', C.blue], ['clock', '2 days before', C.mustard], ['key', 'Check-in', C.green], ['house', 'Check-out', C.tealD], ['star', 'After the stay', C.purple]].forEach(([k, n, col], i) => {
      badge(x, k, xs[i], TY, 44, col, { s: popS(t, this.start + .1 + i * .08, .3) });
      txt(x, n, xs[i], TY + 92, { size: 26, weight: 700, align: 'center', a: clamp((t - this.start - .3) * 4) });
    });
    // the guest travels along the stay
    const gx = t < T.m[1] ? lerp(xs[0], xs[1], E.inOut(prog(t, T.m[0] - .6, T.m[1] - T.m[0]))) : lerp(xs[1], xs[4], E.inOut(prog(t, T.m[1] + .2, T.m[2] - T.m[1] - .2)));
    const moving = (t > T.m[0] - .6 && t < T.m[1]) || (t > T.m[1] + .2 && t < T.m[2]);
    person(x, gx, GY, { who: 'ginger', s: .42, walk: moving ? t * 9 : null, hold: 'case', caseCol: C.mustard });
    // messages appear at the moments they are sent
    [['Booking confirmed', 'the moment they book', 'envelope', C.blue, 0], ['How to get here', 'sent 2 days before', 'pin', C.mustard, 1], ['How was your stay?', 'after check-out', 'star', C.purple, 4]].forEach(([a, b, k, col, node], i) => {
      const s = popS(t, T.m[i], .35); if (s <= 0) return;
      const fly = prog(t, T.send + i * .12, .4);
      at(x, xs[node] + fly * 300, TY - 190 - fly * 500, { s, a: 1 - fly }, (x) => {
        softCard(x, -200, -70, 400, 140, 20, C.white); poly(x, [[-20, 70], [0, 96], [20, 70]], C.white);
        badge(x, k, -140, 0, 38, col); txt(x, a, -88, -6, { size: 26, weight: 700 }); txt(x, b, -88, 28, { size: 20, color: C.mute });
        if (t >= T.m[i] + .1) { circ(x, 180, -60, 20, C.green); check(x, 180, -60, 20); }
      });
    });
    ['Payment reminder', 'Welcome message', 'Check-out instructions', 'Team alert'].forEach((n, i) => { const s = popS(t, T.send + .25 + i * .12, .3); if (s > 0) pill(x, n, [330, 760, 1220, 1640][i], 1000, { size: 26, s, bg: C.white, fg: [C.blue, C.green, C.tealD, C.orange][i], sh: C.navyD }); });
    stampPill(x, 'at just the right moment', 960, 228, t, T.moment, { bg: C.navy, sh: C.grey, size: 44 });
    drawBush(x, this.b1, -20, 1000, t, 1, { s: .9 }); drawBush(x, this.b2, 1960, 1000, t, 2, { s: .9 });
  }
});

// 11 — Smart pricing follows demand: up on busy nights, filling the quiet ones.
scene(11, 11, {
  bg: C.teal, wipe: 'bottom', cam: [1.0, 1.03, 960, 540],
  build() {
    this.T = { chip: w(11, 'smart') - .1, dem: w(11, 'follows') - .05, up: w(11, 'raising') - .05, down: w(11, 'filling') - .25, fill: w(11, 'quiet') - .05 };
    this.lvl = [.38, .2, .24, .46, .86, 1, .62, .4, .18, .22, .5, .9, 1, .66]; this.busy = [4, 5, 11, 12]; this.quiet = [1, 2, 8, 9];
    this.b1 = bush(61, 460, 520, { n: 11 });
  },
  draw(x, t) {
    const T = this.T, CX = 140, CY = 210, CW = 150, CH = 260;
    room(x, { win: [], fy: 1000 });
    softCard(x, CX - 30, CY - 120, 7 * CW + 60, 2 * (CH + 30) + 150, 26, C.white, { sa: .2 });
    txt(x, 'Casa Marina · rates', CX, CY - 50, { size: 36, weight: 700 });
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((d, i) => txt(x, d, CX + i * CW + CW / 2, CY + 4, { size: 22, weight: 700, color: i === 4 || i === 5 ? C.coral : C.mute, align: 'center' }));
    const dp = E.out(prog(t, T.dem, .6));
    for (let k = 0; k < 14; k++) {
      const cx = CX + (k % 7) * CW, cy = CY + 20 + Math.floor(k / 7) * (CH + 30);
      rr(x, cx + 6, cy, CW - 12, CH, 14, C.greyL);
      const bh = (CH - 20) * this.lvl[k] * dp; rr(x, cx + 6, cy + CH - bh, CW - 12, bh, 14, C.purpleL);
      txt(x, String(k + 4), cx + 22, cy + 36, { size: 22, weight: 700, color: C.mute });
      const bi = this.busy.indexOf(k), qi = this.quiet.indexOf(k);
      let price = '€180', col = C.white, fg = C.ink;
      if (bi >= 0 && t >= T.up + bi * .13) { price = ['€235', '€250'][bi % 2]; col = C.green; fg = '#fff'; }
      if (qi >= 0 && t >= T.down + qi * .1) { price = ['€155', '€149'][qi % 2]; col = C.blue; fg = '#fff'; }
      const flip = bi >= 0 ? Math.abs(Math.cos(clamp((t - T.up - bi * .13) / .2) * Math.PI)) : qi >= 0 ? Math.abs(Math.cos(clamp((t - T.down - qi * .1) / .2) * Math.PI)) : 1;
      at(x, cx + CW / 2, cy + CH / 2 + 30, { sy: flip }, (x) => { rr(x, -58, -30, 116, 60, 14, col); txt(x, price, 0, 12, { size: 30, weight: 700, color: fg, align: 'center' }); });
      if (qi >= 0 && t >= T.fill + qi * .13) at(x, cx + CW / 2, cy + CH - 36, { s: popS(t, T.fill + qi * .13, .25) }, (x) => { rr(x, -58, -22, 116, 44, 22, C.navy); txt(x, 'Booked', 0, 8, { size: 20, weight: 700, color: '#fff', align: 'center' }); });
      if (bi >= 0 && t >= T.up + bi * .13 + .12) at(x, cx + CW - 26, cy + 34, { s: popS(t, T.up + bi * .13 + .12, .25) }, (x) => { circ(x, 0, 0, 18, C.green); poly(x, [[0, -10], [10, 4], [-10, 4]], '#fff'); });
    }
    if (t >= T.chip) at(x, 1460, CY - 52, { s: popS(t, T.chip, .3) }, (x) => { rr(x, -170, -36, 340, 72, 36, C.purple); icon(x, 'spark', -126, 0, 30, '#fff'); txt(x, 'Smart pricing', 10, 11, { size: 32, weight: 700, color: '#fff', align: 'center' }); });
    // revenue card climbs
    const rv = t >= T.fill + .7;
    at(x, 1640, 640, { s: popS(t, T.fill + .7, .35) || (t > this.start ? .001 : 0) }, (x) => {
      softCard(x, -170, -150, 340, 300, 24, C.white); txt(x, 'Revenue', -140, -96, { size: 30, weight: 700 }); txt(x, '+18%', -140, -20, { size: 64, weight: 700, color: C.green });
      [.4, .55, .5, .75, .95].forEach((v, i) => rr(x, -140 + i * 58, 120 - 140 * v, 44, 140 * v, 8, i === 4 ? C.green : C.tealXL));
    });
    drawBush(x, this.b1, 1860, 1100, t, 4, { s: .9 });
  }
});

// 12 — Before they arrive, guests check in online: scan their ID, pay the balance, leave a deposit.
scene(12, 12, {
  bg: C.teal, wipe: 'left', cam: [1.0, 1.03, 960, 560],
  build() {
    this.T = { phone: w(12, 'guests') - .5, lbl: w(12, 'online') - .02, s: [w(12, 'scan') - .08, w(12, 'pay') - .12, w(12, 'leave') - .12], k: [w(12, 'id') + .4, w(12, 'balance') + .35, w(12, 'deposit') + .3], done: w(12, 'deposit') + .62 };
    this.plant = bush(71, 300, 380, { n: 9, fronds: .3 });
  },
  draw(x, t) {
    const T = this.T;
    room(x, { wx: 300, win: [0, 1, 2], fy: 930, ex: 1860, edge: false });
    poly(x, [[1820, -200], [2200, -200], [2200, 1300], [1760, 1300]], C.navy);
    rr(x, 120, 600, 760, 110, 40, C.orangeD); rr(x, 90, 680, 820, 140, 40, C.orange); rr(x, 70, 650, 90, 190, 36, C.orangeD); rr(x, 840, 650, 90, 190, 36, C.orangeD);
    rr(x, 140, 830, 24, 100, 0, C.navyL); rr(x, 850, 830, 24, 100, 0, C.navyL);
    drawBush(x, this.plant, 1060, 760, t, 1, { s: .85 }); poly(x, [[1000, 760], [1120, 760], [1104, 930], [1016, 930]], C.navy);
    person(x, 560, 885, { who: 'blonde', s: 1.05, dir: 1, sit: true, armF: POSE.phone, hold: 'phone', armB: [.3, .4], mood: t >= T.done ? 'happy' : 'smile' });
    // the check-in on her phone, big
    const pp = E.back(prog(t, T.phone, .4));
    if (t >= T.phone) phone(x, 1420, lerp(1500, 560, pp), 420, 820, (x, w, h) => {
      rr(x, 0, 0, w, h, 0, C.white); rr(x, 0, 0, w, 84, 0, C.tealD); txt(x, 'Online check-in', 26, 56, { size: 28, weight: 700, color: '#fff' });
      [['id', 'Scan your ID'], ['card', 'Pay the balance'], ['shield', 'Leave a deposit']].forEach(([k, n], i) => {
        if (t < T.s[i] - .2) return; const p = E.out(prog(t, T.s[i] - .2, .25)), y = 120 + i * 190;
        at(x, w / 2 + (1 - p) * 300, y + 80, { a: p }, (x) => {
          rr(x, -170, -80, 340, 160, 18, C.white); badge(x, k, -110, -14, 40, [C.blue, C.mustard, C.purple][i]);
          txt(x, n, -54, -6, { size: 23, weight: 700 }); txt(x, ['passport.jpg', '€420', '€300 hold'][i], -54, 26, { size: 20, color: C.mute });
          if (i === 0 && t > T.s[0] && t < T.k[0]) { const sy = ((t - T.s[0]) * 220) % 120 - 60; rr(x, -150, sy, 300, 5, 2, C.teal); }
          if (t >= T.k[i]) at(x, 130, -40, { s: popS(t, T.k[i], .3) }, (x) => { circ(x, 0, 0, 24, C.green); check(x, 0, 0, 24); });
        });
      });
      if (t >= T.done) at(x, w / 2, h - 70, { s: popS(t, T.done, .35) }, (x) => { rr(x, -150, -36, 300, 72, 36, C.green); txt(x, 'All set!', 0, 12, { size: 32, weight: 700, color: '#fff', align: 'center' }); });
    }, { rot: .02 });
    stampPill(x, 'Check in online', 560, 300, t, T.lbl + .1, { bg: C.navy, sh: C.tealD, size: 56 });
  }
});

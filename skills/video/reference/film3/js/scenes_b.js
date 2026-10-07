// Act 3, first half — channels, one calendar, one inbox, automations, smart pricing.

// 7 — Create a listing once, publish it to Airbnb, Booking.com, Vrbo and 50+ channels.
scene(7, 7, {
  bg: '#F3D6C8', seed: 15, wipe: 'bottom', cam: [1.0, 1.035, 960, 560],
  build() {
    const T = this.T = {
      card: this.start - 1, photo: w(7, 'create') - .05, text: w(7, 'listing') - .05, price: w(7, 'once') - .12, lbl: w(7, 'once') + .2, btn: w(7, 'publish') - .5, press: w(7, 'publish') + .12,
      ch: [w(7, 'airbnb') - .1, w(7, 'booking') - .1, w(7, 'verbo') - .1], more: w(7, 'more') - .05, fifty: w(7, '50') - .1,
    };
    this.ys = [270, 490, 710];
    cue(T.photo, 'tap', { g: .7, pan: -.5 }); cue(T.text, 'tap', { g: .6, p: 1.1, pan: -.5 }); cue(T.price, 'tap', { g: .6, p: 1.2, pan: -.5 }); cue(T.lbl + .1, 'stamp', { g: .5, pan: -.5 });
    cue(T.btn, 'pop', { g: .6, pan: -.4 }); cue(T.press, 'button', { g: .7, pan: -.4 }); cue(T.press + .05, 'sparkle', { g: .4, pan: -.3 });
    T.ch.forEach((c, i) => { cue(c - .32, 'swoosh', { g: .4, p: 1.1 + i * .1, pan: .1 }); cue(c, 'land', { g: .8, p: 1 + i * .06, pan: .4 }); cue(c + .28, 'tick', { g: .5, p: 1 + i * .1, pan: .5 }); });
    for (let i = 0; i < 9; i++) cue(T.more + i * .075, 'sticker', { g: .45, p: 1 + i * .06, pan: .7 });
    cue(T.fifty + .12, 'stamp', { g: .7, pan: .3 }); cue(T.fifty + .2, 'sparkle', { g: .5, pan: .3 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), LX = 410, LY = 610;
    // the listing
    if (dropIn(ctx, A.listBase, LX, LY, t, T.card, { id: 'lb', rot: -.01 })) {
      if (t < T.photo) bars(ctx, LX - 265, LY - 300, [530], { h: 240, color: '#EEE9DF' });
      dropIn(ctx, A.listPhoto, LX, LY - 185, t, T.photo, { id: 'lp', d: .3 });
      dropIn(ctx, A.listText, LX, LY + 40, t, T.text, { id: 'lt', d: .26, dy: -12, elev: 0 });
      dropIn(ctx, A.listPrice, LX, LY + 172, t, T.price, { id: 'lpr', d: .26, dy: -12, elev: 0 });
      const pressed = t >= T.press && t < T.press + .17, live = t >= T.press + .17;
      popIn(ctx, live ? A.btnPublished : A.btnPublish, LX + 150, LY + 278, t, T.btn, { id: 'bp', d: .25, s: pressed ? .92 : 1, elev: pressed ? .3 : undefined });
    }
    dropIn(ctx, A.lblOnce, LX, 185, t, T.lbl, { id: 'lonce', rot: -.04 });
    // the same listing goes out to each channel
    T.ch.forEach((c, i) => {
      const y = this.ys[i], line = curve([LX + 292, LY - 60 + i * 60], [880, y + (i - 1) * 40], [1002, y]), f = prog(t, c - .35, .35);
      strokePath(ctx, line, f, { dash: [3, 15], w: 6, a: .5 });
      if (f > 0 && f < 1) { const [px, py] = pointAt(line, f); put(ctx, A.packet, px, py, { id: 'pk' + i, rot: .1, boil: .3 }); }
      dropIn(ctx, A.chCard[i], 1265, y, t, c, { id: 'cc' + i, rot: [-.015, .012, -.01][i], d: .32, dx: -40, dy: 0, s: 1.12 });
      popIn(ctx, A.live, 1460, y + 52, t, c + .28, { id: 'lv' + i, d: .22, rot: -.04 });
    });
    const sp = [[1640, 232], [1686, 306], [1630, 380], [1690, 454], [1634, 528], [1688, 602], [1632, 676], [1686, 750], [1640, 824]];
    A.chSmall.forEach((S, i) => popIn(ctx, S, sp[i][0], sp[i][1], t, T.more + i * .075, { id: 'cs' + i, d: .25, rot: (rnd('csr', i) - .5) * .14 }));
    dropIn(ctx, A.lbl50, 1330, 930, t, T.fifty, { id: 'l50', rot: -.025 });
    if (t >= T.fifty + .2) sparks(ctx, [[930, 880, .55], [1750, 930, .6], [1560, 170, .5]], t, T.fifty + .2, st, 's7');
    // pointer presses Publish; the ninja looks on
    if (t >= T.btn - .1 && t < T.ch[0] + .2) pointer(ctx, [[T.btn, 860, 1010], [T.press, LX + 165, LY + 290], [T.ch[0] + .2, 860, 1020]], t, { id: 'cur7' });
    if (t >= T.press - .3) { const p = prog(t, T.press - .3, .4); let hop = 0; T.ch.forEach(c => { if (t >= c && t < c + .3) hop = Math.sin(prog(t, c, .3) * Math.PI) * 22; }); drawNinja(ctx, 865, lerp(1250, 925, E.back(p)) - hop, { t: st, s: .72, eyes: t >= T.fifty ? 'happy' : 'open', look: 1, rot: Math.sin(st * 2.4) * .05, id: 'n7' }); }
  }
});

// 8 — Rates and availability sync in real time; every calendar agrees.
scene(8, 8, {
  bg: '#CFE7DF', seed: 17, wipe: 'left', cam: [1.0, 1.035, 960, 560],
  build() {
    const T = this.T = {
      board: this.start - 1, minis: this.start - 1, rate: w(8, 'rates') + .05, avail: w(8, 'availability') + .2, sync: w(8, 'sink'), rt: w(8, 'real') - .12,
      agree: w(8, 'agrees') - .2, stamp: w(8, 'double') - .15, strike: w(8, 'stay') - .05, gone: w(8, 'past') - .05,
    };
    this.my = [290, 560, 830];
    cue(T.rate, 'flip', { g: .7, pan: -.2 }); [0, 1, 2].forEach(i => { cue(T.rate + .1, 'swoosh', { g: .25, p: 1.4 }); cue(T.rate + .3 + i * .12, 'flip', { g: .55, p: 1.1 + i * .1, pan: .6 }); });
    cue(T.avail - .2, 'swoosh', { g: .35, pan: -.3 }); cue(T.avail, 'land', { g: .8, p: 1.1, pan: -.3 }); [0, 1, 2].forEach(i => cue(T.sync + .15 + i * .13, 'tap', { g: .6, p: 1.2 + i * .1, pan: .6 }));
    cue(T.rt + .1, 'stamp', { g: .5, pan: -.3 }); cue(T.rt + .15, 'sparkle', { g: .4 });
    [0, 1, 2].forEach(i => cue(T.agree + i * .12, 'tick', { g: .6, p: 1 + i * .12, pan: .6 })); cue(T.agree + .3, 'ding', { g: .3, pan: .4 });
    cue(T.stamp + .1, 'stamp', { g: .6 }); cue(T.strike, 'scribble', { d: .3, g: .5 }); cue(T.gone, 'whoosh', { g: .6, p: .9 }); cue(T.gone + .1, 'rustle', { g: .4 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), BX = 590, BY = 570, G = A.calGeom, ox = BX - 540, oy = BY - 300;
    // wires from the calendar to each channel
    this.my.forEach((y, i) => {
      const line = curve([BX + 540, BY + (i - 1) * 60], [1260, y], [1350, y]);
      strokePath(ctx, line, prog(t, T.minis + i * .1, .3), { dash: [3, 15], w: 6, a: .45 });
      [[T.rate + .08, 'g'], [T.sync - .1, 'b']].forEach(([tp, c]) => { const f = prog(t, tp + i * .12, .25); if (f > 0 && f < 1) put(ctx, A.dot[c], ...pointAt(line, f), { id: 'pl' + i + c, s: 1.5, boil: 0 }); });
    });
    if (dropIn(ctx, A.calBoard, BX, BY, t, T.board, { id: 'cb', rot: -.004, d: .36 })) {
      A.bk.forEach((b, i) => { const [x, y] = G.at(b.row, b.d0); popIn(ctx, b.S, ox + x, oy + y, t, T.board + .25 + i * .05, { id: 'bk' + i, d: .22, boil: .25 }); });
      const [nx, ny] = G.at(A.bkNew.row, A.bkNew.d0);
      if (t >= T.avail - .25) { const p = prog(t, T.avail - .25, .25); put(ctx, A.bkNew.S, ox + nx, oy + ny - 200 * (1 - E.out(p)), { id: 'bkn', rot: -.2 * (1 - p), elev: .9 + 4 * (1 - p), a: clamp(p * 4), s: lerp(1.25, 1, p) }); }
      // the rate for Casa Marina
      const newRate = t >= T.rate, fk = flipK(t, T.rate);
      ctx.save(); ctx.translate(ox + 912, oy + 46); ctx.scale(1, fk);
      paper(ctx, rrect(-140, -28, 280, 56, 28), newRate ? P.green : '#ECE7DE', { elev: .6, seed: 8 });
      ink(ctx, newRate ? 'Rate  €195' : 'Rate  €180', 0, 12, { size: 32, weight: 700, color: newRate ? '#fff' : P.ink, align: 'center', a: 1 });
      ctx.restore();
    }
    // the channels keep up
    this.my.forEach((y, i) => {
      if (!dropIn(ctx, A.chCal[i], 1570, y, t, T.minis + i * .1, { id: 'mc' + i, rot: [.012, -.01, .012][i], d: .3 })) return;
      const tr = T.rate + .3 + i * .12, nr = t >= tr;
      ctx.save(); ctx.translate(1770, y - 12); ctx.scale(1, flipK(t, tr)); ink(ctx, nr ? '€195' : '€180', 0, 10, { size: 31, weight: 700, color: nr ? P.green : P.ink, align: 'right', a: 1 }); ctx.restore();
      popIn(ctx, A.chBlock, 1570 - 220 + 20 + 8 * 29, y - 100 + 120, t, T.sync + .15 + i * .13, { id: 'blk' + i, d: .2 });
      popIn(ctx, A.check, 1770, y - 72, t, T.agree + i * .12, { id: 'ck8' + i, d: .22, s: .95 });
    });
    popIn(ctx, A.boltB, 1245, BY, t, T.sync - .05, { id: 'bolt', d: .25, rot: Math.sin(st * 5) * .08 });
    dropIn(ctx, A.lblRT, 330, 190, t, T.rt, { id: 'lrt', rot: -.04 });
    // double bookings stay in the past
    if (t >= T.stamp) {
      const sx = BX + 40, sy = BY + 60;
      if (t < T.gone) { dropIn(ctx, A.stampSm, sx, sy, t, T.stamp, { id: 'dbs', rot: -.06, d: .3, s: 1.15 }); strokePath(ctx, [[sx - 420, sy + 40], [sx + 420, sy - 44]], prog(t, T.strike, .3), { w: 16, color: P.ink, a: .95 }); }
      else flyOut(ctx, A.stampSm, sx, sy, t, T.gone, { to: [-700, 900], spin: -1.4, rot: -.06, d: .45, s: 1.15 });
    }
  }
});

// 9 — Every guest message lands in one inbox. AI drafts the reply. You just press send.
const DRAFT = ['Hi Anna! Check-in is from 3 pm.', 'I’ll send your door code on Friday morning.'];
scene(9, 9, {
  bg: '#DDD6F0', seed: 19, wipe: 'top', cam: [1.0, 1.035, 1000, 580],
  build() {
    const T = this.T = {
      win: this.start - 1, rows: w(9, 'message') - .12, lbl: w(9, 'one') - .12, open: w(9, 'inbox') - .05, draft: w(9, 'ai') - .22, type: w(9, 'drafts') - .08,
      btn: w(9, 'you') - .12, hand: w(9, 'press') - .2, press: w(9, 'send') - .02,
    };
    T.type2 = T.type + .68; T.sent = T.press + .2;
    [0, 1, 2, 3].forEach(i => { cue(T.rows + i * .17 - .1, 'swoosh', { g: .3, p: 1.2 + i * .08, pan: -.4 }); cue(T.rows + i * .17 + .2, 'tap', { g: .55, p: 1 + i * .07, pan: -.5 }); });
    cue(T.lbl + .1, 'stamp', { g: .5, pan: -.6 }); cue(T.open, 'pop', { g: .6, pan: .2 });
    cue(T.draft, 'land', { g: .7, pan: .3 }); cue(T.draft + .1, 'sparkle', { g: .6, pan: .3 }); cue(T.type, 'scribble', { d: .6, g: .5 }); cue(T.type2, 'scribble', { d: .75, g: .5 });
    cue(T.btn, 'pop', { g: .6, pan: .5 }); cue(T.hand, 'slide', { g: .45, p: .8, pan: .5 }); cue(T.press, 'button', { g: .8, pan: .5 }); cue(T.sent - .05, 'whoosh', { g: .5, p: 1.3, pan: .3 }); cue(T.sent + .25, 'tick', { g: .6, pan: .4 }); cue(T.sent + .3, 'sparkle', { g: .35, p: 1.3 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), en = enter(t, T.win, .36), AX = 1000, AY = 610, AS = .95;
    if (!en.on) return;
    const f1 = prog(t, T.type, .6), f2 = prog(t, T.type2, .75), sent = t >= T.sent, pressed = t >= T.press && t < T.press + .17;
    let tip = null, bpos = null;
    ctx.save(); ctx.translate(AX, AY + en.dy); ctx.rotate(en.rot - .003); ctx.scale(AS * en.k, AS * en.k); ctx.translate(-750, -430);
    put(ctx, A.inboxWin, 750, 430, { id: 'iw', elev: 2 + en.el, boil: .4 });
    ctx.fillStyle = 'rgba(0,0,0,.07)'; ctx.fillRect(590, 72, 2, 788);
    A.conv.forEach((S, i) => slideIn(ctx, S, 340, 150 + i * 124, t, T.rows + i * .17, { from: [300, -760], id: 'cv' + i, d: .36, spin: .25, ease: E.out }));
    if (t >= T.open) {
      put(ctx, A.threadHead, 630, 92, { id: 'th', boil: .2, elev: 0 });
      popIn(ctx, A.guestBub, 630, 180, t, T.open, { id: 'gb', d: .25 });
    }
    if (!sent) {
      if (dropIn(ctx, A.draftBox, 630, 390, t, T.draft, { id: 'db', d: .32, dy: -18 })) {
        const o = { size: 32, weight: 600, color: P.ink, a: 1 };
        const x1 = typed(ctx, DRAFT[0], 658, 500, o, f1), x2 = typed(ctx, DRAFT[1], 658, 552, o, f2);
        if (t >= T.type - .25 && f1 <= 0) { const q = E.out(prog(t, T.type - .25, .25)); tip = [lerp(1200, 660, q), lerp(260, 494, q)]; }
        else if (f1 > 0 && f1 < 1) tip = [x1 + 2, 494 - Math.abs(Math.sin(st * 9)) * 5];
        else if (f1 >= 1 && f2 <= 0) { const q = E.inOut(prog(t, T.type + .6, T.type2 - T.type - .6)); tip = [lerp(x1, 660, q), lerp(494, 546, q)]; }
        else if (f2 > 0 && f2 < 1) tip = [x2 + 2, 546 - Math.abs(Math.sin(st * 9)) * 5];
        else if (f2 >= 1 && t < T.type2 + 1.15) { const q = E.in(prog(t, T.type2 + .75, .4)); tip = [lerp(x2, 1700, q), lerp(546, 200, q)]; }
      }
    } else {
      const p = prog(t, T.sent, .3); put(ctx, A.sentBub, 1465, lerp(430, 320, E.out(p)), { id: 'sb', s: lerp(.9, 1, E.back(p)), boil: .3 });
      popIn(ctx, A.sentTag, 1400, 500, t, T.sent + .25, { id: 'st', d: .22, rot: -.04 }); popIn(ctx, A.check, 1320, 500, t, T.sent + .25, { id: 'sck', d: .22, s: .8 });
      bars(ctx, 640, 720, [520], { h: 56, color: '#F1EEE7' });
    }
    popIn(ctx, A.btnSend, 1370, 712, t, T.btn, { id: 'bs', d: .25, s: pressed ? .9 : 1, elev: pressed ? .3 : undefined });
    if (tip) put(ctx, A.pencil, tip[0], tip[1], { rot: -.72 + Math.sin(st * 17) * .07 + (rnd('pw9', FRAME) - .5) * .06, id: 'pen9', elev: 2.4, boil: .3, s: 1.15 });
    if (t >= T.hand) {
      const q = prog(t, T.hand, .5), p = E.back(q), back = t >= T.press + .3 ? E.in(prog(t, T.press + .3, .45)) : 0;
      if (back < 1) put(ctx, A.hand, lerp(1800, 1395, p) + back * 90, lerp(1500, 722, p) + (pressed ? 12 : 0) + back * 800, { rot: lerp(.4, .06, E.out(q)) + (rnd('hw9', Math.floor(FRAME / 2)) - .5) * .05, id: 'hand9', elev: 2.4 - (pressed ? 1.4 : 0), boil: .8 });
    }
    ctx.restore();
    dropIn(ctx, A.lblInbox, 270, 118, t, T.lbl, { id: 'linb', rot: -.05 });
    if (sent) sparks(ctx, [[1790, 250, .6], [1830, 640, .5], [180, 900, .5]], t, T.sent + .3, st, 's9');
  }
});

// 10 — Automations: the confirmation, the directions, the review request — at just the right moment.
scene(10, 10, {
  bg: '#F5E5AE', seed: 21, wipe: 'right', cam: [1.0, 1.035, 960, 560],
  build() {
    const T = this.T = { title: this.start + .25, track: this.start - 1, m: [w(10, 'confirmation') - .1, w(10, 'directions') - .1, w(10, 'review') - .1], send: w(10, 'sent') - .1, moment: w(10, 'right') - .2 };
    this.xs = [250, 752, 1010, 1264, 1630];
    cue(T.title, 'stamp', { g: .6, pan: -.3 }); cue(T.title + .05, 'fan', { g: .3, p: .7, pan: -.6 });
    T.m.forEach((m, i) => { cue(m - .3, 'slide', { g: .3, p: 1.3, pan: [-.6, -.2, .7][i] }); cue(m, 'popup', { g: .8, p: 1 + i * .1, pan: [-.6, -.2, .7][i] }); cue(m + .1, 'tick', { g: .4, pan: [-.6, -.2, .7][i] }); });
    [0, 1, 2].forEach(i => cue(T.send + i * .12, 'swoosh', { g: .45, p: 1.2 + i * .1, pan: [-.6, -.2, .7][i] })); [0, 1, 2, 3].forEach(i => cue(T.send + .25 + i * .12, 'sticker', { g: .4, p: 1 + i * .08, pan: -.6 + i * .4 }));
    cue(T.moment + .1, 'stamp', { g: .5, pan: .3 }); cue(T.moment + .2, 'ding', { g: .35 }); [0, 1, 2].forEach(i => cue(T.moment + .3 + i * .1, 'tick', { g: .5, p: 1.1 + i * .1, pan: [-.6, -.2, .7][i] }));
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), xs = this.xs, TY = 690;
    put(ctx, A.gearBig, 210, 215, { rot: st * .9, id: 'g1' }); put(ctx, A.gearSm, 330, 322, { rot: -st * 1.4 + .3, id: 'g2' });
    dropIn(ctx, A.lblAuto, 760, 200, t, T.title, { id: 'lauto', rot: -.02 });
    // the stay, as a timeline
    strokePath(ctx, [[xs[0] - 110, TY], [xs[4] + 110, TY]], prog(t, T.track, .5), { dash: [2, 18], w: 8, a: .5 });
    xs.forEach((x, i) => popIn(ctx, A.node[i], x, TY, t, T.track + .15 + i * .1, { id: 'nd' + i, d: .25 }));
    const mi = [0, 1, 4];
    T.m.forEach((m, k) => {
      const x = xs[mi[k]];
      if (t >= m) { const p = prog(t, m, .32); put(ctx, A.msg[k], x, TY - 74, { sy: Math.max(.02, E.back(p)), sx: lerp(.7, 1, E.out(p)), id: 'msg' + k, rot: [-.015, .012, -.012][k], boil: .35 }); }
      if (k === 2 && t >= m + .25) put(ctx, A.stars, x + 60, TY - 116, { id: 'strs', boil: .2, a: clamp((t - m - .25) * 6) });
      if (t >= T.send + k * .12) { const q = prog(t, T.send + k * .12, .7); if (q < 1) put(ctx, A.planeS, x + 170 + q * 330, TY - 250 - E.out(q) * 330, { id: 'pln' + k, rot: -.5, boil: .3, s: 1 + q * .3, a: 1 - E.in(q) }); }
      popIn(ctx, A.check, x + 196, TY - 250, t, T.moment + .3 + k * .1, { id: 'ck10' + k, d: .22, s: .9 });
    });
    // the booking moves along it
    if (t >= T.m[0] - .2) { const c = along([[T.m[0], xs[0], TY], [T.m[1], xs[1], TY], [T.m[2], xs[4], TY]], t, .6); put(ctx, A.marker, c[0], TY - 40 - Math.abs(Math.sin(st * 5)) * 6, { id: 'mk', s: lerp(0, .78, E.back(prog(t, T.m[0] - .2, .25))), rot: Math.sin(st * 3) * .04 }); }
    A.autoChips.forEach((S, i) => popIn(ctx, S, [330, 760, 1180, 1590][i], 955 + (i % 2) * 14, t, T.send + .25 + i * .12, { id: 'ach' + i, d: .25, rot: (i % 2 ? .025 : -.025) }));
    if (t >= T.send + .15) put(ctx, A.lblAlso, 960, 878, { id: 'lalso', boil: .3, elev: 0, a: clamp((t - T.send - .15) * 6) });
    popIn(ctx, A.clockB, 1210, 210, t, T.moment, { id: 'clk', d: .28, rot: Math.sin(st * 4) * .05 });
    dropIn(ctx, A.lblMoment, 1300, 330, t, T.moment + .1, { id: 'lmom', rot: .02, s: .92 });
  }
});

// 11 — Smart pricing follows demand: up on busy nights, filling the quiet ones.
scene(11, 11, {
  bg: '#D2EAD5', seed: 23, wipe: 'bottom', cam: [1.0, 1.035, 900, 600],
  build() {
    const T = this.T = { cal: this.start - 1, chip: w(11, 'smart') - .1, dem: w(11, 'follows') - .05, up: w(11, 'raising') - .05, down: w(11, 'filling') - .25, fill: w(11, 'quiet') - .05 };
    this.lvl = [.38, .2, .24, .46, .86, 1, .62, .4, .18, .22, .5, .9, 1, .66];
    this.busy = [4, 5, 11, 12]; this.quiet = [1, 2, 8, 9];
    cue(T.chip, 'pop', { g: .6, pan: -.1 }); cue(T.chip + .05, 'sparkle', { g: .55, pan: -.1 });
    cue(T.dem, 'fan', { g: .5, p: .8, pan: -.3 });
    this.busy.forEach((_, i) => { cue(T.up + i * .13, 'flip', { g: .6, p: 1.1 + i * .08, pan: -.3 + i * .1 }); cue(T.up + i * .13 + .12, 'tap', { g: .4, p: 1.3, pan: .6 }); });
    this.quiet.forEach((_, i) => { cue(T.down + i * .1, 'flip', { g: .5, p: .9 + i * .06, pan: -.5 + i * .1 }); cue(T.fill + i * .13, 'stamp', { g: .45, p: 1.2 + i * .06, pan: -.5 + i * .1 }); cue(T.fill + i * .13 + .12, 'tap', { g: .4, p: 1.3, pan: .6 }); });
    cue(T.fill + .7, 'pop', { g: .6, pan: .6 }); cue(T.fill + .75, 'sparkle', { g: .45, pan: .6 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), CX = 620, CY = 610, G = A.priceGeom, ox = CX - 565, oy = CY - 320;
    if (dropIn(ctx, A.priceCal, CX, CY, t, T.cal, { id: 'pc', rot: -.004, d: .36 })) {
      popIn(ctx, A.smartChip, ox + 950, oy + 50, t, T.chip, { id: 'sc11', d: .28, rot: .02 });
      for (let k = 0; k < 14; k++) {
        const [cx, top] = G.cell(k), x = ox + cx, y = oy + top, d = E.out(prog(t, T.dem + (k % 7) * .04, .4));
        if (d > 0) put(ctx, A.demBar, x, y + G.CHh + 22, { sy: Math.max(.02, this.lvl[k] * d), id: 'dm' + k, boil: 0, elev: 0 });
        const bi = this.busy.indexOf(k), qi = this.quiet.indexOf(k);
        let S = A.tagBase, tt = -1;
        if (bi >= 0) { tt = T.up + bi * .13; if (t >= tt) S = A.tagUp[bi % 2]; }
        if (qi >= 0) { tt = T.down + qi * .1; if (t >= tt) S = A.tagDown[qi % 2]; }
        if (t >= T.cal + .2 + k * .02) put(ctx, S, x, y + 100, { id: 'tg' + k, boil: .2, sy: tt > 0 ? flipK(t, tt) : 1, s: tt > 0 && t >= tt ? lerp(1.2, 1.04, E.out(prog(t, tt, .25))) : 1 });
        if (bi >= 0) popIn(ctx, A.arrUp, x + 46, y + 56, t, T.up + bi * .13 + .08, { id: 'au' + k, d: .2 });
        if (qi >= 0) { popIn(ctx, A.arrDown, x + 46, y + 56, t, T.down + qi * .1 + .08, { id: 'ad' + k, d: .2 }); dropIn(ctx, A.bookedTag, x, y + 162, t, T.fill + qi * .13, { id: 'bt' + k, d: .25, rot: (qi % 2 ? .05 : -.05), dy: -20 }); }
      }
    }
    // what it adds up to
    if (dropIn(ctx, A.revCard, 1580, 660, t, T.cal + .2, { id: 'rv', rot: .01, d: .36 })) {
      let n = 6; this.busy.forEach((_, i) => { if (t >= T.up + i * .13 + .12) n++; }); this.quiet.forEach((_, i) => { if (t >= T.fill + i * .13 + .12) n++; });
      for (let i = 0; i < n; i++) put(ctx, A.coinFlat, 1580 + (rnd('cf', i) - .5) * 16, 854 - i * 28, { id: 'cn' + i, boil: .2 });
      popIn(ctx, A.upChip, 1670, 480, t, T.fill + .7, { id: 'upc', d: .25, rot: .05 });
    }
    { const p = prog(t, this.start + .3, .4); let hop = 0;[T.up, T.fill].forEach(c => { if (t >= c && t < c + .8) hop = Math.abs(Math.sin((t - c) * 8)) * 16; }); drawNinja(ctx, 1580, lerp(-200, 260, E.bounce(p)) - hop, { t: st, s: .85, eyes: t >= T.fill + .5 ? 'happy' : 'open', look: -1, rot: Math.sin(st * 2.3) * .05, id: 'n11' }); }
  }
});

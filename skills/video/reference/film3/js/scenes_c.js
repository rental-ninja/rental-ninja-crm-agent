// Act 3, second half — the guest's side, the team, the money, the website, the reports.

// 12 — Guests check in online: ID, balance, deposit.
scene(12, 12, {
  bg: '#CCE5F1', seed: 25, wipe: 'left', cam: [1.0, 1.035, 960, 580],
  build() {
    const T = this.T = { phone: w(12, 'guests') - .5, lbl: w(12, 'online') - .12, s: [w(12, 'scan') - .08, w(12, 'pay') - .12, w(12, 'leave') - .12], k: [w(12, 'id') + .4, w(12, 'balance') + .35, w(12, 'deposit') + .3], done: w(12, 'deposit') + .62 };
    this.cy = [270, 560, 850];
    cue(T.phone, 'slide', { g: .6 }); cue(T.phone + .4, 'land', { g: .8 }); cue(T.lbl + .1, 'stamp', { g: .5, pan: -.6 });
    T.s.forEach((s, i) => { cue(s - .2, 'swoosh', { g: .3, p: 1.2, pan: .5 }); cue(s, 'land', { g: .7, p: 1 + i * .08, pan: .5 }); cue(T.k[i], 'tick', { g: .7, p: 1 + i * .12, pan: .2 }); cue(T.k[i] + .02, 'pop', { g: .4, p: 1.3, pan: .5 }); });
    cue(T.s[0] + .15, 'scribble', { d: .55, g: .3 }); cue(T.s[1] + .35, 'click', { g: .6, pan: .5 }); cue(T.done, 'ding', { g: .35 }); cue(T.done, 'sparkle', { g: .5 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), PX = 800, PY = 590, ox = PX - 220, oy = PY - 410, all = t >= T.done;
    // the guest, at home, before the trip
    { put(ctx, A.case1, 112, 1026, { id: 'c12' }); drawPerson(ctx, 290, 1028, { kind: 'g1', s: 1.36, eyes: all ? 'happy' : 'open', look: 1, armR: -1.0, held: (c) => put(c, A.miniPhone, 140, -196, { rot: .25, boil: 0 }), hy: all ? -Math.abs(Math.sin((t - T.done) * 9)) * 8 * (1 - prog(t, T.done, 1)) : 0, id: 'g12' }); }
    dropIn(ctx, A.lblCheckin, 310, 170, t, T.lbl, { id: 'lci', rot: -.04 });
    if (!slideIn(ctx, A.ciPhone, PX, PY, t, T.phone, { from: [0, 900], id: 'cip', spin: .06, d: .5, rot: -.01 })) return;
    if (t >= T.phone + .5) {
      put(ctx, all ? A.ciDone : A.ciWait, PX, oy + 752, { id: 'cib' + (all ? 1 : 0), boil: .2, s: all ? lerp(1.2, 1, E.out(prog(t, T.done, .25))) : 1 });
      T.k.forEach((k, i) => popIn(ctx, A.check, ox + 372, oy + 236 + i * 176, t, k, { id: 'ck12' + i, d: .22, s: .9 }));
    }
    T.s.forEach((s, i) => {
      const y = this.cy[i], line = curve([PX + 205, oy + 264 + i * 176], [1100, y], [1165, y]);
      strokePath(ctx, line, prog(t, s - .25, .25), { dash: [3, 14], w: 6, a: .45 });
      if (!dropIn(ctx, A.ci[i], 1445, y, t, s, { id: 'ci' + i, rot: [.012, -.01, .012][i], d: .32, dx: 60, dy: 0 })) return;
      if (i === 0 && t >= s + .15 && t < T.k[0]) { const q = (t - s - .15) / (T.k[0] - s - .15); put(ctx, A.scanLine, 1445 - 280 + 142, y - 120 + lerp(44, 184, Math.abs(Math.sin(q * Math.PI * 1.5))), { id: 'scl', boil: 0, a: .85 }); }
      popIn(ctx, A.check, 1712, y - 108, t, T.k[i], { id: 'ckc' + i, d: .22, s: 1.1 });
    });
    if (all) sparks(ctx, [[560, 250, .6], [1060, 190, .5], [1780, 130, .55], [1090, 990, .45]], t, T.done, st, 's12');
  }
});

// 13 — On the day, a door code lets them in; a digital guidebook answers the small questions.
scene(13, 13, {
  bg: '#F3DDB6', seed: 27, wipe: 'top', cam: [1.0, 1.035, 960, 600],
  camAt(t) { const q = E.inOut(prog(t, this.T.guide - .55, .8)); return [lerp(1.5, 1.02, q), lerp(250, 960, q), lerp(1080, 600, q)]; },
  build() {
    const T = this.T = { lbl: w(13, 'day') - .2, code: w(13, 'door') - .2, dig: w(13, 'door'), led: w(13, 'lets') - .02, open: w(13, 'in') - .08, guide: w(13, 'digital') - .2, q: w(13, 'answers') - .45, a: w(13, 'small') - .15 };
    cue(T.lbl + .1, 'stamp', { g: .45, pan: -.6 }); cue(T.code, 'popup', { g: .7, pan: -.5 }); [0, 1, 2, 3].forEach(i => cue(T.dig + i * .13, 'type', { g: .7, p: 1 + i * .08, pan: -.5 }));
    cue(T.led, 'blink', { g: .5, p: 1.2, pan: -.3 }); cue(T.open, 'slide', { g: .6, p: .8, pan: -.3 }); cue(T.open + .2, 'sparkle', { g: .45, pan: -.3 }); cue(T.open + .3, 'boing', { g: .3, pan: -.6 });
    cue(T.guide, 'slide', { g: .7, pan: .5 }); cue(T.guide + .42, 'land', { g: .8, pan: .5 });
    [0, 1, 2].forEach(i => { cue(T.q + i * .2, 'popup', { g: .6, p: 1 + i * .12, pan: 0 }); cue(T.a + i * .24, 'tick', { g: .65, p: 1 + i * .12, pan: .4 }); });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), HX = 470, HY = 975, dx = HX + 58, open = E.inOut(prog(t, T.open, .35)), inside = t >= T.open;
    put(ctx, A.sun, 1790, 150, { rot: st * .08, id: 'sun13', s: .7 }); put(ctx, A.cloud2, 960 + st * 5, 110, { id: 'c13', s: .8 });
    put(ctx, A.ground, -140, 860, { id: 'gr13', boil: .2 });
    put(ctx, A.house, HX, HY, { id: 'house13', boil: .3 });
    if (open > 0) put(ctx, A.glow, dx, HY, { boil: 0, elev: 0, a: open });
    put(ctx, A.door, dx, HY, { sx: lerp(1, .2, open), boil: 0, elev: .6 + open });
    put(ctx, A.keypad, dx + 186, HY - 190, { id: 'kp', s: .8 }); put(ctx, t >= T.led ? A.ledG : A.ledR, dx + 186, HY - 234, { id: 'led', boil: 0, s: t >= T.led ? lerp(1.6, 1, E.out(prog(t, T.led, .25))) : 1 });
    // the guests, with the code on their phone
    [['g2', 205, A.case2], ['g1', 365, A.case1]].forEach(([k, x, C], i) => {
      const hop = inside ? Math.abs(Math.sin((t - T.open) * 9 + i)) * 16 * (1 - prog(t, T.open, 1.2)) : 0;
      put(ctx, C, x - 100, 1052, { id: 'c13' + i, boil: .3 });
      drawPerson(ctx, x, 1054 - hop, { kind: k, s: 1.08, eyes: 'happy', look: 1, armR: i ? -1.0 : -.14, held: i ? (c) => put(c, A.miniPhone, 140, -196, { rot: .25, boil: 0 }) : null, id: 'g13' + i });
    });
    if (t >= T.code && t < T.guide + .6) {
      const p = prog(t, T.code, .3), out = E.in(prog(t, T.guide + .3, .3));
      put(ctx, A.codeCard, 470, 640, { sy: Math.max(.02, E.back(p)) * (1 - out), sx: 1 - out * .5, id: 'cc13', rot: -.015 });
      if (out <= 0) A.digit.forEach((S, i) => popIn(ctx, S, 470 - 120 + 68 + i * 94, 640 - 210 + 117, t, T.dig + i * .13, { id: 'dg' + i, d: .18, boil: .2, elev: 0 }));
    }
    dropIn(ctx, A.lblDay, 250, 420, t, T.lbl, { id: 'lday', rot: -.04, s: .8 });
    // the guidebook
    const GX = 1500, GY = 570;
    if (slideIn(ctx, A.guide, GX, GY, t, T.guide, { from: [900, 40], id: 'gd13', spin: .08, d: .5, rot: .012 })) {
      const qx = [1000, 1024, 990], qy = [300, 490, 680];
      A.qb.forEach((S, i) => {
        popIn(ctx, S, qx[i], qy[i], t, T.q + i * .2, { id: 'qb' + i, d: .26, rot: [-.03, .02, -.02][i] });
        const ta = T.a + i * .24; popIn(ctx, A.check, qx[i] + S.w / 2 - 6, qy[i] - 44, t, ta, { id: 'qa' + i, d: .22 });
        if (t >= ta) put(ctx, A.guideRing, GX - 310 + 36 + (i % 2) * 284 + 132, GY - 380 + 186 + Math.floor(i / 2) * 274 + 125, { id: 'gr' + i + Math.floor(st * 3), boil: .6, elev: 0, s: lerp(1.12, 1, E.out(prog(t, ta, .25))) });
      });
    }
  }
});

// 14 — Extras, like a late check-out, are one tap away.
scene(14, 14, {
  bg: '#F6D5DC', seed: 29, wipe: 'right', cam: [1.0, 1.03, 960, 580],
  build() {
    const T = this.T = { phone: this.start - 1, clock: w(14, 'late') - .25, lbl: w(14, 'checkout') - .1, hand: w(14, 'one') - .1, tap: w(14, 'tap') + .05, plus: w(14, 'away') - .1 };
    cue(T.clock, 'pop', { g: .7, pan: .5 }); for (let i = 0; i < 6; i++) cue(T.clock + .2 + i * .1, 'tick', { g: .3, p: 1 + i * .04, pan: .5 }); cue(T.lbl + .1, 'stamp', { g: .5, pan: .5 });
    cue(T.hand, 'slide', { g: .4, p: .8, pan: -.2 }); cue(T.tap, 'button', { g: .8, pan: -.2 }); cue(T.tap + .1, 'sparkle', { g: .4, pan: -.2 });
    [0, 1, 2].forEach(i => cue(T.tap + .2 + i * .1, 'swoosh', { g: .25, p: 1.5, pan: .2 })); cue(T.plus + .1, 'stamp', { g: .6, pan: .5 }); cue(T.plus + .15, 'ding', { g: .35, pan: .4 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), PX = 640, PY = 590, bx = PX - 230 + 330, by = PY - 410 + 323, tapped = t >= T.tap, pressed = tapped && t < T.tap + .17;
    { drawPerson(ctx, 205, 1030, { kind: 'g3', s: 1.28, eyes: tapped ? 'happy' : 'open', look: 1, id: 'g14', hy: tapped ? -Math.abs(Math.sin((t - T.tap) * 9)) * 8 * (1 - prog(t, T.tap, 1)) : 0 }); }
    if (dropIn(ctx, A.exPhone, PX, PY, t, T.phone, { id: 'exp', rot: -.012, d: .36 })) {
      if (tapped) put(ctx, A.btnAdded, bx - 10, by, { id: 'bad', boil: .2, s: lerp(1.25, 1, E.out(prog(t, T.tap, .25))) }); else put(ctx, A.btnAdd, bx, by, { id: 'bad0', boil: .2 });
    }
    // the clock slips from 11 to 2
    if (popIn(ctx, A.bigClock, 1370, 430, t, T.clock, { id: 'bcl', d: .3, rot: -.02 })) {
      const q = E.inOut(prog(t, T.clock + .2, .8)), ha = lerp(-Math.PI / 6, Math.PI / 3, q), ma = q * Math.PI * 6;
      ctx.save(); ctx.translate(1370, 430); ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 3;
      ctx.strokeStyle = P.ink; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ha) * 84, -Math.cos(ha) * 84); ctx.stroke();
      ctx.strokeStyle = P.red; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ma) * 124, -Math.cos(ma) * 124); ctx.stroke();
      ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(0, 0, 14, 0, 7); ctx.fill(); ctx.restore();
    }
    dropIn(ctx, A.lblLate, 1370, 715, t, T.lbl, { id: 'llate', rot: -.025 });
    dropIn(ctx, A.lblPlus, 1370, 905, t, T.plus, { id: 'lplus', rot: .03 });
    if (tapped) [0, 1, 2].forEach(i => { const q = prog(t, T.tap + .2 + i * .1, .5); if (q > 0 && q < 1) { const [cx, cy] = pointAt(curve([bx, by], [1000, 300], [1300, 880]), E.inOut(q)); put(ctx, A.coin, cx, cy, { id: 'co' + i, rot: q * 5, boil: 0 }); } });
    if (t >= T.hand) {
      const q = prog(t, T.hand, .5), p = E.back(q), back = t >= T.tap + .3 ? E.in(prog(t, T.tap + .3, .45)) : 0;
      if (back < 1) put(ctx, A.hand, lerp(1100, bx + 22, p) + back * 60, lerp(1500, by + 6, p) + (pressed ? 12 : 0) + back * 800, { rot: lerp(.4, .06, E.out(q)) + (rnd('hw14', Math.floor(FRAME / 2)) - .5) * .05, id: 'hand14', elev: 2.4 - (pressed ? 1.4 : 0), boil: .8 });
    }
    if (t >= T.plus + .15) sparks(ctx, [[1080, 850, .55], [1680, 900, .6], [1640, 250, .45]], t, T.plus + .15, st, 's14');
  }
});

// 15 — Cleanings and check-ins schedule themselves; the team gets every job, and sends back photos.
scene(15, 15, {
  bg: '#D8E8F5', seed: 31, wipe: 'bottom', cam: [1.0, 1.035, 960, 580],
  camAt(t) { const q = E.inOut(prog(t, this.T.clean - .5, .8)); return [lerp(1.55, 1.02, q), lerp(120, 960, q), lerp(330, 580, q)]; },
  build() {
    const T = this.T = {
      sched: this.start - 1, j: [w(15, 'cleanings') - .05, w(15, 'check') - .05], self: w(15, 'schedule') - .1, clean: w(15, 'your') - .45, phone: w(15, 'every') - .25, buzz: w(15, 'phone') - .05,
      rep: w(15, 'sends') - .35, ck: w(15, 'sends'), ph: w(15, 'photos') - .08, done: w(15, 'done') - .12,
    };
    T.j.forEach((j, i) => { cue(j, 'pop', { g: .7, p: 1 + i * .15, pan: -.6 }); cue(j + .05, 'tap', { g: .5, pan: -.6 }); }); cue(T.self, 'fan', { g: .3, p: .7, pan: -.6 });
    for (let i = 0; i < 3; i++) cue(T.clean + .1 + i * .13, 'tap', { g: .3, pan: -.2 });
    cue(T.phone, 'land', { g: .7, pan: .1 }); cue(T.buzz, 'rustle', { g: .3, p: 1.6, pan: .1 }); cue(T.buzz + .05, 'blink', { g: .4, pan: .1 });
    cue(T.rep, 'slide', { g: .5, pan: .6 }); cue(T.rep + .4, 'land', { g: .8, pan: .6 }); [0, 1, 2].forEach(i => cue(T.ck + .1 + i * .15, 'tick', { g: .55, p: 1 + i * .1, pan: .6 }));
    [0, 1, 2].forEach(i => { cue(T.ph + i * .2, 'click', { g: .6, p: 1.3, pan: .2 }); cue(T.ph + i * .2 + .02, 'swoosh', { g: .3, p: 1.4, pan: .4 }); cue(T.ph + i * .2 + .3, 'tap', { g: .5, p: 1.1 + i * .1, pan: .6 }); });
    cue(T.done + .1, 'stamp', { g: .7, pan: .6 }); cue(T.done + .15, 'sparkle', { g: .5, pan: .6 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), SX = 335, SY = 450, RX = 1545, RY = 560;
    // the schedule makes the jobs itself
    if (dropIn(ctx, A.sched, SX, SY, t, T.sched, { id: 'sch', rot: -.012, d: .36 })) {
      T.j.forEach((j, i) => popIn(ctx, A.jobChip[i], SX - 280 + 214, SY - 235 + 330 + i * 92, t, j, { id: 'jc' + i, d: .28, rot: (i ? .015 : -.015) }));
      if (t >= T.self - .2) put(ctx, A.gearSm, SX + 232, SY - 240, { id: 'gs15', rot: st * 1.6, s: .62 * E.back(prog(t, T.self - .2, .3)) });
    }
    if (t >= T.self) put(ctx, A.lblSelf, SX, SY + 290, { id: 'lself', boil: .4, elev: 0, rot: -.03, a: clamp((t - T.self) * 6) });
    // the cleaner
    if (t >= T.clean) {
      const p = prog(t, T.clean, .45), y = lerp(1750, 1034, E.back(p)), got = t >= T.buzz, fin = t >= T.done;
      put(ctx, A.mop, 660, y - 4, { id: 'mop', rot: -.14 }); put(ctx, A.bucket, 905, y, { id: 'bkt' });
      drawPerson(ctx, 775, y - (fin ? Math.abs(Math.sin((t - T.done) * 9)) * 12 * (1 - prog(t, T.done, 1)) : 0), { kind: 'cleaner', s: 1.32, eyes: fin ? 'happy' : got ? 'open' : 'happy', look: 1, armL: 1.0, armR: fin ? -2.5 : -.14, id: 'cl15' });
    }
    // the job, on their phone
    strokePath(ctx, curve([SX + 100, SY + 96], [760, 330], [930, 430]), prog(t, T.phone - .3, .3), { dash: [3, 14], w: 6, a: .45 });
    if (dropIn(ctx, A.jobPhone, 1085, 470 + (t >= T.buzz && t < T.buzz + .5 ? (rnd('jb', FRAME) - .5) * 8 : 0), t, T.phone, { id: 'jph', rot: .02 + (t >= T.buzz && t < T.buzz + .5 ? Math.sin(t * 60) * .03 : 0), d: .34 })) {
      if (t >= T.buzz && t < T.buzz + .6) { put(ctx, A.buzz, 1265, 330, { id: 'bz15' + FRAME % 3, boil: 1.2, rot: -.3 }); put(ctx, A.buzz, 905, 330, { id: 'by15' + FRAME % 3, boil: 1.2, rot: Math.PI + .3 }); }
    }
    // the report comes back
    if (slideIn(ctx, A.report, RX, RY, t, T.rep, { from: [800, 40], id: 'rep', spin: .08, d: .45, rot: .01 })) {
      [0, 1, 2].forEach(i => popIn(ctx, A.check, RX - 300 + 62, RY - 340 + 170 + i * 66, t, T.ck + .1 + i * .15, { id: 'rck' + i, d: .2, s: .72 }));
      A.photo.forEach((S, i) => {
        const t0 = T.ph + i * .2; if (t < t0) return;
        const p = prog(t, t0, .32), e = E.out(p), tx = RX - 300 + 118 + i * 182, ty = RY - 340 + 487;
        if (p < .35) put(ctx, A.flash, 1085, 360, { id: 'fl' + i, boil: 0, a: 1 - p / .35, s: .6 + p, elev: 0 });
        put(ctx, S, lerp(1085, tx, e), lerp(430, ty, e) - Math.sin(p * Math.PI) * 90, { id: 'pho' + i, rot: (1 - e) * .5 + [-.04, .03, -.02][i], s: lerp(.5, 1, e), elev: 1.3 + 4 * Math.sin(p * Math.PI), boil: .3 });
      });
      dropIn(ctx, A.lblDone, RX + 130, RY - 318, t, T.done, { id: 'ldone', rot: .07 });
      if (t >= T.done + .15) sparks(ctx, [[1860, 330, .55], [1240, 200, .5], [1850, 940, .45]], t, T.done + .15, st, 's15');
    }
  }
});

// 16 — At the end of the month the accounting is already done.
scene(16, 16, {
  bg: '#E6DCF3', seed: 33, wipe: 'left', cam: [1.0, 1.035, 960, 580],
  build() {
    const T = this.T = { page: this.start - 1, flip: w(16, 'end') + .15, st: w(16, 'month') + .25, rows: w(16, 'accounting') - .1, pay: w(16, 'done') - .15, d: [w(16, 'owner') - .1, w(16, 'commissions') - .1, w(16, 'invoices') - .1], calc: w(16, 'calculated') - .12 };
    cue(T.flip, 'flip', { g: .8, pan: -.7 }); cue(T.st, 'slide', { g: .6 }); cue(T.st + .42, 'land', { g: .9, pan: -.1 });
    A.ROWS.forEach((_, i) => cue(T.rows + i * .17, 'type', { g: .6, p: 1 + i * .06, pan: .1 })); cue(T.pay, 'stamp', { g: .6, pan: .1 }); cue(T.pay + .25, 'tick', { g: .7, pan: .1 }); cue(T.pay + .3, 'ding', { g: .3 });
    T.d.forEach((d, i) => { cue(d - .2, 'swoosh', { g: .3, p: 1.2, pan: .6 }); cue(d, 'land', { g: .75, p: 1 + i * .08, pan: .6 }); });
    cue(T.calc + .1, 'stamp', { g: .55, pan: .5 }); cue(T.calc + .15, 'sparkle', { g: .55, pan: .5 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), SX = 850, SY = 590, ox = SX - 340, oy = SY - 360;
    dropIn(ctx, t >= T.flip ? A.page31 : A.page30, 250, 300, t, T.page, { id: 'pg', rot: -.04, sy: flipK(t, T.flip, .22) });
    { const p = prog(t, T.st + .2, .45), calm = t >= T.pay; drawPerson(ctx, 250, lerp(1750, 1036, E.back(p)), { kind: 'host', s: 1.3, eyes: calm ? 'closed' : 'happy', mouth: 'smile', look: 1, armR: -1.0, held: (c) => put(c, A.mug, 142, -176, { boil: 0, s: 1.05 }), hy: calm ? Math.sin(st * 2) * 3 : 0, id: 'host16' }); }
    if (slideIn(ctx, A.statement, SX, SY, t, T.st, { from: [0, 900], id: 'stm', spin: .05, d: .5, rot: -.008 })) {
      A.ROWS.forEach(([, v, c], i) => { const tt = T.rows + i * .17; if (t >= tt) typed(ctx, v, ox + 644 - textW(v, 35, 700), oy + 202 + i * 84, { size: 35, weight: 700, color: c, a: 1, family: F.disp }, prog(t, tt, .2)); });
      if (t >= T.pay) { const k = lerp(1.35, 1, E.out(prog(t, T.pay, .25))); ctx.save(); ctx.translate(ox + 630, oy + 614); ctx.scale(k, k); ink(ctx, '€2,554', 0, 16, { size: 60, weight: 700, color: P.green, align: 'right', a: 1 }); ctx.restore(); popIn(ctx, A.check, ox + 640, oy + 548, t, T.pay + .25, { id: 'ck16', d: .22 }); }
    }
    const ys = [300, 510, 720];
    A.docTile.forEach((S, i) => dropIn(ctx, S, 1580, ys[i], t, T.d[i], { id: 'dt' + i, rot: [.015, -.012, .015][i], d: .34, dx: 70, dy: 0 }));
    dropIn(ctx, A.lblCalc, 1540, 925, t, T.calc, { id: 'lcalc', rot: -.025 });
    if (t >= T.calc + .15) sparks(ctx, [[1250, 250, .6], [1830, 880, .55], [1220, 930, .45], [470, 240, .5]], t, T.calc + .15, st, 's16');
  }
});

// 17 — Owners follow their bookings with a login of their own.
scene(17, 17, {
  bg: '#DCEBD0', seed: 35, wipe: 'top', cam: [1.0, 1.03, 960, 580],
  build() {
    const T = this.T = { phone: this.start - 1, bars: w(17, 'follow') - .1, lbl: w(17, 'login') - .2, c: [w(17, 'bookings') - .1, w(17, 'login') + .1, w(17, 'own') - .05], tap: w(17, 'own') - .05 };
    [0, 1, 2].forEach(i => cue(T.bars + i * .1, 'tap', { g: .45, p: 1 + i * .1 })); cue(T.lbl + .1, 'stamp', { g: .55, pan: .5 }); cue(T.lbl, 'pop', { g: .5, pan: .1 });
    T.c.forEach((c, i) => cue(c, 'sticker', { g: .55, p: 1 + i * .1, pan: .6 })); cue(T.tap, 'click', { g: .7 }); cue(T.tap + .1, 'pop', { g: .6, p: 1.2 }); cue(T.tap + .15, 'sparkle', { g: .4 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), PX = 900, PY = 590, cx0 = PX - 230 + 52, cy0 = PY - 410 + 279, tapped = t >= T.tap;
    { drawPerson(ctx, 340, 1034, { kind: 'owner', s: 1.4, eyes: 'happy', look: 1, armR: tapped ? -2.4 + Math.sin(st * 10) * .25 : -.14, id: 'own17' }); }
    if (dropIn(ctx, A.ownPhone, PX, PY, t, T.phone, { id: 'owp', rot: -.01, d: .36 })) {
      [[0, 0], [2, 1], [4, 2]].forEach(([c, r], i) => popIn(ctx, A.ownBars[i], cx0 + c * 50, cy0 + r * 62, t, T.bars + i * .1, { id: 'ob' + i, d: .22, boil: .2 }));
      popIn(ctx, A.ownStay, cx0 + 50, cy0 + 186, t, T.tap + .1, { id: 'ost', d: .25, boil: .2 });
      if (t >= T.tap - .5 && t < T.tap + .7) pointer(ctx, [[T.tap - .45, 1180, 1040], [T.tap, PX + 40, PY + 312], [T.tap + .7, 1200, 1060]], t, { id: 'cur17' });
    }
    popIn(ctx, A.keyB, 1180, 250, t, T.lbl, { id: 'keyb', d: .28, rot: -.1 });
    dropIn(ctx, A.lblOwner, 1500, 290, t, T.lbl, { id: 'lown', rot: .025 });
    A.ownChips.forEach((S, i) => dropIn(ctx, S, 1500, 500 + i * 118, t, T.c[i], { id: 'oc' + i, rot: [-.015, .012, -.012][i], d: .3, dx: 50, dy: 0 }));
  }
});

// 18 — Your own booking website brings guests straight to you, with no channel commission.
scene(18, 18, {
  bg: '#CCE5F1', seed: 37, wipe: 'right', cam: [1.0, 1.035, 960, 580],
  build() {
    const T = this.T = { site: this.start - 1, lbl: w(18, 'website') - .25, walk: w(18, 'brings') - .2, arrive: w(18, 'guests') + .45, arrow: w(18, 'straight') - .05, click: w(18, 'you') + .08, fee: w(18, 'with') - .1, x: w(18, 'no') - .02, off: w(18, 'pay') + .05 };
    cue(T.lbl + .1, 'stamp', { g: .5, pan: -.4 }); for (let i = 0; i < 5; i++) cue(T.walk + .15 + i * .24, 'tap', { g: .3, p: 1 + (i % 2) * .2, pan: .7 });
    cue(T.arrow, 'scribble', { d: .45, g: .4 }); cue(T.click, 'click', { g: .7, pan: -.5 }); cue(T.click + .1, 'pop', { g: .6, p: 1.2, pan: -.4 }); cue(T.click + .15, 'sparkle', { g: .45, pan: -.4 });
    cue(T.fee, 'land', { g: .7, pan: .6 }); cue(T.x, 'thud', { g: .7, pan: .6 }); cue(T.x + .02, 'stamp', { g: .6, pan: .6 }); cue(T.off, 'whoosh', { g: .5, pan: .6 }); cue(T.off + .3, 'stamp', { g: .6, pan: .6 }); cue(T.off + .35, 'ding', { g: .3, pan: .5 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), SX = 690, SY = 630, SS = .96, bx = SX + (181 - 550) * SS, by = SY;
    put(ctx, A.cloud1, 1700 + st * 5, 140, { id: 'c181', s: .75 });
    dropIn(ctx, A.site, SX, SY, t, T.site, { id: 'site18', rot: -.006, s: SS, d: .38 });
    dropIn(ctx, A.lblSite, 520, 165, t, T.lbl, { id: 'lsite', rot: -.03 });
    // guests come straight to it
    const wk = walk(t, T.walk, T.arrive, 2250, 1490), booked = t >= T.click + .1;
    if (t >= T.walk) [['g3', 0], ['g4', 185]].forEach(([k, d], i) => drawPerson(ctx, wk.x + d, 1030 + wk.bob - (booked ? Math.abs(Math.sin((t - T.click) * 9 + i)) * 14 * (1 - prog(t, T.click, 1.2)) : 0), { kind: k, flip: true, s: 1.12, rot: wk.lean, eyes: 'happy', look: 1, armR: booked && !i ? -2.4 + Math.sin(st * 10) * .25 : -.14, id: 'g18' + i }));
    const path = new PB().M(1395, 880).C(1250, 1035, 700, 1020, 400, 1010).C(90, 1000, 60, 700, bx - 100, by + 8).pts, f = prog(t, T.arrow, .5);
    strokePath(ctx, path, f, { dash: [4, 16], w: 8, color: P.red, a: .8 });
    if (f > 0 && f < 1) put(ctx, A.cursor, ...pointAt(path, f), { id: 'cur18', rot: -.1, s: 1.4 }); else if (f >= 1 && t < T.click + .6) put(ctx, A.cursor, bx - 60, by + 10, { id: 'cur18', rot: -.1, s: t >= T.click && t < T.click + .14 ? 1.2 : 1.4 });
    popIn(ctx, A.bookedChip, bx + 232, by + 4, t, T.click + .1, { id: 'bkd', d: .25, rot: -.05 });
    if (booked) [[bx + 380, by - 150, .7], [bx + 470, by - 60, .5]].forEach(([hx, hy, s], i) => popIn(ctx, A.heart, hx, hy - (t - T.click) * 30, t, T.click + .2 + i * .2, { s, id: 'h18' + i, rot: Math.sin(st * 3 + i) * .15 }));
    // and no channel commission
    const FX = 1560, FY = 380;
    if (t < T.off) { dropIn(ctx, A.feeTag, FX, FY, t, T.fee, { id: 'fee', rot: .05, d: .32 }); if (t >= T.x - .1) { const p = prog(t, T.x - .1, .1); put(ctx, A.bigX, FX, FY, { id: 'bx', s: lerp(2, 1, E.in(p)), a: clamp(p * 3), rot: -.05, elev: 1 + 5 * (1 - p) }); } }
    else { flyOut(ctx, A.feeTag, FX, FY, t, T.off, { to: [700, -500], spin: 1.6, rot: .05, d: .4 }); flyOut(ctx, A.bigX, FX, FY, t, T.off, { to: [700, -500], spin: 1.6, rot: -.05, d: .4 }); dropIn(ctx, A.lblNoFee, 1540, 390, t, T.off + .25, { id: 'lnofee', rot: .03 }); }
  }
});

// 19 — Clear reports show how every home is performing.
scene(19, 19, {
  bg: '#F5E5AE', seed: 39, wipe: 'bottom', cam: [1.0, 1.035, 960, 580],
  build() {
    const T = this.T = { win: this.start - 1, k: w(19, 'clear') - .05, bars: w(19, 'every') - .25, line: w(19, 'performing') - .3 };
    this.vals = [[82, v => Math.round(v) + '%', P.green], [48200, v => '€' + (Math.round(v / 100) * 100).toLocaleString('en-US'), P.blue], [164, v => '€' + Math.round(v), P.purple]];
    this.rev = [[.92, '€16.4k'], [.74, '€13.1k'], [.5, '€8.9k'], [.55, '€9.8k']];
    [0, 1, 2].forEach(i => { cue(T.k + i * .15, 'tap', { g: .55, p: 1 + i * .1, pan: -.5 + i * .5 }); for (let j = 0; j < 4; j++) cue(T.k + i * .15 + .1 + j * .1, 'type', { g: .3, p: 1.2 + j * .05, pan: -.5 + i * .5 }); });
    cue(T.bars - .05, 'land', { g: .6, pan: -.3 }); this.rev.forEach((_, i) => cue(T.bars + .1 + i * .12, 'slide', { g: .3, p: 1.4 + i * .1, pan: -.3 }));
    cue(T.line - .1, 'land', { g: .6, pan: .4 }); cue(T.line + .1, 'scribble', { d: .6, g: .4 }); cue(T.line + .75, 'pop', { g: .6, pan: .5 }); cue(T.line + .8, 'sparkle', { g: .4, pan: .5 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), en = enter(t, T.win, .36);
    if (!en.on) return;
    ctx.save(); ctx.translate(960, 600 + en.dy); ctx.rotate(en.rot - .003); ctx.scale(.96 * en.k, .96 * en.k); ctx.translate(-750, -430);
    put(ctx, A.repWin, 750, 430, { id: 'rw', elev: 2 + en.el, boil: .4 });
    A.kpi.forEach((S, i) => {
      if (!dropIn(ctx, S, 120 + i * 440, 96, t, T.k + i * .15, { id: 'kp' + i, d: .28, dy: -16 })) return;
      const [v, fmt, c] = this.vals[i], q = E.out(prog(t, T.k + i * .15 + .1, .6));
      ink(ctx, fmt(v * q), 160 + i * 440, 246, { size: 84, weight: 700, color: c, a: 1 });
    });
    if (dropIn(ctx, A.repA, 120, 312, t, T.bars - .05, { id: 'ra', d: .28, dy: -16 })) this.rev.forEach(([v, l], i) => {
      const q = E.out(prog(t, T.bars + .1 + i * .12, .5)); if (q <= 0) return;
      put(ctx, A.barH[i], 350, 428 + i * 90, { sx: Math.max(.02, v * q), id: 'bh' + i, boil: 0 });
      if (q > .9) ink(ctx, l, 350 + 400 * v + 14, 438 + i * 90, { size: 26, weight: 700, color: P.mute });
    });
    if (dropIn(ctx, A.repB, 840, 312, t, T.line - .1, { id: 'rb', d: .28, dy: -16 })) {
      const pts = [[910, 608], [1070, 567], [1230, 504], [1390, 513]], f = prog(t, T.line + .1, .6);
      strokePath(ctx, pts, f, { w: 9, color: P.green, a: 1 });
      pts.forEach(([x, y], i) => { if (f > 0 && f * 3 >= i) put(ctx, A.dot.g, x, y, { id: 'ld' + i, boil: .2, s: 1.5 }); });
      if (t >= T.line + .75) { const k = E.back(prog(t, T.line + .75, .25)); ctx.save(); ctx.translate(1390, 450); ctx.scale(k, k); paper(ctx, rrect(-62, -30, 124, 60, 30), P.green, { elev: .8, seed: 5 }); ink(ctx, '82%', 0, 13, { size: 36, weight: 700, color: '#fff', align: 'center', a: 1 }); ctx.restore(); }
    }
    ctx.restore();
    if (t >= T.line + .8) sparks(ctx, [[150, 170, .55], [1790, 200, .6], [1800, 960, .45]], t, T.line + .8, st, 's19');
  }
});

// 20 — All of it at your desk, or in your pocket.
scene(20, 20, {
  bg: '#F3D6C8', seed: 41, wipe: 'left', cam: [1.0, 1.03, 960, 600],
  build() {
    const T = this.T = { lap: this.start - 1, desk: w(20, 'desk') - .2, phone: w(20, 'or') - .15, slide: w(20, 'pocket') - .5, lbl: w(20, 'pocket') - .1 };
    cue(T.desk + .1, 'stamp', { g: .5, pan: -.3 }); cue(T.phone, 'pop', { g: .8, pan: .5 }); cue(T.phone + .05, 'boing', { g: .3, pan: .5 });
    cue(T.slide, 'slide', { g: .8, p: .7, pan: .5 }); cue(T.slide + .42, 'tap', { g: .7, p: .8, pan: .5 }); cue(T.lbl + .1, 'stamp', { g: .6, pan: .5 }); cue(T.lbl + .15, 'sparkle', { g: .45, pan: .5 });
  },
  draw(ctx, t) {
    const T = this.T, st = step(t), PX = 1500, OY = 700;
    { const p = prog(t, this.start + .4, .4); drawNinja(ctx, 1010, lerp(520, 236, E.back(p)), { t: st, s: .8, eyes: t >= T.lbl ? 'happy' : 'open', look: 1, rot: .1 + Math.sin(st * 2.3) * .04, id: 'n20' }); }
    dropIn(ctx, A.laptopBig, 640, 925, t, T.lap, { id: 'lpb', rot: -.006, d: .38 });
    dropIn(ctx, A.lblDesk, 420, 190, t, T.desk, { id: 'ldesk', rot: -.04 });
    // the same thing on a phone, which goes into a pocket
    dropIn(ctx, A.pocket, PX, OY - 40, t, T.lap + .1, { id: 'pkt', rot: 0, d: .38, spin: 0 });
    if (t >= T.phone) {
      const p = E.back(prog(t, T.phone, .3)), s = E.inOut(prog(t, T.slide, .45)), y = lerp(370, OY + 160, s);
      ctx.save(); ctx.beginPath(); ctx.rect(PX - 400, -200, 800, OY + 200); ctx.clip();
      put(ctx, A.pocketPhone, PX, y, { id: 'pph', rot: lerp(.07, 0, s), s: p, elev: 1.8 - s });
      ctx.restore();
      if (s > .2) put(ctx, A.pocketLip, PX, OY - 6, { id: 'plip', boil: .2, a: clamp((s - .2) * 4) });
    }
    dropIn(ctx, A.lblPocket, 1490, 300, t, T.lbl, { id: 'lpock', rot: .03 });
    if (t >= T.lbl + .15) sparks(ctx, [[1180, 200, .55], [1830, 440, .5], [150, 960, .45]], t, T.lbl + .15, st, 's20');
  }
});

// Act 3, second half: the guest's side, the team, the money, the website, the reports. Then the finale.
function numDot(x, cx, cy, n, c) { paper(x, ellipse(cx, cy, 26, 26, 30), c, { elev: .3 }); ink(x, String(n), cx, cy + 11, { size: 30, weight: 700, color: '#fff', align: 'center', a: 1 }); }

function buildGuest() {
  // online check-in
  A.ciPhone = phoneFrame(440, 820, {
    draw: (x) => {
      ink(x, 'Online check-in', 44, 112, { size: 38, weight: 700, a: 1 }); ink(x, 'Casa Marina  ·  14 – 17 Aug', 44, 150, { size: 24, weight: 600, color: P.mute });
      [['Scan your ID', 'Passport or ID card'], ['Pay the balance', '€240 due'], ['Leave a deposit', '€200, held on card']].forEach(([a, b], i) => {
        const y = 186 + i * 176; paper(x, rrect(36, y, 368, 156, 18), '#FFFFFF', { elev: .5, amp: .5 }); numDot(x, 78, y + 50, i + 1, [P.blue, P.green, P.purple][i]);
        ink(x, a, 116, y + 60, { size: 30, weight: 700, a: 1 }); ink(x, b, 56, y + 116, { size: 25, weight: 600, color: P.mute });
      });
    }
  });
  A.ciDone = cardSprite(368, 68, P.green, { r: 34, elev: 0, elevS: .8, draw: (x) => { tick(x, 108, 36, 1, '#fff', 6); ink(x, 'All set', 212, 47, { size: 32, weight: 700, color: '#fff', align: 'center', a: 1 }); } });
  A.ciWait = cardSprite(368, 68, '#E4DED3', { r: 34, elev: 0, elevS: .3, draw: (x) => ink(x, '3 steps to go', 184, 46, { size: 28, weight: 700, color: '#8A857B', align: 'center', a: 1 }) });
  const card = (title, draw) => spr(560, 240, (x) => { paper(x, rrect(0, 0, 560, 240, 22), '#FFFDF8', { elev: 0 }); ink(x, title, 286, 66, { size: 40, weight: 700, a: 1 }); draw(x); }, { elev: 1.6 });
  A.ci = [
    card('ID scanned', (x) => {
      paper(x, rrect(26, 34, 232, 156, 14), '#DDEBFA', { elev: .6 }); paper(x, rrect(26, 34, 232, 34, 14).map(([a, b]) => [a, Math.min(b, 68)]), P.blue, { elev: 0, rim: false, amp: .3 });
      paper(x, ellipse(86, 116, 24, 24, 30), '#F6C9A8', { elev: .3 }); paper(x, new PB().M(50, 178).Q(50, 140, 86, 140).Q(122, 140, 122, 178).pts, P.teal, { elev: .3, amp: .4 }); bars(x, 140, 96, [96, 70, 84], { h: 11, gap: 26, color: '#AFC6E4' });
      ink(x, 'Verified by AI', 286, 116, { size: 30, weight: 600, color: P.mute });
    }),
    card('Balance paid', (x) => {
      paper(x, rrect(26, 50, 232, 140, 16), P.slate, { elev: .6, sheen: .2 }); paper(x, rrect(26, 78, 232, 30, 0), '#1F2931', { elev: 0, rim: false }); paper(x, rrect(46, 130, 60, 40, 8), P.gold, { elev: .3 }); bars(x, 124, 146, [110], { h: 12, color: '#8FA1AD' });
      ink(x, '€240', 286, 126, { size: 50, weight: 700, color: P.green, a: 1 });
    }),
    card('Deposit held', (x) => {
      paper(x, new PB().M(142, 30).L(236, 62).L(236, 120).Q(232, 176, 142, 204).Q(52, 176, 48, 120).L(48, 62).pts, P.purple, { elev: .6, sheen: .2 }); glyph(x, 'lock', 142, 120, 50, '#fff', P.purple);
      ink(x, '€200', 286, 126, { size: 50, weight: 700, color: P.purple, a: 1 }); ink(x, 'released after the stay', 286, 170, { size: 24, weight: 600, color: P.mute });
    }),
  ];
  A.scanLine = spr(250, 16, (x) => paper(x, rrect(0, 0, 250, 16, 8), '#3CD0C0', { elev: 0, rim: false, tex: .2 }), { elev: .6 });
  A.lblCheckin = paperText('Online check-in', { size: 72, weight: 700, color: '#fff', backing: P.blue, border: 17 });
  A.miniPhone = phoneFrame(70, 124, { elev: .8 });

  // door code and guidebook
  A.codeCard = spr(420, 210, (x) => {
    paper(x, new PB().M(18, 0).L(402, 0).Q(420, 0, 420, 18).L(420, 164).Q(420, 182, 402, 182).L(150, 182).L(120, 210).L(100, 182).L(18, 182).Q(0, 182, 0, 164).L(0, 18).Q(0, 0, 18, 0).pts, '#FFFFFF', { elev: 0 });
    ink(x, 'Your door code', 28, 50, { size: 32, weight: 700, a: 1 });
    [0, 1, 2, 3].forEach(i => paper(x, rrect(28 + i * 94, 72, 80, 90, 12), '#EEF1F4', { elev: -1, shadowAlpha: 0, rim: false }));
  }, { ax: 120, ay: 210, elev: 1.8 });
  A.digit = [...'4827'].map(d => spr(80, 90, (x) => ink(x, d, 40, 68, { size: 70, weight: 700, family: F.mono, align: 'center', a: 1 }), { elev: 0 }));
  const wifi = (x, cx, cy, c) => { x.save(); x.strokeStyle = c; x.lineWidth = 8; x.lineCap = 'round';[18, 36, 54].forEach(r => { x.beginPath(); x.arc(cx, cy + 26, r, -Math.PI * .75, -Math.PI * .25); x.stroke(); }); x.fillStyle = c; x.beginPath(); x.arc(cx, cy + 26, 7, 0, 7); x.fill(); x.restore(); };
  A.guide = spr(620, 760, (x) => {
    paper(x, rrect(0, 0, 620, 760, 26), '#FFFDF8', { elev: 0 });
    paper(x, rrect(0, 0, 620, 150, 26).map(([a, b]) => [a, Math.min(b, 150)]), P.teal, { elev: .2, rim: false, sheen: .2 });
    ink(x, 'Guidebook', 40, 76, { size: 58, weight: 700, color: '#fff', a: 1 }); ink(x, 'Casa Marina', 42, 122, { size: 30, weight: 600, color: '#fff', a: .9 });
    [['Wi-Fi', '#4C82D9'], ['Parking', '#E86A33'], ['Beaches', '#F2B53A'], ['House rules', '#6F5BD0']].forEach(([t, c], i) => {
      const px = 36 + (i % 2) * 284, py = 186 + Math.floor(i / 2) * 274; paper(x, rrect(px, py, 264, 250, 20), '#FFFFFF', { elev: .6 });
      paper(x, ellipse(px + 132, py + 102, 72, 72, 50), c, { elev: .4, sheen: .2 });
      if (i === 0) wifi(x, px + 132, py + 100, '#fff'); else if (i === 1) ink(x, 'P', px + 132, py + 134, { size: 92, weight: 700, color: '#fff', align: 'center', a: 1 }); else if (i === 2) { paper(x, star(px + 132, py + 102, 50, 34, 12), '#fff', { elev: .2, amp: .3, rim: false }); paper(x, ellipse(px + 132, py + 102, 24, 24, 24), c, { elev: 0, rim: false }); } else glyph(x, 'doc', px + 132, py + 102, 50, '#fff', c);
      ink(x, t, px + 132, py + 222, { size: 34, weight: 700, align: 'center', a: 1 });
    });
  }, { elev: 1.8 });
  A.guideRing = spr(284, 270, (x) => { x.strokeStyle = P.green; x.lineWidth = 9; x.lineJoin = 'round'; x.beginPath(); x.roundRect(8, 8, 268, 254, 22); x.stroke(); }, { elev: 0 });
  A.qb = ['Wi-Fi password?', 'Where do we park?', 'Best beach nearby?'].map(t => { const wd = textW(t, 34, 700) + 56; return spr(wd, 100, (x) => { bubble(x, 0, 0, wd, 76, '#FFFFFF', 'l'); ink(x, t, 28, 50, { size: 34, weight: 700, a: 1 }); }, { elev: 1.4 }); });
  A.lblDay = paperText('On the day', { size: 60, weight: 700, color: P.ink, border: 14 });

  // extras
  A.exPhone = phoneFrame(460, 820, {
    draw: (x) => {
      ink(x, 'Extras', 46, 116, { size: 46, weight: 700, a: 1 }); ink(x, 'Make your stay even better', 46, 154, { size: 24, weight: 600, color: P.mute });
      [['Late check-out', 'Stay until 2 pm', '€25', 'clock', P.orange], ['Airport transfer', 'Door to door', '€40', 'pin', P.blue], ['Breakfast basket', 'Waiting on arrival', '€18', 'heart', P.red]].forEach(([a, b, p, k, c], i) => {
        const y = 190 + i * 196; paper(x, rrect(34, y, 392, 176, 18), '#FFFFFF', { elev: .5, amp: .5 }); paper(x, ellipse(82, y + 56, 32, 32, 40), c, { elev: .3 }); glyph(x, k, 82, y + 56, 20, '#fff', c);
        ink(x, a, 128, y + 50, { size: 29, weight: 700, a: 1 }); ink(x, b, 128, y + 84, { size: 23, weight: 600, color: P.mute }); ink(x, p, 56, y + 146, { size: 38, weight: 700, a: 1 });
        if (i) { paper(x, rrect(250, y + 106, 160, 54, 27), '#ECE7DE', { elev: .2 }); ink(x, 'Add', 330, y + 143, { size: 27, weight: 700, align: 'center', color: P.ink }); }
      });
    }
  });
  A.btnAdd = cardSprite(160, 54, P.red, { r: 27, elev: 0, elevS: .8, draw: (x) => ink(x, 'Add', 80, 37, { size: 27, weight: 700, color: '#fff', align: 'center', a: 1 }) });
  A.btnAdded = cardSprite(160, 54, P.green, { r: 27, elev: 0, elevS: .4, draw: (x) => { tick(x, 30, 28, .7, '#fff', 5); ink(x, 'Added', 96, 37, { size: 26, weight: 700, color: '#fff', align: 'center', a: 1 }); } });
  A.bigClock = spr(400, 400, (x) => {
    paper(x, ellipse(200, 200, 196, 196, 90), P.orange, { elev: 0, sheen: .2 }); paper(x, ellipse(200, 200, 166, 166, 90), '#FFFDF8', { elev: .5 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; paper(x, ellipse(200 + Math.sin(a) * 140, 200 - Math.cos(a) * 140, i % 3 ? 6 : 11, i % 3 ? 6 : 11, 14), i % 3 ? '#C9C3B8' : P.ink, { elev: 0, rim: false }); }
  }, { elev: 1.6 });
  A.lblLate = paperText('Late check-out', { size: 70, weight: 700, color: '#fff', backing: P.orange, border: 16 });
  A.lblPlus = paperText('+ €25', { size: 110, weight: 700, color: '#fff', backing: P.green, border: 22 });
}

function buildOps() {
  A.sched = spr(560, 470, (x) => {
    paper(x, rrect(0, 0, 560, 470, 24), '#FFFDF8', { elev: 0 });
    ink(x, 'Saturday', 30, 60, { size: 42, weight: 700, a: 1 }); ink(x, 'Casa Marina', 218, 60, { size: 30, weight: 600, color: P.mute });
    ['9', '11', '13', '15', '17'].forEach((h, i) => { ink(x, h + ':00', 40 + i * 120, 112, { size: 22, weight: 700, color: '#9A948A', align: 'center' }); x.fillStyle = 'rgba(0,0,0,.07)'; x.fillRect(39 + i * 120, 124, 2, 320); });
    paper(x, new PB().M(10, 140).L(160, 140).L(140, 204).L(10, 204).pts, CH[0][1], { elev: .5, amp: .5 }); ink(x, 'Anna out', 22, 182, { size: 25, weight: 700, color: '#fff', a: 1 });
    paper(x, new PB().M(460, 140).L(550, 140).L(550, 204).L(440, 204).pts, CH[1][1], { elev: .5, amp: .5 }); ink(x, 'Lopez', 468, 182, { size: 24, weight: 700, color: '#fff', a: 1 });
    ink(x, 'Jobs', 30, 270, { size: 28, weight: 700, color: P.mute });
  }, { elev: 1.7 });
  const job = (t, sub, c, k) => spr(360, 78, (x) => { paper(x, rrect(0, 0, 360, 78, 16), c, { elev: 0, sheen: .2 }); glyph(x, k, 42, 39, 24, '#fff', c); ink(x, t, 80, 36, { size: 27, weight: 700, color: '#fff', a: 1 }); ink(x, sub, 80, 64, { size: 21, weight: 600, color: '#fff', a: .9 }); }, { elev: 1.1 });
  A.jobChip = [job('Cleaning · 11:30', 'assigned to Marta', P.blue, 'broom'), job('Check-in · 16:00', 'assigned to Leo', P.green, 'key')];
  A.lblSelf = hand('scheduled automatically', 50, '#3E5C80');
  A.jobPhone = phoneFrame(320, 580, {
    draw: (x) => {
      paper(x, ellipse(54, 100, 12, 12, 16), P.red, { elev: .2, rim: false }); ink(x, 'New job', 76, 112, { size: 34, weight: 700, a: 1 });
      paper(x, rrect(30, 140, 260, 230, 18), '#FFFFFF', { elev: .5 }); paper(x, ellipse(76, 190, 30, 30, 30), P.blue, { elev: .3 }); glyph(x, 'broom', 76, 190, 20, '#fff', P.blue);
      ink(x, 'Cleaning', 120, 200, { size: 32, weight: 700, a: 1 }); ink(x, 'Casa Marina', 50, 268, { size: 30, weight: 700, a: 1 }); ink(x, 'Sat · 11:30', 50, 308, { size: 27, weight: 600, color: P.mute }); ink(x, 'Guests arrive 16:00', 50, 346, { size: 23, weight: 600, color: P.mute });
      paper(x, rrect(30, 400, 260, 68, 34), P.green, { elev: .5 }); ink(x, 'Start', 160, 446, { size: 32, weight: 700, color: '#fff', align: 'center', a: 1 });
    }
  });
  A.report = spr(600, 680, (x) => {
    paper(x, rrect(0, 0, 600, 680, 24), '#FFFDF8', { elev: 0 });
    paper(x, ellipse(66, 66, 36, 36, 40), P.blue, { elev: .3 }); glyph(x, 'broom', 66, 66, 23, '#fff', P.blue);
    ink(x, 'Cleaning', 120, 60, { size: 40, weight: 700, a: 1 }); ink(x, 'Casa Marina · Marta', 120, 96, { size: 27, weight: 600, color: P.mute });
    ['Beds made', 'Bathroom', 'Kitchen'].forEach((t, i) => { paper(x, ellipse(62, 170 + i * 66, 22, 22, 30), '#E9E3D8', { elev: -1, shadowAlpha: 0, rim: false }); ink(x, t, 104, 182 + i * 66, { size: 32, weight: 600 }); });
    ink(x, 'Photos', 36, 392, { size: 28, weight: 700, color: P.mute });
    [0, 1, 2].forEach(i => { x.save(); x.strokeStyle = '#C9C3B8'; x.lineWidth = 3; x.setLineDash([8, 9]); x.beginPath(); x.roundRect(34 + i * 182, 412, 168, 150, 12); x.stroke(); x.restore(); });
  }, { elev: 1.7 });
  const pol = (draw, r) => spr(168, 150, (x) => { paper(x, rrect(0, 0, 168, 150, 10), '#FFFFFF', { elev: 0 }); x.save(); x.beginPath(); x.roundRect(8, 8, 152, 134, 6); x.clip(); draw(x); x.restore(); }, { elev: 1.3 });
  A.photo = [
    pol((x) => { paper(x, rrect(8, 8, 152, 134, 0), '#E8EEF5', { elev: 0, rim: false }); paper(x, rrect(20, 70, 128, 66, 10), '#8FB7E3', { elev: .4 }); paper(x, rrect(26, 56, 50, 32, 10), '#fff', { elev: .4 }); paper(x, rrect(84, 56, 50, 32, 10), '#fff', { elev: .4 }); paper(x, rrect(14, 28, 140, 34, 8), '#C49A6C', { elev: .2 }); }),
    pol((x) => { paper(x, rrect(8, 8, 152, 134, 0), '#DDF0EE', { elev: 0, rim: false }); paper(x, new PB().M(20, 76).L(148, 76).Q(148, 128, 120, 128).L(48, 128).Q(20, 128, 20, 76).pts, '#fff', { elev: .5 }); paper(x, rrect(14, 68, 140, 14, 7), '#EEF5F5', { elev: .3 }); paper(x, rrect(116, 30, 10, 46, 4), '#9AA6AE', { elev: .2 });[[50, 56, 12], [72, 46, 9], [90, 60, 7]].forEach(([a, b, r]) => paper(x, ellipse(a, b, r, r, 14), '#fff', { elev: .2 })); }),
    pol((x) => { paper(x, rrect(8, 8, 152, 134, 0), '#FBEFD9', { elev: 0, rim: false }); paper(x, rrect(8, 92, 152, 50, 0), '#C49A6C', { elev: .3 }); paper(x, rrect(34, 58, 60, 40, 6), '#E4424E', { elev: .4 }); paper(x, rrect(26, 52, 76, 10, 5), '#B7283A', { elev: .2 }); paper(x, rrect(112, 40, 26, 58, 6), '#5FA36B', { elev: .4 }); paper(x, ellipse(125, 34, 20, 14, 14), '#3F7F4E', { elev: .2 }); }),
  ];
  A.lblDone = paperText('Done', { size: 84, weight: 700, color: '#fff', backing: P.green, border: 18 });
  A.flash = spr(260, 260, (x) => paper(x, star(130, 130, 128, 50, 10), '#FFFFFF', { elev: 0, rim: false, tex: .2 }), { elev: 0 });
}

function miniDash(x, px, py, w, h) {
  const tw = (w - 40) / 3;
  [['82%', 'Occupancy', P.green], ['€48k', 'Revenue', P.blue], ['€164', 'Nightly rate', P.purple]].forEach(([v, l, c], i) => { paper(x, rrect(px + i * (tw + 20), py, tw, h * .34, 12), '#FFFFFF', { elev: .4, amp: .4 }); ink(x, v, px + i * (tw + 20) + 14, py + h * .2, { size: h * .13, weight: 700, color: c, a: 1 }); ink(x, l, px + i * (tw + 20) + 14, py + h * .3, { size: h * .06, weight: 600, color: P.mute }); });
  paper(x, rrect(px, py + h * .4, w, h * .6, 12), '#FFFFFF', { elev: .4, amp: .4 });
  [.5, .8, .62, .95, .7, .88].forEach((v, i) => paper(x, rrect(px + 24 + i * (w - 48) / 6, py + h * (.96 - v * .48), (w - 48) / 6 - 14, h * v * .48, 5), [P.red, P.gold, P.blue, P.green, P.purple, P.teal][i], { elev: .2, amp: .3, rim: false }));
}

function buildMoney() {
  // month end
  const page = (n) => spr(260, 300, (x) => { paper(x, rrect(0, 0, 260, 300, 18), '#FFFFFF', { elev: 0 }); paper(x, rrect(0, 0, 260, 84, 18).map(([a, b]) => [a, Math.min(b, 84)]), P.red, { elev: .2, rim: false }); ink(x, 'August', 130, 58, { size: 40, weight: 700, color: '#fff', align: 'center', a: 1 }); ink(x, n, 130, 236, { size: 150, weight: 700, align: 'center', a: 1 });[70, 190].forEach(v => paper(x, rrect(v - 8, -14, 16, 40, 8), '#8A857B', { elev: .4 })); }, { elev: 1.5 });
  A.page30 = page('30'); A.page31 = page('31');
  A.ROWS = [['Booking income', '€4,280', P.ink], ['Cleaning', '– €360', P.ink], ['Channel fees', '– €510', P.ink], ['Management · 20%', '– €856', P.ink]];
  A.statement = spr(680, 720, (x) => {
    paper(x, rrect(0, 0, 680, 720, 22), '#FFFEFA', { elev: 0 });
    paper(x, rrect(0, 0, 680, 130, 22).map(([a, b]) => [a, Math.min(b, 130)]), P.lav, { elev: .2, rim: false });
    ink(x, 'Owner statement', 36, 62, { size: 46, weight: 700, a: 1 }); ink(x, 'Villa Sol  ·  August', 38, 106, { size: 28, weight: 600, color: P.mute });
    A.ROWS.forEach(([l], i) => { ink(x, l, 38, 202 + i * 84, { size: 33, weight: 600 }); x.fillStyle = 'rgba(0,0,0,.07)'; x.fillRect(36, 226 + i * 84, 608, 2); });
    paper(x, rrect(28, 540, 624, 140, 18), '#EAF6EE', { elev: .4 }); ink(x, 'Owner payout', 52, 626, { size: 38, weight: 700, a: 1 });
  }, { elev: 1.8 });
  const tile = (t, k, c) => spr(420, 170, (x) => { paper(x, rrect(0, 0, 420, 170, 22), '#FFFDF8', { elev: 0 }); paper(x, ellipse(86, 85, 56, 56, 50), c, { elev: .4, sheen: .2 }); glyph(x, k, 86, 85, 36, '#fff', c); const ws = t.split(' '); ws.forEach((wd, i) => ink(x, wd, 166, (ws.length > 1 ? 74 : 98) + i * 46, { size: 40, weight: 700, a: 1 })); }, { elev: 1.5 });
  A.docTile = [tile('Owner statements', 'doc', P.green), tile('Commissions', 'percent', P.purple), tile('Invoices', 'envelope', P.blue)];
  A.lblCalc = paperText('calculated for you', { size: 62, weight: 700, color: '#fff', backing: P.purple, border: 15 });

  // owner login
  A.ownPhone = phoneFrame(460, 820, {
    draw: (x) => {
      ink(x, 'Villa Sol', 46, 116, { size: 46, weight: 700, a: 1 }); ink(x, 'Owner view', 46, 154, { size: 25, weight: 600, color: P.mute });
      paper(x, rrect(34, 184, 392, 330, 18), '#FFFFFF', { elev: .5 }); ink(x, 'August', 54, 230, { size: 29, weight: 700, a: 1 });
      miniCal(x, 52, 250, 46, 58, 7, 4, {});
      paper(x, rrect(34, 534, 392, 120, 18), '#EAF6EE', { elev: .5 }); ink(x, 'Next payout', 56, 582, { size: 26, weight: 600, color: P.mute }); ink(x, '€2,554', 56, 632, { size: 46, weight: 700, color: P.green, a: 1 });
      paper(x, rrect(34, 676, 392, 78, 39), P.purple, { elev: .5 }); ink(x, 'Block my own dates', 230, 726, { size: 30, weight: 700, color: '#fff', align: 'center', a: 1 });
    }
  });
  const ob = (n, c, wd) => spr(wd, 40, (x) => { paper(x, rrect(0, 0, wd, 40, 10), c, { elev: 0, amp: .4 }); ink(x, n, 12, 29, { size: 23, weight: 700, color: '#fff', a: 1 }); }, { ax: 0, ay: 20, elev: .6 });
  A.ownBars = [ob('Meyer', CH[1][1], 146), ob('Rossi', CH[2][1], 196), ob('Kim', CH[0][1], 96)]; A.ownStay = ob('My stay', P.purple, 146);
  A.lblOwner = paperText('Owner login', { size: 78, weight: 700, color: '#fff', backing: P.green, border: 18 });
  A.ownChips = ['Their bookings', 'Their statements', 'Their own dates'].map((t, i) => spr(430, 84, (x) => { paper(x, rrect(0, 0, 430, 84, 42), '#FFFDF8', { elev: 0 }); paper(x, ellipse(44, 42, 26, 26, 30), P.green, { elev: .3 }); tick(x, 44, 42, .8, '#fff', 5); ink(x, t, 86, 55, { size: 36, weight: 700, a: 1 }); }, { elev: 1.2 }));
  A.keyB = badge('key', P.gold, 60);

  // the website
  A.lblSite = paperText('Your own website', { size: 72, weight: 700, color: '#fff', backing: P.sea, border: 17 });
  A.feeTag = spr(400, 230, (x) => { paper(x, [[0, 115], [70, 20], [400, 20], [400, 210], [70, 210]], '#FFE8A8', { elev: 0, amp: .8 }); paper(x, ellipse(62, 115, 16, 16, 20), '#F3D6C8', { elev: -1, shadowAlpha: 0, rim: false }); ink(x, '%', 160, 156, { size: 120, weight: 700, color: '#8A5A12', align: 'center', a: 1 }); ink(x, 'channel', 300, 106, { size: 32, weight: 700, color: '#8A5A12', align: 'center', a: 1 }); ink(x, 'commission', 300, 146, { size: 32, weight: 700, color: '#8A5A12', align: 'center', a: 1 }); }, { elev: 1.5 });
  A.bigX = spr(300, 300, (x) => cross(x, 150, 150, 110, P.red, 34), { elev: 1 });
  A.lblNoFee = paperText('Booked direct', { size: 78, weight: 700, color: '#fff', backing: P.green, border: 18 });
  A.bookedChip = chip('Booked', P.green, { size: 34, h: 62, weight: 700, elevS: 1.3 });

  // reports
  A.repWin = appWindow(1500, 860, ['Reports'], 4);
  A.kpi = [['Occupancy', P.green], ['Revenue', P.blue], ['Avg. nightly rate', P.purple]].map(([l, c]) => spr(420, 190, (x) => { paper(x, rrect(0, 0, 420, 190, 20), '#FFFFFF', { elev: 0 }); paper(x, rrect(0, 0, 14, 190, 7), c, { elev: 0, rim: false }); ink(x, l, 40, 56, { size: 30, weight: 700, color: P.mute }); }, { ax: 0, ay: 0, elev: .9 }));
  A.repA = spr(690, 480, (x) => { paper(x, rrect(0, 0, 690, 480, 20), '#FFFFFF', { elev: 0 }); ink(x, 'Revenue by home', 32, 54, { size: 32, weight: 700, a: 1 }); HOMES.forEach((h, i) => ink(x, h.n, 36, 126 + i * 90, { size: 28, weight: 700 })); }, { ax: 0, ay: 0, elev: .9 });
  A.repB = spr(620, 480, (x) => { paper(x, rrect(0, 0, 620, 480, 20), '#FFFFFF', { elev: 0 }); ink(x, 'Occupancy', 32, 54, { size: 32, weight: 700, a: 1 }); for (let i = 0; i < 4; i++) { x.fillStyle = 'rgba(0,0,0,.07)'; x.fillRect(34, 120 + i * 90, 552, 2); }['May', 'Jun', 'Jul', 'Aug'].forEach((m, i) => ink(x, m, 70 + i * 160, 450, { size: 24, weight: 700, color: '#9A948A', align: 'center' })); }, { ax: 0, ay: 0, elev: .9 });
  A.barH = [P.red, P.gold, P.blue, P.green].map(c => spr(400, 44, (x) => paper(x, rrect(0, 0, 400, 44, 10), c, { elev: 0, amp: .4, sheen: .2 }), { ax: 0, ay: 22, elev: .5 }));

  // desk or pocket
  A.laptopBig = spr(980, 640, (x) => {
    paper(x, rrect(70, 0, 840, 560, 24), '#3A4650', { elev: 0, sheen: .15 }); paper(x, rrect(92, 22, 796, 500, 10), '#F6F2EA', { elev: -1, shadowAlpha: 0, rim: false });
    paper(x, rrect(92, 22, 64, 500, 0), P.slate, { elev: 0, rim: false }); paper(x, ellipse(124, 60, 18, 18, 30), P.peach, { elev: .2 }); for (let i = 0; i < 5; i++) paper(x, rrect(110, 106 + i * 56, 28, 28, 8), i === 0 ? P.red : '#4B5C67', { elev: .1, rim: false, amp: .3 });
    miniDash(x, 184, 50, 676, 440);
    paper(x, [[0, 640], [50, 560], [930, 560], [980, 640]], '#C9CED4', { elev: .6, amp: .5 }); paper(x, rrect(400, 580, 180, 26, 8), '#AEB5BC', { elev: 0, rim: false });
  }, { ax: 490, ay: 640, elev: 1.8 });
  A.pocketPhone = phoneFrame(280, 540, { draw: (x) => { paper(x, ellipse(50, 84, 18, 18, 30), P.peach, { elev: .2 }); paper(x, new PB().M(32, 80).Q(50, 62, 68, 80).L(68, 87).Q(50, 73, 32, 87).pts, P.red, { elev: .2, amp: .3 }); ink(x, 'Today', 84, 96, { size: 30, weight: 700, a: 1 });
    [['82%', 'Occupancy', P.green], ['€48k', 'Revenue', P.blue], ['€164', 'Nightly rate', P.purple]].forEach(([v, l, c], i) => { paper(x, rrect(28, 124 + i * 78, 224, 68, 12), '#FFFFFF', { elev: .4, amp: .4 }); ink(x, v, 42, 171 + i * 78, { size: 38, weight: 700, color: c, a: 1 }); ink(x, l, 240, 167 + i * 78, { size: 19, weight: 600, color: P.mute, align: 'right' }); });
    paper(x, rrect(28, 362, 224, 130, 12), '#FFFFFF', { elev: .4, amp: .4 });[.5, .8, .62, .95, .7, .88].forEach((v, i) => paper(x, rrect(44 + i * 33, 480 - v * 100, 22, v * 100, 4), [P.red, P.gold, P.blue, P.green, P.purple, P.teal][i], { elev: .2, amp: .3, rim: false }));
  } });
  A.pocket = spr(560, 520, (x) => {
    paper(x, rrect(0, 0, 560, 520, 0), '#5B86C8', { elev: 0, amp: 1.2 });
    x.save(); x.strokeStyle = '#E8B04A'; x.lineWidth = 5; x.setLineDash([16, 12]); x.lineCap = 'round'; x.beginPath(); x.moveTo(110, 40); x.lineTo(110, 300); x.quadraticCurveTo(110, 420, 280, 440); x.quadraticCurveTo(450, 420, 450, 300); x.lineTo(450, 40); x.stroke(); x.beginPath(); x.moveTo(20, 24); x.lineTo(540, 24); x.stroke(); x.restore();
    paper(x, ellipse(118, 48, 14, 14, 20), '#C98A3A', { elev: .4 }); paper(x, ellipse(442, 48, 14, 14, 20), '#C98A3A', { elev: .4 });
  }, { ax: 280, ay: 0, elev: 2 });
  A.pocketLip = spr(360, 60, (x) => paper(x, new PB().M(0, 0).Q(180, 56, 360, 0).L(360, 60).L(0, 60).pts, '#4C76B6', { elev: 0, amp: .6 }), { ax: 180, ay: 0, elev: 1 });
  A.lblDesk = paperText('at your desk', { size: 64, weight: 700, color: P.ink, border: 15 }); A.lblPocket = paperText('or in your pocket', { size: 64, weight: 700, color: '#fff', backing: P.red, border: 15 });
}

function buildFinale() {
  // a village of homes
  const roofs = [P.red, P.gold, P.blue, P.green, P.orange, P.purple, P.teal];
  A.tiny = roofs.map((c, i) => spr(84, 84, (x) => { paper(x, rrect(16, 38, 52, 44, 3), i % 2 ? '#FFF4E2' : '#FFFFFF', { elev: 0, amp: .4 }); paper(x, [[6, 42], [42, 8], [78, 42]], c, { elev: .5, amp: .4 }); paper(x, rrect(34, 56, 16, 26, 2), shade(c, -.2), { elev: 0, rim: false }); }, { ax: 42, ay: 82, elev: .8 }));
  const hill = (c, ph, amp) => spr(2200, 520, (x) => { const b = new PB().M(0, 520).L(0, 90); for (let i = 0; i <= 44; i++) b.L(i * 50, 80 + Math.sin(i * .33 + ph) * amp + Math.sin(i * 1.1 + ph * 2) * 8); b.L(2200, 520); paper(x, b.pts, c, { elev: 0, amp: 1.4, texName: 'bg' }); }, { ax: 0, ay: 0, elev: 1.5 });
  A.hills = [hill('#A9D59A', .4, 46), hill('#8CC47E', 2.1, 38), hill('#73B266', 4.0, 30)];
  A.hillY = (k, px) => 80 + Math.sin(((px + 140) / 50) * .33 + [.4, 2.1, 4.0][k]) * [46, 38, 30][k] + Math.sin(((px + 140) / 50) * 1.1 + [.4, 2.1, 4.0][k] * 2) * 8;
  A.bigNum = paperText('12,500+', { size: 250, weight: 700, color: P.red, border: 26 });
  A.slotRing = spr(200, 200, (x) => { x.strokeStyle = '#C9C3B8'; x.lineWidth = 6; x.setLineDash([4, 16]); x.lineCap = 'round'; x.beginPath(); x.arc(100, 100, 92, 0, 7); x.stroke(); }, { elev: 0 });
  A.lblProps = paperText('properties run on Rental Ninja', { size: 66, weight: 700, color: P.ink, border: 15 });
  A.rate = [['4.9', 'on G2'], ['4.8', 'on Capterra']].map(([n, l]) => spr(270, 270, (x) => { paper(x, star(135, 135, 133, 112, 18), P.gold, { elev: 0, amp: .6, sheen: .3 }); paper(x, ellipse(135, 135, 98, 98, 60), '#FFFDF8', { elev: .5 }); ink(x, n, 118, 150, { size: 84, weight: 700, align: 'center', a: 1 }); paper(x, star(196, 122, 26, 11, 5), P.gold, { elev: .3, amp: .3 }); ink(x, l, 135, 192, { size: 26, weight: 700, align: 'center', color: '#6B665D' }); }, { elev: 1.6 }));

  // moving in
  A.dayPage = ['1', '2'].map(n => spr(240, 280, (x) => { paper(x, rrect(0, 0, 240, 280, 18), '#FFFFFF', { elev: 0 }); paper(x, rrect(0, 0, 240, 80, 18).map(([a, b]) => [a, Math.min(b, 80)]), P.green, { elev: .2, rim: false }); ink(x, 'Day', 120, 56, { size: 42, weight: 700, color: '#fff', align: 'center', a: 1 }); ink(x, n, 120, 222, { size: 150, weight: 700, align: 'center', a: 1 });[64, 176].forEach(v => paper(x, rrect(v - 8, -14, 16, 40, 8), '#8A857B', { elev: .4 })); }, { elev: 1.5 }));
  A.box = ['Listings', 'Bookings', 'Guests'].map(t => spr(250, 210, (x) => { paper(x, rrect(10, 40, 230, 170, 8), '#D9A869', { elev: 0, amp: .8 }); paper(x, [[0, 46], [26, 8], [224, 8], [250, 46]], '#E6BD84', { elev: .5, amp: .6 }); paper(x, rrect(106, 8, 38, 110, 3), '#F3E3C3', { elev: .2, rim: false }); paper(x, rrect(30, 124, 190, 60, 8), '#FFFDF8', { elev: .3 }); ink(x, t, 125, 166, { size: 34, weight: 700, align: 'center', a: 1 }); }, { ax: 125, ay: 210, elev: 1.4 }));
  A.acctWin = appWindow(940, 600, ['Your account'], 0);
  A.chipFree = chip('Free onboarding', P.green, { size: 40, h: 80, weight: 700, elevS: 1.3 });
  A.lblDays = paperText('a day or two', { size: 70, weight: 700, color: P.ink, border: 16 });

  // three promises
  A.claims = [['Less busywork.', P.blue], ['Happier guests.', P.orange], ['More bookings.', P.green]].map(([t, c]) => paperText(t, { size: 124, weight: 700, color: '#FFFFFF', backing: c, border: 22 }));
  A.claimIco = [badge('doc', P.blue, 92), badge('heart', P.orange, 92), badge('calendar', P.green, 92)];

  // end card
  A.tagline = paperText('Your whole rental business, in one place.', { size: 56, weight: 600, color: P.ink, backing: '#FFFDF8', border: 17 });
  A.btnDemo = cardSprite(440, 116, P.red, { r: 58, elev: 0, elevS: 1.6, draw: (x) => ink(x, 'Book a demo', 220, 76, { size: 52, weight: 700, color: '#fff', align: 'center', a: 1 }) });
  A.url = chip('rental-ninja.com', '#FFFDF8', { size: 34, h: 74, color: P.ink, weight: 700, elevS: 1, padX: 56 });
}

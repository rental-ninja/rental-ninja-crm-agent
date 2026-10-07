// Act 3, first half: channels, the shared calendar, the inbox, automations, smart pricing.
const CH = [['Airbnb', '#E0666F'], ['Booking.com', '#3A68B8'], ['Vrbo', '#2B7C93']];

function buildChannels() {
  // the listing, assembled once
  A.listBase = cardSprite(580, 690, '#FFFDF8', { r: 26, elev: 0, elevS: 1.8 });
  A.listPhoto = spr(530, 270, (x) => thumb(x, 0, 0, 530, 270, { r: 16, hx: .4, hs: .32 }), { elev: .9 });
  A.listText = spr(530, 150, (x) => { ink(x, 'Casa Marina', 0, 50, { size: 56, weight: 700, a: 1 }); ink(x, 'Sleeps 4  ·  2 bedrooms  ·  Sea view', 0, 100, { size: 29, weight: 600, color: '#6B665D' }); let cx = 0;['Wi-Fi', 'Pool', 'Parking'].forEach(t => { const wd = textW(t, 24, 600) + 34; paper(x, rrect(cx, 116, wd, 32, 16), '#E8F3F5', { elev: .2, rim: false }); ink(x, t, cx + wd / 2, 139, { size: 24, weight: 600, color: P.seaD, align: 'center' }); cx += wd + 10; }); }, { elev: 0 });
  A.listPrice = spr(530, 86, (x) => { ink(x, '€180', 0, 60, { size: 58, weight: 700, a: 1 }); ink(x, '/ night', 150, 58, { size: 30, weight: 600, color: '#6B665D' }); }, { elev: 0 });
  A.btnPublish = cardSprite(230, 78, P.red, { r: 39, elev: 0, elevS: 1.2, draw: (x) => ink(x, 'Publish', 115, 52, { size: 34, weight: 700, color: '#fff', align: 'center', a: 1 }) });
  A.btnPublished = cardSprite(230, 78, P.green, { r: 39, elev: 0, elevS: .5, draw: (x) => { tick(x, 44, 40, 1, '#fff', 6); ink(x, 'Live', 130, 52, { size: 34, weight: 700, color: '#fff', align: 'center', a: 1 }); } });
  A.lblOnce = paperText('Create it once', { size: 66, weight: 700, color: '#fff', backing: P.red, border: 16 });
  // channel cards: the same listing, live on each
  A.chCard = CH.map(([n, c]) => spr(470, 170, (x) => {
    paper(x, rrect(0, 0, 470, 170, 20), '#FFFFFF', { elev: 0 });
    paper(x, rrect(0, 0, 470, 56, 20).map(([a, b]) => [a, Math.min(b, 56)]), c, { elev: .2, rim: false }); ink(x, n, 22, 40, { size: 32, weight: 700, color: '#fff', a: 1 });
    thumb(x, 18, 70, 120, 84, { r: 8, hs: .34 }); ink(x, 'Casa Marina', 154, 106, { size: 30, weight: 700, a: 1 }); ink(x, '€180 / night', 154, 142, { size: 24, weight: 600, color: '#6B665D' });
  }, { elev: 1.5 }));
  A.live = chip('Live', P.green, { size: 26, h: 46, weight: 700, elevS: .8 });
  const small = ['Expedia', 'Google', 'Agoda', 'Holidu', 'Trip.com', 'Home2Go', 'Despegar', 'Whimstay', 'Blueground'];
  const cols = ['#F2B53A', '#4C82D9', '#C8583A', '#E86A33', '#2E6FD0', '#1FA396', '#6F5BD0', '#D14D8B', '#3A4650'];
  A.chSmall = small.map((n, i) => chip(n, '#FFFFFF', { size: 30, h: 60, color: cols[i], weight: 700, elevS: 1.1, padX: 44 }));
  A.lbl50 = paperText('50+ channels', { size: 92, weight: 700, color: '#fff', backing: P.blue, border: 20 });
  A.packet = spr(64, 48, (x) => { thumb(x, 0, 0, 64, 48, { r: 8, hs: .36, sun: false }); }, { elev: 1.4 });

  // the shared calendar
  const DW = 58, X0 = 240, Y0 = 140, RH = 110;
  A.calBoard = spr(1080, 600, (x) => {
    paper(x, rrect(0, 0, 1080, 600, 24), '#FFFDF8', { elev: 0, sheen: .08 });
    ink(x, 'Calendar', 28, 52, { size: 38, weight: 700, a: 1 }); ink(x, 'August', 204, 52, { size: 30, weight: 600, color: P.mute });
    for (let d = 0; d < 14; d++) { ink(x, String(d + 1), X0 + d * DW + DW / 2, 117, { size: 27, weight: 700, color: (d % 7 === 5 || d % 7 === 6) ? P.red : '#6F6A62', align: 'center' }); }
    HOMES.forEach((h, r) => {
      const y = Y0 + r * RH; x.fillStyle = 'rgba(0,0,0,.07)'; x.fillRect(16, y, 1048, 2);
      thumb(x, 22, y + 22, 84, 66, { ...h, r: 8, sun: false }); ink(x, h.n.split(' ')[0], 118, y + 50, { size: 27, weight: 700, a: 1 }); ink(x, h.n.split(' ')[1], 118, y + 81, { size: 27, weight: 700, a: 1 });
      for (let d = 0; d < 14; d++) paper(x, rrect(X0 + d * DW + 2, y + 10, DW - 4, RH - 20, 6), (d % 7 === 5 || d % 7 === 6) ? '#F6EFE3' : '#F2EFE8', { elev: 0, rim: false, amp: .2, tex: .4 });
    });
  }, { elev: 1.8 });
  const bar = (d0, d1, col, name) => spr((d1 - d0) * DW, 62, (x, wd) => { paper(x, new PB().M(18, 0).L(wd - 4, 0).L(wd - 22, 62).L(0, 62).pts, col, { elev: 0, amp: .5, sheen: .2 }); ink(x, name, 28, 43, { size: 30, weight: 700, color: '#fff', a: 1 }); }, { ax: 0, ay: 31, elev: .9 });
  A.calGeom = { DW, X0, Y0, RH, at: (row, d0) => [X0 + (d0 - 1) * DW + DW / 2, Y0 + row * RH + RH / 2] };
  A.bk = [[0, 2, 5, CH[0][1], 'Anna'], [1, 1, 4, CH[1][1], 'Meyer'], [1, 8, 13, CH[2][1], 'Rossi'], [2, 4, 9, CH[0][1], 'Dubois'], [3, 6, 8, CH[1][1], 'Kim'], [3, 11, 14, CH[0][1], 'Silva']].map(([row, d0, d1, c, n]) => ({ row, d0, S: bar(d0, d1, c, n) }));
  A.bkNew = { row: 0, d0: 9, S: bar(9, 12, CH[1][1], 'Lopez') };
  A.chCal = CH.map(([n, c]) => spr(440, 200, (x) => {
    paper(x, rrect(0, 0, 440, 200, 20), '#FFFFFF', { elev: 0 });
    paper(x, rrect(0, 0, 440, 56, 20).map(([a, b]) => [a, Math.min(b, 56)]), c, { elev: .2, rim: false }); ink(x, n, 20, 40, { size: 31, weight: 700, color: '#fff', a: 1 });
    ink(x, 'Casa Marina', 20, 98, { size: 27, weight: 700, a: 1 });
    for (let d = 0; d < 14; d++) paper(x, rrect(20 + d * 29, 120, 25, 58, 5), (d >= 1 && d < 4) ? '#C9C3B8' : '#DDF0E2', { elev: 0, rim: false, amp: .2 });
  }, { elev: 1.5 }));
  A.chBlock = spr(87, 58, (x) => { [0, 1, 2].forEach(i => paper(x, rrect(i * 29, 0, 25, 58, 5), '#C9C3B8', { elev: 0, rim: false, amp: .2 })); }, { ax: 0, ay: 0, elev: .3 });
  A.lblRT = paperText('in real time', { size: 60, weight: 700, color: '#fff', backing: P.green, border: 15 });
  A.stampSm = paperText('DOUBLE BOOKING', { size: 64, weight: 700, color: '#fff', backing: P.red, border: 14 });
  A.boltB = badge('bolt', P.gold, 46, { col: '#fff' });
}

function buildInbox() {
  A.inboxWin = appWindow(1500, 860, ['Inbox'], 1);
  const rows = [['Anna', 'Airbnb', CH[0][1], '#F2B53A'], ['Marc', 'Booking.com', CH[1][1], '#EE8A68'], ['Yuki', 'Vrbo', CH[2][1], '#6F5BD0'], ['Lena', 'Website', P.green, '#4C82D9']];
  A.conv = rows.map(([n, ch, c, av], i) => spr(450, 112, (x) => {
    paper(x, rrect(0, 0, 450, 112, 16), i === 0 ? '#F4EFFC' : '#FFFFFF', { elev: 0, amp: .5 });
    paper(x, ellipse(54, 56, 34, 34, 40), av, { elev: .4 }); ink(x, n[0], 54, 70, { size: 38, weight: 700, color: '#fff', align: 'center', a: 1 });
    ink(x, n, 104, 48, { size: 31, weight: 700, a: 1 });
    const wd = textW(ch, 23, 700) + 24; paper(x, rrect(104 + textW(n, 31, 700) + 14, 22, wd, 36, 18), c, { elev: .2, rim: false }); ink(x, ch, 104 + textW(n, 31, 700) + 14 + wd / 2, 48, { size: 23, weight: 700, color: '#fff', align: 'center', a: 1 });
    bars(x, 104, 72, [250 - i * 30], { h: 13 });
    paper(x, ellipse(416, 56, 10, 10, 16), P.red, { elev: .3, rim: false });
  }, { elev: 1 }));
  A.threadHead = spr(820, 70, (x) => { ink(x, 'Anna', 0, 46, { size: 42, weight: 700, a: 1 }); ink(x, '· Casa Marina · 14 – 17 Aug', 118, 46, { size: 28, weight: 600, color: P.mute }); }, { ax: 0, ay: 0, elev: 0 });
  A.guestBub = spr(640, 110, (x) => { bubble(x, 0, 0, 640, 84, '#FFFFFF', 'l'); ink(x, 'Hi! What time can we check in on Friday?', 24, 53, { size: 30, weight: 600, a: 1 }); }, { ax: 0, ay: 0, elev: 1 });
  A.draftBox = spr(840, 250, (x) => {
    paper(x, rrect(0, 0, 840, 250, 20), '#F4EFFC', { elev: 0 });
    x.save(); x.strokeStyle = P.purple; x.lineWidth = 4; x.setLineDash([3, 12]); x.lineCap = 'round'; x.beginPath(); x.roundRect(8, 8, 824, 234, 16); x.stroke(); x.restore();
    paper(x, rrect(22, 20, 226, 46, 23), P.purple, { elev: .4 }); paper(x, sparkle(48, 43, 14), '#fff', { elev: .2, amp: .3 }); ink(x, 'Smart draft', 70, 53, { size: 26, weight: 700, color: '#fff', a: 1 });
  }, { ax: 0, ay: 0, elev: 1.1 });
  A.btnSend = cardSprite(190, 72, P.red, { r: 36, elev: 0, elevS: 1.2, draw: (x) => { ink(x, 'Send', 82, 49, { size: 34, weight: 700, color: '#fff', align: 'center', a: 1 }); glyph(x, 'plane', 150, 36, 18, '#fff', P.red); } });
  A.sentBub = spr(740, 150, (x) => { bubble(x, 0, 0, 740, 124, '#2F8FA8', 'r'); ink(x, 'Hi Anna! Check-in is from 3 pm.', 26, 50, { size: 30, weight: 600, color: '#fff', a: 1 }); ink(x, 'I’ll send your door code on Friday morning.', 26, 94, { size: 30, weight: 600, color: '#fff', a: 1 }); }, { ax: 740, ay: 0, elev: 1.1 });
  A.sentTag = chip('Sent', P.green, { size: 24, h: 42, weight: 700, elevS: .7 });
  A.lblInbox = paperText('One inbox', { size: 70, weight: 700, color: '#fff', backing: P.purple, border: 16 });
  A.envelope = spr(110, 80, (x) => glyph(x, 'envelope', 55, 40, 50, '#FFFDF8', '#8A857B'), { elev: 1.5 });

  // automations
  A.lblAuto = paperText('Automations', { size: 84, weight: 700, color: '#fff', backing: P.orange, border: 18 });
  const node = (t, kind, c) => spr(260, 200, (x) => { paper(x, ellipse(130, 56, 50, 50, 50), '#FFFDF8', { elev: 0 }); paper(x, ellipse(130, 56, 40, 40, 50), c, { elev: .4 }); glyph(x, kind, 130, 56, 26, '#fff', c); ink(x, t, 130, 150, { size: 30, weight: 700, align: 'center', a: 1 }); }, { ax: 130, ay: 56, elev: 1.1 });
  A.node = [node('Booked', 'calendar', P.blue), node('2 days before', 'clock', P.gold), node('Check-in', 'key', P.green), node('Check-out', 'house', P.teal), node('After the stay', 'star', P.purple)];
  const msg = (title, sub, kind, c) => spr(430, 190, (x) => {
    paper(x, new PB().M(18, 0).L(412, 0).Q(430, 0, 430, 18).L(430, 144).Q(430, 162, 412, 162).L(240, 162).L(215, 190).L(190, 162).L(18, 162).Q(0, 162, 0, 144).L(0, 18).Q(0, 0, 18, 0).pts, '#FFFFFF', { elev: 0 });
    paper(x, ellipse(58, 60, 38, 38, 40), c, { elev: .4 }); glyph(x, kind, 58, 60, 25, '#fff', c);
    ink(x, title, 110, 56, { size: 31, weight: 700, a: 1 }); ink(x, sub, 110, 94, { size: 25, weight: 600, color: P.mute });
  }, { ax: 215, ay: 190, elev: 1.6 });
  A.msg = [msg('Booking confirmed', 'sent the moment they book', 'envelope', P.blue), msg('How to get here', 'sent 2 days before', 'pin', P.gold), msg('How was your stay?', 'sent after check-out', 'star', P.purple)];
  A.stars = spr(200, 40, (x) => [0, 1, 2, 3, 4].forEach(i => paper(x, star(20 + i * 40, 20, 17, 7.5, 5), P.gold, { elev: .2, amp: .3, rim: false })), { elev: .3 });
  A.planeS = spr(80, 70, (x) => glyph(x, 'plane', 40, 35, 36, '#FFFFFF', '#D9D3C8'), { elev: 1.8 });
  A.clockB = badge('clock', P.green, 70);
  A.marker = spr(100, 110, (x) => { glyph(x, 'pin', 50, 52, 52, P.red, '#fff'); }, { ax: 50, ay: 98, elev: 1.6 });
  A.lblMoment = paperText('at just the right moment', { size: 54, weight: 700, color: P.ink, border: 13 });
  A.autoChips = ['Payment reminder', 'Welcome message', 'Check-out instructions', 'Team alert'].map((t, i) => chip(t, '#FFFDF8', { size: 32, h: 66, color: [P.blue, P.green, P.teal, P.orange][i], weight: 700, elevS: 1.1, padX: 54 }));
  A.lblAlso = hand('and whatever else you set up:', 46, '#7A6A3A');
}

function buildPricing() {
  const CW = 150, CHh = 200;
  A.priceCal = spr(1130, 640, (x) => {
    paper(x, rrect(0, 0, 1130, 640, 24), '#FFFDF8', { elev: 0, sheen: .08 });
    ink(x, 'Casa Marina', 30, 58, { size: 40, weight: 700, a: 1 }); ink(x, '· rates', 262, 58, { size: 32, weight: 600, color: P.mute }); paper(x, rrect(470, 34, 34, 28, 6), '#CFC7EE', { elev: 0, rim: false }); ink(x, 'demand', 514, 58, { size: 28, weight: 700, color: P.purple });
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((d, i) => ink(x, d, 40 + i * CW + CW / 2, 118, { size: 26, weight: 700, color: i >= 4 && i < 6 ? P.red : '#6F6A62', align: 'center' }));
    for (let j = 0; j < 2; j++) for (let i = 0; i < 7; i++) { paper(x, rrect(40 + i * CW + 5, 136 + j * (CHh + 40) + 5, CW - 10, CHh + 30, 12), '#F4F1EA', { elev: 0, rim: false, amp: .3, tex: .4 }); ink(x, String(j * 7 + i + 4), 40 + i * CW + 22, 136 + j * (CHh + 40) + 44, { size: 27, weight: 700, color: '#77726A' }); }
  }, { elev: 1.8 });
  A.priceGeom = { CW, CHh, cell: (k) => [40 + (k % 7) * CW + CW / 2, 136 + Math.floor(k / 7) * (CHh + 40)] };
  A.smartChip = spr(300, 60, (x) => { paper(x, rrect(0, 0, 300, 60, 30), P.purple, { elev: 0, sheen: .2 }); paper(x, sparkle(36, 30, 16), '#fff', { elev: .2, amp: .3 }); ink(x, 'Smart pricing', 62, 41, { size: 30, weight: 700, color: '#fff', a: 1 }); }, { elev: 1.2 });
  const tag = (txt, bg, fg) => spr(124, 66, (x) => { paper(x, rrect(0, 0, 124, 66, 14), bg, { elev: 0, amp: .5 }); ink(x, txt, 62, 46, { size: 38, weight: 700, color: fg, align: 'center', a: 1 }); }, { elev: .8 });
  A.tagBase = tag('€180', '#FFFFFF', P.ink); A.tagUp = ['€235', '€250'].map(t => tag(t, '#2E9A63', '#fff')); A.tagDown = ['€155', '€149'].map(t => tag(t, '#4C82D9', '#fff'));
  A.arrUp = spr(44, 44, (x) => paper(x, [[22, 2], [42, 26], [30, 26], [30, 42], [14, 42], [14, 26], [2, 26]], P.green, { elev: 0, amp: .3 }), { elev: .8 });
  A.arrDown = spr(44, 44, (x) => paper(x, [[22, 42], [42, 18], [30, 18], [30, 2], [14, 2], [14, 18], [2, 18]], P.blue, { elev: 0, amp: .3 }), { elev: .8 });
  A.demBar = spr(110, 100, (x) => paper(x, rrect(0, 0, 110, 100, 8), '#CFC7EE', { elev: 0, rim: false, amp: .4 }), { ax: 55, ay: 100, elev: .2 });
  A.bookedTag = spr(132, 50, (x) => { paper(x, rrect(0, 0, 132, 50, 25), P.ink, { elev: 0 }); ink(x, 'Booked', 66, 35, { size: 27, weight: 700, color: '#fff', align: 'center', a: 1 }); }, { elev: 1.1 });
  A.lblDemand = hand('demand', 54, P.purple);
  A.revCard = spr(360, 470, (x) => { paper(x, rrect(0, 0, 360, 470, 24), '#FFFDF8', { elev: 0 }); ink(x, 'Revenue', 30, 60, { size: 40, weight: 700, a: 1 }); ink(x, 'this month', 30, 96, { size: 26, weight: 600, color: P.mute }); paper(x, rrect(30, 420, 300, 12, 6), '#E4DED3', { elev: 0, rim: false }); }, { elev: 1.6 });
  A.coinFlat = spr(150, 40, (x) => { paper(x, rrect(0, 6, 150, 30, 15), '#E09A22', { elev: 0 }); paper(x, rrect(0, 0, 150, 30, 15), P.gold, { elev: .3, sheen: .3 }); }, { elev: .7 });
  A.upChip = chip('▲ up', P.green, { size: 34, h: 60, weight: 700, elevS: 1.1 });
}

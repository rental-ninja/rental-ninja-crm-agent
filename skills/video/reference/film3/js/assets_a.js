// Acts 1 and 2: the welcome, the mess, the double booking, the calmer way, the hub.
function miniWin(x, w, h, title, accent, body) {
  paper(x, rrect(0, 0, w, h, 16), '#FFFFFF', { elev: 0, sheen: .08 });
  paper(x, rrect(0, 0, w, 40, 16).map(([a, b]) => [a, Math.min(b, 40)]), '#ECE7DE', { elev: .2, rim: false });
  [P.red, P.gold, P.green].forEach((c, i) => paper(x, ellipse(20 + i * 18, 20, 6, 6, 14), c, { elev: .2, rim: false }));
  paper(x, rrect(0, 40, w, 50, 0), accent, { elev: .2, rim: false, amp: .3 });
  ink(x, title, 18, 75, { size: 28, weight: 700, color: '#fff', a: 1 });
  if (body) body(x, w, h);
}
function miniCal(x, px, py, cw, ch, cols, rows, marks = {}) {
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const k = j * cols + i; paper(x, rrect(px + i * (cw + 4), py + j * (ch + 4), cw, ch, 4), marks[k] || '#EEE9DF', { elev: 0, rim: false, amp: .3 }); }
}
function bubble(x, px, py, w, h, col, tail = 'l') {
  const b = new PB().M(px + 14, py).L(px + w - 14, py).Q(px + w, py, px + w, py + 14).L(px + w, py + h - 14).Q(px + w, py + h, px + w - 14, py + h);
  if (tail === 'r') b.L(px + w - 24, py + h).L(px + w - 14, py + h + 18).L(px + w - 50, py + h);
  b.L(px + (tail === 'l' ? 50 : 14), py + h); if (tail === 'l') b.L(px + 14, py + h + 18).L(px + 24, py + h);
  b.L(px + 14, py + h).Q(px, py + h, px, py + h - 14).L(px, py + 14).Q(px, py, px + 14, py);
  paper(x, b.pts, col, { elev: .5, amp: .5 });
}
function buildActOne() {
  A.signCasa = spr(250, 210, (x) => { paper(x, rrect(114, 70, 22, 140, 4), '#A97A4F', { elev: 0 }); paper(x, rrect(0, 0, 250, 92, 12), '#E9C79A', { elev: .6, amp: 1 }); ink(x, 'Casa Marina', 125, 60, { size: 40, weight: 700, family: F.hand, color: '#5B3A29', align: 'center', a: 1 }); }, { ax: 125, ay: 208, elev: 1.1 });
  // the desk and what piles up on it
  A.plant = spr(200, 260, (x) => { [[100, 150, -.5], [100, 150, .5], [100, 150, 0], [100, 150, -1.0], [100, 150, 1.0]].forEach(([px, py, r], i) => { x.save(); x.translate(px, py); x.rotate(r); paper(x, new PB().M(0, 0).Q(-34, -70, 0, -140 + Math.abs(r) * 30).Q(34, -70, 0, 0).pts, i % 2 ? P.leafD : P.leaf, { elev: .4, amp: .6 }); x.restore(); }); paper(x, [[50, 150], [150, 150], [136, 256], [64, 256]], '#C9744B', { elev: .5 }); paper(x, rrect(42, 140, 116, 28, 8), '#D98A5F', { elev: .5 }); }, { ax: 100, ay: 256, elev: 1.2 });
  A.wallCal = spr(250, 270, (x) => { paper(x, rrect(0, 0, 250, 270, 12), '#FFFFFF', { elev: 0 }); paper(x, rrect(0, 0, 250, 66, 12).map(([a, b]) => [a, Math.min(b, 66)]), P.sea, { elev: .2, rim: false }); ink(x, 'This week', 125, 45, { size: 30, weight: 700, color: '#fff', align: 'center', a: 1 }); miniCal(x, 18, 84, 26, 36, 7, 1, { 4: '#F9C4C4', 5: '#F9C4C4', 6: '#F9C4C4' }); glyph(x, 'heart', 196, 160, 22, P.red); ink(x, 'Guests arrive', 20, 170, { size: 25, weight: 700 }); ink(x, 'Friday, 3 pm', 20, 204, { size: 23, weight: 600, color: P.mute }); bars(x, 20, 228, [180], { h: 10 }); }, { elev: 1.1 });
  A.framePic = spr(330, 260, (x) => { paper(x, rrect(0, 0, 330, 260, 8), '#C49A6C', { elev: 0 }); paper(x, rrect(16, 16, 298, 228, 4), '#FFFDF8', { elev: -1, shadowAlpha: 0 }); thumb(x, 30, 30, 270, 200, { r: 4 }); }, { elev: 1.1 });
  A.desk = spr(2200, 300, (x) => { paper(x, rrect(0, 30, 2200, 270, 0), '#B98A5C', { elev: 0, texName: 'bg', amp: .4 }); paper(x, rrect(0, 0, 2200, 44, 8), '#D2A878', { elev: .8, amp: .8 }); }, { ax: 0, ay: 0, elev: 1.8 });
  A.laptop = spr(460, 300, (x) => {
    paper(x, rrect(40, 0, 380, 250, 16), '#3A4650', { elev: 0, sheen: .15 }); paper(x, rrect(54, 14, 352, 214, 8), '#F6F2EA', { elev: -1, shadowAlpha: 0, rim: false });
    bars(x, 72, 40, [300, 240, 280, 180], { h: 12, gap: 30 }); paper(x, rrect(72, 170, 110, 36, 18), P.red, { elev: .3 });
    paper(x, [[0, 300], [26, 250], [434, 250], [460, 300]], '#C9CED4', { elev: .6, amp: .5 }); paper(x, rrect(180, 262, 100, 18, 6), '#AEB5BC', { elev: 0, rim: false });
  }, { ax: 230, ay: 298, elev: 1.4 });
  const R = '#F3B0B0';
  const TABS = [
    ['Airbnb', '#E0666F', (x) => { thumb(x, 16, 104, 150, 100, { r: 8 }); bars(x, 182, 114, [170, 130], { h: 12, gap: 26 }); ink(x, '€120', 182, 196, { size: 34, weight: 700, a: 1 }); }],
    ['Booking.com', '#3A68B8', (x) => { miniCal(x, 18, 106, 44, 26, 7, 4, { 9: R, 10: R, 11: R, 17: '#BFE0C8', 18: '#BFE0C8' }); ink(x, '€135', 368, 236, { size: 30, weight: 700, a: 1, align: 'right' }); }],
    ['Vrbo', '#2B7C93', (x) => { thumb(x, 16, 104, 150, 100, { r: 8, roof: P.blue, sky: '#D9EBF3' }); bars(x, 182, 114, [160, 120], { h: 12, gap: 26 }); ink(x, '€129', 182, 196, { size: 34, weight: 700, a: 1 }); }],
    ['Prices', '#2E9A63', (x) => { ['Site 1', 'Site 2', 'Site 3'].forEach((s, i) => { ink(x, s, 20, 130 + i * 40, { size: 24, weight: 600, color: P.mute }); ink(x, ['€120', '€135', '€129'][i], 360, 130 + i * 40, { size: 26, weight: 700, align: 'right', color: i === 1 ? P.red : P.ink, a: 1 }); }); }],
    ['Calendar', '#E09A22', (x) => { miniCal(x, 18, 106, 44, 26, 7, 4, { 2: '#F7C8B8', 3: '#F7C8B8', 4: '#F7C8B8', 12: '#BFD6F2', 13: '#BFD6F2', 22: '#CFC7EE', 23: '#CFC7EE', 24: '#CFC7EE' }); }],
    ['Messages', '#6F5BD0', (x) => { [0, 1, 2].forEach(i => { paper(x, ellipse(38, 124 + i * 44, 15, 15, 20), ['#F2B53A', '#EE8A68', '#4C82D9'][i], { elev: .2, rim: false }); bars(x, 66, 118 + i * 44, [220 - i * 40], { h: 12 }); paper(x, ellipse(346, 124 + i * 44, 9, 9, 14), P.red, { elev: .2, rim: false }); }); }],
  ];
  A.tabs = TABS.map(([t, c, body]) => spr(380, 250, (x) => miniWin(x, 380, 250, t, c, body), { elev: 1.4 }));
  A.sheetX = spr(470, 330, (x) => {
    paper(x, rrect(0, 0, 470, 330, 10), '#FFFFFF', { elev: 0 });
    paper(x, rrect(0, 0, 470, 50, 10).map(([a, b]) => [a, Math.min(b, 50)]), '#2E8B57', { elev: .2, rim: false });
    ink(x, 'bookings_FINAL_v7.xlsx', 16, 34, { size: 24, weight: 700, color: '#fff', family: F.mono, a: 1 });
    for (let j = 0; j < 6; j++) for (let i = 0; i < 5; i++) { const c = (i === 3 && j === 2) ? '#F7B6B6' : (j === 0 ? '#E3EFE6' : (i === 1 && j === 4) ? '#FFE9A6' : '#F7F5F0'); paper(x, rrect(12 + i * 90, 62 + j * 43, 86, 39, 3), c, { elev: 0, rim: false, amp: .2 }); if (j > 0 && (i + j) % 2) bars(x, 22 + i * 90, 77 + j * 43, [50], { h: 9 }); }
    ink(x, '#REF!', 325, 176, { size: 20, weight: 700, color: P.red, family: F.mono, align: 'center', a: 1 });
  }, { elev: 1.5 });
  A.phoneBuzz = phoneFrame(180, 340, { draw: (x) => { [0, 1, 2, 3].forEach(i => { paper(x, rrect(18, 52 + i * 62, 144, 52, 12), '#FFFFFF', { elev: .4, amp: .3 }); paper(x, ellipse(40, 78 + i * 62, 12, 12, 16), [P.red, P.blue, P.gold, P.purple][i], { elev: .2, rim: false }); bars(x, 60, 66 + i * 62, [86, 60], { h: 8, gap: 16 }); }); } });
  A.counts = ['3', '12', '27'].map(n => spr(84, 84, (x) => { paper(x, ellipse(42, 42, 40, 40, 40), P.red, { elev: 0 }); ink(x, n, 42, 57, { size: 42, weight: 700, color: '#fff', align: 'center', a: 1 }); }, { elev: 1.5 }));
  A.buzz = spr(80, 160, (x) => { x.strokeStyle = P.ink; x.lineWidth = 6; x.lineCap = 'round'; x.globalAlpha = .7;[[20, 40], [44, 66]].forEach(([r0, r1], i) => { x.beginPath(); x.arc(-10, 80, i ? r1 : r0, -.7, .7); x.stroke(); }); }, { ax: 0, ay: 80, elev: 0 });
  A.sticky = [['update prices!', '#FFE27A'], ['call the cleaner', '#FFC9A8'], ['reply to Anna', '#BFE8C8'], ['owner report??', '#F9C4D2']].map(([t, c]) => spr(210, 150, (x) => { paper(x, rrect(0, 0, 210, 150, 4), c, { elev: 0, amp: .8 }); x.save(); x.globalAlpha = .12; x.fillStyle = '#000'; x.fillRect(0, 0, 210, 26); x.restore(); const ws = t.split(' '), half = Math.ceil(ws.length / 2); ink(x, ws.slice(0, half).join(' '), 105, 78, { size: 40, weight: 700, family: F.hand, align: 'center', a: 1 }); ink(x, ws.slice(half).join(' '), 105, 120, { size: 40, weight: 700, family: F.hand, align: 'center', a: 1 }); }, { elev: 1 }));
  // four chores
  const cap = (x, t, c = '#5A4630') => ink(x, t, 290, 318, { size: 46, weight: 700, family: F.hand, align: 'center', a: 1, color: c });
  A.vig = [
    spr(580, 350, (x) => {
      paper(x, rrect(0, 0, 580, 350, 22), '#FFFDF8', { elev: 0 });
      [['Site 1', '€120'], ['Site 2', '€135'], ['Site 3', '€129']].forEach(([s, p], i) => {
        const cx = 110 + i * 180; pencil(x, [[cx, 20], [cx, 70]], { color: '#B9B2A6', w: 3, wob: 0 });
        paper(x, [[cx - 66, 110], [cx, 62], [cx + 66, 110], [cx + 66, 230], [cx - 66, 230]], ['#FFE8A8', '#F9C4C4', '#CDE8D5'][i], { elev: .8, amp: .7 });
        paper(x, ellipse(cx, 96, 9, 9, 14), '#FFFDF8', { elev: -1, shadowAlpha: 0, rim: false });
        ink(x, p, cx, 178, { size: 44, weight: 700, align: 'center', a: 1, color: i === 1 ? P.red : P.ink }); ink(x, s, cx, 214, { size: 22, weight: 600, align: 'center', color: '#6B665D' });
      });
      cap(x, 'three sites, three prices');
    }, { elev: 1.5 }),
    spr(580, 350, (x) => {
      paper(x, rrect(0, 0, 580, 350, 22), '#27345A', { elev: 0, dark: .2 });
      glyph(x, 'moon', 500, 74, 56, '#F4E4B0', '#27345A'); [[60, 50], [150, 90], [330, 40], [410, 120], [250, 96]].forEach(([sx, sy], i) => paper(x, sparkle(sx, sy, 8 + (i % 2) * 5), '#F4E4B0', { elev: 0, rim: false, amp: .2 }));
      bubble(x, 36, 120, 330, 64, '#FFFFFF', 'l'); ink(x, 'Where is the key??', 56, 162, { size: 30, weight: 600, a: 1 });
      bubble(x, 190, 200, 300, 64, '#FFFFFF', 'l'); ink(x, 'Wi-Fi password?', 210, 242, { size: 30, weight: 600, a: 1 });
      ink(x, '00:47', 490, 186, { size: 40, weight: 700, family: F.mono, color: '#F4E4B0', align: 'center', a: 1 });
      cap(x, 'at midnight…', '#F4E4B0');
    }, { elev: 1.5 }),
    spr(580, 350, (x) => {
      paper(x, rrect(0, 0, 580, 350, 22), '#E6F2F6', { elev: 0 });
      put(x, A.mop, 100, 270, { boil: 0, s: .72, rot: .12 }); put(x, A.bucket, 190, 268, { boil: 0, s: .8 });
      paper(x, rrect(300, 46, 230, 120, 16), '#FFFFFF', { elev: .6 }); glyph(x, 'phone', 346, 106, 40, P.slate, '#FFFFFF'); ink(x, 'Calling…', 392, 96, { size: 28, weight: 700, a: 1 }); ink(x, 'no answer', 392, 132, { size: 24, weight: 600, color: P.red, a: 1 });
      paper(x, rrect(330, 186, 170, 84, 4), '#FFE27A', { elev: .6, amp: .6 }); ink(x, 'guests at 3 pm!', 415, 238, { size: 32, weight: 700, family: F.hand, align: 'center', a: 1 });
      cap(x, 'is it clean yet?');
    }, { elev: 1.5 }),
    spr(580, 350, (x) => {
      paper(x, rrect(0, 0, 580, 350, 22), '#F3ECDD', { elev: 0 });
      put(x, A.ppl.owner.body, 110, 330, { boil: 0, s: .8, elev: .6 }); put(x, A.ppl.owner.head, 110, 94, { boil: 0, s: .8, elev: .6 });
      x.save(); x.strokeStyle = P.ink; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.moveTo(100, 122); x.lineTo(120, 122); x.stroke(); x.restore();
      bubble(x, 210, 40, 330, 70, '#FFFFFF', 'l'); ink(x, 'My statement?', 232, 86, { size: 32, weight: 700, a: 1 });
      paper(x, rrect(240, 140, 300, 130, 8), '#FFFFFF', { elev: .6 }); for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) paper(x, rrect(250 + i * 71, 150 + j * 38, 67, 34, 3), j === 0 ? '#E3EFE6' : '#F4F1EA', { elev: 0, rim: false, amp: .2 });
      ink(x, '?', 498, 252, { size: 40, weight: 700, color: P.red, align: 'center', a: 1 }); ink(x, '?', 356, 214, { size: 40, weight: 700, color: P.red, align: 'center', a: 1 });
      ink(x, 'numbers, by Friday', 390, 318, { size: 46, weight: 700, family: F.hand, align: 'center', a: 1, color: '#5A4630' });
    }, { elev: 1.5 }),
  ];
  // the double booking
  const slip = (src, col, who) => spr(440, 230, (x) => {
    paper(x, rrect(0, 0, 440, 230, 16), '#FFFDF8', { elev: 0 });
    paper(x, rrect(0, 0, 440, 58, 16).map(([a, b]) => [a, Math.min(b, 58)]), col, { elev: .2, rim: false }); ink(x, 'Booking · ' + src, 20, 40, { size: 29, weight: 700, color: '#fff', a: 1 });
    ink(x, 'Casa Marina', 20, 104, { size: 36, weight: 700, a: 1 }); ink(x, who, 20, 142, { size: 26, weight: 600, color: '#6B665D' });
    paper(x, rrect(20, 162, 250, 50, 25), '#FFE8A8', { elev: .4 }); ink(x, '14 – 17 Aug', 145, 197, { size: 30, weight: 700, align: 'center', a: 1, color: '#5B3A00' });
    paper(x, ellipse(390, 186, 26, 26, 30), P.green, { elev: .4 }); tick(x, 390, 186, 1.0, '#fff', 6);
  }, { elev: 1.5 });
  A.slip = [slip('Airbnb', '#E0666F', 'Anna + 1 guest'), slip('Booking.com', '#3A68B8', 'The Meyer family')];
  A.stampDB = paperText('DOUBLE BOOKING', { size: 120, weight: 700, color: '#fff', backing: P.red, border: 22 });
  A.qmark = paperText('?', { size: 120, weight: 700, color: P.red, border: 14 }); A.emark = paperText('!', { size: 120, weight: 700, color: P.red, border: 14 });
  // the calmer way
  A.lblCalm = paperText('a calmer way', { size: 96, weight: 700, color: '#fff', backing: P.sea, border: 20 });
  A.streak = spr(520, 26, (x) => paper(x, new PB().M(0, 13).L(520, 2).L(520, 24).pts, '#FFFFFF', { elev: 0, rim: false, amp: .3 }), { ax: 520, ay: 13, elev: .3 });
  // the hub
  A.hub = cardSprite(1640, 470, '#FBF8F1', { r: 40, elev: 0, elevS: 2 });
  A.lblOne = paperText('One place', { size: 70, weight: 700, color: '#fff', backing: P.red, border: 16 });
  A.hubB = [['house', P.red], ['calendar', P.blue], ['person', P.orange], ['team', P.green], ['coin', P.purple]].map(([k, c]) => badge(k, c, 92));
  A.hubL = ['Listings', 'Bookings', 'Guests', 'Team', 'Money'].map(t => spr(260, 70, (x) => ink(x, t, 130, 52, { size: 50, weight: 700, align: 'center', a: 1 }), { elev: 0 }));
}

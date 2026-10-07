// The world: navy plant silhouettes, facades and doors, devices, flat UI, icons, the ninja and the brand.
const A = {};

// ---------- foliage silhouettes ----------
function leafPath(x, len, wid, slits) {
  x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(wid, -len * .45, 0, -len); x.quadraticCurveTo(-wid, -len * .45, 0, 0); x.fill();
  if (slits) { x.save(); x.globalCompositeOperation = 'destination-out'; x.lineWidth = wid * .09; x.lineCap = 'round';
    for (let i = 1; i <= slits; i++) { const yy = -len * (.18 + i * .6 / slits); [-1, 1].forEach(sd => { x.beginPath(); x.moveTo(sd * wid * .62, yy + len * .04); x.lineTo(sd * wid * .18, yy - len * .02); x.stroke(); }); }
    x.restore(); }
}
function frond(x, len, n, side = 1) {
  x.lineCap = 'round'; x.lineWidth = len * .018; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(len * .25 * side, -len * .6, len * .45 * side, -len); x.stroke();
  for (let i = 2; i < n; i++) {
    const t = i / n, bx = len * .25 * side * 2 * t * (1 - t) + len * .45 * side * t * t, by = -len * .6 * 2 * t * (1 - t) - len * t * t;
    [-1, 1].forEach(sd => { x.save(); x.translate(bx, by); x.rotate(sd * (1.05 - t * .4) + side * .3); x.beginPath(); x.ellipse(0, -len * .09 * (1.2 - t), len * .022, len * .1 * (1.2 - t), 0, 0, 7); x.fill(); x.restore(); });
  }
}
// a clump of leaves rising from a point at the bottom centre of a w x h box
function bush(seed, w, h, o = {}) {
  return spr(w, h, (x) => {
    const R = mulberry(seed); x.fillStyle = o.col || C.navy; x.strokeStyle = o.col || C.navy; x.translate(w / 2, h);
    const n = o.n ?? 9;
    for (let i = 0; i < n; i++) {
      const a = -1.25 + 2.5 * (i + R() * .6) / n, len = h * (.55 + R() * .42);
      x.save(); x.rotate(a * .75);
      if (R() < (o.fronds ?? .35)) frond(x, len, 14, a > 0 ? 1 : -1); else { x.lineWidth = len * .02; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -len * .5); x.stroke(); x.translate(0, -len * .38); leafPath(x, len * .66, len * (.2 + R() * .1), 0); }
      x.restore();
    }
  }, { ax: w / 2, ay: h, pad: 60 });
}
function drawBush(x, S, px, py, t, k = 0, o = {}) { put(x, S, px, py, { rot: sway(t, k, o.amp ?? .018, o.sp ?? 1.2), s: o.s ?? 1, sx: o.sx ?? 1, a: o.a }); }

// ---------- architecture ----------
// a facade wall with the strip of high windows the reference uses
function facade(x, px, py, w, h, o = {}) {
  rr(x, px, py, w, h, 0, o.col || C.wall);
  if (o.shade !== false) { x.save(); x.globalAlpha *= .5; poly(x, [[px, py + h], [px + w * .35, py + h], [px + w * .25, py + h - 46], [px, py + h - 46]], C.wallD); x.restore(); }
  const n = o.windows ?? Math.floor(w / 130);
  for (let i = 0; i < n; i++) { const wx = px + 40 + i * (w - 80) / n; rr(x, wx, py + 26, 34, 70, 2, C.white); rr(x, wx + 44, py + 26, 34, 70, 2, C.white); }
}
// the reference's white door: a frame with a ladder of panels; open = 0..1
function door(x, px, py, w, h, open = 0, o = {}) {
  rr(x, px - 26, py - h - 34, w + 52, 22, 3, C.navyL);
  rr(x, px - 10, py - h - 12, w + 20, h + 12, 0, C.greyL);
  rr(x, px, py - h, w, h, 0, o.inside || C.navyL);
  if (o.glow && open > 0) { x.save(); x.globalAlpha *= open * .9; rr(x, px, py - h, w, h, 0, C.glow); x.restore(); }
  if (o.inner) o.inner(x);
  const dw = w * (1 - open * .8);
  rr(x, px, py - h, dw, h, 0, C.white);
  const n = 6; for (let i = 0; i < n; i++) rr(x, px + dw * .14, py - h + 26 + i * (h - 40) / n, dw * .72, (h - 40) / n - 16, 2, C.wallD);
  rr(x, px + dw - 22, py - h * .5, 8, 46, 4, C.navyM);
}
function antenna(x, px, py, s = 1) {
  at(x, px, py, { s }, (x) => { strokeL(x, [[0, 0], [0, -150]], 5, C.navy); [0, 1, 2, 3].forEach(i => strokeL(x, [[-34 + i * 6, -150 + i * 22], [34 - i * 6, -150 + i * 22]], 4, C.navy)); strokeL(x, [[0, -150], [-60, -110]], 4, C.navy); });
}
// a rental home seen from the street: flat Mediterranean box
function home(x, px, py, s = 1, o = {}) {
  at(x, px, py, { s }, (x) => {
    rr(x, -230, -360, 460, 360, 0, o.wall || C.white);
    poly(x, [[-260, -360], [0, -470], [260, -360]], o.roof || C.coral);
    rr(x, -160, -290, 90, 90, 4, C.tealL); rr(x, 70, -290, 90, 90, 4, C.tealL);
    strokeL(x, [[-115, -290], [-115, -200]], 6, C.white); strokeL(x, [[115, -290], [115, -200]], 6, C.white);
    rr(x, -45, -170, 90, 170, 40, o.door || C.navyL);
    if (o.lit) { x.save(); x.globalAlpha *= o.lit; rr(x, -160, -290, 90, 90, 4, C.glow); rr(x, 70, -290, 90, 90, 4, C.glow); x.restore(); }
  });
}
A.homeSmall = null;

// ---------- devices ----------
function phone(x, px, py, w, h, fn, o = {}) {
  at(x, px, py, o, (x) => {
    if (o.shadow !== false) { x.save(); x.globalAlpha *= .9; rr(x, -w / 2 + 12, -h / 2 + 14, w, h, w * .14, C.navyL); x.restore(); }
    rr(x, -w / 2, -h / 2, w, h, w * .14, C.navy);
    const b = w * .055; rr(x, -w / 2 + b, -h / 2 + b, w - 2 * b, h - 2 * b, w * .1, C.white);
    x.save(); rrPath(x, -w / 2 + b, -h / 2 + b, w - 2 * b, h - 2 * b, w * .1); x.clip(); x.translate(-w / 2 + b, -h / 2 + b); fn && fn(x, w - 2 * b, h - 2 * b); x.restore();
    rr(x, -w * .14, -h / 2 + b + 4, w * .28, 9, 5, C.navy);
  });
}
function laptop(x, px, py, w, h, fn, o = {}) {
  at(x, px, py, o, (x) => {
    rr(x, -w / 2, -h, w, h, 18, C.navy);
    rr(x, -w / 2 + 16, -h + 16, w - 32, h - 32, 6, C.white);
    x.save(); rrPath(x, -w / 2 + 16, -h + 16, w - 32, h - 32, 6); x.clip(); x.translate(-w / 2 + 16, -h + 16); fn && fn(x, w - 32, h - 32); x.restore();
    poly(x, [[-w / 2 - 60, 0], [w / 2 + 60, 0], [w / 2 + 40, 26], [-w / 2 - 40, 26]], C.greyD);
    rr(x, -w / 2 - 60, -4, w + 120, 12, 6, C.grey);
  });
}
// app window chrome inside a screen
function appBar(x, w, title, col = C.teal) {
  rr(x, 0, 0, w, 64, 0, col); txt(x, title, 26, 43, { size: 28, weight: 700, color: '#fff' });
}
// wall-mounted smart lock / keypad, the reference's intercom reimagined
function keypad(x, px, py, s, o = {}) {
  at(x, px, py, { s }, (x) => {
    hardShadow(x, 16, 16, (c) => rr(x, -110, -170, 220, 340, 18, c || C.navy));
    rr(x, -94, -154, 188, 308, 10, C.greyL);
    rr(x, -76, -138, 152, 92, 8, o.screen || C.teal);
    if (o.code) txt(x, o.code, 0, -78, { size: 34, weight: 700, color: '#fff', align: 'center', font: F.mono, ls: 4 });
    for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) { const k = j * 3 + i; rr(x, -66 + i * 46, -30 + j * 44, 40, 36, 8, o.press === k ? C.teal : C.white); }
    if (o.unlocked !== undefined) circ(x, 70, 138, 8, o.unlocked ? C.green : C.coral);
  });
}

// ---------- flat UI ----------
function pill(x, s, px, py, o = {}) {
  const size = o.size ?? 44, pad = o.pad ?? size * .7, wd = textW(s, size, 700) + pad * 2, ht = size * 1.7;
  at(x, px, py, o, (x) => {
    if (o.shadow !== false) { x.save(); x.globalAlpha *= .9; rr(x, -wd / 2 + 8, -ht / 2 + 10, wd, ht, ht / 2, o.sh || C.navy); x.restore(); }
    rr(x, -wd / 2, -ht / 2, wd, ht, ht / 2, o.bg || C.coral);
    txt(x, s, 0, size * .36, { size, weight: 700, color: o.fg || '#fff', align: 'center' });
  });
  return wd;
}
function avatar(x, cx, cy, r, col, letter) { circ(x, cx, cy, r, col); if (letter) txt(x, letter, cx, cy + r * .36, { size: r * 1.05, weight: 700, color: '#fff', align: 'center' }); }
function check(x, cx, cy, s, col = '#fff', lw) { strokeL(x, [[cx - s * .5, cy], [cx - s * .12, cy + s * .38], [cx + s * .55, cy - s * .4]], lw || s * .22, col); }
function cross(x, cx, cy, s, col, lw) { strokeL(x, [[cx - s / 2, cy - s / 2], [cx + s / 2, cy + s / 2]], lw || s * .2, col); strokeL(x, [[cx + s / 2, cy - s / 2], [cx - s / 2, cy + s / 2]], lw || s * .2, col); }
// small flat glyphs, centred, size ~ s
function icon(x, kind, cx, cy, s, col = '#fff', bg) {
  x.save(); x.translate(cx, cy); const k = s / 50; x.scale(k, k); x.fillStyle = col; x.strokeStyle = col; x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = 6;
  const P = (pts) => poly(x, pts, col);
  switch (kind) {
    case 'house': P([[-24, 0], [0, -22], [24, 0], [18, 0], [18, 22], [-18, 22], [-18, 0]]); if (bg) rr(x, -6, 6, 12, 16, 3, bg); break;
    case 'calendar': rr(x, -22, -18, 44, 40, 6, col); if (bg) rr(x, -17, -6, 34, 23, 3, bg); strokeL(x, [[-12, -24], [-12, -14]], 6, col); strokeL(x, [[12, -24], [12, -14]], 6, col); break;
    case 'person': circ(x, 0, -10, 11, col); x.beginPath(); x.arc(0, 22, 20, Math.PI, 0); x.fill(); break;
    case 'team': circ(x, -12, -8, 9, col); circ(x, 12, -8, 9, col); x.beginPath(); x.arc(-12, 20, 15, Math.PI, 0); x.fill(); x.beginPath(); x.arc(12, 20, 15, Math.PI, 0); x.fill(); break;
    case 'coin': circ(x, 0, 0, 22, col); if (bg) txt(x, '€', 0, 10, { size: 28, weight: 700, color: bg, align: 'center' }); break;
    case 'chat': rr(x, -24, -18, 48, 32, 10, col); P([[-8, 12], [-14, 24], [4, 12]]); break;
    case 'key': circ(x, -10, 0, 12, col); rr(x, -2, -4, 28, 8, 3, col); rr(x, 16, 0, 6, 10, 2, col); if (bg) circ(x, -10, 0, 5, bg); break;
    case 'star': { x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 10 : 24; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); break; }
    case 'clock': x.beginPath(); x.arc(0, 0, 21, 0, 7); x.lineWidth = 6; x.stroke(); strokeL(x, [[0, -11], [0, 0], [9, 6]], 5, col); break;
    case 'envelope': rr(x, -24, -16, 48, 32, 5, col); if (bg) strokeL(x, [[-20, -12], [0, 4], [20, -12]], 5, bg); break;
    case 'pin': x.beginPath(); x.arc(0, -6, 16, Math.PI * .85, Math.PI * .15); x.lineTo(0, 24); x.closePath(); x.fill(); if (bg) circ(x, 0, -6, 6, bg); break;
    case 'lock': rr(x, -18, -4, 36, 28, 5, col); x.beginPath(); x.arc(0, -6, 12, Math.PI, 0); x.lineWidth = 6; x.stroke(); break;
    case 'unlock': rr(x, -18, -4, 36, 28, 5, col); x.beginPath(); x.arc(0, -10, 12, Math.PI, -.2); x.lineWidth = 6; x.stroke(); break;
    case 'bolt': P([[4, -24], [-14, 4], [0, 4], [-4, 24], [14, -4], [0, -4]]); break;
    case 'chart': rr(x, -22, 2, 10, 20, 2, col); rr(x, -6, -10, 10, 32, 2, col); rr(x, 10, -22, 10, 44, 2, col); break;
    case 'broom': strokeL(x, [[14, -24], [-2, 6]], 6, col); P([[-16, 2], [6, 10], [-4, 26], [-24, 18]]); break;
    case 'camera': rr(x, -24, -12, 48, 32, 6, col); rr(x, -8, -18, 16, 8, 2, col); if (bg) circ(x, 0, 4, 9, bg); break;
    case 'doc': rr(x, -18, -24, 36, 48, 5, col); if (bg) { bars(x, -10, -12, [20, 20, 14], { h: 5, gap: 11, color: bg }); } break;
    case 'globe': x.beginPath(); x.arc(0, 0, 21, 0, 7); x.lineWidth = 5; x.stroke(); x.beginPath(); x.ellipse(0, 0, 9, 21, 0, 0, 7); x.stroke(); strokeL(x, [[-21, 0], [21, 0]], 5, col); break;
    case 'phone': rr(x, -14, -24, 28, 48, 6, col); if (bg) rr(x, -9, -17, 18, 30, 2, bg); break;
    case 'moon': x.beginPath(); x.arc(0, 0, 20, 0, 7); x.fill(); if (bg) circ(x, 10, -8, 17, bg); break;
    case 'heart': x.beginPath(); x.moveTo(0, 20); x.bezierCurveTo(-30, 0, -20, -26, 0, -10); x.bezierCurveTo(20, -26, 30, 0, 0, 20); x.fill(); break;
    case 'spark': x.beginPath(); x.moveTo(0, -24); x.quadraticCurveTo(4, -4, 24, 0); x.quadraticCurveTo(4, 4, 0, 24); x.quadraticCurveTo(-4, 4, -24, 0); x.quadraticCurveTo(-4, -4, 0, -24); x.fill(); break;
    case 'plane': P([[-24, -2], [24, -20], [10, 22], [2, 6]]); break;
    case 'wifi': [22, 14].forEach(r => { x.beginPath(); x.arc(0, 10, r, Math.PI * 1.2, Math.PI * 1.8); x.lineWidth = 6; x.stroke(); }); circ(x, 0, 10, 5, col); break;
    case 'tag': P([[-22, -14], [8, -14], [24, 0], [8, 14], [-22, 14]]); if (bg) circ(x, -12, 0, 4, bg); break;
    case 'id': rr(x, -24, -16, 48, 32, 5, col); if (bg) { circ(x, -10, -2, 7, bg); bars(x, 2, -6, [14, 10], { h: 4, gap: 9, color: bg }); } break;
    case 'card': rr(x, -24, -16, 48, 32, 5, col); if (bg) rr(x, -24, -8, 48, 7, 0, bg); break;
    case 'shield': x.beginPath(); x.moveTo(0, -24); x.lineTo(20, -16); x.quadraticCurveTo(20, 12, 0, 24); x.quadraticCurveTo(-20, 12, -20, -16); x.closePath(); x.fill(); break;
  }
  x.restore();
}
// round icon badge: coloured disc with a white glyph
function badge(x, kind, cx, cy, r, col, o = {}) { at(x, cx, cy, o, (x) => { circ(x, 0, 0, r, col); icon(x, kind, 0, 0, r * 1.05, '#fff', col); }); }

// a flat calendar grid; marks = {cellIndex: colour}
function calGrid(x, px, py, cols, rows, cw, ch, marks = {}, base = C.greyL) { for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) rr(x, px + i * (cw + 6), py + j * (ch + 6), cw, ch, 6, marks[j * cols + i] || base); }
// a simple landscape thumbnail of a home
function thumb(x, px, py, w, h, o = {}) {
  x.save(); rrPath(x, px, py, w, h, o.r ?? 10); x.clip();
  rr(x, px, py, w, h, 0, o.sky || C.tealXL); rr(x, px, py + h * .72, w, h * .28, 0, o.sea || C.teal);
  const hx = px + w * (o.hx ?? .5), hw = w * (o.hs ?? .36), hh = hw * .62;
  rr(x, hx - hw / 2, py + h * .74 - hh, hw, hh, 0, C.white); poly(x, [[hx - hw * .6, py + h * .74 - hh], [hx, py + h * .74 - hh * 1.6], [hx + hw * .6, py + h * .74 - hh]], o.roof || C.coral);
  rr(x, hx - hw * .1, py + h * .74 - hh * .55, hw * .2, hh * .55, 3, C.navyL);
  x.restore();
}

// ---------- the ninja, flat ----------
function ninja(x, cx, cy, r, o = {}) {
  at(x, cx, cy, o, (x) => {
    const sw = Math.sin((o.t || 0) * 6) * .18;
    x.save(); x.translate(-r * .82, -r * .5); x.rotate(Math.PI * 1.08 + sw); rr(x, -r * .1, 0, r * .2, r * .62, r * .1, C.coral); x.rotate(.35); rr(x, -r * .08, 0, r * .16, r * .5, r * .08, C.coralD); x.restore();
    circ(x, 0, 0, r, C.navyL);
    x.save(); x.beginPath(); x.arc(0, 0, r, 0, 7); x.clip();
    x.beginPath(); x.moveTo(-r * 1.1, -r * .16); x.quadraticCurveTo(0, -r * 1.04, r * 1.1, -r * .16); x.lineTo(r * 1.1, r * .12); x.quadraticCurveTo(0, -r * .52, -r * 1.1, r * .12); x.closePath(); x.fillStyle = C.coral; x.fill();
    x.restore();
    x.beginPath(); x.moveTo(-r * .72, -r * .12); x.quadraticCurveTo(0, r * .05, r * .72, -r * .12); x.quadraticCurveTo(r * .9, r * .3, r * .5, r * .55); x.quadraticCurveTo(0, r * .45, -r * .5, r * .55); x.quadraticCurveTo(-r * .9, r * .3, -r * .72, -r * .12); x.fillStyle = C.peach; x.fill();
    circ(x, -r * .78, -r * .5, r * .14, C.coral);
    const e = o.eyes || 'happy'; x.strokeStyle = C.navy; x.fillStyle = C.navy; x.lineWidth = r * .07; x.lineCap = 'round';
    [-1, 1].forEach(sd => {
      const ex = sd * r * .27, ey = r * .2;
      if (e === 'happy' || (e === 'wink' && sd > 0)) { x.beginPath(); x.arc(ex, ey + r * .05, r * .1, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); }
      else if (e === 'closed') { x.beginPath(); x.arc(ex, ey - r * .03, r * .1, Math.PI * .1, Math.PI * .9); x.stroke(); }
      else ell(x, ex, ey, r * .055, r * .075, C.navy);
    });
  });
}
// the logo lock-up; letters appear one per tap from times[]; returns width
function brand(x, cx, cy, size, t, times, o = {}) {
  const parts = [...'Rental'].map(c => [c, o.light || C.white]).concat([...'Ninja'].map(c => [c, C.red]));
  const ws = parts.map(([c]) => textW(c, size, 500, F.brand)), tot = ws.reduce((a, b) => a + b, 0) + size * .12;
  let px = cx - tot / 2;
  parts.forEach(([c, col], i) => {
    const t0 = times ? times[i] ?? times[times.length - 1] : -1, p = times ? popS(t, t0, .28) : 1;
    if (p > 0) at(x, px + ws[i] / 2 + (i > 5 ? size * .12 : 0), cy, { s: p, a: clamp(p * 2) }, (x) => txt(x, c, 0, size * .36, { size, weight: 500, color: col, align: 'center', font: F.brand }));
    px += ws[i];
  });
  return tot;
}

// a street with the house: facade, door, antenna, a navy roofline at the left, the red Rental Ninja banner
function street(x, t, o = {}) {
  const GY = o.gy ?? 930;
  rr(x, -200, -200, 2400, GY + 200, 0, o.sky || C.sky);
  facade(x, 760, 170, 1300, GY - 170, { windows: 8 });
  antenna(x, 700, 300, .9);
  poly(x, [[420, GY], [420, 330], [760, 300], [760, GY]], C.navy);
  door(x, o.dx ?? 1180, GY, 210, 400, o.open || 0, { glow: true, inner: o.inner });
  if (o.banner !== false) banner(x, o.bx ?? 1640, 288);
  if (o.lock !== false) at(x, (o.dx ?? 1180) + 290, GY - 230, { s: .32 }, (x) => keypad(x, 0, 0, 1, { screen: C.red }));
  rr(x, -200, GY, 2400, 300, 0, C.navy);
}

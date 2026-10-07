// Shared cut-out kit: palette, paper helpers, the ninja, people, icons, windows and phones.
const P = {
  ink: '#262C38', slate: '#2F3C45', slateD: '#1F2931', red: '#E4424E', redD: '#B7283A', peach: '#FFE2CD', white: '#FBF8F1', cream: '#F5EDE0',
  sky: '#BFE0EE', sea: '#3E9DB3', seaD: '#2B7C93', seaL: '#86CAD6', sand: '#F1D6A2', sandD: '#E3BF7F', sun: '#F8C24A', sunD: '#F2A93B',
  coral: '#EE8A68', leaf: '#5FA36B', leafD: '#3F7F4E', trunk: '#A97A4F', blue: '#4C82D9', purple: '#6F5BD0', green: '#2E9A63', gold: '#F2B53A',
  orange: '#E86A33', gray: '#C9C3B8', grayD: '#9A948A', lav: '#EFEAFB', pink: '#F4A7B5', line: '#E4DED3', teal: '#1FA396', navy: '#27345A', mute: '#6F6A62', card: '#FFFDF8',
};
const A = {};

function cardSprite(w, h, color, o = {}) {
  return spr(w, h, (x) => { paper(x, rrect(0, 0, w, h, o.r ?? 18), color, { elev: 0, ...o }); if (o.draw) o.draw(x, w, h); }, { elev: o.elevS ?? 1, ax: o.ax, ay: o.ay });
}
function cloudPts(circles, n = 140) {
  let cx = 0, cy = 0; circles.forEach(c => { cx += c[0]; cy += c[1]; }); cx /= circles.length; cy /= circles.length;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a); let best = 0;
    for (const c of circles) { const ox = cx - c[0], oy = cy - c[1], b = ox * dx + oy * dy, cc = ox * ox + oy * oy - c[2] * c[2], disc = b * b - cc; if (disc >= 0) best = Math.max(best, -b + Math.sqrt(disc)); }
    pts.push([cx + dx * best, cy + dy * best]);
  }
  return pts;
}
function bars(x, px, py, widths, o = {}) { // placeholder text lines, cut as thin paper strips
  widths.forEach((w, i) => paper(x, rrect(px, py + i * (o.gap || 20), w, o.h || 9, 4), o.color || '#D9D3C8', { elev: .25, amp: .4, rim: false, sheen: .05 }));
}
const textW = (t, size, weight = 600, fam = F.disp) => measure(t, `${weight} ${size}px ${fam}`).w;
function chip(t, col, o = {}) {
  const size = o.size || 26, fam = o.mono ? F.mono : (o.hand ? F.hand : F.disp), weight = o.weight || 600, w = Math.ceil(textW(t, size, weight, fam) + (o.padX ?? size * 1.3)), h = o.h || Math.round(size * 1.85);
  return cardSprite(w, h, col, { r: o.r ?? h / 2, elev: 0, elevS: o.elevS ?? .9, amp: .6, draw: (x) => ink(x, t, w / 2, h / 2 + size * .36, { size, weight, family: fam, color: o.color || '#fff', align: 'center', a: 1 }) });
}
// handwritten caption (marker on the table, no backing)
function hand(t, size = 50, color = P.ink) { return spr(measure(t, `700 ${size}px ${F.hand}`).w + 12, size * 1.3, (x) => ink(x, t, 6, size, { size, weight: 700, family: F.hand, color, a: 1 }), { elev: 0 }); }
function tick(x, cx, cy, s, color = '#fff', w = 6) { pencil(x, [[cx - 12 * s, cy], [cx - 3 * s, cy + 10 * s], [cx + 14 * s, cy - 11 * s]], { color, w, a: 1, wob: 0 }); }
function cross(x, cx, cy, s, color = '#fff', w = 6) { pencil(x, [[cx - s, cy - s], [cx + s, cy + s]], { color, w, a: 1, wob: 0 }); pencil(x, [[cx + s, cy - s], [cx - s, cy + s]], { color, w, a: 1, wob: 0 }); }
// a little landscape thumbnail clipped to a rounded rect
function thumb(x, px, py, w, h, o = {}) {
  x.save(); x.beginPath(); x.roundRect(px, py, w, h, o.r ?? 10); x.clip();
  paper(x, rrect(px, py, w, h, o.r ?? 10), o.sky || P.sky, { elev: 0, rim: false });
  if (o.sun !== false) paper(x, ellipse(px + w * .82, py + h * .26, h * .13, h * .13, 30), o.sunC || P.sun, { elev: .4 });
  if (o.town) {
    for (let i = 0; i < 5; i++) { const bw = w * .16, bh = h * (.35 + rnd('tw', o.seed, i) * .3); paper(x, rrect(px + w * .06 + i * w * .18, py + h - bh, bw, bh + 6, 3), [o.c1 || '#E9B18A', o.c2 || '#F4D9B5'][i % 2], { elev: .5, amp: .4 }); }
  } else {
    paper(x, [[px, py + h], [px, py + h * .66], [px + w * .45, py + h * .5], [px + w, py + h * .6], [px + w, py + h]], o.far || P.seaL, { elev: .5 });
    paper(x, [[px, py + h], [px, py + h * .82], [px + w, py + h * .74], [px + w, py + h]], o.near || P.sea, { elev: .6 });
  }
  const hx = px + w * (o.hx ?? .38), hy = py + h * .82, hs = h * (o.hs ?? .3);
  paper(x, [[hx - hs * .7, hy], [hx + hs * .7, hy], [hx + hs * .7, hy - hs * .8], [hx - hs * .7, hy - hs * .8]], '#fff', { elev: .6, amp: .4 });
  paper(x, [[hx - hs * .9, hy - hs * .74], [hx, hy - hs * 1.45], [hx + hs * .9, hy - hs * .74]], o.roof || P.red, { elev: .7, amp: .4 });
  x.restore();
}
const HOMES = [
  { n: 'Casa Marina', roof: P.red },
  { n: 'Villa Sol', roof: P.gold, sky: '#F7D9C2', far: '#E6A77C', near: '#C9744B' },
  { n: 'Can Blau', roof: P.blue, sky: '#D9EBF3' },
  { n: 'Finca Oliva', roof: P.green, town: true, seed: 2 },
];

// ---------- Icons: white paper glyphs for badges ----------
function glyph(x, kind, cx, cy, r, col = '#FFFDF8', bg = P.ink) {
  const pp = (pts, c = col, o = {}) => paper(x, pts, c, { elev: .35, amp: .35, rim: false, sheen: .1, ...o });
  const T = (px, py) => [cx + px * r, cy + py * r];
  switch (kind) {
    case 'house': pp([T(-.62, .7), T(-.62, -.05), T(.62, -.05), T(.62, .7)]); pp([T(-.85, 0), T(0, -.8), T(.85, 0)]); pp(rrect(cx - .16 * r, cy + .2 * r, .32 * r, .5 * r, 2), bg); break;
    case 'calendar': pp(rrect(cx - .7 * r, cy - .55 * r, 1.4 * r, 1.25 * r, .16 * r)); pp(rrect(cx - .7 * r, cy - .55 * r, 1.4 * r, .34 * r, .1 * r), bg, { elev: 0 });
      for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) pp(rrect(cx - .48 * r + i * .36 * r, cy + .0 * r + j * .32 * r, .22 * r, .2 * r, 2), bg, { elev: 0 });
      pp(rrect(cx - .42 * r, cy - .78 * r, .14 * r, .36 * r, 3)); pp(rrect(cx + .28 * r, cy - .78 * r, .14 * r, .36 * r, 3)); break;
    case 'chat': pp(new PB().M(...T(-.75, -.55)).L(...T(.75, -.55)).L(...T(.75, .3)).L(...T(.05, .3)).L(...T(-.4, .75)).L(...T(-.35, .3)).L(...T(-.75, .3)).pts);
      [-.36, 0, .36].forEach(d => pp(ellipse(cx + d * r, cy - .12 * r, .1 * r, .1 * r, 14), bg, { elev: 0 })); break;
    case 'person': pp(ellipse(cx, cy - .32 * r, .34 * r, .34 * r, 30)); pp(new PB().M(...T(-.7, .75)).Q(...T(-.7, .08), ...T(0, .08)).Q(...T(.7, .08), ...T(.7, .75)).pts); break;
    case 'team': pp(ellipse(cx + .34 * r, cy - .38 * r, .26 * r, .26 * r, 24), shade(col, -.12)); pp(new PB().M(...T(-.1, .62)).Q(...T(-.1, -.02), ...T(.36, -.02)).Q(...T(.86, -.02), ...T(.86, .62)).pts, shade(col, -.12));
      pp(ellipse(cx - .22 * r, cy - .22 * r, .3 * r, .3 * r, 24)); pp(new PB().M(...T(-.82, .75)).Q(...T(-.82, .14), ...T(-.22, .14)).Q(...T(.38, .14), ...T(.38, .75)).pts); break;
    case 'coin': pp(ellipse(cx, cy, .74 * r, .74 * r, 40)); x.save(); x.strokeStyle = bg; x.globalAlpha = .25; x.lineWidth = r * .06; x.beginPath(); x.arc(cx, cy, .58 * r, 0, 7); x.stroke(); x.restore(); ink(x, '€', cx, cy + .34 * r, { size: r * .95, weight: 700, color: bg, align: 'center', a: 1 }); break;
    case 'tag': pp([T(-.75, -.15), T(-.25, -.62), T(.7, -.62), T(.7, .62), T(-.25, .62), T(-.75, .15)]); pp(ellipse(cx - .36 * r, cy, .12 * r, .12 * r, 14), bg, { elev: 0 }); break;
    case 'key': pp(ellipse(cx - .38 * r, cy, .36 * r, .36 * r, 30)); pp(ellipse(cx - .38 * r, cy, .14 * r, .14 * r, 16), bg, { elev: 0 }); pp(rrect(cx - .1 * r, cy - .1 * r, .9 * r, .2 * r, 3)); pp(rrect(cx + .42 * r, cy, .13 * r, .3 * r, 2)); pp(rrect(cx + .64 * r, cy, .13 * r, .22 * r, 2)); break;
    case 'chart': [[-.6, .1, .55], [-.17, -.3, .95], [.26, -.62, 1.27]].forEach(([a, b, h]) => pp(rrect(cx + a * r, cy + b * r, .34 * r, h * r, 3))); break;
    case 'gear': { const b = new PB(); for (let i = 0; i < 16; i++) { const a0 = i / 16 * Math.PI * 2, rr = i % 2 ? .78 : .56; b.p.push([cx + Math.cos(a0 - .11) * rr * r, cy + Math.sin(a0 - .11) * rr * r], [cx + Math.cos(a0 + .11) * rr * r, cy + Math.sin(a0 + .11) * rr * r]); } pp(b.pts); pp(ellipse(cx, cy, .24 * r, .24 * r, 20), bg, { elev: 0 }); break; }
    case 'broom': x.save(); x.translate(cx, cy); x.rotate(.5); pp(rrect(-.07 * r, -.85 * r, .14 * r, 1.05 * r, 3)); pp([[-.4 * r, .15 * r], [.4 * r, .15 * r], [.55 * r, .8 * r], [-.55 * r, .8 * r]]); x.restore(); break;
    case 'lock': x.save(); x.strokeStyle = col; x.lineWidth = r * .17; x.lineCap = 'round'; x.beginPath(); x.arc(cx, cy - .22 * r, .34 * r, Math.PI, 0); x.stroke(); x.restore(); pp(rrect(cx - .55 * r, cy - .2 * r, 1.1 * r, .85 * r, .14 * r)); pp(ellipse(cx, cy + .2 * r, .12 * r, .12 * r, 14), bg, { elev: 0 }); break;
    case 'star': pp(star(cx, cy + .04 * r, .8 * r, .36 * r, 5)); break;
    case 'doc': pp([T(-.52, -.78), T(.2, -.78), T(.55, -.42), T(.55, .78), T(-.52, .78)]); [-.2, .08, .36].forEach(d => pp(rrect(cx - .32 * r, cy + d * r, .66 * r, .1 * r, 2), bg, { elev: 0 })); break;
    case 'envelope': pp(rrect(cx - .78 * r, cy - .52 * r, 1.56 * r, 1.04 * r, .1 * r)); pencil(x, [T(-.7, -.42), T(0, .1), T(.7, -.42)], { color: bg, w: r * .09, a: .8, wob: 0 }); break;
    case 'plane': pp([T(-.8, -.1), T(.8, -.7), T(.2, .75), T(-.05, .2)]); pp([T(-.8, -.1), T(.8, -.7), T(-.05, .2)], shade(col, -.1), { elev: .2 }); break;
    case 'heart': pp(new PB().M(...T(0, .7)).C(...T(-1.1, -.05), ...T(-.55, -.9), ...T(0, -.3)).C(...T(.55, -.9), ...T(1.1, -.05), ...T(0, .7)).pts); break;
    case 'bolt': pp([T(.15, -.85), T(-.5, .1), T(-.05, .1), T(-.2, .85), T(.5, -.15), T(.05, -.15)]); break;
    case 'globe': pp(ellipse(cx, cy, .74 * r, .74 * r, 40)); x.save(); x.strokeStyle = bg; x.globalAlpha = .55; x.lineWidth = r * .07; x.beginPath(); x.ellipse(cx, cy, .32 * r, .74 * r, 0, 0, 7); x.moveTo(cx - .74 * r, cy); x.lineTo(cx + .74 * r, cy); x.stroke(); x.restore(); break;
    case 'moon': pp(ellipse(cx, cy, .7 * r, .7 * r, 40)); pp(ellipse(cx + .34 * r, cy - .2 * r, .58 * r, .58 * r, 40), bg, { elev: 0 }); break;
    case 'phone': pp(rrect(cx - .42 * r, cy - .78 * r, .84 * r, 1.56 * r, .16 * r)); pp(rrect(cx - .3 * r, cy - .58 * r, .6 * r, 1.0 * r, .06 * r), bg, { elev: 0 }); break;
    case 'percent': ink(x, '%', cx, cy + .38 * r, { size: r * 1.2, weight: 700, color: col, align: 'center', a: 1 }); break;
    case 'spark': pp(sparkle(cx, cy, .82 * r)); break;
    case 'camera': pp(rrect(cx - .75 * r, cy - .42 * r, 1.5 * r, 1.0 * r, .14 * r)); pp(rrect(cx - .3 * r, cy - .62 * r, .6 * r, .3 * r, 3)); pp(ellipse(cx, cy + .08 * r, .3 * r, .3 * r, 24), bg, { elev: 0 }); break;
    case 'pin': pp(new PB().M(...T(0, .85)).C(...T(-.75, 0), ...T(-.6, -.8), ...T(0, -.8)).C(...T(.6, -.8), ...T(.75, 0), ...T(0, .85)).pts); pp(ellipse(cx, cy - .22 * r, .22 * r, .22 * r, 18), bg, { elev: 0 }); break;
    case 'clock': pp(ellipse(cx, cy, .76 * r, .76 * r, 40)); pencil(x, [[cx, cy - .45 * r], [cx, cy], [cx + .32 * r, cy + .18 * r]], { color: bg, w: r * .11, a: .9, wob: 0 }); break;
  }
}
// round badge with a glyph; R = radius
function badge(kind, color, R = 60, o = {}) {
  return spr(R * 2 + 8, R * 2 + 8, (x) => {
    if (o.ring !== false) paper(x, ellipse(R + 4, R + 4, R + 3, R + 3, 60), '#FFFDF8', { elev: 0 });
    paper(x, ellipse(R + 4, R + 4, R - (o.ring === false ? 0 : 6), R - (o.ring === false ? 0 : 6), 60), color, { elev: .5, sheen: .2 });
    glyph(x, kind, R + 4, R + 4, R * .62, o.col || '#FFFDF8', color);
  }, { elev: o.elev ?? 1.3 });
}

// ---------- Ninja ----------
function buildNinja(R = 110) {
  const c = R + 8;
  A.ninjaHead = spr(c * 2, c * 2, (x) => {
    paper(x, ellipse(c, c, R, R, 96), P.slate, {
      elev: 0, amp: 1.2, sheen: .1, dark: .2, inner: (x) => {
        const g = x.createRadialGradient(c - R * .35, c - R * .4, R * .05, c, c, R * 1.15); g.addColorStop(0, 'rgba(110,145,158,.45)'); g.addColorStop(.6, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.28)');
        x.fillStyle = g; x.fillRect(0, 0, c * 2, c * 2);
      }
    });
    x.save(); x.beginPath(); x.arc(c, c, R + 4, 0, 7); x.clip();
    const band = new PB().M(c - 1.1 * R, c - .16 * R).Q(c, c - 1.04 * R, c + 1.1 * R, c - .16 * R).L(c + 1.1 * R, c + .12 * R).Q(c, c - .52 * R, c - 1.1 * R, c + .12 * R).pts;
    paper(x, band, P.red, { elev: 1.1, amp: .8, sheen: .22 });
    x.restore();
    const f = new PB().M(c - .72 * R, c - .15 * R).Q(c, c + .02 * R, c + .72 * R, c - .15 * R)
      .C(c + .86 * R, c - .15 * R, c + .88 * R, c + .1 * R, c + .84 * R, c + .27 * R)
      .C(c + .79 * R, c + .46 * R, c + .62 * R, c + .57 * R, c + .45 * R, c + .55 * R)
      .C(c + .28 * R, c + .51 * R, c + .12 * R, c + .44 * R, c, c + .44 * R)
      .C(c - .12 * R, c + .44 * R, c - .28 * R, c + .51 * R, c - .45 * R, c + .55 * R)
      .C(c - .62 * R, c + .57 * R, c - .79 * R, c + .46 * R, c - .84 * R, c + .27 * R)
      .C(c - .88 * R, c + .1 * R, c - .86 * R, c - .15 * R, c - .72 * R, c - .15 * R).pts;
    paper(x, f, P.peach, { elev: 1, amp: .7, sheen: .2 });
    x.save(); x.globalAlpha = .18; x.fillStyle = '#F07A7A'; x.beginPath(); x.ellipse(c - .5 * R, c + .33 * R, .12 * R, .07 * R, 0, 0, 7); x.ellipse(c + .5 * R, c + .33 * R, .12 * R, .07 * R, 0, 0, 7); x.fill(); x.restore();
  }, { elev: 1.4 });
  const tail = (len, wid, col) => spr(len, wid, (x) => {
    const p = new PB().M(0, wid / 2).Q(len * .4, -wid * .1, len, wid * .25).L(len * .86, wid / 2).L(len, wid * .78).Q(len * .4, wid * 1.1, 0, wid / 2).pts;
    paper(x, p, col, { elev: 0, amp: .6 });
  }, { ax: 0, ay: wid / 2, elev: 1.1 });
  A.ninjaTail1 = tail(R * .72, R * .34, P.red);
  A.ninjaTail2 = tail(R * .6, R * .3, P.redD);
  A.ninjaKnot = spr(R * .3, R * .3, (x) => paper(x, ellipse(R * .15, R * .15, R * .15, R * .13, 30), P.redD, { elev: 0 }), { elev: 1.2 });
  A.ninjaR = R;
  // support headset for the onboarding scene
  A.headset = spr(260, 200, (x) => {
    x.save(); x.strokeStyle = '#3A4650'; x.lineWidth = 13; x.lineCap = 'round'; x.beginPath(); x.arc(130, 128, 112, Math.PI * 1.06, Math.PI * 1.94); x.stroke();
    x.lineWidth = 7; x.beginPath(); x.moveTo(22, 150); x.quadraticCurveTo(30, 196, 86, 192); x.stroke(); x.restore();
    paper(x, rrect(2, 98, 34, 64, 14), P.red, { elev: .6 }); paper(x, rrect(224, 98, 34, 64, 14), P.red, { elev: .6 });
    paper(x, ellipse(92, 191, 13, 9, 16), '#3A4650', { elev: .4, rim: false });
  }, { ax: 130, ay: 128, elev: .8 });
}
// eyes: 'happy' | 'open' | 'closed' | 'wink' | 'wide'
function drawNinja(ctx, x, y, o = {}) {
  const R = A.ninjaR, s = o.s ?? 1, t = o.t ?? 0, id = o.id || 'ninja';
  const bf = Math.floor(FRAME / 2), jx = (rnd(id, bf, 'x') - .5) * 1.2, jy = (rnd(id, bf, 'y') - .5) * 1.2;
  ctx.save(); ctx.translate(x + jx, y + jy); ctx.rotate(o.rot || 0); ctx.scale(s * (o.sx ?? 1), s * (o.sy ?? 1));
  const k = { x: -.8 * R, y: -.52 * R }, fl = Math.sin(t * 7.5) * .16, fl2 = Math.sin(t * 7.5 + 1.7) * .14;
  put(ctx, A.ninjaTail2, k.x, k.y, { rot: Math.PI * 1.32 + fl2, boil: 0, elev: o.elev ?? 1 });
  put(ctx, A.ninjaTail1, k.x, k.y, { rot: Math.PI * 1.08 + fl, boil: 0, elev: o.elev ?? 1 });
  put(ctx, A.ninjaHead, 0, 0, { boil: 0, elev: o.elev ?? 1.4 });
  put(ctx, A.ninjaKnot, k.x, k.y, { boil: 0, elev: .6 });
  ctx.strokeStyle = P.ink; ctx.fillStyle = P.ink; ctx.lineCap = 'round'; ctx.lineWidth = R * .055; ctx.globalAlpha = .92;
  const ex = .27 * R, ey = .19 * R, er = .1 * R, e = o.eyes || 'happy', lk = (o.look || 0) * er * .5;
  const eye = (cx, kind) => {
    ctx.beginPath();
    if (kind === 'happy') { ctx.arc(cx, ey + er * .35, er, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    else if (kind === 'closed') { ctx.arc(cx, ey - er * .3, er, Math.PI * .1, Math.PI * .9); ctx.stroke(); }
    else if (kind === 'wide') { ctx.ellipse(cx, ey, er * .62, er * .8, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + er * .2, ey - er * .3, er * .22, 0, 7); ctx.fill(); ctx.fillStyle = P.ink; }
    else { ctx.ellipse(cx, ey, er * .5, er * .62, 0, 0, 7); ctx.fill(); }
  };
  eye(-ex + lk, e === 'wink' ? 'open' : e); eye(ex + lk, e === 'wink' ? 'happy' : e);
  ctx.globalAlpha = 1;
  if (o.headset) put(ctx, A.headset, 0, -6, { boil: 0, elev: .8 });
  ctx.restore();
}

// ---------- People: host, guests, cleaner, owner ----------
const FOLK = {
  host: { skin: '#FBD3B4', hair: '#5B3A29', top: '#E8A93B', legs: '#3D4A5C', shoe: '#2A3240', style: 'bun' },
  g1: { skin: '#F6C9A8', hair: '#E3BF7F', top: '#1FA396', legs: '#5C6B7A', shoe: '#3A2F2A', style: 'hat' },
  g2: { skin: '#C98F6B', hair: '#2B2320', top: '#EE8A68', legs: '#3D4A5C', shoe: '#2A3240', style: 'short' },
  g3: { skin: '#FBD3B4', hair: '#C9562E', top: '#6F5BD0', legs: '#4A5568', shoe: '#2A3240', style: 'bob' },
  g4: { skin: '#E3B08C', hair: '#3A2A22', top: '#4C82D9', legs: '#55606E', shoe: '#2A3240', style: 'cap' },
  cleaner: { skin: '#E9BC9A', hair: '#2E2A33', top: '#5B8FD6', legs: '#2F4C7A', shoe: '#FFFFFF', style: 'kerchief', apron: true },
  owner: { skin: '#F3CDB0', hair: '#C9CDD2', top: '#5FA36B', legs: '#6B5B4A', shoe: '#3A2F2A', style: 'side', glasses: true },
};
function buildPeople() {
  A.ppl = {};
  for (const [k, f] of Object.entries(FOLK)) {
    const K = A.ppl[k] = {};
    K.body = spr(190, 260, (x) => {
      [[56, 0], [108, 0]].forEach(([lx]) => { paper(x, rrect(lx, 168, 30, 72, 10), f.legs, { elev: 0, amp: .5 }); paper(x, rrect(lx - 6, 232, 44, 24, 11), f.shoe, { elev: .4, amp: .4 }); });
      const torso = new PB().M(42, 28).Q(95, -8, 148, 28).Q(172, 110, 164, 188).Q(95, 204, 26, 188).Q(18, 110, 42, 28).pts;
      paper(x, torso, f.top, { elev: .6, amp: .9, sheen: .18 });
      if (f.apron) { paper(x, rrect(58, 78, 74, 108, 12), '#FFFDF8', { elev: .4, amp: .5 }); paper(x, rrect(76, 120, 38, 30, 6), '#E8EEF5', { elev: .2, rim: false }); }
      else if (k === 'host') { paper(x, new PB().M(70, 8).Q(95, 40, 120, 8).Q(95, 22, 70, 8).pts, shade(f.top, -.16), { elev: .2, rim: false }); }
      else if (k === 'owner') { paper(x, [[95, 20], [84, 40], [95, 100], [106, 40]], '#C8583A', { elev: .3, amp: .3 }); }
      else paper(x, rrect(70, 86, 50, 8, 4), shade(f.top, -.14), { elev: 0, rim: false });
    }, { ax: 95, ay: 256, elev: 1.2 });
    K.head = spr(150, 170, (x) => {
      const cx = 75, cy = 92, R = 56;
      if (f.style === 'bob') paper(x, new PB().M(cx - 66, cy + 44).Q(cx - 76, cy - 70, cx, cy - 72).Q(cx + 76, cy - 70, cx + 66, cy + 44).Q(cx, cy + 20, cx - 66, cy + 44).pts, f.hair, { elev: 0, amp: .8 });
      if (f.style === 'bun') paper(x, ellipse(cx + 8, cy - 70, 26, 24, 30), f.hair, { elev: 0, amp: .6 });
      paper(x, ellipse(cx, cy, R, R, 60), f.skin, { elev: .3, amp: .7, sheen: .2 });
      const cap = (y0, c, dip = 0) => paper(x, new PB().M(cx - R - 3, cy + y0).Q(cx - R, cy - R - 14, cx, cy - R - 8).Q(cx + R, cy - R - 14, cx + R + 3, cy + y0).Q(cx, cy - R * .42 + dip, cx - R - 3, cy + y0).pts, c, { elev: .5, amp: .7, sheen: .15 });
      if (f.style === 'bun' || f.style === 'bob') cap(-6, f.hair, 6);
      if (f.style === 'short') cap(-16, f.hair);
      if (f.style === 'side') { paper(x, new PB().M(cx - R - 2, cy + 6).Q(cx - R - 4, cy - 40, cx - 30, cy - R + 2).Q(cx - 40, cy - 14, cx - R - 2, cy + 6).pts, f.hair, { elev: .4, amp: .5 }); paper(x, new PB().M(cx + R + 2, cy + 6).Q(cx + R + 4, cy - 40, cx + 30, cy - R + 2).Q(cx + 40, cy - 14, cx + R + 2, cy + 6).pts, f.hair, { elev: .4, amp: .5 }); }
      if (f.style === 'hat') { cap(-20, f.hair); paper(x, ellipse(cx, cy - 34, 82, 17, 50), '#F1D6A2', { elev: .7, amp: .7 }); paper(x, new PB().M(cx - 46, cy - 36).Q(cx - 40, cy - 86, cx, cy - 86).Q(cx + 40, cy - 86, cx + 46, cy - 36).pts, '#F6E2B8', { elev: .5, amp: .6 }); paper(x, rrect(cx - 46, cy - 50, 92, 12, 4), P.red, { elev: .2, rim: false }); }
      if (f.style === 'cap') { cap(-22, '#E4424E'); paper(x, new PB().M(cx + 10, cy - 30).Q(cx + 70, cy - 40, cx + 84, cy - 20).Q(cx + 50, cy - 18, cx + 10, cy - 22).pts, '#B7283A', { elev: .5, amp: .4 }); }
      if (f.style === 'kerchief') { cap(-14, '#F2B53A'); paper(x, [[cx + 44, cy - 50], [cx + 78, cy - 66], [cx + 70, cy - 34]], '#E09A22', { elev: .4, amp: .4 }); }
      x.save(); x.globalAlpha = .2; x.fillStyle = '#F07A7A'; x.beginPath(); x.ellipse(cx - 32, cy + 20, 9, 6, 0, 0, 7); x.ellipse(cx + 32, cy + 20, 9, 6, 0, 0, 7); x.fill(); x.restore();
      if (f.glasses) { x.save(); x.strokeStyle = P.ink; x.lineWidth = 3.5; x.globalAlpha = .85; x.beginPath(); x.arc(cx - 20, cy + 4, 14, 0, 7); x.moveTo(cx + 34, cy + 4); x.arc(cx + 20, cy + 4, 14, 0, 7); x.moveTo(cx - 6, cy + 2); x.lineTo(cx + 6, cy + 2); x.stroke(); x.restore(); }
    }, { ax: 75, ay: 92, elev: 1 });
    K.arm = spr(44, 130, (x) => { paper(x, rrect(6, 0, 32, 104, 16), shade(f.top, -.08), { elev: 0, amp: .5 }); paper(x, ellipse(22, 110, 17, 17, 24), f.skin, { elev: .4, amp: .4 }); }, { ax: 22, ay: 16, elev: .8 });
  }
  A.case1 = spr(110, 150, (x) => { x.save(); x.strokeStyle = '#6B5B4A'; x.lineWidth = 8; x.lineCap = 'round'; x.beginPath(); x.moveTo(36, 40); x.lineTo(36, 8); x.lineTo(74, 8); x.lineTo(74, 40); x.stroke(); x.restore(); paper(x, rrect(8, 36, 94, 104, 14), P.coral, { elev: .3 }); [30, 55, 80].forEach(v => paper(x, rrect(v - 3, 46, 6, 84, 3), shade(P.coral, -.16), { elev: 0, rim: false })); paper(x, ellipse(28, 144, 8, 8, 12), P.ink, { elev: 0, rim: false }); paper(x, ellipse(82, 144, 8, 8, 12), P.ink, { elev: 0, rim: false }); }, { ax: 55, ay: 150, elev: 1 });
  A.case2 = spr(110, 150, (x) => { x.save(); x.strokeStyle = '#6B5B4A'; x.lineWidth = 8; x.lineCap = 'round'; x.beginPath(); x.moveTo(36, 40); x.lineTo(36, 8); x.lineTo(74, 8); x.lineTo(74, 40); x.stroke(); x.restore(); paper(x, rrect(8, 36, 94, 104, 14), P.blue, { elev: .3 }); paper(x, rrect(8, 78, 94, 14, 3), P.gold, { elev: .2, rim: false }); paper(x, ellipse(28, 144, 8, 8, 12), P.ink, { elev: 0, rim: false }); paper(x, ellipse(82, 144, 8, 8, 12), P.ink, { elev: 0, rim: false }); }, { ax: 55, ay: 150, elev: 1 });
  A.sweat = spr(30, 44, (x) => paper(x, new PB().M(15, 0).Q(32, 28, 15, 42).Q(-2, 28, 15, 0).pts, '#8FD0E8', { elev: 0, amp: .3 }), { elev: .6 });
  A.mop = spr(120, 330, (x) => { paper(x, rrect(54, 0, 12, 270, 5), '#C49A6C', { elev: 0 }); paper(x, new PB().M(24, 262).L(96, 262).Q(112, 310, 104, 326).L(16, 326).Q(8, 310, 24, 262).pts, '#F3EEE4', { elev: .4 }); [36, 52, 68, 84].forEach(v => pencil(x, [[v, 274], [v - 2, 322]], { color: '#CFC7B8', w: 3, wob: 0 })); }, { ax: 60, ay: 326, elev: 1 });
  A.bucket = spr(130, 120, (x) => { x.save(); x.strokeStyle = '#8A857B'; x.lineWidth = 6; x.beginPath(); x.arc(65, 42, 52, Math.PI * 1.05, Math.PI * 1.95); x.stroke(); x.restore(); paper(x, [[10, 36], [120, 36], [106, 118], [24, 118]], '#6FB6D9', { elev: .3 }); paper(x, rrect(4, 28, 122, 16, 8), '#8CCBE8', { elev: .4 }); }, { ax: 65, ay: 118, elev: 1 });
  A.mug = spr(70, 60, (x) => { x.save(); x.strokeStyle = '#fff'; x.lineWidth = 8; x.beginPath(); x.arc(52, 30, 13, -1.3, 1.3); x.stroke(); x.restore(); paper(x, rrect(6, 8, 44, 48, 8), '#FFFFFF', { elev: .3 }); paper(x, rrect(10, 10, 36, 8, 4), '#7A4B2A', { elev: 0, rim: false }); }, { ax: 28, ay: 56, elev: .8 });
}
// x,y = feet. eyes: happy|open|wide|closed|worried. mouth: smile|open|flat|frown|wavy. armL/armR: rotation (0 = hanging).
function drawPerson(ctx, x, y, o = {}) {
  const K = A.ppl[o.kind || 'host'], s = o.s ?? 1, id = o.id || o.kind || 'host';
  const bf = Math.floor(FRAME / 2), jx = (rnd(id, bf, 'x') - .5) * 1.4, jy = (rnd(id, bf, 'y') - .5) * 1.0;
  ctx.save(); ctx.translate(x + jx, y + jy); ctx.rotate(o.rot || 0); ctx.scale(s * (o.flip ? -1 : 1), s * (o.sy ?? 1));
  put(ctx, K.arm, -58, -226, { rot: o.armL ?? .14, boil: 0, elev: .5 });
  put(ctx, K.body, 0, 0, { boil: 0, elev: o.elev ?? 1.2 });
  if (o.held) o.held(ctx);
  put(ctx, K.arm, 58, -226, { rot: o.armR ?? -.14, boil: 0, elev: .8 });
  const hy = -300 + (o.hy || 0), hx = o.hx || 0;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(o.headRot || 0);
  put(ctx, K.head, 0, 0, { boil: 0, elev: 1 });
  ctx.strokeStyle = P.ink; ctx.fillStyle = P.ink; ctx.lineCap = 'round'; ctx.lineWidth = 4.5; ctx.globalAlpha = .9;
  const e = o.eyes || 'happy', m = o.mouth || 'smile', lk = (o.look || 0) * 5, ey = 4, ex = 20;
  [-ex, ex].forEach((cx, i) => {
    ctx.beginPath();
    if (e === 'happy') { ctx.arc(cx + lk, ey + 4, 8, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke(); }
    else if (e === 'closed') { ctx.arc(cx + lk, ey - 3, 8, Math.PI * .12, Math.PI * .88); ctx.stroke(); }
    else if (e === 'wide') { ctx.ellipse(cx + lk, ey, 6.5, 8, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + lk + 2, ey - 3, 2.2, 0, 7); ctx.fill(); ctx.fillStyle = P.ink; }
    else { ctx.ellipse(cx + lk, ey, 4.6, 5.6, 0, 0, 7); ctx.fill(); }
    if (e === 'worried' || e === 'wide') { ctx.beginPath(); ctx.moveTo(cx - 10 * (i ? -1 : 1), ey - 20); ctx.lineTo(cx + 9 * (i ? -1 : 1), ey - 14 - (e === 'wide' ? 8 : 0)); ctx.lineWidth = 4; ctx.stroke(); ctx.lineWidth = 4.5; }
  });
  ctx.beginPath();
  if (m === 'smile') { ctx.arc(lk * .6, 20, 13, Math.PI * .14, Math.PI * .86); ctx.stroke(); }
  else if (m === 'frown') { ctx.arc(lk * .6, 40, 13, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke(); }
  else if (m === 'open') { ctx.ellipse(lk * .6, 29, 7, 9, 0, 0, 7); ctx.fill(); }
  else if (m === 'wavy') { ctx.moveTo(-14 + lk * .6, 30); ctx.quadraticCurveTo(-7, 23, 0, 30); ctx.quadraticCurveTo(7, 37, 14, 30); ctx.stroke(); }
  else { ctx.moveTo(-10 + lk * .6, 30); ctx.lineTo(10 + lk * .6, 30); ctx.stroke(); }
  ctx.globalAlpha = 1;
  ctx.restore(); ctx.restore();
}

// ---------- Sky furniture, sparkles, shared bits ----------
function buildNature() {
  A.cloud1 = spr(330, 150, (x) => paper(x, cloudPts([[70, 95, 55], [140, 70, 70], [225, 88, 58], [280, 110, 40], [110, 115, 38], [190, 115, 40]]), P.white, { elev: 0, amp: 1.2, sheen: .25 }), { elev: 1.6 });
  A.cloud2 = spr(250, 120, (x) => paper(x, cloudPts([[55, 75, 42], [115, 55, 55], [180, 72, 45], [120, 90, 35]]), P.white, { elev: 0, amp: 1.2, sheen: .25 }), { elev: 1.6 });
  A.cloud3 = spr(420, 170, (x) => { paper(x, cloudPts([[80, 110, 60], [170, 75, 80], [265, 90, 70], [345, 118, 45], [140, 130, 40], [230, 130, 45]]), '#F3F7F8', { elev: 0, amp: 1.2 }); }, { elev: 1.4 });
  A.cloudG = spr(330, 150, (x) => paper(x, cloudPts([[70, 95, 55], [140, 70, 70], [225, 88, 58], [280, 110, 40], [110, 115, 38], [190, 115, 40]]), '#8E8AA0', { elev: 0, amp: 1.2, sheen: .1 }), { elev: 1.6 });
  A.sun = spr(300, 300, (x) => {
    paper(x, star(150, 150, 148, 108, 14), P.sunD, { elev: 0, amp: 1.2 });
    paper(x, ellipse(150, 150, 98, 98, 80), P.sun, { elev: 1.3, sheen: .3 });
    paper(x, ellipse(150, 150, 62, 62, 60), '#FAD472', { elev: .6, sheen: .2 });
  }, { elev: 1.2 });
  A.bigSpark = spr(220, 220, (x) => { paper(x, sparkle(110, 110, 105), P.purple, { elev: 0, amp: .8, sheen: .25 }); paper(x, sparkle(110, 110, 58), '#B5A8F0', { elev: .7 }); }, { elev: 2 });
  A.smallSpark = spr(80, 80, (x) => paper(x, sparkle(40, 40, 38), P.gold, { elev: 0 }), { elev: 1.2 });
  A.smallSparkW = spr(60, 60, (x) => paper(x, sparkle(30, 30, 28), '#FFFFFF', { elev: 0 }), { elev: 1 });
  A.smallSparkP = spr(60, 60, (x) => paper(x, sparkle(30, 30, 28), P.purple, { elev: 0 }), { elev: 1 });
  A.check = spr(64, 64, (x) => { paper(x, ellipse(32, 32, 30, 30, 40), P.green, { elev: 0 }); paper(x, [[14, 33], [21, 26], [28, 34], [44, 16], [51, 23], [28, 47]], '#FFFDF8', { elev: .8, amp: .5 }); }, { elev: 1.4 });
  A.xmark = spr(64, 64, (x) => { paper(x, ellipse(32, 32, 30, 30, 40), P.red, { elev: 0 }); cross(x, 32, 32, 12, '#FFFDF8', 8); }, { elev: 1.4 });
  A.heart = spr(90, 90, (x) => glyph(x, 'heart', 45, 45, 40, P.red), { elev: 1.2 });
  A.pencil = spr(300, 40, (x) => {
    paper(x, [[0, 20], [34, 8], [34, 32]], '#E8C9A0', { elev: 0, rim: false });
    paper(x, [[0, 20], [12, 15.5], [12, 24.5]], P.purple, { elev: .2, rim: false });
    paper(x, rrect(34, 6, 210, 28, 3), P.purple, { elev: .2 });
    x.fillStyle = 'rgba(0,0,0,.1)'; x.fillRect(34, 20, 210, 3);
    paper(x, rrect(244, 5, 20, 30, 2), '#C9CCD2', { elev: .3 });
    paper(x, sparkle(280, 20, 20), P.gold, { elev: .4, amp: .3 });
  }, { ax: 0, ay: 20, elev: 2.2 });
  A.hand = spr(200, 1000, (x) => {
    paper(x, rrect(40, 250, 130, 750, 14), P.blue, { elev: 0 });
    paper(x, rrect(34, 236, 142, 36, 10), shade(P.blue, -.15), { elev: .6 });
    const f = new PB().M(50, 250).L(50, 150).Q(50, 118, 80, 118).L(84, 118).L(84, 26).Q(84, 0, 104, 0).Q(124, 0, 124, 26).L(124, 110).Q(150, 104, 158, 124).Q(176, 126, 176, 150).L(176, 250).pts;
    paper(x, f, '#FBD3B4', { elev: 1, amp: .8 });
    pencil(x, [[124, 130], [124, 170]], { color: 'rgba(160,90,60,.35)', w: 3, wob: 0 }); pencil(x, [[150, 140], [150, 175]], { color: 'rgba(160,90,60,.35)', w: 3, wob: 0 });
    paper(x, rrect(92, 8, 24, 22, 8), '#FFF3EA', { elev: .2, rim: false });
  }, { ax: 104, ay: 6, elev: 2.4 });
  const cc = [P.red, P.gold, P.green, P.blue, P.purple, P.pink, '#1FA396', P.orange];
  A.confetti = Array.from({ length: 16 }, (_, i) => spr(30, 30, (x) => { const c = cc[i % 8]; i % 3 === 0 ? paper(x, ellipse(15, 15, 9, 9, 20), c, { elev: 0, rim: false }) : i % 3 === 1 ? paper(x, rrect(4, 9, 22, 12, 2), c, { elev: 0, rim: false }) : paper(x, star(15, 15, 13, 6, 5), c, { elev: 0, rim: false }); }, { elev: 1.6 }));
  A.cursor = spr(46, 62, (x) => paper(x, [[0, 0], [0, 50], [13, 38], [23, 60], [32, 56], [22, 35], [40, 35]], '#FFFFFF', { elev: 0, amp: .5 }), { ax: 0, ay: 0, elev: 1.8 });
  A.dot = {}; [['p', P.purple], ['r', P.red], ['g', P.green], ['b', P.blue], ['w', '#FFFDF8']].forEach(([k, c]) => A.dot[k] = spr(22, 22, (x) => paper(x, ellipse(11, 11, 10, 10, 20), c, { elev: 0 }), { elev: .5 }));
  A.gearBig = spr(200, 200, (x) => glyph(x, 'gear', 100, 100, 120, P.gold, '#F5E5AE'), { elev: 1.2 });
  A.gearSm = spr(130, 130, (x) => glyph(x, 'gear', 65, 65, 78, P.orange, '#F5E5AE'), { elev: 1.2 });
  A.coin = spr(70, 70, (x) => { paper(x, ellipse(35, 35, 33, 33, 40), P.gold, { elev: 0, sheen: .3 }); paper(x, ellipse(35, 35, 25, 25, 40), '#F8CF6A', { elev: .3 }); ink(x, '€', 35, 48, { size: 36, weight: 700, color: '#9A6A00', align: 'center', a: 1 }); }, { elev: 1.2 });
}

// ---------- The house ----------
function buildHouse() {
  A.house = spr(620, 600, (x) => {
    paper(x, rrect(410, 40, 56, 150, 6), '#C97A5A', { elev: .4 }); paper(x, rrect(402, 30, 72, 24, 6), '#B7653F', { elev: .5 });
    paper(x, rrect(70, 230, 480, 366, 8), '#FFF4E2', { elev: 0, amp: 1 });
    paper(x, [[20, 250], [310, 20], [600, 250], [560, 270], [310, 80], [60, 270]], P.red, { elev: 1.2, amp: 1, sheen: .2 });
    paper(x, [[60, 270], [310, 80], [560, 270]], '#FFF4E2', { elev: 0, amp: .6, rim: false });
    paper(x, ellipse(310, 190, 34, 34, 40), '#BFE0EE', { elev: -1, shadowAlpha: 0 }); x.save(); x.strokeStyle = '#fff'; x.lineWidth = 6; x.beginPath(); x.moveTo(276, 190); x.lineTo(344, 190); x.moveTo(310, 156); x.lineTo(310, 224); x.stroke(); x.restore();
    // window with shutters and a flower box
    paper(x, rrect(128, 320, 130, 130, 8), '#BFE0EE', { elev: -1, shadowAlpha: 0 }); x.save(); x.strokeStyle = '#fff'; x.lineWidth = 7; x.beginPath(); x.moveTo(193, 320); x.lineTo(193, 450); x.moveTo(128, 385); x.lineTo(258, 385); x.stroke(); x.restore();
    paper(x, rrect(96, 314, 34, 142, 5), P.sea, { elev: .5 }); paper(x, rrect(256, 314, 34, 142, 5), P.sea, { elev: .5 });
    paper(x, rrect(116, 450, 154, 30, 6), '#C97A5A', { elev: .6 });
    [[140, P.pink], [170, P.red], [200, P.gold], [230, P.pink], [252, P.red]].forEach(([fx, c], i) => { paper(x, ellipse(fx, 446 - (i % 2) * 8, 12, 12, 16), c, { elev: .4, amp: .4 }); });
    [[150, 0], [186, 1], [216, 0]].forEach(([fx]) => paper(x, ellipse(fx, 452, 14, 9, 14), P.leaf, { elev: .2, amp: .3, rim: false }));
    // doorway (dark inside) with a step
    paper(x, rrect(368, 330, 126, 266, 10), '#5B4A42', { elev: -1, shadowAlpha: 0, rim: false });
    paper(x, rrect(354, 582, 154, 18, 5), '#D9CBB6', { elev: .5 });
    paper(x, rrect(404, 282, 54, 34, 8), '#FFFFFF', { elev: .5 }); ink(x, '7', 431, 309, { size: 28, weight: 700, color: P.slate, align: 'center' });
  }, { ax: 310, ay: 596, elev: 1.6 });
  A.door = spr(126, 266, (x) => { paper(x, rrect(0, 0, 126, 266, 8), P.teal, { elev: 0, sheen: .2 }); paper(x, rrect(16, 18, 94, 96, 6), shade(P.teal, -.12), { elev: -1, shadowAlpha: 0 }); paper(x, rrect(16, 132, 94, 114, 6), shade(P.teal, -.12), { elev: -1, shadowAlpha: 0 }); paper(x, ellipse(104, 140, 8, 8, 14), P.gold, { elev: .5 }); }, { ax: 0, ay: 266, elev: .6 });
  A.glow = spr(126, 266, (x) => paper(x, rrect(0, 0, 126, 266, 8), '#FFE9A8', { elev: 0, rim: false, tex: .3 }), { ax: 0, ay: 266, elev: 0 });
  A.bush = spr(200, 110, (x) => paper(x, cloudPts([[50, 70, 40], [100, 52, 50], [150, 70, 40]]), P.leaf, { elev: 0, amp: 1 }), { ax: 100, ay: 108, elev: 1 });
  A.bushD = spr(160, 90, (x) => paper(x, cloudPts([[40, 58, 32], [80, 42, 40], [120, 58, 32]]), P.leafD, { elev: 0, amp: 1 }), { ax: 80, ay: 88, elev: 1 });
  A.ground = spr(2200, 260, (x) => { const b = new PB().M(0, 260).L(0, 60); for (let i = 0; i <= 40; i++) b.L(i * 55, 50 + Math.sin(i * .5) * 14 + Math.sin(i * 1.7) * 5); b.L(2200, 260); paper(x, b.pts, '#B9DDA5', { elev: 0, amp: 1.4, texName: 'bg' }); }, { ax: 0, ay: 0, elev: 1.5 });
  A.path = spr(900, 120, (x) => paper(x, new PB().M(0, 60).Q(450, 10, 900, 40).L(900, 110).Q(450, 80, 0, 120).pts, '#F1D6A2', { elev: 0, amp: 1.2 }), { ax: 0, ay: 60, elev: .4 });
  // keypad lock
  A.keypad = spr(90, 150, (x) => { paper(x, rrect(0, 0, 90, 150, 14), '#3A4650', { elev: 0, sheen: .15 }); for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) paper(x, ellipse(22 + i * 23, 56 + j * 24, 8, 8, 14), '#C9D2D8', { elev: .2, rim: false, amp: .2 }); }, { elev: 1.1 });
  A.ledR = spr(30, 30, (x) => paper(x, ellipse(15, 15, 11, 11, 20), '#F0505C', { elev: 0 }), { elev: .3 });
  A.ledG = spr(30, 30, (x) => paper(x, ellipse(15, 15, 11, 11, 20), '#3CD07F', { elev: 0 }), { elev: .3 });
}

// ---------- Windows, phones, the guest-facing site ----------
// App window with the slate nav rail. crumbs = ['Inbox'] or ['Rentals', 'Casa Marina']; active = index of the lit nav item.
function appWindow(w, h, crumbs, active = 0) {
  return spr(w, h, (x) => {
    paper(x, rrect(0, 0, w, h, 30), '#FBF8F1', { elev: 0, sheen: .08 });
    paper(x, rrect(0, 0, 130, h, 30).map(([a, b]) => [Math.min(a, 84), b]), P.slate, { elev: .3, rim: false, sheen: .1, dark: .15 });
    paper(x, ellipse(42, 48, 24, 24, 40), P.peach, { elev: .5 }); paper(x, new PB().M(18, 44).Q(42, 20, 66, 44).L(66, 52).Q(42, 34, 18, 52).pts, P.red, { elev: .4, amp: .4 });
    for (let i = 0; i < 6; i++) paper(x, rrect(24, 118 + i * 72, 36, 36, 10), i === active ? P.red : '#4B5C67', { elev: .3, rim: false, amp: .4 });
    paper(x, rrect(8, 106 + active * 72, 6, 60, 3), P.red, { elev: 0, rim: false });
    let cx = 112; crumbs.forEach((c, i) => { const last = i === crumbs.length - 1; ink(x, c, cx, 50, { size: 32, weight: last ? 700 : 500, color: last ? P.ink : P.mute }); cx += textW(c, 32, last ? 700 : 500) + 12; if (!last) { ink(x, '›', cx, 50, { size: 32, weight: 600, color: P.mute }); cx += 28; } });
    x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(84, 70, w - 84, 2);
  }, { elev: 2 });
}
function phoneFrame(w, h, o = {}) {
  return spr(w, h, (x) => {
    paper(x, rrect(0, 0, w, h, w * .16), o.body || P.slate, { elev: 0, sheen: .12, dark: .2 });
    paper(x, rrect(w * .05, w * .05, w * .9, h - w * .1, w * .12), o.screen || '#FBF8F1', { elev: -1, shadowAlpha: 0, rim: false });
    paper(x, rrect(w * .37, w * .085, w * .26, w * .065, w * .03), P.slateD, { elev: .2, rim: false });
    if (o.draw) o.draw(x, w, h);
  }, { elev: o.elev ?? 1.8, ax: o.ax, ay: o.ay });
}
function buildSite() {
  const th = { accent: '#2F8FA8', sky: '#BFE3EE', far: '#86CAD6', near: '#3E9DB3', page: '#FFFFFF', text: '#1D3947', card: '#F4FAFB', sun: P.sun };
  A.site = spr(1100, 700, (x) => {
    paper(x, rrect(0, 0, 1100, 700, 24), '#FFFFFF', { elev: 0, sheen: .08 });
    paper(x, rrect(0, 0, 1100, 56, 24).map(([a, b]) => [a, Math.min(b, 56)]), '#ECE7DE', { elev: .3, rim: false });
    [P.red, P.gold, P.green].forEach((c, i) => paper(x, ellipse(30 + i * 26, 28, 8, 8, 20), c, { elev: .3, rim: false }));
    paper(x, rrect(330, 12, 440, 32, 16), '#FFFFFF', { elev: .2 }); ink(x, 'casamarina.com', 550, 35, { size: 19, weight: 500, color: '#555', align: 'center' });
    // nav
    paper(x, rrect(20, 70, 1060, 56, 12), th.card, { elev: .4 });
    paper(x, ellipse(54, 98, 16, 16, 30), th.accent, { elev: .5 }); paper(x, [[46, 102], [62, 102], [54, 90]], '#fff', { elev: .2, rim: false });
    ink(x, 'Casa Marina', 80, 106, { size: 22, weight: 600, color: th.text });
    ['Homes', 'Guides', 'About', 'FAQ'].forEach((w, i) => ink(x, w, 580 + i * 94, 106, { size: 18, weight: 500, color: th.text, a: .75 }));
    paper(x, rrect(960, 81, 104, 34, 17), th.accent, { elev: .5 }); ink(x, 'Book', 1012, 104, { size: 18, weight: 600, color: '#fff', align: 'center' });
    // hero
    paper(x, rrect(20, 136, 1060, 300, 14), th.sky, { elev: .5 });
    x.save(); x.beginPath(); x.roundRect(20, 136, 1060, 300, 14); x.clip(); x.translate(20, 136);
    paper(x, ellipse(900, 90, 46, 46, 50), th.sun, { elev: .6 });
    paper(x, [[0, 300], [0, 200], ...Array.from({ length: 30 }, (_, i) => [i / 29 * 1060, 190 - Math.sin(i / 29 * 5 + .4) * 26 - Math.sin(i * .9) * 6]), [1060, 300]], th.far, { elev: .9 });
    paper(x, [[0, 300], ...Array.from({ length: 30 }, (_, i) => [i / 29 * 1060, 238 - Math.sin(i / 29 * 7 + 2) * 16]), [1060, 300]], th.near, { elev: 1 });
    paper(x, [[770, 190], [850, 190], [850, 240], [770, 240]], '#fff', { elev: .7 }); paper(x, [[760, 196], [810, 158], [860, 196]], th.accent, { elev: .8 });
    x.restore();
    paper(x, rrect(60, 176, 470, 220, 16), 'rgba(255,255,255,.9)', { elev: .8 });
    ink(x, 'Sunny homes by the sea', 84, 246, { size: 37, weight: 700, color: th.text, a: 1 }); ink(x, 'Beachfront stays in Mallorca', 86, 288, { size: 23, weight: 500, color: th.text, a: .8 });
    paper(x, rrect(86, 324, 190, 52, 26), P.red, { elev: .8 }); ink(x, 'Book direct', 181, 358, { size: 22, weight: 700, color: '#fff', align: 'center', a: 1 });
    [0, 1, 2].forEach(i => { const cx = 20 + i * 360; paper(x, rrect(cx, 452, 340, 228, 14), th.card, { elev: .6 }); thumb(x, cx + 10, 462, 320, 140, { ...HOMES[i], r: 10 }); ink(x, HOMES[i].n, cx + 18, 642, { size: 25, weight: 700, color: th.text, a: 1 }); ink(x, ['from €180', 'from €240', 'from €150'][i], cx + 18, 668, { size: 18, weight: 600, color: P.green }); });
  }, { elev: 1.8 });
}

// ---------- Brand ----------
function buildBrand() {
  A.brand = [...'Rental'].map(c => paperText(c, { size: 150, weight: 500, family: F.brand, color: '#F4EFE6', backing: null }))
    .concat([...'Ninja'].map(c => paperText(c, { size: 150, weight: 500, family: F.brand, color: '#F0505C', backing: null })));
  A.brandW = [...'RentalNinja'].map(c => measure(c, `500 150px ${F.brand}`).w);
  A.brandTot = A.brandW.reduce((a, b) => a + b, 0) + 10;
}
// the logo lock-up, letters dropping one per frame from t0; x0 = left edge of the word
function drawBrand(ctx, x0, y, t, t0, s = 1, key = 'br') {
  let x = x0;
  A.brand.forEach((S, i) => { dropIn(ctx, S, x + S.w * s / 2, y, t, t0 + i / 12, { id: key + i, d: .25, spin: (i % 2 ? .1 : -.1), boil: .4, s }); x += (A.brandW[i] + 1) * s; });
}

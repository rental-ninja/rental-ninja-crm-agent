// Humaaans canvas rig. Needs hum_data.js (HUM) loaded first.
// hum(x, px, py, o): px,py = point between the feet on the ground.
// o: head, body, bottom (part names) | cast (HUM_CAST key, fills the rest) | s (1 = 520 px tall) | dir (±1)
//    colors {skin, hair, top, bottom, shoe, inner} | a (alpha) | t (seconds, idle motion)
//    headTilt (rad, + = chin down/forward) | armB (rad, back arm around the shoulder, - = raise forward)
//    walk (phase rad) | walkMode 'legs' (default) or 'swap' | knee (default true)
//    stance (rad: legs straight, ±stance apart, via the leg rig; cast presets may set one for bottoms drawn mid-kick)
//    sit (true or a sitting-bottom name) | seat (default true: draw the Humaaans seat) | lean (rad)

const HUM_WALK = { A: 0.36, bend: 0.75, kneeAt: 0.5, overlap: 0.012 };
// Bottoms whose legs are drawn in a near-straight pose can be rigged; others borrow those legs for walking.
const HUM_WALK_LEGS = { 'Skinny Jeans': 'Skinny Jeans', Sweatpants: 'Sweatpants', Shorts: 'Shorts', 'Skinny Jeans Walk': 'Skinny Jeans', Sprint: 'Sweatpants', 'Baggy Pants': 'Sweatpants', Jogging: 'Sweatpants', Skirt: 'Shorts' };
const HUM_WALK_SWAP = ['Skinny Jeans', 'Skinny Jeans Walk', 'Skinny Jeans', 'Skinny Jeans Walk'];

function humShade(hex, amt) {
  const n = parseInt(hex.slice(1), 16), t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round((t - v) * p + v));
  return '#' + ((1 << 24) + (c[0] << 16) + (c[1] << 8) + c[2]).toString(16).slice(1);
}

function humFill(p, col) {
  let base;
  switch (p.role) {
    case 'skin': base = col.skin; break;
    case 'hair': base = col.hair; break;
    case 'top': base = col.top; break;
    case 'topShade': base = col.top && humShade(col.top, -0.2); break;
    case 'bottom': base = col.bottom; break;
    case 'bottomShade': base = col.bottom && humShade(col.bottom, -0.22); break;
    case 'shoe': base = col.shoe; break;
    default: base = p.inner ? col.inner : null;
  }
  if (!base) return p.fill;
  return p.k ? humShade(base, p.k) : base;
}

const humPath = (p) => p._p || (p._p = new Path2D(p.d));

function humDraw(x, p, col) {
  x.save();
  if (p.clip) x.clip(p._c || (p._c = new Path2D(p.clip)));
  if (p.op !== undefined) x.globalAlpha *= p.op;
  x.fillStyle = humFill(p, col);
  x.fill(humPath(p), p.rule || 'nonzero');
  x.restore();
}

const humRot = (x, cx, cy, a) => { if (a) { x.translate(cx, cy); x.rotate(a); x.translate(-cx, -cy); } };

// Per-leg geometry, computed once per bottom: axis, knee, clip half-planes, knee cap.
function humLegGeo(B) {
  if (B._legs) return B._legs;
  const tmp = document.createElement('canvas').getContext('2d'), out = {}, R = 2, ov = HUM_WALK.overlap;
  for (const k of ['b', 'f']) {
    const parts = B.parts.filter((p) => p.leg === k && p.role !== 'shoe');
    const inside = (x, y) => parts.some((p) => tmp.isPointInPath(humPath(p), x, y));
    // Leg centre line from horizontal scans just below the hip and just above the heel.
    const centre = (y) => {
      let lo = null, hi = null;
      for (let x = -0.45; x <= 0.45; x += 0.002) if (inside(x, y)) { if (lo === null) lo = x; hi = x; }
      return lo === null ? null : (lo + hi) / 2;
    };
    const g = B.legs[k], hy = g.hip[1] + 0.03, ay = g.ankle[1] - 0.03;
    const hx = centre(hy) ?? g.hip[0], ax = centre(ay) ?? g.ankle[0];
    const len = Math.hypot(ax - hx, ay - hy), ux = (ax - hx) / len, uy = (ay - hy) / len, nx = -uy, ny = ux;
    let kx = hx + ux * len * HUM_WALK.kneeAt, ky = hy + uy * len * HUM_WALK.kneeAt;
    let lo = 0, hi = 0;
    while (inside(kx + nx * (lo - 0.002), ky + ny * (lo - 0.002)) && lo > -0.1) lo -= 0.002;
    while (inside(kx + nx * (hi + 0.002), ky + ny * (hi + 0.002)) && hi < 0.1) hi += 0.002;
    kx += nx * (lo + hi) / 2; ky += ny * (lo + hi) / 2;
    const capR = (hi - lo) / 2;
    const half = (s) => { // s=+1: hip side, s=-1: ankle side, overlapping the cut by ov
      const cx = kx + ux * ov * s, cy = ky + uy * ov * s, p = new Path2D();
      p.moveTo(cx + nx * R, cy + ny * R); p.lineTo(cx - nx * R, cy - ny * R);
      p.lineTo(cx - nx * R - ux * R * s, cy - ny * R - uy * R * s); p.lineTo(cx + nx * R - ux * R * s, cy + ny * R - uy * R * s); p.closePath();
      return p;
    };
    let cap = null;
    for (const p of parts) if (tmp.isPointInPath(humPath(p), kx, ky)) cap = p;
    out[k] = { hx, hy, ax, ay, len, rest: Math.atan2(ax - hx, ay - hy), kx, ky, thigh: half(1), shin: half(-1), cap, capX: kx, capY: ky, capR: capR * 0.98 };
  }
  return (B._legs = out);
}

// Leg pose at walk phase ph -> [thigh angle from vertical (+ = forward), knee bend, inStance].
// Each leg spends half the cycle in stance (thigh sweeps back so the foot moves at constant speed,
// knee straight) and half in swing (thigh sweeps forward, knee folds early and is straight again by 60%).
// stance (rad): legs held apart at ±stance instead of walking.
function humLegPose(ph, k, stance) {
  if (stance !== undefined) return [k === 'f' ? -stance : stance, 0.03, true];
  const u = (((ph + (k === 'f' ? 0 : Math.PI)) / (2 * Math.PI) + 0.25) % 1 + 1) % 1, sA = Math.sin(HUM_WALK.A);
  if (u >= 0.5) return [Math.asin(sA * (1 - 4 * (u - 0.5))), 0, true];
  const sw = u * 2;
  return [Math.asin(sA * (2 * sw - 1)), sw < 0.6 ? HUM_WALK.bend * Math.sin(Math.PI * sw / 0.6) : 0, false];
}

function humAnkleY(G, a1, a2) {
  const t = G.len * HUM_WALK.kneeAt, s = G.len - t;
  return G.hy + t * Math.cos(a1) + s * Math.cos(a1 - a2);
}

function humBottomWalk(x, B, ph, col, knee, overlay, stance) {
  const L = humLegGeo(B);
  const pose = { b: humLegPose(ph, 'b', stance), f: humLegPose(ph, 'f', stance) };
  for (const p of overlay?.before || []) humDraw(x, p, col);
  for (const p of B.parts) {
    if (overlay && !p.leg && (p.role === 'bottom' || p.role === 'bottomShade')) continue;
    if (!p.leg) { humDraw(x, p, col); continue; }
    const G = L[p.leg], [a1, a2] = pose[p.leg], rot = G.rest - a1, bend = knee ? a2 : 0;
    if (p.role !== 'shoe') {
      x.save(); humRot(x, G.hx, G.hy, rot); x.clip(G.thigh); humDraw(x, p, col);
      if (knee && p === G.cap) { x.fillStyle = humFill(p, col); x.beginPath(); x.arc(G.capX, G.capY, G.capR, 0, 7); x.fill(); }
      x.restore();
    }
    x.save(); humRot(x, G.hx, G.hy, rot); humRot(x, G.kx, G.ky, bend);
    if (p.role === 'shoe') humRot(x, G.ax, G.ay, -(rot + bend * 0.45));
    else x.clip(G.shin);
    humDraw(x, p, col); x.restore();
  }
  for (const p of overlay?.after || []) humDraw(x, p, col);
}

// How far the hip must drop so the planted foot keeps its original ground contact.
function humWalkDrop(B, ph, knee, stance) {
  const L = humLegGeo(B);
  const lift = ['b', 'f'].map((k) => { const [a1, a2, st] = humLegPose(ph, k, stance); return [L[k].ay - humAnkleY(L[k], a1, knee ? a2 : 0), st]; });
  const planted = lift.filter((v) => v[1]).map((v) => v[0]);
  return Math.min(...(planted.length ? planted : lift.map((v) => v[0])));
}

function hum(x, px, py, o = {}) {
  const c = o.cast ? HUM_CAST[o.cast] : {};
  const head = HUM.heads[o.head || c.head || 'Short 1'], body = HUM.bodies[o.body || c.body || 'Long Sleeve'];
  const col = { ...(c.colors || {}), ...(o.colors || {}) };
  const t = o.t || 0, stance = o.walk == null && !o.sit ? (o.stance ?? (o.bottom ? undefined : c.stance)) : undefined;
  const ph = o.walk ?? (stance !== undefined ? 0 : null), walking = ph !== null && !o.sit;
  const knee = o.knee ?? true, S = 520 * (o.s ?? 1), dir = o.dir ?? 1;
  let bottomName = o.bottom || c.bottom || 'Skinny Jeans', B, dropY = 0, overlay = null;
  if (o.sit) B = HUM.sitting[typeof o.sit === 'string' ? o.sit : (o.sitBottom || c.sit || 'Skinny Jeans 1')];
  else if (walking && o.walkMode === 'swap') {
    B = HUM.bottoms[HUM_WALK_SWAP[Math.floor(((ph % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (Math.PI / 2)) % 4]];
  } else if (walking) {
    const src = HUM.bottoms[bottomName];
    B = HUM.bottoms[HUM_WALK_LEGS[bottomName] || 'Skinny Jeans'];
    if (bottomName === 'Skirt') overlay = { before: src.parts.filter((p) => p.role === 'bottomShade' && !p.leg), after: src.parts.filter((p) => p.role === 'bottom' && !p.leg) };
    dropY = humWalkDrop(B, ph, knee, stance);
  } else B = HUM.bottoms[bottomName];

  x.save();
  x.translate(px, py); x.scale(S * dir, S);
  if (o.a !== undefined) x.globalAlpha *= o.a;
  x.translate(0, -B.ground + dropY);
  if (o.lean) x.rotate(o.lean);
  const [nx, ny] = HUM.neck, breath = Math.sin(t * 2.1) * 0.0018;
  const moving = walking && stance === undefined;
  const tilt = (o.headTilt || 0) + Math.sin(t * 1.3 + 0.7) * 0.025 + (moving ? Math.sin(ph * 2) * 0.02 : 0);
  // head (behind the collar), bottom, then body
  x.save(); x.translate(nx, ny + breath); x.rotate(tilt);
  for (const p of head.parts) humDraw(x, p, col);
  x.restore();
  if (walking && o.walkMode !== 'swap') humBottomWalk(x, B, ph, col, knee, overlay, stance);
  else for (const p of B.parts) if (!(p.seat && o.seat === false)) humDraw(x, p, col);
  const armB = (o.armB || 0) + (moving ? -0.3 * Math.sin(ph) : 0);
  x.save(); x.translate(nx, ny + breath);
  for (const p of body.parts) {
    if (p.arm && body.armPivot && armB) { x.save(); humRot(x, body.armPivot[0], body.armPivot[1], armB); humDraw(x, p, col); x.restore(); }
    else humDraw(x, p, col);
  }
  x.restore();
  x.restore();
}

// Ground distance covered per radian of walk phase (units of person height): px += humStride() * 520 * s * dphase.
function humStride(bottom = 'Skinny Jeans') {
  const B = HUM.bottoms[HUM_WALK_LEGS[bottom] || 'Skinny Jeans'], L = humLegGeo(B).f;
  return (2 * L.len * Math.sin(HUM_WALK.A)) / Math.PI;
}

const HUM_C = { coral: '#F5515F', red: '#9F031B', navy: '#032C5B', cream: '#FFF4EC', blue: '#2885D6', mustard: '#E9A93A', teal: '#2C8C8F', plum: '#6E3C78', khaki: '#C9B08A', ink: '#1E1B2E' };

// The film's FOLKS roles mapped to Humaaans pieces.
const HUM_CAST = {
  host: { head: 'Long', body: 'Turtle Neck', bottom: 'Skinny Jeans', sit: 'Skinny Jeans 1', colors: { skin: '#B98260', hair: '#2A2230', top: HUM_C.coral, bottom: HUM_C.navy, shoe: HUM_C.ink } },
  ginger: { head: 'Wavy', body: 'Long Sleeve', bottom: 'Skirt', stance: 0.1, sit: 'Skinny Jeans 1', colors: { skin: '#F4CDB0', hair: '#E07A3A', top: HUM_C.cream, bottom: HUM_C.red, shoe: HUM_C.navy } },
  beard: { head: 'Short Beard', body: 'Hoodie', bottom: 'Sweatpants', sit: 'Sweat Pants', colors: { skin: '#E9B994', hair: '#4A3428', top: HUM_C.red, bottom: '#6B4A3A', shoe: HUM_C.ink, inner: HUM_C.cream } },
  cleaner: { head: 'Chongo', body: 'Long Sleeve', bottom: 'Sweatpants', sit: 'Sweat Pants', colors: { skin: '#D8A07C', hair: '#2B2230', top: HUM_C.teal, bottom: HUM_C.navy, shoe: '#FFFFFF' } },
  owner: { head: 'Short 1', body: 'Trench Coat', bottom: 'Skinny Jeans', sit: 'Baggy Pants', colors: { skin: '#F3CDB0', hair: '#C9CDD2', top: HUM_C.khaki, bottom: '#4E463F', shoe: HUM_C.ink, inner: HUM_C.navy } },
  blonde: { head: 'Pony', body: 'Jacket 2', bottom: 'Skinny Jeans Walk', stance: 0.12, sit: 'Skinny Jeans 1', colors: { skin: '#F6D2B8', hair: '#E9C27A', top: HUM_C.plum, bottom: HUM_C.navy, shoe: HUM_C.ink, inner: HUM_C.cream } },
  dad: { head: 'Short 2', body: 'Jacket', bottom: 'Baggy Pants', stance: 0.1, sit: 'Baggy Pants', colors: { skin: '#9C6B4E', hair: '#1F1A20', top: HUM_C.blue, bottom: HUM_C.khaki, shoe: HUM_C.ink, inner: HUM_C.cream } },
  tech: { head: 'Caesar', body: 'Hoodie', bottom: 'Skinny Jeans', sit: 'Sweat Pants', colors: { skin: '#D9A27E', hair: '#3A2A22', top: HUM_C.mustard, bottom: HUM_C.navy, shoe: HUM_C.ink, inner: HUM_C.navy } },
};

if (typeof module !== 'undefined') module.exports = { hum, humStride, HUM_CAST, HUM_C };

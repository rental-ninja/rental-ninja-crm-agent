// Flat explainer characters in three-quarter view: slender bodies, small heads, one shade tone, drawn from a small rig every frame.
const FOLKS = {
  host: { skin: '#B98260', hair: '#2A2230', top: '#EDB54B', bottom: '#A9BEDD', shoe: '#F8F9FA', style: 'long', sleeve: 'short' },
  ginger: { skin: '#F4CDB0', hair: '#E07A3A', top: '#F4F4F2', bottom: '#D8453B', legs: '#8A5A48', shoe: '#3A2F2A', style: 'bob', skirt: true, sleeve: 'short', collar: C.navy },
  beard: { skin: '#F0C3A0', hair: '#4A3428', top: '#C8636F', bottom: '#7A5340', shoe: '#3A2F2A', style: 'short', beard: true, sleeve: 'long' },
  cleaner: { skin: '#E2B08A', hair: '#2B2230', top: '#3E9297', bottom: '#30364F', shoe: '#F8F9FA', style: 'bun', apron: '#F8F9FA', sleeve: 'short' },
  owner: { skin: '#F3CDB0', hair: '#D3D7DB', top: '#4FA77A', bottom: '#5E5246', shoe: '#2B2230', style: 'side', glasses: true, sleeve: 'long' },
  blonde: { skin: '#F6D2B8', hair: '#E9C27A', top: '#7A68C9', bottom: '#30364F', shoe: '#F8F9FA', style: 'pony', sleeve: 'long' },
  dad: { skin: '#9C6B4E', hair: '#1F1A20', top: '#4C7FD0', bottom: '#C9B79A', shoe: '#2B2230', style: 'short', sleeve: 'short' },
  tech: { skin: '#D9A27E', hair: '#3A2A22', top: '#EC8B4E', bottom: '#30364F', shoe: '#2B2230', style: 'cap', sleeve: 'short' },
};

function shadeHex(hex, amt) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255; const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b); return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// arm poses: [shoulder, elbow] radians, 0 = hanging, PI = straight up, forward positive
const POSE = {
  wave: (t) => [2.75, .35 + Math.sin(t * 9) * .35],
  up: [2.8, .1], point: [1.45, .05], reach: [1.2, .25], phone: [.45, 2.05], tap: [.75, 1.45], hip: [-.35, -1.2], hang: [.05, .12], hold: [.15, .25], chin: [.5, 2.5],
};

const FOLK = (() => {
  // Smooth path through points; tangents are scaled to each segment so uneven spacing never loops. [x, y, 1] is a hard corner.
  function curve(p, pts, closed = true) {
    const n = pts.length, P = i => pts[closed ? ((i % n) + n) % n : Math.max(0, Math.min(n - 1, i))];
    const dir = i => {
      const q = P(i); if (q[2]) return [0, 0];
      const a = P(i - 1), b = P(i + 1), dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1; return [dx / m, dy / m];
    };
    p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0, segs = closed ? n : n - 1; i < segs; i++) {
      const p1 = P(i), p2 = P(i + 1), d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * .36, t1 = dir(i), t2 = dir(i + 1);
      p.bezierCurveTo(p1[0] + t1[0] * d, p1[1] + t1[1] * d, p2[0] - t2[0] * d, p2[1] - t2[1] * d, p2[0], p2[1]);
    }
    if (closed) p.closePath();
    return p;
  }
  const shape = (pts, closed = true) => curve(new Path2D(), pts, closed);
  // one filled tapered shape along a chain of [x, y, width] nodes; caps < .3 end flat
  function limb(nodes, capA = .9, capB = .9) {
    const n = nodes.length, seg = [], L = [], R = [];
    for (let i = 0; i < n - 1; i++) {
      const dx = nodes[i + 1][0] - nodes[i][0], dy = nodes[i + 1][1] - nodes[i][1], d = Math.hypot(dx, dy) || 1e-6;
      seg.push([-dy / d, dx / d, dx / d, dy / d]);
    }
    for (let i = 0; i < n; i++) {
      const a = seg[Math.max(0, i - 1)], b = seg[Math.min(n - 2, i)];
      let nx = a[0] + b[0], ny = a[1] + b[1]; const m = Math.hypot(nx, ny);
      if (m < 1e-4) { nx = a[0]; ny = a[1]; } else { nx /= m; ny /= m; }
      const h = nodes[i][2] / 2 / Math.sqrt(Math.max(.5, nx * a[0] + ny * a[1]));
      L.push([nodes[i][0] + nx * h, nodes[i][1] + ny * h]); R.push([nodes[i][0] - nx * h, nodes[i][1] - ny * h]);
    }
    const a = seg[0], b = seg[n - 2], E = nodes[n - 1], S = nodes[0], pts = [];
    const flatB = capB < .3, flatA = capA < .3;
    L.forEach((q, i) => pts.push(i === n - 1 && flatB || i === 0 && flatA ? [q[0], q[1], 1] : q));
    if (!flatB) pts.push([E[0] + b[2] * E[2] / 2 * capB, E[1] + b[3] * E[2] / 2 * capB]);
    for (let i = n - 1; i >= 0; i--) { const q = R[i]; pts.push(i === n - 1 && flatB || i === 0 && flatA ? [q[0], q[1], 1] : q); }
    if (!flatA) pts.push([S[0] - a[2] * S[2] / 2 * capA, S[1] - a[3] * S[2] / 2 * capA]);
    return shape(pts);
  }
  const mix = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const cache = new Map();
  const once = (k, fn) => { let v = cache.get(k); if (!v) { v = fn(); cache.set(k, v); } return v; };
  const tone = new Map();
  const sh = (hex, amt) => { const k = hex + amt; let v = tone.get(k); if (!v) { v = shadeHex(hex, amt); tone.set(k, v); } return v; };
  const lum = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * .3 + (n >> 8 & 255) * .59 + (n & 255) * .11) / 255; };
  const fill = (x, p, c) => { x.fillStyle = c; x.fill(p); };
  const line = (x, pts, lw, c) => { x.beginPath(); curve(x, pts, false); x.lineWidth = lw; x.strokeStyle = c; x.lineCap = 'round'; x.lineJoin = 'round'; x.stroke(); };
  const seedOf = s => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) % 9973; return h / 9973; };

  // ---------- static shapes, body frame: feet at 0, 1 = full height, facing +x ----------
  const HEAD = () => once('head', () => shape([[.002, -.968], [.033, -.958], [.049, -.932], [.053, -.902], [.051, -.876], [.043, -.857], [.025, -.847], [.001, -.851], [-.022, -.865], [-.038, -.885], [-.048, -.912], [-.045, -.944], [-.025, -.964]]));
  const NECK = () => once('neck', () => shape([[-.019, -.875, 1], [.009, -.875, 1], [.012, -.80, 1], [-.023, -.80, 1]]));
  const NECKSH = () => once('necksh', () => shape([[-.021, -.874, 1], [.011, -.872, 1], [.0105, -.846], [-.006, -.837], [-.022, -.842]]));
  const TORSO = fem => once('torso' + fem, () => shape(fem
    ? [[-.022, -.808], [-.052, -.798], [-.068, -.778], [-.07, -.74], [-.064, -.68], [-.052, -.61], [-.06, -.522, 1], [.062, -.518, 1], [.052, -.61], [.07, -.68], [.072, -.74], [.064, -.785], [.046, -.8], [.022, -.812]]
    : [[-.024, -.808], [-.06, -.798], [-.078, -.778], [-.08, -.74], [-.074, -.68], [-.064, -.6], [-.066, -.522, 1], [.066, -.518, 1], [.062, -.6], [.072, -.685], [.078, -.745], [.07, -.785], [.05, -.8], [.024, -.812]]));
  const TORSOSH = () => once('torsosh', () => shape([[-.1, -.82, 1], [-.04, -.81], [-.056, -.77], [-.058, -.7], [-.048, -.62], [-.046, -.56], [-.05, -.5, 1], [-.1, -.5, 1]]));
  const NECKHOLE = () => once('neckhole', () => shape([[-.025, -.81], [.0, -.812], [.026, -.814], [.02, -.802], [.002, -.796], [-.016, -.8]]));
  const PELVIS = () => once('pelvis', () => shape([[-.062, -.56, 1], [.062, -.56, 1], [.064, -.5], [.05, -.452], [.0, -.445], [-.05, -.452], [-.064, -.5]]));
  const SKIRT = sit => once('skirt' + sit, () => shape(sit
    ? [[-.058, -.545, 1], [.058, -.545, 1], [.1, -.512], [.16, -.49], [.172, -.425, 1], [-.075, -.42, 1], [-.074, -.48]]
    : [[-.057, -.545, 1], [.057, -.545, 1], [.068, -.48], [.094, -.358, 1], [-.088, -.358, 1], [-.066, -.48]]));
  const SKIRTSH = () => once('skirtsh', () => shape([[-.066, -.48], [-.05, -.48], [-.03, -.43], [-.04, -.356, 1], [-.09, -.356, 1]]));
  const APRON = () => once('apron', () => shape([[-.026, -.712, 1], [.046, -.712, 1], [.05, -.63], [.07, -.57], [.074, -.405, 1], [-.042, -.405, 1], [-.046, -.57], [-.03, -.63]]));
  const SHOE = () => once('shoe', () => shape([[-.022, -.018], [.006, -.017], [.03, -.007], [.052, -.002], [.064, .008], [.062, .024, 1], [-.024, .024, 1], [-.027, .004]]));
  const SOLE = () => once('sole', () => shape([[-.026, .015, 1], [.064, .015, 1], [.063, .02], [.06, .025, 1], [-.024, .025, 1]]));
  // hands: wrist at 0, fingers along +y, thumb on +x
  const HAND = g => once('hand' + g, () => {
    const fist = [[-.011, -.003], [.011, -.003], [.016, .012], [.013, .027], [.0, .032], [-.013, .027], [-.015, .012]];
    if (g === 'fist') return [shape(fist), limb([[.008, .006, .011], [.014, .018, .009], [.008, .026, .008]])];
    if (g === 'point') return [shape(fist), limb([[.004, .022, .0095], [.006, .044, .0085], [.007, .06, .008]]), limb([[.008, .006, .011], [.016, .018, .0085]])];
    if (g === 'open') return [shape([[-.012, -.003], [.012, -.003], [.016, .02], [.015, .043], [.006, .054], [-.004, .053], [-.012, .042], [-.016, .018]]), limb([[.008, .004, .012], [.026, .014, .009]])];
    return [shape([[-.01, -.003], [.01, -.003], [.0125, .014], [.011, .031], [.004, .041], [-.004, .04], [-.01, .03], [-.0115, .012]]), limb([[.006, .004, .01], [.0125, .018, .0075], [.011, .026, .0065]])];
  });
  const OPENGAPS = [[[.008, .03], [.008, .05]], [[0, .032], [-.0, .052]], [[-.007, .03], [-.008, .047]]];

  // hair: [back layer (shade tone, behind the head), front layer, strand lines]
  const HAIR = st => once('hair' + st, () => {
    switch (st) {
      case 'long': return {
        back: shape([[.02, -.982], [-.03, -.988], [-.064, -.958], [-.076, -.9], [-.082, -.8], [-.088, -.72], [-.074, -.684, 1], [-.034, -.70, 1], [-.028, -.78], [-.026, -.86], [-.01, -.91]]),
        front: shape([[.047, -.938], [.034, -.972], [-.006, -.99], [-.048, -.975], [-.066, -.932], [-.068, -.862], [-.062, -.78], [-.056, -.722, 1], [-.034, -.738], [-.026, -.80], [-.022, -.868], [-.012, -.915], [.008, -.944], [.03, -.946]]),
        lines: [[[-.004, -.988], [-.03, -.95], [-.04, -.88], [-.046, -.79]], [[-.052, -.94], [-.058, -.86], [-.054, -.78]]],
      };
      case 'bob': return {
        back: shape([[-.04, -.97], [-.07, -.935], [-.078, -.88], [-.072, -.842, 1], [-.03, -.842, 1], [-.03, -.9]]),
        front: shape([[.053, -.93], [.045, -.962], [.018, -.982], [-.022, -.986], [-.058, -.966], [-.072, -.926], [-.074, -.878], [-.068, -.846, 1], [-.012, -.846], [.006, -.84, 1], [-.004, -.862], [-.01, -.89], [-.006, -.915], [.008, -.932], [.03, -.938]]),
        lines: [[[.03, -.975], [.012, -.95], [.004, -.93]], [[-.04, -.96], [-.054, -.9], [-.05, -.86]]],
      };
      case 'bun': return {
        back: null, bun: true,
        front: shape([[.045, -.944], [.032, -.967], [.0, -.979], [-.034, -.971], [-.054, -.946], [-.056, -.906], [-.048, -.876], [-.034, -.874, 1], [-.029, -.9], [-.013, -.914], [-.006, -.9, 1], [.002, -.902, 1], [.008, -.932], [.026, -.946]]),
        lines: [[[.03, -.966], [.0, -.958], [-.03, -.94]]],
        tie: [-.036, -.958, .007],
      };
      case 'pony': return {
        back: null,
        front: shape([[.048, -.94], [.036, -.968], [.004, -.981], [-.032, -.974], [-.054, -.948], [-.056, -.906], [-.048, -.876], [-.034, -.874, 1], [-.029, -.9], [-.013, -.914], [-.006, -.9, 1], [.002, -.902, 1], [.01, -.928], [.03, -.946]]),
        lines: [[[.036, -.968], [.016, -.952], [.002, -.93]], [[-.012, -.976], [-.036, -.95]]],
        pony: true,
      };
      case 'side': return {
        back: null,
        front: shape([[.048, -.938], [.038, -.962], [.008, -.976], [-.028, -.972], [-.052, -.95], [-.056, -.91], [-.048, -.884], [-.036, -.878, 1], [-.03, -.9], [-.012, -.912], [-.008, -.894, 1], [.0, -.894, 1], [.006, -.93], [.026, -.947]]),
        lines: [[[.018, -.962], [-.002, -.956], [-.03, -.952]]],
      };
      case 'cap': return {
        back: null,
        front: shape([[-.05, -.93], [-.056, -.9], [-.048, -.878], [-.034, -.876, 1], [-.029, -.9], [-.012, -.912], [-.006, -.894, 1], [.002, -.896, 1], [.004, -.925]]),
        lines: [],
        cap: {
          dome: shape([[-.055, -.914, 1], [-.055, -.95], [-.036, -.979], [.0, -.99], [.034, -.98], [.05, -.954], [.053, -.926, 1]]),
          bill: shape([[.03, -.936, 1], [.07, -.938], [.098, -.93], [.102, -.92], [.08, -.917], [.03, -.922, 1]]),
          band: shape([[-.055, -.925, 1], [.053, -.936, 1], [.053, -.926, 1], [-.055, -.914, 1]]),
          seam: [[-.002, -.99], [.006, -.96], [.006, -.932]],
        },
      };
      default: return {
        back: null,
        front: shape([[.049, -.944], [.054, -.966], [.037, -.987], [.004, -.991], [-.03, -.983], [-.052, -.958], [-.056, -.92], [-.05, -.886], [-.036, -.876, 1], [-.03, -.9], [-.012, -.912], [-.008, -.892, 1], [.0, -.894, 1], [.004, -.928], [.024, -.944]]),
        lines: [[[.046, -.972], [.02, -.968], [-.01, -.962]]],
      };
    }
  });
  const BEARD = () => once('beard', () => shape([[-.036, -.906, 1], [-.012, -.914], [-.004, -.89], [.012, -.884], [.03, -.882], [.046, -.886], [.056, -.876], [.057, -.858], [.049, -.84], [.032, -.829], [.008, -.83], [-.012, -.842], [-.024, -.862], [-.034, -.884]]));

  // ---------- the figure ----------
  function draw(x, px, py, o) {
    const f = { ...FOLKS[o.who || 'host'], ...(o.look || {}) }, Hh = 520 * (o.s ?? 1), dir = o.dir ?? 1;
    const t = o.t ?? (typeof FRAME !== 'undefined' ? FRAME / FPS : 0), seed = seedOf(o.who || 'host') * 6.283;
    const fem = ['long', 'bob', 'bun', 'pony'].includes(f.style) ? 1 : 0;
    const skin = f.skin, skinB = sh(skin, -.1), skinD = sh(skin, -.16), ink = sh(skin, -.45);
    const top = f.top, topD = sh(top, lum(top) > .85 ? -.1 : -.17), bot = f.bottom, botD = sh(bot, -.17), hair = f.hair, hairD = sh(hair, lum(hair) > .6 ? -.2 : -.25);
    const sleeveLong = f.sleeve === 'long', cuff = f.collar || topD;
    x.translate(px, py); x.scale(Hh * dir, Hh); if (o.lean) x.rotate(o.lean);
    const ph = o.walk, walking = ph !== undefined && ph !== null, idle = o.idle !== false && !walking && !o.sit;
    if (idle) x.rotate(Math.sin(t * .8 + seed) * .004);
    const breath = o.idle === false ? 0 : (Math.sin(t * 2.4 + seed) * .5 + .5) * .0028;

    // ----- legs -----
    const hipY = -.47, L1 = .228, L2 = .215;
    const legGeo = (side, phase) => {
      let a1 = side > 0 ? .045 : -.03, a2 = 0, foot = 0;
      if (o.sit) { a1 = 1.45 + side * .04; a2 = 1.45; }
      else if (walking) { a1 = .42 * Math.sin(phase); a2 = .62 * Math.max(0, Math.cos(phase)) + .06; foot = (a2 - .06) * .8 - Math.max(0, a1) * .45; }
      else if (o.stance) { a1 = side * o.stance; }
      const hx = side * .02, kx = hx + L1 * Math.sin(a1), ky = hipY + L1 * Math.cos(a1);
      return { h: [hx, hipY], k: [kx, ky], a: [kx + L2 * Math.sin(a1 - a2), ky + L2 * Math.cos(a1 - a2)], foot };
    };
    const p0 = walking ? ph : 0, legB = legGeo(-1, p0 + Math.PI), legF = legGeo(1, p0);
    if (o.sit) x.translate(0, .245);
    else if (walking) x.translate(0, -.027 - Math.max(legB.a[1], legF.a[1]));
    const shoe = (g, back) => {
      x.save(); x.translate(g.a[0], g.a[1]); x.rotate(g.foot);
      const c = back ? sh(f.shoe, -.12) : f.shoe;
      fill(x, SHOE(), c); fill(x, SOLE(), lum(f.shoe) > .6 ? sh(f.shoe, -.22) : sh(f.shoe, .3)); x.restore();
    };
    const leg = (g, back) => {
      if (f.skirt) {
        const c = back ? sh(f.legs, -.15) : f.legs;
        fill(x, limb([[g.h[0], g.h[1] - .03, .05], g.h.concat(.05), mix(g.h, g.k, .55).concat(.042), g.k.concat(.036), mix(g.k, g.a, .35).concat(.037), g.a.concat(.026)], .9, .6), c);
        shoe(g, back);
      } else {
        shoe(g, back);
        const c = back ? botD : bot;
        fill(x, limb([[g.h[0], g.h[1] - .03, .074], g.h.concat(.073), mix(g.h, g.k, .5).concat(.066), g.k.concat(.057), mix(g.k, g.a, .5).concat(.053), [g.a[0], g.a[1] - .004, .052]], .9, .1), c);
      }
    };
    leg(legB, true); leg(legF, false);
    if (f.skirt) {
      fill(x, SKIRT(o.sit ? 1 : 0), f.bottom);
      if (!o.sit) fill(x, SKIRTSH(), sh(f.bottom, -.14));
      x.fillStyle = sh(f.bottom, -.14); x.fillRect(-.057, -.545, .114, .012);
    } else {
      fill(x, PELVIS(), bot);
      if (o.sit) ell(x, -.012, -.462, .07, .034, bot);
      if (!o.sit) line(x, [[.03, -.54], [.024, -.5], [.02, -.47]], .003, botD);
    }

    // ----- upper body, breathing -----
    x.translate(0, -breath);
    const swing = walking ? Math.sin(ph) * .38 : 0;
    const armGeo = (front, ang) => {
      const sx = front ? .04 : -.05, sy = -.765;
      const [a1, a2] = ang || [walking ? (front ? -swing : swing) : (front ? .07 : -.12), walking ? .2 + .22 * Math.max(0, front ? -Math.sin(ph) : Math.sin(ph)) : .14 + (idle ? Math.sin(t * 1.1 + seed + (front ? 0 : 1)) * .03 : 0)];
      const ex = sx + .16 * Math.sin(a1), ey = sy + .16 * Math.cos(a1);
      return { s: [sx, sy], e: [ex, ey], h: [ex + .15 * Math.sin(a1 + a2), ey + .15 * Math.cos(a1 + a2)], a: a1 + a2, a1 };
    };
    const hand = (g, back, gesture) => {
      x.save(); x.translate(g.h[0], g.h[1]); x.rotate(-g.a);
      for (const p of HAND(gesture)) fill(x, p, back ? skinB : skin);
      if (gesture === 'open') { x.lineWidth = .0022; x.strokeStyle = skinD; x.lineCap = 'round'; x.beginPath(); for (const [p, q] of OPENGAPS) { x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); } x.stroke(); }
      x.restore();
    };
    const arm = (g, back, gesture) => {
      const sk = back ? skinB : skin, tp = back ? topD : top;
      const u = (k) => mix(g.s, g.e, k), lo = (k) => mix(g.e, g.h, k);
      const bare = sleeveLong ? null : limb([g.s.concat(.036), u(.5).concat(.032), g.e.concat(.028), lo(.55).concat(.026), lo(.97).concat(.021)], .9, .6);
      const sleeve = sleeveLong
        ? limb([[g.s[0], g.s[1] - .006, .054], u(.5).concat(.048), g.e.concat(.043), lo(.5).concat(.04), lo(.9).concat(.037)], .9, .1)
        : limb([[g.s[0], g.s[1] - .006, .056], u(.3).concat(.052), u(.5).concat(.049)], .9, .1);
      if (!back) {
        // the near arm casts a sliver of shade on the shirt so it reads against the same colour
        x.save(); x.clip(TORSO(fem)); x.translate(-.008, .005);
        if (bare) fill(x, bare, topD);
        fill(x, sleeve, topD); x.restore();
      }
      if (bare) fill(x, bare, sk);
      hand(g, back, gesture);
      fill(x, sleeve, tp);
      if (sleeveLong) fill(x, limb([lo(.8).concat(.0385), lo(.9).concat(.0375)], .1, .1), back ? sh(cuff, -.08) : cuff);
      else fill(x, limb([u(.43).concat(.0495), u(.5).concat(.049)], .1, .1), f.collar ? (back ? sh(cuff, .1) : cuff) : sh(tp, -.1));
    };
    const gestureOf = (g, explicit, holding, pose) => explicit || (holding ? 'fist' : pose === POSE.point || pose === POSE.reach ? 'point' : g.a1 > 2.2 ? 'open' : 'relax');
    const gB = armGeo(false, o.armB);
    arm(gB, true, gestureOf(gB, o.handB, false, o.armB));

    // ----- hair behind, neck, torso -----
    const hs = HAIR(f.style);
    const tilt = (o.headTilt || 0) + (idle ? Math.sin(t * .6 + seed) * .012 : 0);
    const headFrame = (fn) => { x.save(); x.translate(0, -.85); x.rotate(tilt); x.translate(0, .85); fn(); x.restore(); };
    if (hs.back && f.style !== 'long') headFrame(() => fill(x, hs.back, hairD));
    if (hs.pony) headFrame(() => {
      const sw = walking ? Math.sin(ph) * .1 : Math.sin(t * 1.3 + seed) * .03;
      x.save(); x.translate(-.044, -.962); x.rotate(sw);
      fill(x, limb([[0, 0, .03], [-.03, .012, .038], [-.046, .06, .03], [-.044, .12, .016], [-.034, .15, .006]], .9, .9), hairD);
      fill(x, limb([[0, 0, .026], [-.026, .012, .03], [-.04, .058, .022], [-.039, .1, .01]], .9, .9), hair);
      x.restore();
    });
    fill(x, NECK(), skin); fill(x, NECKSH(), skinD);
    if (f.style === 'long') headFrame(() => fill(x, hs.back, hairD));
    fill(x, TORSO(fem), top);
    x.save(); x.clip(TORSO(fem)); fill(x, TORSOSH(), topD);
    if (sleeveLong) { x.fillStyle = topD; x.fillRect(-.08, -.516, .16, .02); }
    else line(x, [[.058, -.575], [.035, -.555], [.0, -.552]], .003, topD);
    x.restore();
    fill(x, NECKHOLE(), skin); line(x, [[-.025, -.808], [-.012, -.798], [.008, -.796], [.026, -.811]], f.collar ? .007 : .005, f.collar || topD);
    if (f.apron) {
      line(x, [[-.022, -.712], [-.03, -.76], [-.028, -.805]], .006, f.apron);
      fill(x, APRON(), f.apron);
      x.fillStyle = sh(f.apron, -.1); x.fillRect(-.046, -.6, .118, .01);
      rr(x, -.002, -.535, .05, .05, .008, sh(f.apron, -.07));
    }

    // ----- head -----
    headFrame(() => {
      fill(x, HEAD(), skin);
      x.save(); x.clip(HEAD()); x.translate(-.003, .008); fill(x, hs.cap ? hs.cap.bill : hs.front, skinD); x.restore();
      if (!f.beard) { ell(x, -.02, -.902, .0085, .0125, skin); x.lineWidth = .0028; x.strokeStyle = skinD; x.beginPath(); x.arc(-.02, -.902, .005, -1.2, 1.4); x.stroke(); }
      if (f.beard) {
        fill(x, BEARD(), hair);
        line(x, [[-.004, -.89], [.006, -.866], [.0, -.85]], .003, hairD);
      }
      face(x, f, o, t, seed, skin, skinD, ink, hair);
      if (hs.cap) {
        fill(x, hs.front, hair); const cc = f.capCol || C.navy;
        fill(x, hs.cap.dome, cc); fill(x, hs.cap.band, sh(cc, .15)); fill(x, hs.cap.bill, sh(cc, .08));
        line(x, hs.cap.seam, .0025, sh(cc, .2)); circ(x, -.001, -.99, .005, sh(cc, .2));
      } else {
        fill(x, hs.front, hair);
        for (const l of hs.lines) line(x, l, .003, hairD);
        if (hs.bun) { circ(x, -.05, -.976, .021, hairD); circ(x, -.047, -.979, .018, hair); line(x, [[-.06, -.986], [-.05, -.992], [-.038, -.988]], .0028, hairD); }
        if (hs.tie) circ(x, hs.tie[0], hs.tie[1], hs.tie[2], sh(hair, -.35));
        if (hs.pony) circ(x, -.046, -.96, .008, sh(hair, -.45));
      }
      if (f.glasses) {
        x.lineWidth = .0032; x.strokeStyle = C.navy; x.beginPath();
        x.roundRect(.021, -.915, .025, .019, .006); x.roundRect(-.004, -.914, .017, .018, .006);
        x.moveTo(.013, -.909); x.lineTo(.021, -.909); x.moveTo(-.004, -.909); x.lineTo(-.016, -.906); x.stroke();
      }
    });

    // ----- front arm and whatever it holds -----
    const gF = armGeo(true, o.armF);
    if (o.hold === 'phone') {
      arm(gF, false, 'fist');
      x.save(); x.translate(gF.h[0], gF.h[1]); x.rotate(Math.PI - gF.a + (o.holdRot || 0));
      rr(x, -.022, -.05, .044, .075, .008, C.navy); rr(x, -.017, -.044, .034, .06, .005, o.screen || C.teal);
      rr(x, .016, -.01, .012, .013, .006, skin); rr(x, .015, .004, .011, .011, .0055, skin); rr(x, .014, .015, .01, .01, .005, skinD);
      x.save(); x.translate(-.018, .002); x.rotate(-.5); rr(x, -.006, -.014, .012, .024, .006, skin); x.restore();
      x.restore();
    } else if (o.hold === 'case') {
      const cc = o.caseCol || C.coral, ccD = sh(cc, -.18);
      x.save(); x.translate(gF.h[0], gF.h[1] + .016);
      strokeL(x, [[-.016, .0], [-.016, .1]], .006, C.navyM); strokeL(x, [[.016, 0], [.016, .1]], .006, C.navyM);
      rr(x, -.06, .1, .12, .16, .02, cc);
      rr(x, -.06, .23, .12, .03, .02, ccD); x.fillStyle = cc; x.fillRect(-.06, .224, .12, .012);
      rr(x, -.035, .115, .01, .13, .005, ccD); rr(x, .025, .115, .01, .13, .005, ccD);
      rr(x, -.03, .094, .06, .01, .004, C.navyL);
      circ(x, -.04, .265, .012, C.navy); circ(x, .04, .265, .012, C.navy); circ(x, -.04, .265, .004, C.navyM); circ(x, .04, .265, .004, C.navyM);
      rr(x, -.022, -.008, .044, .012, .006, C.navy);
      x.restore();
      arm(gF, false, 'fist');
    } else arm(gF, false, gestureOf(gF, o.handF, false, o.armF));
  }

  function face(x, f, o, t, seed, skin, skinD, ink, hair) {
    const mood = o.mood || 'smile', eyeY = -.906, navy = C.navy;
    // blink: explicit, at blinkAt, or every few seconds with a half-closed frame either side
    let lid = 1;
    if (o.blink) lid = 0;
    else {
      const bt = o.blinkAt !== undefined ? o.t - o.blinkAt + .08 : (o.autoBlink === false ? -1 : ((t + seed) % (3.4 + seed * .25)));
      if (bt >= 0 && bt < .16) lid = Math.min(1, Math.abs(bt - .08) / .08 * 1.2);
    }
    const shut = lid < .2 || mood === 'happy';
    // blush and nose
    ell(x, .034, -.884, .008, .0045, 'rgba(226,96,96,.16)');
    line(x, [[.045, -.918], [.054, -.892], [.044, -.886]], .0032, ink);
    // eyes
    const eyes = [[.032, 1], [.006, .85]];
    for (const [ex, k] of eyes) {
      if (shut) { x.lineWidth = .0045; x.strokeStyle = navy; x.lineCap = 'round'; x.beginPath(); x.arc(ex, eyeY + (mood === 'happy' ? .004 : -.001), .0062 * k, mood === 'happy' ? Math.PI * 1.15 : Math.PI * .15, mood === 'happy' ? Math.PI * 1.85 : Math.PI * .85); x.stroke(); }
      else ell(x, ex, eyeY, .0042 * k, (mood === 'wide' ? .0085 : .0064) * lid, navy);
    }
    // brows
    const browC = lum(hair) > .55 ? sh(hair, -.45) : hair, by = mood === 'wide' ? -.006 : 0;
    if (mood === 'worried') { line(x, [[.024, -.931], [.033, -.928], [.042, -.921]], .0036, browC); line(x, [[-.002, -.92], [.012, -.929]], .0034, browC); }
    else { line(x, [[.023, -.922 + by], [.032, -.927 + by], [.042, -.924 + by]], .0036, browC); line(x, [[-.003, -.921 + by], [.005, -.925 + by], [.012, -.924 + by]], .0034, browC); }
    // mouth
    const mx = .031, my = -.872;
    if (f.beard) ell(x, mx, my + .001, .011, .006, skinD);
    if (mood === 'open' || mood === 'wide') { ell(x, mx, my, .0062, mood === 'wide' ? .0085 : .0062, navy); ell(x, mx, my + .0035, .0038, .0022, '#E0707A'); }
    else if (mood === 'happy') {
      x.beginPath(); x.moveTo(mx - .012, my - .004); x.quadraticCurveTo(mx, my - .001, mx + .012, my - .005); x.quadraticCurveTo(mx + .008, my + .011, mx - .001, my + .01); x.quadraticCurveTo(mx - .01, my + .008, mx - .012, my - .004); x.fillStyle = navy; x.fill();
      ell(x, mx, my + .006, .005, .0026, '#E0707A');
    }
    else if (mood === 'worried') line(x, [[mx - .009, my + .002], [mx - .003, my - .002], [mx + .003, my + .001], [mx + .009, my - .002]], .0034, navy);
    else { x.lineWidth = .0036; x.strokeStyle = navy; x.lineCap = 'round'; x.beginPath(); x.arc(mx, my - .01, .012, Math.PI * .28, Math.PI * .72); x.stroke(); }
  }

  // translucent figures go through an offscreen pass so overlapping parts do not show seams
  let off = null;
  function ghost(x, px, py, o, alpha) {
    const cv = x.canvas, Wc = cv.width, Hc = cv.height;
    if (!off || off.width !== Wc || off.height !== Hc) { off = document.createElement('canvas'); off.width = Wc; off.height = Hc; }
    const m = x.getTransform(), Hh = 520 * (o.s ?? 1);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [u, v] of [[-.65, -1.35], [.65, -1.35], [.65, .55], [-.65, .55]]) {
      const X = px + u * Hh, Y = py + v * Hh, dx = m.a * X + m.c * Y + m.e, dy = m.b * X + m.d * Y + m.f;
      x0 = Math.min(x0, dx); x1 = Math.max(x1, dx); y0 = Math.min(y0, dy); y1 = Math.max(y1, dy);
    }
    x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(Wc, Math.ceil(x1)); y1 = Math.min(Hc, Math.ceil(y1));
    if (x1 <= x0 || y1 <= y0) return;
    const ox = off.getContext('2d');
    ox.setTransform(1, 0, 0, 1, 0, 0); ox.globalAlpha = 1; ox.clearRect(x0, y0, x1 - x0, y1 - y0);
    ox.save(); ox.setTransform(m); draw(ox, px, py, o); ox.restore();
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = alpha; x.drawImage(off, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); x.restore();
  }

  return { draw, ghost, limb, shape, curve, sh };
})();

// x,y = feet on the ground. o: who, s (1 = 520 px tall), dir (1 right, -1 left), walk (stride phase or null),
// armF/armB = [shoulder, elbow] radians, mood, blink, blinkAt, t, hold ('phone' | 'case'), sit, lean, headTilt, a, look, stance,
// handF/handB ('relax' | 'open' | 'fist' | 'point'), idle (false = no breathing/sway), autoBlink (false = no automatic blink)
function person(x, px, py, o = {}) {
  const a = o.a ?? 1; if (a <= .001) return;
  const alpha = x.globalAlpha * a;
  if (alpha < .995 && x.canvas && x.getTransform) return FOLK.ghost(x, px, py, o, alpha);
  x.save(); FOLK.draw(x, px, py, o); x.restore();
}

// close-up hand holding a phone, the reference's "Best Friend Ben" shot. fn draws the screen in a 300x640 box.
function handPhone(x, px, py, o, fn) {
  at(x, px, py, o, (x) => {
    const sk = o.skin || '#F2C6A0', skD = shadeHex(sk, -.14), sl = o.sleeve || C.teal, slD = shadeHex(sl, -.15);
    // forearm and sleeve
    x.fillStyle = sk; x.fill(FOLK.shape([[-120, 560], [110, 560], [150, 700], [170, 920, 1], [-190, 920, 1], [-160, 700]]));
    x.fillStyle = sl; x.fill(FOLK.shape([[-175, 700, 1], [165, 690, 1], [190, 920, 1], [-205, 920, 1]]));
    x.fillStyle = slD; x.fill(FOLK.shape([[-175, 700, 1], [165, 690, 1], [168, 735, 1], [-178, 745, 1]]));
    // palm behind the phone
    x.fillStyle = sk; x.fill(FOLK.shape([[-170, 260], [-60, 200], [120, 210], [190, 300], [185, 470], [120, 600], [-120, 610], [-190, 470]]));
    x.fillStyle = skD; x.fill(FOLK.shape([[-120, 560, 1], [110, 560, 1], [120, 600], [0, 625], [-120, 610]]));
    // phone
    rr(x, -170, -330, 340, 680, 46, C.navy);
    rr(x, 168, -170, 8, 70, 3, C.navyM); rr(x, -176, -200, 8, 50, 3, C.navyM); rr(x, -176, -130, 8, 50, 3, C.navyM);
    rr(x, -150, -310, 300, 640, 30, C.white);
    x.save(); rrPath(x, -150, -310, 300, 640, 30); x.clip(); x.translate(-150, -310); fn(x, 300, 640); x.restore();
    rr(x, -40, -322, 80, 10, 5, C.navyL);
    // fingers curling over the right edge, thumb over the left
    [[0, 64, 66], [72, 62, 66], [142, 58, 62], [208, 52, 56]].forEach(([y, h, w], i) => {
      rr(x, 136, y + 7, w, h, h / 2, skD);
      rr(x, 136, y, w, h, h / 2, sk);
    });
    x.fillStyle = skD; x.fill(FOLK.limb([[-206, 500, 100], [-194, 330, 84], [-164, 222, 68], [-146, 190, 60]], .9, .95));
    x.fillStyle = sk; x.fill(FOLK.limb([[-206, 492, 100], [-196, 324, 84], [-166, 214, 68], [-148, 182, 60]], .9, .95));
    x.fillStyle = shadeHex(sk, .3); x.fill(FOLK.limb([[-160, 198, 30], [-148, 182, 24]], .9, .9));
  });
}

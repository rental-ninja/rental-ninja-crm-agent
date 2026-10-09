// Flat vector hands. Load after flat.js, folk.js and world.js.
// Every hand is built from cached Path2D shapes (tapered bezier fingers, palms, cuffs) and filled with
// three tones derived from the skin: base, one shade, and a pale nail tint. Light comes from the top left.

const HAND = (() => {
  const cache = new Map();
  const P = (key, build) => { let p = cache.get(key); if (!p) { p = new Path2D(); build(p); cache.set(key, p); } return p; };
  const r1 = v => Math.round(v * 2) / 2;

  function mixHex(a, b, k) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (s) => Math.round(lerp(pa >> s & 255, pb >> s & 255, k));
    return '#' + ((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1);
  }
  const palCache = new Map();
  function pal(skin, sleeve) {
    const k = skin + sleeve; let p = palCache.get(k);
    if (!p) {
      p = {
        skin, shade: mixHex(skin, '#8A3F38', .24), deep: mixHex(skin, '#4A2230', .42), nail: mixHex(skin, '#FFFFFF', .42),
        sleeve, sleeveD: mixHex(sleeve, '#1E2236', .2), sleeveL: mixHex(sleeve, '#FFFFFF', .16),
      };
      palCache.set(k, p);
    }
    return p;
  }

  // a finger segment pointing up (-y): base centre at 0,0, round tip at -len, widths w0 at the base, w1 at the tip
  function fingerPath(len, w0, w1) {
    len = r1(len); w0 = r1(w0); w1 = r1(w1);
    return P(`f${len}|${w0}|${w1}`, (p) => {
      const a = w0 / 2, b = w1 / 2;
      p.moveTo(-a, 0);
      p.bezierCurveTo(-a * 1.04, -len * .45, -b * 1.06, -len * .7, -b, -len + b);
      p.bezierCurveTo(-b, -len - b * .32, -b * .5, -len, 0, -len);
      p.bezierCurveTo(b * .5, -len, b, -len - b * .32, b, -len + b);
      p.bezierCurveTo(b * 1.04, -len * .7, a * 1.02, -len * .45, a, 0);
      p.bezierCurveTo(a, a * .6, -a, a * .6, -a, 0);
      p.closePath();
    });
  }
  // a thin crescent used for knuckle creases and folds
  function creasePath(w, d) {
    return P(`c${r1(w)}|${r1(d)}`, (p) => { p.moveTo(-w / 2, 0); p.quadraticCurveTo(0, d, w / 2, 0); p.quadraticCurveTo(0, d * .45, -w / 2, 0); p.closePath(); });
  }
  function crease(x, cx, cy, w, d, rot, col) { x.save(); x.translate(cx, cy); x.rotate(rot); x.fillStyle = col; x.fill(creasePath(w, d)); x.restore(); }
  // a nail seen from above, near the tip of a finger pointing up
  function nailPath(w, h) {
    return P(`n${r1(w)}|${r1(h)}`, (p) => {
      p.moveTo(-w / 2, h * .2); p.bezierCurveTo(-w / 2, -h * .7, w / 2, -h * .7, w / 2, h * .2);
      p.bezierCurveTo(w / 2, h * .55, -w / 2, h * .55, -w / 2, h * .2); p.closePath();
    });
  }

  // one finger: base at 0,0, pointing up, rim of shade on side `rim` (+1 right, -1 left)
  function finger(x, pc, len, w0, w1, o = {}) {
    const rim = o.rim ?? 1;
    x.fillStyle = pc.shade; x.fill(fingerPath(len, w0, w1));
    x.save(); x.translate(-rim * w1 * .1, -1); x.fillStyle = pc.skin; x.fill(fingerPath(len - w1 * .06, w0 * .8, w1 * .78)); x.restore();
    if (o.creases) o.creases.forEach(([k, wk]) => crease(x, -rim * w1 * .06, -len * k, w1 * (wk ?? .55), w1 * .16, 0, pc.shade));
    if (o.nail) { x.save(); x.translate(-rim * w1 * .1, -len + w1 * .62); x.globalAlpha *= .85; x.fillStyle = pc.nail; x.fill(nailPath(w1 * .52, w1 * .58)); x.restore(); }
    if (o.pad) { x.save(); x.translate(rim * w1 * .12, -len + w1 * .5); x.fillStyle = pc.shade; x.fill(creasePath(w1 * .5, w1 * .18)); x.restore(); }
  }
  const seg = (x, px, py, rot, fn) => { x.save(); x.translate(px, py); x.rotate(rot); fn(); x.restore(); };

  // sleeve + cuff along an axis from (ax, ay) with direction ang (0 = down), wrist width ww
  function forearm(x, pc, ax, ay, ang, ww, o = {}) {
    x.save(); x.translate(ax, ay); x.rotate(ang);
    const skinLen = o.skinLen ?? 90, len = o.len ?? 900, sw = ww * 1.12;
    // wrist skin
    x.fillStyle = pc.skin; x.beginPath(); x.moveTo(-ww / 2, -40); x.lineTo(ww / 2, -40); x.lineTo(ww / 2 * 1.04, skinLen + 10); x.lineTo(-ww / 2 * 1.04, skinLen + 10); x.closePath(); x.fill();
    x.fillStyle = pc.shade; x.beginPath(); x.moveTo(ww / 2 - ww * .16, -40); x.lineTo(ww / 2, -40); x.lineTo(ww / 2 * 1.04, skinLen + 10); x.lineTo(ww / 2 - ww * .12, skinLen + 10); x.closePath(); x.fill();
    // sleeve body widening away from the wrist
    x.fillStyle = pc.sleeve; x.beginPath(); x.moveTo(-sw / 2, skinLen); x.lineTo(sw / 2, skinLen); x.lineTo(sw / 2 + len * .12, len); x.lineTo(-sw / 2 - len * .12, len); x.closePath(); x.fill();
    x.fillStyle = pc.sleeveD; x.beginPath(); x.moveTo(sw / 2 - sw * .2, skinLen); x.lineTo(sw / 2, skinLen); x.lineTo(sw / 2 + len * .12, len); x.lineTo(sw / 2 + len * .12 - sw * .3, len); x.closePath(); x.fill();
    // cuff band with a soft fold under it
    rr(x, -sw / 2 - 6, skinLen - 4, sw + 12, 44, 16, pc.sleeveL);
    rr(x, -sw / 2 - 6, skinLen + 30, sw + 12, 10, 5, pc.sleeveD);
    x.restore();
  }

  return { P, pal, mixHex, fingerPath, creasePath, crease, nailPath, finger, seg, forearm, cache };
})();

const HAND_SKIN = '#F2C6A0', HAND_SLEEVE = C.teal;

// ---------- 1. close-up hand holding a phone ----------
// Drop-in for handPhone: fn(x, 300, 640) paints the screen. Hand from the bottom right (o.side 'left' mirrors it).
// o.tapAt [sx, sy] screen point the thumb reaches; o.reach 0..1 travel from rest to tapAt (default 1);
// o.tap 0..1 press; o.scroll 0..1 one upward swipe; o.tilt small lean (-1..1); o.skin, o.sleeve.
// Returns the thumb tip in the caller's coordinates (handy for ripples).
const PHONE_REST = [130, 560];
function handPhone2(x, px, py, o = {}, fn) {
  const side = o.side === 'left' ? -1 : 1, pc = HAND.pal(o.skin || HAND_SKIN, o.sleeve || HAND_SLEEVE);
  const tap = clamp(o.tap ?? 0), reach = o.tapAt ? clamp(o.reach ?? 1) : 0, scr = o.scroll;
  // thumb target in hand space (right-handed), screen origin at (-150, -310)
  const toHand = ([sx, sy]) => [side * (sx - 150), sy - 310];
  const rest = toHand(o.restAt || [side > 0 ? PHONE_REST[0] : 300 - PHONE_REST[0], PHONE_REST[1]]);
  const goal = o.tapAt ? toHand(o.tapAt) : rest;
  const re = E.inOut(reach);
  let tx = lerp(rest[0], goal[0], re), ty = lerp(rest[1], goal[1], re);
  let lift = Math.max(1 - tap, Math.sin(reach * Math.PI) * (o.tapAt ? 1 : 0));
  if (scr !== undefined && scr !== null) { const s = clamp(scr); ty += lerp(80, -80, E.inOut(s)); lift = Math.max(1 - clamp(Math.sin(s * Math.PI) * 1.8), 0) * (1 - tap) + 0; lift = Math.min(lift, 1 - clamp(Math.sin(s * Math.PI) * 1.8)); }
  lift = clamp(lift);
  // the grip slides along the phone so the thumb can reach (and never folds up)
  const M0 = [168, 330], maxL = 330, minL = 190;
  const gyFor = (gx, gy0) => { const dx = M0[0] - gx, room = Math.sqrt(Math.max(0, maxL * maxL - dx * dx)), roomMin = Math.sqrt(Math.max(0, minL * minL - dx * dx)); let g = Math.min(0, gy0 - M0[1] + room); if (M0[1] - gy0 < roomMin) g = Math.max(g, gy0 - M0[1] + roomMin); return clamp(g, -330, 90); };
  const gy = lerp(gyFor(rest[0], rest[1]), gyFor(goal[0], goal[1]), re) + (o.grip || 0);
  const squeeze = tap * 3;
  at(x, px, py, o, (x) => {
    if (o.tilt) { x.transform(1, o.tilt * .1, 0, 1, 0, 0); x.scale(1 - Math.abs(o.tilt) * .06, 1); }
    x.translate(0, tap * 4);
    // ---- behind the phone: forearm, palm, the four fingertips ----
    x.save(); x.scale(side, 1); x.translate(0, gy);
    handPhoneBack(x, pc, side, squeeze);
    x.restore();
    // ---- the phone ----
    rr(x, -170, -330, 340, 680, 46, C.navy);
    x.save(); x.globalAlpha *= .55; rr(x, -170 + (side > 0 ? 0 : 326), -260, 14, 520, 7, C.navyL); x.restore();
    rr(x, -150, -310, 300, 640, 30, C.white);
    x.save(); rrPath(x, -150, -310, 300, 640, 30); x.clip(); x.translate(-150, -310); fn && fn(x, 300, 640); x.restore();
    rr(x, -40, -322, 80, 10, 5, C.navyL);
    // ---- in front: thenar mound and thumb ----
    x.save(); x.scale(side, 1);
    const M = [M0[0], M0[1] + gy], dx = tx - M[0], dy = ty - M[1];
    const L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
    const hov = 1 + lift * .06, Lh = L + 22 - lift * 26;
    // cast shadow on the phone, clipped to the body
    x.save(); rrPath(x, -170, -330, 340, 680, 46); x.clip();
    x.translate(side * 0 + 10 + lift * 14, 14 + lift * 20); x.globalAlpha *= .24 - lift * .06;
    x.fillStyle = C.navy; handPhoneThumb(x, pc, M, Lh, ang, hov, tap, true);
    x.restore();
    handPhoneThumb(x, pc, M, Lh, ang, hov, tap, false);
    x.restore();
  });
  const sc = o.s ?? 1, r = o.rot || 0, lx = side * tx * sc * (o.sx ?? 1), ly = (ty + tap * 4) * sc * (o.sy ?? 1);
  return [px + lx * Math.cos(r) - ly * Math.sin(r), py + lx * Math.sin(r) + ly * Math.cos(r)];
}
function handPhoneBack(x, pc, side, squeeze) {
  const { P, finger, seg, forearm } = HAND;
  forearm(x, pc, 160, 600, -.36, 236, { skinLen: 70 });
  // palm, mostly hidden by the phone; the heel shows under its bottom edge
  const palm = P('phonePalm', (p) => {
    p.moveTo(-110, 90);
    p.bezierCurveTo(-196, 170, -205, 400, -150, 470);
    p.bezierCurveTo(-100, 540, -10, 580, 70, 610);
    p.lineTo(270, 560);
    p.bezierCurveTo(262, 440, 245, 290, 205, 170);
    p.bezierCurveTo(160, 60, 0, 40, -110, 90); p.closePath();
  });
  x.fillStyle = pc.skin; x.fill(palm);
  // shade on the heel, under the phone's bottom edge (contact shadow) and the pinky-side rim
  const heelShade = P('phoneHeelShade', (p) => { p.moveTo(-150, 470); p.bezierCurveTo(-100, 540, -10, 580, 70, 610); p.lineTo(90, 585); p.bezierCurveTo(10, 560, -80, 520, -125, 455); p.closePath(); });
  x.fillStyle = pc.shade; x.fill(heelShade);
  x.fillStyle = pc.shade; x.fill(P('phoneUnder2', (p) => { p.moveTo(-150, 340); p.lineTo(170, 340); p.bezierCurveTo(166, 360, 150, 372, 120, 374); p.lineTo(-110, 374); p.bezierCurveTo(-136, 372, -150, 360, -150, 340); p.closePath(); }));
  // fingertips curling round the far edge: [y, length out of the edge, width, angle]
  x.fillStyle = pc.deep; x.fill(P('fingerMass', (p) => { p.moveTo(-150, -96); p.bezierCurveTo(-176, -90, -188, -40, -186, 40); p.bezierCurveTo(-186, 140, -184, 210, -170, 250); p.lineTo(-140, 262); p.closePath(); }));
  [[-50, 50, 64, -.15], [34, 58, 67, -.05], [116, 51, 63, .05], [192, 36, 53, .15]].forEach(([fy, out, wd, a]) => {
    seg(x, -110 + squeeze, fy, -Math.PI / 2 + a, () => {
      const len = 60 + out;
      finger(x, pc, len, wd * 1.08, wd * .88, { rim: -1 });
      // nail on the outer side of the curled tip, and the last knuckle fold at the phone edge
      x.save(); x.translate(wd * .16, -len + wd * .44); x.globalAlpha *= .8; x.fillStyle = pc.nail; x.fill(HAND.nailPath(wd * .42, wd * .5)); x.restore();
      HAND.crease(x, -wd * .12, -len + wd * 1.15, wd * .42, wd * .13, .2, pc.shade);
    });
  });
}
// the thumb: thenar mound at M, a tapered thumb of length L at angle ang
function handPhoneThumb(x, pc, M, L, ang, hov, tap, shadowOnly) {
  const { P } = HAND;
  // thenar mound: the fleshy root of the thumb, over the phone's lower corner, running down into the palm
  const mound = P('phoneMound2', (p) => {
    p.moveTo(-60, -40); p.bezierCurveTo(-40, -95, 50, -110, 95, -60);
    p.bezierCurveTo(140, -10, 150, 130, 130, 260); p.lineTo(-40, 300);
    p.bezierCurveTo(-95, 180, -90, 30, -60, -40); p.closePath();
  });
  const Lr = Math.round(L / 3) * 3, l = Lr, b = 62, t = 43;
  const thumb = P('thumb2' + Lr, (p) => {
    p.moveTo(0, -b);
    p.bezierCurveTo(l * .3, -b - 2, l * .48, -t - 12, l * .6, -t - 10); // knuckle bulge on the outer edge
    p.bezierCurveTo(l * .74, -t - 7, l - t * 1.25, -t, l - t, -t);
    p.bezierCurveTo(l - t * .35, -t, l + 1, -t * .55, l + 1, -1);
    p.bezierCurveTo(l + 1, t * .58, l - t * .42, t * 1.04, l - t * 1.05, t * 1.04);
    p.bezierCurveTo(l * .7, t + 5, l * .35, b - 2, 0, b + 4);
    p.bezierCurveTo(-36, b, -36, -b, 0, -b); p.closePath();
  });
  x.save(); x.translate(M[0], M[1]);
  if (shadowOnly) { x.fill(mound); x.rotate(ang); x.scale(hov, hov); x.fill(thumb); x.restore(); return; }
  x.fillStyle = pc.skin; x.fill(mound);
  x.fillStyle = pc.shade; x.fill(P('moundShade', (p) => { p.moveTo(132, 40); p.bezierCurveTo(150, 120, 140, 200, 130, 260); p.lineTo(95, 268); p.bezierCurveTo(118, 190, 124, 110, 132, 40); p.closePath(); }));
  x.save(); x.rotate(ang); x.scale(hov, hov);
  // squash at the tip while pressing
  if (tap > 0) { x.translate(l, 0); x.scale(1 - tap * .06, 1 + tap * .1); x.translate(-l, 0); }
  x.fillStyle = pc.skin; x.fill(thumb);
  // one shade tone along the palm-side edge, the knuckle creases and the nail
  x.fillStyle = pc.shade; x.fill(P('thumbShade2' + Lr, (p) => {
    p.moveTo(-6, b + 2); p.bezierCurveTo(l * .35, b - 4, l * .7, t + 4, l - t * 1.05, t * 1.02);
    p.bezierCurveTo(l - t * .42, t * 1.02, l + 1, t * .58, l + 1, t * .05);
    p.bezierCurveTo(l - 10, t * .5, l - t * .8, t * .62, l * .72, t * .62);
    p.bezierCurveTo(l * .45, t * .64, l * .2, b * .66, -6, b + 2); p.closePath();
  }));
  HAND.crease(x, l * .58, -t * .7, 26, 7, Math.PI / 2 + .2, pc.shade);
  HAND.crease(x, l * .58 + 11, -t * .56, 17, 5, Math.PI / 2 + .2, pc.shade);
  x.save(); x.translate(l - 30, -t * .2); x.rotate(Math.PI / 2); x.globalAlpha *= .75; x.fillStyle = pc.nail; x.fill(HAND.nailPath(40, 46)); x.restore();
  x.restore();
  // fold where the thumb leaves the mound
  x.save(); x.rotate(ang); HAND.crease(x, 34, -b * .7, 54, 12, Math.PI / 2 + .45, pc.shade); x.restore();
  x.restore();
}

// Thumb choreography for handPhone2: taps = [[time, [sx, sy]], ...] screen points pressed at those times.
// Returns { tapAt, reach, tap } to spread into handPhone2's options. o.approach (s) travel time, o.rest rest point.
function thumbTrack(t, taps, o = {}) {
  const ap = o.approach ?? .42, back = o.back ?? .5, rest = o.rest || PHONE_REST;
  let pos = rest, tap = 0;
  for (let i = 0; i < taps.length; i++) {
    const [tt, pt] = taps[i], prev = i ? taps[i - 1] : null, next = taps[i + 1];
    const from = prev && tt - ap < prev[0] + .3 + back ? prev[1] : rest;
    if (t < tt - ap) break;
    pos = t < tt - .04 ? [lerp(from[0], pt[0], E.inOut(prog(t, tt - ap, ap - .04))), lerp(from[1], pt[1], E.inOut(prog(t, tt - ap, ap - .04)))] : pt;
    tap = t < tt ? E.out(prog(t, tt - .1, .1)) : t < tt + .08 ? 1 : 1 - E.inOut(prog(t, tt + .08, .2));
    if (!next || t < next[0] - ap) {
      if (!next || next[0] - ap > tt + .3 + back) { const r = prog(t, tt + .3, back); if (r > 0) pos = [lerp(pt[0], rest[0], E.inOut(r)), lerp(pt[1], rest[1], E.inOut(r))]; }
      break;
    }
  }
  return { tapAt: pos, reach: 1, tap, restAt: rest };
}

// mirror helper: hands are drawn right-handed; o.side 'left' mirrors them
function handFrame(x, px, py, o, fn) {
  const side = o.side === 'left' ? -1 : 1, pc = HAND.pal(o.skin || HAND_SKIN, o.sleeve || HAND_SLEEVE);
  at(x, px, py, o, (x) => { if (o.angle) x.rotate(o.angle * side); x.scale(side, 1); fn(x, pc, side); });
}
// soft cast shadow of a shape drawn by fn, offset in screen space
function handShadow(x, dx, dy, a, fn) { x.save(); x.translate(dx, dy); x.globalAlpha *= a; fn(true); x.restore(); }

// ---------- 2. index finger pointing / tapping ----------
// px,py is the fingertip contact point; the hand hangs below it (seen from the back). o.angle rotates about the tip,
// o.press 0..1 (0 hovering, 1 pressed with a squash), o.shadow false to skip the cast shadow.
function handPoint(x, px, py, o = {}) {
  const press = clamp(o.press ?? 0), h = 1 - press;
  handFrame(x, px, py, o, (x, pc) => {
    const body = (sh) => {
      const fill = (p, c) => { x.fillStyle = sh ? C.navy : c; x.fill(p); };
      x.save(); x.translate(10 * h, 22 * h); x.scale(1 + .05 * h, 1 + .05 * h);
      if (press > 0) { x.scale(1 + press * .05, 1 - press * .035); }
      if (!sh) HAND.forearm(x, pc, 52, 480, .12, 170, { skinLen: 50 });
      else { x.save(); x.translate(52, 480); x.rotate(.12); x.fillRect(-90, -40, 180, 900); x.restore(); }
      // three curled fingers: their folded middle joints make the top of the fist
      [[54, 52], [98, 50], [136, 44]].forEach(([fx, len], i) => HAND.seg(x, fx, 290, .1 + i * .07, () => {
        if (sh) { fill(HAND.fingerPath(len + 30, 54, 54)); return; }
        HAND.finger(x, pc, len + 30, 54 - i * 2, 54 - i * 3, { rim: 1 });
        HAND.crease(x, -3, -len - 2, 30, 8, 0, pc.shade);
      }));
      // back of the hand
      fill(HAND.P('pointBack', (p) => { p.moveTo(-36, 250); p.bezierCurveTo(-52, 330, -44, 420, -14, 490); p.lineTo(122, 490); p.bezierCurveTo(154, 420, 168, 330, 156, 262); p.bezierCurveTo(124, 236, 10, 232, -36, 250); p.closePath(); }), pc.skin);
      if (!sh) {
        x.fillStyle = pc.shade; x.fill(HAND.P('pointBackShade', (p) => { p.moveTo(156, 262); p.bezierCurveTo(168, 330, 154, 420, 122, 490); p.lineTo(100, 490); p.bezierCurveTo(130, 420, 142, 330, 132, 258); p.closePath(); }));
        [[52, 268], [95, 270], [133, 276]].forEach(([kx, ky]) => HAND.crease(x, kx, ky, 26, 7, 0, pc.shade));
      }
      // tucked thumb along the near side
      HAND.seg(x, -26, 440, .3, () => { if (sh) { fill(HAND.fingerPath(150, 66, 52)); return; } HAND.finger(x, pc, 150, 66, 52, { rim: 1, creases: [[.62, .5]] }); });
      // the index finger, tip on the origin
      HAND.seg(x, 4, 262, 0, () => {
        if (sh) { fill(HAND.fingerPath(262, 68, 52)); return; }
        HAND.finger(x, pc, 262, 68, 52, { rim: 1, nail: true, creases: [[.46, .55], [.48, .4], [.74, .45]] });
      });
      x.restore();
    };
    if (o.shadow !== false) handShadow(x, 14 + 22 * h, 18 + 26 * h, .14 + .04 * press, body);
    body(false);
  });
}

// ---------- 3. a hand gripping an object's edge ----------
// px,py sits on the object's edge under the thumb; the object lies above (y < 0). fn(x) draws it between the
// fingers (behind) and the thumb (in front). o.angle, o.side, o.t (a breath of motion), o.squeeze 0..1.
function handHold(x, px, py, o = {}, fn) {
  const t = o.t ?? 0, sq = clamp(o.squeeze ?? 0);
  handFrame(x, px, py + Math.sin(t * 2.2) * 3, o, (x, pc, side) => {
    HAND.forearm(x, pc, 66, 236, -.42, 176, { skinLen: 60 });
    // the palm under the edge, the fingers behind the object
    x.fillStyle = pc.skin; x.fill(HAND.P('holdPalm2', (p) => { p.moveTo(-50, -10); p.lineTo(120, -30); p.bezierCurveTo(150, 60, 146, 180, 124, 250); p.lineTo(16, 280); p.bezierCurveTo(-20, 190, -50, 90, -50, -10); p.closePath(); }));
    x.fillStyle = pc.shade; x.fill(HAND.P('holdPalmShade2', (p) => { p.moveTo(138, 50); p.bezierCurveTo(150, 130, 144, 200, 124, 250); p.lineTo(102, 254); p.bezierCurveTo(124, 190, 130, 120, 138, 50); p.closePath(); }));
    [[-40, -.14, 150], [2, -.04, 168], [44, .06, 158], [84, .16, 124]].forEach(([fx, a, len]) => HAND.seg(x, fx, 0, a, () => HAND.finger(x, pc, len, 46, 40, { rim: 1, nail: true })));
    x.save(); if (side < 0) x.scale(-1, 1); fn && fn(x); x.restore();
    // front: the index finger curling under the edge, the thenar mound and the thumb on the face
    x.fillStyle = pc.skin; x.fill(HAND.P('holdMound2', (p) => { p.moveTo(14, 30); p.bezierCurveTo(30, -20, 110, -30, 136, 20); p.bezierCurveTo(156, 80, 146, 160, 120, 210); p.lineTo(46, 190); p.bezierCurveTo(16, 140, 4, 80, 14, 30); p.closePath(); }));
    x.fillStyle = pc.shade; x.fill(HAND.P('holdEdge', (p) => { p.moveTo(-50, -4); p.lineTo(40, -14); p.bezierCurveTo(20, 4, -20, 10, -50, 12); p.closePath(); }));
    HAND.seg(x, 72, 34, -.7 - sq * .1, () => HAND.finger(x, pc, 160, 66, 52, { rim: 1, nail: true, creases: [[.58, .5]] }));
    HAND.crease(x, 74, 76, 44, 10, -.6, pc.shade);
  });
}

// ---------- 4. gestures: wave, thumbs up, open palm ----------
// the palm side of a right hand, wrist at 0,0, fingers up; spread 0..1 fans the fingers
function palmHand(x, pc, spread = .5, o = {}) {
  const P = HAND.P;
  if (o.arm !== false) HAND.forearm(x, pc, 0, 40, o.armAng ?? 0, 124, { skinLen: 40 });
  const sp = .5 + spread;
  // thumb out to the side, then four fingers rooted on the palm's top edge
  HAND.seg(x, -50, -56, -.9 * sp - .1, () => HAND.finger(x, pc, 118, 58, 44, { rim: 1, creases: [[.55, .5]] }));
  [[-47, -168, -.2, 114, 44, 37], [-14, -182, -.07, 130, 46, 38], [20, -178, .07, 120, 44, 37], [52, -162, .21, 92, 39, 32]].forEach(([fx, fy, a, len, w0, w1]) =>
    HAND.seg(x, fx, fy, a * sp * 1.6, () => HAND.finger(x, pc, len, w0, w1, { rim: 1, creases: [[.42, .5], [.7, .45]] })));
  x.fillStyle = pc.skin; x.fill(P('palm', (p) => { p.moveTo(-64, 0); p.bezierCurveTo(-82, -60, -80, -140, -66, -178); p.bezierCurveTo(-30, -196, 40, -194, 68, -168); p.bezierCurveTo(80, -110, 76, -40, 56, 0); p.closePath(); }));
  x.fillStyle = pc.skin; x.fill(P('thenar', (p) => { p.moveTo(-70, -120); p.bezierCurveTo(-104, -96, -110, -40, -80, -4); p.lineTo(-30, 0); p.bezierCurveTo(-40, -50, -50, -90, -70, -120); p.closePath(); }));
  x.fillStyle = pc.shade; x.fill(P('palmShade', (p) => { p.moveTo(68, -168); p.bezierCurveTo(80, -110, 76, -40, 56, 0); p.lineTo(40, 0); p.bezierCurveTo(60, -50, 64, -110, 56, -160); p.closePath(); }));
  // palm lines: heart line, life line around the thumb mound
  x.fillStyle = pc.shade;
  x.fill(P('heartLine', (p) => { p.moveTo(-40, -140); p.quadraticCurveTo(10, -122, 62, -146); p.quadraticCurveTo(12, -128, -40, -140); p.closePath(); }));
  x.fill(P('lifeLine', (p) => { p.moveTo(-50, -122); p.quadraticCurveTo(-12, -80, -26, -12); p.quadraticCurveTo(-20, -80, -50, -122); p.closePath(); }));
}
// o.t drives the wave; o.amp scales it
function handWave(x, px, py, o = {}) {
  const t = o.t ?? 0, k = o.amp ?? 1;
  handFrame(x, px, py, { ...o, rot: (o.rot || 0) + Math.sin(t * 7.5) * .3 * k }, (x, pc) => palmHand(x, pc, .55 + Math.sin(t * 7.5 + 1) * .12 * k));
}
// fist seen from the side, thumb up; o.t gives a small pump
function handThumbsUp(x, px, py, o = {}) {
  const t = o.t ?? 0, pump = Math.abs(Math.sin(t * 4.2)) * (o.amp ?? 1);
  handFrame(x, px, py - pump * 8, { ...o, rot: (o.rot || 0) + Math.sin(t * 4.2) * .05 }, (x, pc) => {
    HAND.forearm(x, pc, -6, 90, .12, 128, { skinLen: 40 });
    x.fillStyle = pc.skin; x.fill(HAND.P('fist', (p) => { p.moveTo(-74, -70); p.bezierCurveTo(-40, -96, 40, -96, 70, -80); p.lineTo(70, 60); p.bezierCurveTo(40, 96, -40, 100, -72, 76); p.bezierCurveTo(-84, 20, -84, -30, -74, -70); p.closePath(); }));
    // four curled fingers stacked on the front of the fist
    [0, 1, 2, 3].forEach(i => HAND.seg(x, -10, -62 + i * 40 + (i === 3 ? -2 : 0), Math.PI / 2, () => {
      const len = 100 - i * 8, wd = 40 - i * 2;
      HAND.finger(x, pc, len, wd, wd, { rim: 1 });
      HAND.crease(x, 0, -len * .38, wd * .5, wd * .14, 0, pc.shade);
    }));
    x.fillStyle = pc.shade; x.fill(HAND.P('fistShade', (p) => { p.moveTo(-72, 76); p.bezierCurveTo(-40, 100, 40, 96, 70, 60); p.lineTo(70, 80); p.bezierCurveTo(30, 108, -40, 108, -72, 90); p.closePath(); }));
    // the thumb, straight up, nail facing out
    HAND.seg(x, -36, -40, .06, () => HAND.finger(x, pc, 156, 66, 52, { rim: 1, nail: true, creases: [[.55, .55]] }));
  });
}
// open palm presenting something, fingers to the upper right; o.t gives a gentle bob
function handOpen(x, px, py, o = {}) {
  const t = o.t ?? 0;
  handFrame(x, px, py + Math.sin(t * 2.4) * 6, { ...o, rot: (o.rot || 0) + .95 + Math.sin(t * 2.4 + .6) * .04 }, (x, pc) => {
    x.scale(1, .86);
    palmHand(x, pc, .25, { armAng: -.25 });
  });
}

// ---------- 5. two hands typing, seen from the front ----------
// px,py is the middle of the keyboard line the fingertips rest on; o.t bobs the fingers, o.gap the hand spacing.
function handKeyboard(x, px, py, o = {}) {
  const t = o.t ?? 0, pc = HAND.pal(o.skin || HAND_SKIN, o.sleeve || HAND_SLEEVE), gap = o.gap ?? 170;
  at(x, px, py, o, (x) => {
    [-1, 1].forEach(sd => {
      x.save(); x.translate(sd * gap, 0); x.scale(sd, 1);
      HAND.forearm(x, pc, 40, 175, -.32, 140, { skinLen: 40 });
      x.fillStyle = pc.skin; x.fill(HAND.P('kbBack', (p) => { p.moveTo(-74, 34); p.bezierCurveTo(-40, 20, 50, 20, 82, 40); p.bezierCurveTo(96, 90, 92, 150, 76, 196); p.lineTo(-30, 200); p.bezierCurveTo(-60, 150, -80, 90, -74, 34); p.closePath(); }));
      x.fillStyle = pc.shade; x.fill(HAND.P('kbBackShade', (p) => { p.moveTo(82, 40); p.bezierCurveTo(96, 90, 92, 150, 76, 196); p.lineTo(56, 196); p.bezierCurveTo(74, 150, 78, 90, 66, 38); p.closePath(); }));
      // thumb resting toward the space bar
      HAND.seg(x, -54, 132, -1.1, () => HAND.finger(x, pc, 92, 48, 40, { rim: 1, nail: true }));
      // index..pinky, from the inner side outwards; each one lifts and strikes on its own rhythm
      [[-52, 72, 38, 1.3], [-14, 80, 40, 0], [24, 74, 38, 2.1], [60, 58, 34, 3.6]].forEach(([fx, len, wd, ph], i) => {
        const v = Math.sin(t * (10 + i * 1.7) + ph + sd * 1.1), lift = Math.max(0, v) * 14, hit = Math.max(0, -v - .6) * 10;
        HAND.seg(x, fx, 44 - i * 2, (i - 1.5) * .07, () => {
          HAND.finger(x, pc, len + lift - hit, wd, wd * .86, { rim: 1, nail: true });
          HAND.crease(x, 0, -(len + lift - hit) * .5, wd * .5, wd * .14, 0, pc.shade);
        });
      });
      [[-52, 36], [-14, 30], [24, 32], [60, 40]].forEach(([kx, ky]) => HAND.crease(x, kx, ky + 12, 20, 6, 0, pc.shade));
      x.restore();
    });
  });
}

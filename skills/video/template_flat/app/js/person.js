// The cast is Humaaans (CC0) behind the film's person() API, so scenes call person(x, px, py, o) as before.
Object.assign(HUM_CAST.host.colors, { top: C.red });
HUM_CAST.ginger.colors.top = C.mustard;
function person(x, px, py, o = {}) {
  const who = o.who || 'host', s = o.s ?? 1, dir = o.dir ?? 1, S = 520 * s;
  const sh = o.armF ? o.armF[0] : 0, raise = sh > .7 ? -Math.min(2.3, (sh - .3) * .8) : 0;
  hum(x, px, py, { cast: who, s, dir, walk: o.walk ?? undefined, sit: o.sit, seat: false, a: o.a, t: NOW + (px % 7), headTilt: (o.headTilt || 0) + (o.mood === 'worried' ? .08 : 0), armB: raise, lean: o.lean, colors: o.colors });
  x.save(); x.globalAlpha *= o.a ?? 1;
  if (o.hold === 'case') { // a cabin case rolled from the front hand
    const cx = px + dir * .25 * S, cy = py, col = o.caseCol || C.coral;
    rr(x, cx - .002 * S, cy - .43 * S, .012 * S, .2 * S, .004 * S, C.navyL);
    rr(x, cx - .06 * S, cy - .24 * S, .13 * S, .17 * S, .025 * S, col);
    rr(x, cx - .06 * S, cy - .24 * S, .13 * S, .035 * S, .02 * S, shadeHex(col, -.15));
    [-.04, .05].forEach(d => circ(x, cx + d * S, cy - .03 * S, .014 * S, C.navy));
  }
  if (o.hold === 'phone') { // a phone in the front hand
    const cx = px + dir * .2 * S, cy = py - (o.sit ? .36 : .5) * S;
    at(x, cx, cy, { rot: dir * -.25 }, (x) => { rr(x, -.026 * S, -.05 * S, .052 * S, .095 * S, .008 * S, C.navy); rr(x, -.02 * S, -.042 * S, .04 * S, .076 * S, .004 * S, o.screen || C.tealL); });
  }
  x.restore();
}

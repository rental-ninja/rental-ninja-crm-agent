// Choreography helpers. Scene boundaries and beats are derived from the narrator's timings (VO), so picture and voice stay locked.
const CUES = [];
const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, g: o.g ?? 1, p: o.p ?? 1, pan: o.pan ?? 0, d: o.d ?? 0 });
const LN = i => VO.vo[i - 1];                       // narration line, 1-based
const LEAD = FILM.lead;                             // a scene's sheet lands this long before its line starts
const TAIL = FILM.tail;                             // room for the end card after the last word
const DURATION = Math.round((LN(VO.vo.length).end + TAIL) * 2) / 2;
const B = i => i <= 1 ? 0 : i > VO.vo.length ? DURATION : +(LN(i).start - LEAD).toFixed(3);
// time of the n-th occurrence of a word inside a line; falls back to the line start
function w(line, word, n = 1) { let k = 0; for (const x of VO.words) if (x.line === line - 1 && x.w.toLowerCase().replace(/[^a-z0-9]/g, '') === word && ++k === n) return x.t; console.warn('word not found', line, word); return LN(line).start; }
const wEnd = (line) => LN(line).end;

// ---- animation helpers (all evaluated on stop-motion time) ----
function dropIn(ctx, S, x, y, t, t0, o = {}) {
  if (t < t0) return false;
  const d = o.d ?? .42, p = prog(t, t0, d), e = E.out(p);
  const s = (o.s ?? 1) * lerp(1.22, 1, E.back(p));
  const spin = o.spin ?? (rnd(o.id || t0, 'spin') - .5) * .22;
  put(ctx, S, x + (o.dx ?? 0) * (1 - e), y + (o.dy ?? -26) * (1 - e), { ...o, s, rot: (o.rot || 0) + spin * (1 - e), elev: (o.elev ?? S.elev) + 6 * (1 - e) });
  return true;
}
function slideIn(ctx, S, x, y, t, t0, o = {}) {
  if (t < t0) return false;
  const d = o.d ?? .5, p = prog(t, t0, d), e = o.ease ? o.ease(p) : E.back(p), [fx, fy] = o.from || [-900, 0];
  put(ctx, S, x + fx * (1 - e), y + fy * (1 - e), { ...o, rot: (o.rot || 0) + (o.spin ?? .15) * (1 - E.out(p)), elev: (o.elev ?? S.elev) + 2.5 * (1 - E.out(p)) });
  return true;
}
function popIn(ctx, S, x, y, t, t0, o = {}) {
  if (t < t0) return false;
  const p = prog(t, t0, o.d ?? .33); put(ctx, S, x, y, { ...o, s: (o.s ?? 1) * E.back(p) });
  return true;
}
function flyOut(ctx, S, x, y, t, t0, o = {}) { // lifted off the table and thrown
  const p = prog(t, t0, o.d ?? .45), e = E.in(p);
  if (p >= 1) return;
  const [vx, vy] = o.to || [-1400, -500];
  put(ctx, S, x + vx * e, y + vy * e, { ...o, rot: (o.rot || 0) + (o.spin ?? -1.2) * e, s: (o.s ?? 1) * (1 + .15 * E.out(p)), elev: (o.elev ?? S.elev) + 5 * E.out(p) });
}
// on the table between t0 and t1, then thrown away
function hold(ctx, S, x, y, t, t0, t1, o = {}) { if (t < t1) return dropIn(ctx, S, x, y, t, t0, o); flyOut(ctx, S, x, y, t, t1, { ...o, to: o.to, d: .35 }); return false; }
function reveal(ctx, frac, x, y, wd, h, fn) { if (frac <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(x, y, wd * frac, h); ctx.clip(); fn(); ctx.restore(); }
function strokePath(ctx, pts, frac, o = {}) {
  if (frac <= 0) return;
  let total = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); total += l; }
  let left = total * clamp(frac);
  ctx.save(); ctx.strokeStyle = o.color || P.ink; ctx.lineWidth = o.w || 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = o.a ?? .8; if (o.dash) ctx.setLineDash(o.dash);
  ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = 2; ctx.shadowOffsetY = 1.5;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && left > 0; i++) { const l = seg[i - 1], f = Math.min(1, left / l); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); left -= l; }
  ctx.stroke(); ctx.restore();
}
// point at fraction f along a polyline
function pointAt(pts, f) {
  let total = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); total += l; }
  let left = total * clamp(f);
  for (let i = 1; i < pts.length; i++) { if (left <= seg[i - 1]) { const k = seg[i - 1] ? left / seg[i - 1] : 0; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } left -= seg[i - 1]; }
  return pts[pts.length - 1];
}
function curve(p0, c, p1, n = 24) { const b = new PB().M(...p0).Q(...c, ...p1, n); return b.pts; }
const step = (t, rate = 12) => Math.floor(t * rate) / rate;
// text that is written one letter per frame; returns the x of the writing edge
function typed(ctx, text, x, y, o, f) { const n = Math.floor(clamp(f) * text.length + 1e-6); if (n > 0) ink(ctx, text.slice(0, n), x, y, o); return x + textW(text.slice(0, n), o.size, o.weight, o.family || F.disp); }
// waypoints are arrival times: the traveller moves during the d seconds before each one
function along(way, t, d = .35) {
  let k = 0; while (k < way.length - 1 && t >= way[k + 1][0] - d) k++;
  const nxt = way[k], cur = way[Math.max(0, k - (t < way[k][0] ? 1 : 0))];
  const p = t >= nxt[0] ? 1 : E.inOut(prog(t, nxt[0] - d, d));
  return [lerp(cur[1], nxt[1], p), lerp(cur[2], nxt[2], p)];
}
// composite entrance: scale overshoot + settle
function enter(t, t0, d = .42) { const p = prog(t, t0, d), e = E.out(p); return { on: t >= t0, k: lerp(1.16, 1, E.back(p)), dy: -30 * (1 - e), el: 6 * (1 - e), rot: .02 * (1 - e) }; }
function confetti(ctx, t, t0, cx, cy, n = 46, key = 'cf') {
  if (t < t0) return; const dt = t - t0;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (rnd(key, i, 'a') - .5) * 2.6, v = 700 + rnd(key, i, 'v') * 900, g = 1500;
    const x = cx + Math.cos(a) * v * dt, y = cy + Math.sin(a) * v * dt + .5 * g * dt * dt;
    if (y > 1150) continue;
    put(ctx, A.confetti[i % 16], x, y, { rot: rnd(key, i, 'r') * 6 + dt * (rnd(key, i, 's') - .5) * 18, s: .8 + rnd(key, i, 'sc') * .7, id: key + i, boil: 0, elev: 2.2 });
  }
}
// a card is turned over to show a new face: squish factor around the swap time
const flipK = (t, tt, d = .2) => (t < tt - d / 2 || t > tt + d / 2) ? 1 : Math.max(.06, Math.abs((t - tt) / (d / 2)));
// a walker's position and step bob between two times
function walk(t, t0, t1, x0, x1) { const p = prog(t, t0, t1 - t0), moving = p > 0 && p < 1; return { x: lerp(x0, x1, p), bob: moving ? -Math.abs(Math.sin((t - t0) * 9)) * 12 : 0, lean: moving ? .04 * Math.sign(x1 - x0) : 0, p }; }
const sparks = (ctx, list, t, t0, st, key) => list.forEach(([sx, sy, s], i) => popIn(ctx, [A.smallSpark, A.smallSparkW, A.smallSparkP][i % 3], sx, sy + Math.sin(st * 2 + i) * 6, t, t0 + i * .08, { s, rot: st + i, id: key + i }));
// pointer helper
const pointer = (ctx, way, t, o = {}) => { const c = along(way, t, o.d ?? .34); put(ctx, A.cursor, c[0], c[1], { id: o.id || 'cur', rot: -.1, s: o.s ?? 1.45 }); return c; };

const SCENES = [];
// a scene covers narration lines a..b
function scene(a, b, def) { SCENES.push({ start: B(a), end: B(b + 1), tex: def.tex, ...def }); }

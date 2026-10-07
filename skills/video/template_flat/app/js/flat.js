// Flat vector engine: smooth 25 fps motion, flat fills, navy silhouettes, one paper grain over the whole frame.
const W = 1920, H = 1080, FPS = 25, SS = 1.5;

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, t0, d) => clamp((t - t0) / d);
const E = {
  out: x => 1 - Math.pow(1 - x, 3),
  in: x => x * x * x,
  inOut: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  sine: x => .5 - Math.cos(x * Math.PI) / 2,
  back: x => { const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  elastic: x => x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (2 * Math.PI / 3)) + 1,
};
function hashStr(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = (...k) => mulberry(hashStr(k.join('|')))();
function canvas(w, h) { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; }

// ---------- output format ----------
// Scenes are composed on the 1920x1080 stage (W, H). FMT is the canvas (film.format, or ?fmt= in previews); in the
// other formats main_flat.js fits the stage to the width over a brand backdrop, unless a scene draws its own layout
// (drawFmt / layouts). SAFE = the part of the canvas no platform UI covers, plus the slots of stage, watermark, captions.
const QS = new URLSearchParams(location.search);
const FORMATS = { '16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080], '4x5': [1080, 1350] };
const FMT = (() => { let id = QS.get('fmt') || FILM.format || '16x9'; if (!FORMATS[id]) id = '16x9'; const [w, h] = FORMATS[id]; return { id, w, h, portrait: h > w, wide: id === '16x9' }; })();
const SAFE = (() => {
  // insets [top, bottom, sides] as fractions: Reels/Stories UI covers the top ~14% and the bottom ~20%
  const [t, b, sd] = (FILM.safe || {})[FMT.id] || { '16x9': [.05, .05, .04], '9x16': [.14, .2, .06], '1x1': [.05, .05, .05], '4x5': [.05, .05, .05] }[FMT.id];
  const top = FMT.h * t, bottom = FMT.h * (1 - b), left = FMT.w * sd, right = FMT.w * (1 - sd);
  return { top, bottom, left, right, w: right - left, h: bottom - top, cx: FMT.w / 2, cy: (top + bottom) / 2, x: f => lerp(left, right, f), y: f => lerp(top, bottom, f) };
})();
const LAYOUT = (() => {
  if (FMT.wide) return { stage: { x: 0, y: 0, w: W, h: H, k: 1 }, mark: { x: 1720, y: 1030, w: 280 }, caps: { cx: 960, y: 1000, anchor: 'bottom', maxW: 1200, size: 46 } };
  const k = FMT.w / W, sh = H * k, sy = Math.round(SAFE.cy - sh / 2), below = sy + sh;
  return { stage: { x: 0, y: sy, w: FMT.w, h: sh, k }, mark: { x: FMT.w / 2, y: (SAFE.top + sy) / 2, w: Math.min(FMT.w * .28, (sy - SAFE.top) * 2) },
    caps: { cx: FMT.w / 2, y: (below + SAFE.bottom) / 2, anchor: 'middle', maxW: SAFE.w, size: { '9x16': 56, '1x1': 46, '4x5': 50 }[FMT.id] } };
})();
// burned-in captions: film.yml captions.burn/style, overridden by ?caps=0|1|pill|karaoke
const CAPS = (() => { const q = QS.get('caps'), c = FILM.captions || {}; return { on: q !== null ? !/^(0|off|false)$/.test(q) : c.burn ?? !FMT.wide, style: /^(pill|karaoke)$/.test(q) ? q : c.style || 'pill', size: LAYOUT.caps.size }; })();
Object.assign(SAFE, { stage: LAYOUT.stage, mark: LAYOUT.mark, caps: { x: SAFE.left, w: SAFE.w, h: LAYOUT.caps.size * 3.1, y: LAYOUT.caps.y - LAYOUT.caps.size * (LAYOUT.caps.anchor === 'bottom' ? 3.1 : 1.55) } });

// ---------- timing: the voice and film 3's foley hits ----------
const LEAD = FILM.lead, TAIL = FILM.tail, WIPE = FILM.wipe;
const LN = i => VO.vo[i - 1];
const DURATION = Math.round((LN(VO.vo.length).end + TAIL) * 2) / 2;
const B = i => i <= 1 ? 0 : i > VO.vo.length ? DURATION : +(LN(i).start - LEAD).toFixed(3);
function w(line, word, n = 1) { let k = 0; for (const x of VO.words) if (x.line === line - 1 && x.w.toLowerCase().replace(/[^a-z0-9]/g, '') === word && ++k === n) return x.t; console.warn('word not found', line, word); return LN(line).start; }
// the mix is fixed, so every visible beat lands on the hit it was mixed for
function hit(type, near, win = .45) {
  let best = null;
  for (const [t, k] of (typeof HITS !== 'undefined' ? HITS : [])) if (k === type && Math.abs(t - near) <= win && (best === null || Math.abs(t - near) < Math.abs(best - near))) best = t;
  if (best === null) { console.warn('hit not found', type, near); return near; }
  return best;
}
const hitsIn = (type, a, b) => (typeof HITS !== 'undefined' ? HITS : []).filter(([t, k]) => k === type && t >= a && t <= b).map(([t]) => t);
const CUES = [];
const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, g: o.g ?? 1, p: o.p ?? 1, pan: o.pan ?? 0, d: o.d ?? 0 });
const SCENES = [];
function scene(a, b, def) { SCENES.push({ start: B(a), end: B(b + 1), ...def }); }
let FRAME = 0, NOW = 0;

// ---------- palette and type ----------
const C = {
  teal: '#5BB1B5', tealD: '#3E9297', tealL: '#93CFD0', tealXL: '#D3EBEA', navy: '#1E2236', navyL: '#30364F', navyM: '#454B66',
  wall: '#DDE2E6', wallD: '#C2C9D0', wallL: '#EEF1F3', white: '#F8F9FA', grey: '#A9B2BA', greyD: '#7C8790', greyL: '#E6E9EC', stone: '#9D9F9A',
  coral: '#F0505C', coralD: '#C83C48', orange: '#EC8B4E', mustard: '#EDB54B', pink: '#C8636F', green: '#4FA77A', blue: '#4C7FD0', purple: '#7A68C9',
  airbnb: '#E0666F', booking: '#3A68B8', vrbo: '#2B7C93', ink: '#1E2236', mute: '#6E7781', sky: '#F2F4F5', night: '#26304F', sand: '#E9E4DA',
  navyD: '#0F1220', cream: '#F1ECE3', glow: '#FBE6B5', coralL: '#F6C8B8', coralXL: '#F8E3E0', orangeL: '#FFC9A8', orangeD: '#E38A57',
  greenL: '#DDEFE5', purpleL: '#DCD6F3', purpleXL: '#EFEAFB', kraft: '#D9A66B', kraftD: '#C48F55', peach: '#F6D7BD', line: '#D9DEE3',
};
const F = { ui: '"Quicksand", "Nunito", system-ui, sans-serif', brand: '"Ubuntu", "Quicksand", sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace' };

// ---------- drawing primitives (all flat) ----------
function rrPath(x, ctxX, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); x.beginPath(); x.roundRect(ctxX, y, w, h, r); }
function rr(x, px, py, w, h, r, fill) { rrPath(x, px, py, w, h, r); x.fillStyle = fill; x.fill(); }
function circ(x, cx, cy, r, fill) { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fillStyle = fill; x.fill(); }
function ell(x, cx, cy, rx, ry, fill, rot = 0) { x.beginPath(); x.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2); x.fillStyle = fill; x.fill(); }
function poly(x, pts, fill) { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); x.fillStyle = fill; x.fill(); }
function strokeL(x, pts, lw, color, cap = 'round') { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.lineWidth = lw; x.strokeStyle = color; x.lineCap = cap; x.lineJoin = 'round'; x.stroke(); }
function txt(x, s, px, py, o = {}) {
  x.save(); x.font = `${o.weight || 600} ${o.size || 28}px ${o.font || F.ui}`; x.fillStyle = o.color || C.ink;
  x.textAlign = o.align || 'left'; x.textBaseline = o.base || 'alphabetic'; x.globalAlpha *= o.a ?? 1;
  if (o.ls) x.letterSpacing = o.ls + 'px';
  x.fillText(s, px, py); x.restore();
}
const mctx = canvas(8, 8).getContext('2d');
function textW(s, size, weight = 600, font = F.ui) { mctx.font = `${weight} ${size}px ${font}`; return mctx.measureText(s).width; }
// lines of at most maxW px; two lines are balanced, breaking after punctuation when it can
function wrapText(s, size, maxW, weight = 600, font = F.ui) {
  const ws = String(s).split(/\s+/).filter(Boolean), out = [], tw = l => textW(l, size, weight, font); let cur = '';
  for (const wd of ws) { const n = cur ? cur + ' ' + wd : wd; if (cur && tw(n) > maxW) { out.push(cur); cur = wd; } else cur = n; }
  if (cur) out.push(cur);
  if (out.length !== 2) return out;
  let best = out, bc = Infinity;
  for (let k = 1; k < ws.length; k++) {
    const l = [ws.slice(0, k).join(' '), ws.slice(k).join(' ')], m = Math.max(...l.map(tw)), c = m - (/[,.;:!?]$/.test(ws[k - 1]) ? size * 3 : 0);
    if (m <= maxW && c < bc) { best = l; bc = c; }
  }
  return best;
}
// placeholder copy lines
function bars(x, px, py, ws, o = {}) { ws.forEach((bw, i) => rr(x, px, py + i * (o.gap ?? 24), bw, o.h ?? 10, (o.h ?? 10) / 2, o.color || C.line)); }
// objects mounted on a wall cast a hard, offset navy shadow (the reference's intercom)
function hardShadow(x, dx, dy, fn, a = .9) { x.save(); x.translate(dx, dy); x.globalAlpha *= a; fn(C.navy, true); x.restore(); fn(null, false); }
// floating UI cards get a soft flat drop
function softCard(x, px, py, w, h, r, fill, o = {}) {
  x.save(); x.globalAlpha *= o.sa ?? .14; rr(x, px + (o.dx ?? 0), py + (o.dy ?? 12), w, h, r, C.navy); x.restore();
  rr(x, px, py, w, h, r, fill);
}

// ---------- sprites: pre-rendered at SS for crisp zooms ----------
class Sprite {
  constructor(w, h, fn, o = {}) {
    const pad = o.pad ?? 8; this.w = w; this.h = h; this.pad = pad;
    this.c = canvas((w + pad * 2) * SS, (h + pad * 2) * SS);
    const x = this.c.getContext('2d'); x.scale(SS, SS); x.translate(pad, pad); fn(x, w, h);
    this.ax = o.ax ?? w / 2; this.ay = o.ay ?? h / 2;
  }
}
const spr = (w, h, fn, o) => new Sprite(w, h, fn, o);
function put(x, S, px, py, o = {}) {
  if (!S) return; const a = o.a ?? 1; if (a <= .001) return;
  const s = o.s ?? 1, sx = (o.sx ?? 1) * s, sy = (o.sy ?? 1) * s; if (Math.abs(sx) < .001 || Math.abs(sy) < .001) return;
  x.save(); x.translate(px, py); x.rotate(o.rot || 0); x.scale(sx, sy); x.globalAlpha *= a;
  x.drawImage(S.c, -(S.ax + S.pad), -(S.ay + S.pad), S.c.width / SS, S.c.height / SS); x.restore();
}
// run fn in a local frame: translate, rotate, uniform scale, alpha
function at(x, px, py, o, fn) {
  const a = o.a ?? 1; if (a <= .001) return; const s = o.s ?? 1; if (Math.abs(s) < .001) return;
  x.save(); x.translate(px, py); if (o.rot) x.rotate(o.rot); x.scale(s * (o.sx ?? 1), s * (o.sy ?? 1)); x.globalAlpha *= a; fn(x); x.restore();
}

// ---------- motion helpers ----------
// pop: scale up with a small overshoot from t0
const popS = (t, t0, d = .35) => t < t0 ? 0 : E.back(prog(t, t0, d));
// rise: 0..1 eased arrival
const rise = (t, t0, d = .45) => E.out(prog(t, t0, d));
// land: an object dropped onto a surface — falls in, overshoots slightly, settles
const landY = (t, t0, d = .3, from = -80) => t < t0 - d ? null : lerp(from, 0, E.back(prog(t, t0 - d, d)));
// walking: position and stride phase between t0 and t1
function walkX(t, t0, t1, x0, x1, stride = 120) {
  const p = clamp((t - t0) / (t1 - t0)); const e = p; const x = lerp(x0, x1, e);
  const moving = t > t0 && t < t1; const phase = Math.abs(x - x0) / stride * Math.PI;
  return { x, phase, moving, p };
}
const sway = (t, k = 0, amp = .02, sp = 1.1) => Math.sin(t * sp + k * 1.7) * amp;

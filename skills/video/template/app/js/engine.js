// Paper-craft stop-motion engine: procedural paper, hand-cut outlines, layered shadows, boil.
const W = 1920, H = 1080, FPS = 12, SS = 1.35;

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, t0, d) => clamp((t - t0) / d);
const E = {
  out: x => 1 - Math.pow(1 - x, 3),
  in: x => x * x * x,
  inOut: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  back: x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  elastic: x => x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -9 * x) * Math.sin((x * 10 - .75) * (2 * Math.PI / 3)) + 1,
  bounce: x => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; },
};

function hashStr(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = (...k) => mulberry(hashStr(k.join('|')))();
function noise1(x, seed) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(rnd(seed, i) * 2 - 1, rnd(seed, i + 1) * 2 - 1, u);
}

function canvas(w, h) { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; }

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// ---------- Paper textures ----------
const TEX = {};
function makeTextures() {
  const size = 512;
  const mk = (seed, fiberAmt, grainAmt, blotch) => {
    const c = canvas(size, size), x = c.getContext('2d');
    const img = x.createImageData(size, size), d = img.data;
    const R = mulberry(seed);
    const grids = [8, 16, 32, 64, 128].map(g => { const a = new Float32Array(g * g); for (let i = 0; i < a.length; i++) a[i] = R(); return { g, a }; });
    const amps = [blotch, blotch * .6, .35, .22, .14];
    for (let y = 0; y < size; y++) for (let xx = 0; xx < size; xx++) {
      let v = 0;
      grids.forEach(({ g, a }, k) => {
        const fx = xx / size * g, fy = y / size * g, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
        const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
        const i00 = a[(iy % g) * g + ix % g], i10 = a[(iy % g) * g + (ix + 1) % g], i01 = a[((iy + 1) % g) * g + ix % g], i11 = a[((iy + 1) % g) * g + (ix + 1) % g];
        v += (lerp(lerp(i00, i10, sx), lerp(i01, i11, sx), sy) - .5) * amps[k];
      });
      v += (R() - .5) * grainAmt;
      const o = (y * size + xx) * 4, c8 = clamp(128 + v * 120, 0, 255);
      d[o] = d[o + 1] = d[o + 2] = c8; d[o + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    // fibres
    for (let i = 0; i < 2600 * fiberAmt; i++) {
      const px = R() * size, py = R() * size, len = 4 + R() * 22, a = R() * Math.PI * 2, bend = (R() - .5) * 8;
      const light = R() > .45;
      x.strokeStyle = light ? `rgba(255,255,255,${.05 + R() * .1})` : `rgba(0,0,0,${.03 + R() * .07})`;
      x.lineWidth = .5 + R() * .9;
      for (const ox of [0, -size, size]) for (const oy of [0, -size, size]) {
        x.beginPath(); x.moveTo(px + ox, py + oy);
        x.quadraticCurveTo(px + ox + Math.cos(a) * len / 2 + bend, py + oy + Math.sin(a) * len / 2 - bend, px + ox + Math.cos(a) * len, py + oy + Math.sin(a) * len);
        x.stroke();
      }
    }
    // specks
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(0,0,0,${.05 + R() * .1})`; x.beginPath(); x.arc(R() * size, R() * size, .4 + R() * .9, 0, 7); x.fill(); }
    return c;
  };
  TEX.card = mk(7, 1, .18, .5);      // cardstock
  TEX.bg = mk(11, 1.4, .22, .9);     // table sheets, more mottled
  TEX.soft = mk(23, .6, .1, .35);    // smooth paper for text
  const pc = canvas(8, 8).getContext('2d');
  for (const k in TEX) TEX[k + 'P'] = pc.createPattern(TEX[k], 'repeat');
}

// ---------- Geometry ----------
class PB { // tiny path builder that emits a point list
  constructor() { this.p = []; }
  M(x, y) { this.p.push([x, y]); return this; }
  L(x, y) { this.p.push([x, y]); return this; }
  Q(cx, cy, x, y, n = 14) { const [x0, y0] = this.p[this.p.length - 1]; for (let i = 1; i <= n; i++) { const t = i / n, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t; this.p.push([a * x0 + b * cx + c * x, a * y0 + b * cy + c * y]); } return this; }
  C(c1x, c1y, c2x, c2y, x, y, n = 18) { const [x0, y0] = this.p[this.p.length - 1]; for (let i = 1; i <= n; i++) { const t = i / n, m = 1 - t; this.p.push([m * m * m * x0 + 3 * m * m * t * c1x + 3 * m * t * t * c2x + t * t * t * x, m * m * m * y0 + 3 * m * m * t * c1y + 3 * m * t * t * c2y + t * t * t * y]); } return this; }
  A(cx, cy, r, a0, a1, n = 24) { for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; this.p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return this; }
  get pts() { return this.p; }
}
function rrect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); const b = new PB();
  if (r <= 0) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  b.M(x + r, y).L(x + w - r, y).A(x + w - r, y + r, r, -Math.PI / 2, 0, 8).L(x + w, y + h - r).A(x + w - r, y + h - r, r, 0, Math.PI / 2, 8)
    .L(x + r, y + h).A(x + r, y + h - r, r, Math.PI / 2, Math.PI, 8).L(x, y + r).A(x + r, y + r, r, Math.PI, Math.PI * 1.5, 8);
  return b.pts;
}
function ellipse(cx, cy, rx, ry = rx, n = 64) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
function star(cx, cy, r1, r2, n, rot = -Math.PI / 2) { const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = i % 2 ? r2 : r1; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
function sparkle(cx, cy, r) { // four-point curved AI sparkle
  const b = new PB(), k = r * .18; b.M(cx, cy - r);
  b.Q(cx + k, cy - k, cx + r, cy).Q(cx + k, cy + k, cx, cy + r).Q(cx - k, cy + k, cx - r, cy).Q(cx - k, cy - k, cx, cy - r); return b.pts;
}
// resample + displace along normals => scissor-cut outline
function cut(pts, amp = 1, seed = 1, step = 5) {
  const out = []; const n = pts.length; let s = 0;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n], L = Math.hypot(x1 - x0, y1 - y0), k = Math.max(1, Math.ceil(L / step));
    for (let j = 0; j < k; j++) {
      const t = j / k, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      const nx = L ? -(y1 - y0) / L : 0, ny = L ? (x1 - x0) / L : 0;
      const d = (noise1(s / 38, seed) * .75 + noise1(s / 9, seed + 7) * .25) * amp;
      out.push([x + nx * d, y + ny * d]); s += L / k;
    }
  }
  return out;
}
function tracePts(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
function bounds(pts) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of pts) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return { x: a, y: b, w: c - a, h: d - b }; }

// ---------- Paper rendering ----------
// Draws one sheet of coloured card with grain, soft light falloff and a shadow cast on what is beneath it.
function paper(ctx, pts, color, o = {}) {
  const seed = o.seed ?? hashStr(color + pts.length + pts[0][0]);
  const shape = o.raw ? pts : cut(pts, o.amp ?? .9, seed);
  const elev = o.elev ?? 1;
  ctx.save();
  if (elev > 0) {
    ctx.shadowColor = o.shadowColor || `rgba(35,22,10,${.34 * (o.shadowAlpha ?? 1)})`;
    ctx.shadowBlur = (2.5 + elev * 4.5) * SS; ctx.shadowOffsetX = (.8 + elev * 1.6) * SS; ctx.shadowOffsetY = (1.4 + elev * 2.4) * SS;
  }
  tracePts(ctx, shape); ctx.fillStyle = color; ctx.fill();
  ctx.restore();
  ctx.save(); tracePts(ctx, shape); ctx.clip();
  const b = bounds(shape);
  ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = o.tex ?? .75;
  ctx.save(); ctx.translate((seed % 400), (seed >> 9) % 400); ctx.fillStyle = TEX[(o.texName || 'card') + 'P'];
  ctx.fillRect(b.x - 420, b.y - 420, b.w + 840, b.h + 840); ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  const g = ctx.createLinearGradient(b.x, b.y, b.x + b.w * .8 + 40, b.y + b.h + 40);
  g.addColorStop(0, `rgba(255,250,240,${o.sheen ?? .14})`); g.addColorStop(.55, 'rgba(255,255,255,0)'); g.addColorStop(1, `rgba(40,20,0,${o.dark ?? .08})`);
  ctx.fillStyle = g; ctx.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
  if (o.inner) o.inner(ctx, b);
  ctx.restore();
  // lighter cut edge where the knife exposed the core of the card
  if (o.rim !== false) {
    ctx.save(); tracePts(ctx, shape); ctx.clip();
    ctx.translate(.9, .9); tracePts(ctx, shape); ctx.strokeStyle = `rgba(255,255,255,${o.rim ?? .28})`; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.restore();
  }
  return shape;
}

// A sprite is a pre-rendered cut-out with its own anchor. Drawing happens at SS resolution for crisp zooms.
class Sprite {
  constructor(w, h, fn, o = {}) {
    const pad = o.pad ?? 26;
    this.w = w; this.h = h; this.pad = pad;
    this.c = canvas((w + pad * 2) * SS, (h + pad * 2) * SS);
    const x = this.c.getContext('2d'); x.scale(SS, SS); x.translate(pad, pad);
    fn(x, w, h);
    this.ax = o.ax ?? w / 2; this.ay = o.ay ?? h / 2;
    this.elev = o.elev ?? 1;
  }
}
const spr = (w, h, fn, o) => new Sprite(w, h, fn, o);

let FRAME = 0; // current stop-motion frame index
// draw a sprite: x,y = anchor position; opts: rot (rad), s, sx, sy, a (alpha), elev, id (boil key), boil (px)
function put(ctx, S, x, y, o = {}) {
  if (!S) return;
  const a = o.a ?? 1; if (a <= 0.001) return;
  const s = o.s ?? 1, sx = (o.sx ?? 1) * s, sy = (o.sy ?? 1) * s; if (Math.abs(sx) < .001 || Math.abs(sy) < .001) return;
  const id = o.id ?? S.c.width + '_' + S.c.height;
  const bf = Math.floor(FRAME / 2); // boil on fours: settled, still clearly handmade
  const boil = o.boil ?? .6;
  const jx = (rnd(id, bf, 'x') - .5) * 2 * boil, jy = (rnd(id, bf, 'y') - .5) * 2 * boil, jr = (rnd(id, bf, 'r') - .5) * .0035 * (boil > 0 ? 1 : 0);
  const elev = (o.elev ?? S.elev);
  ctx.save();
  ctx.translate(x + jx, y + jy); ctx.rotate((o.rot || 0) + jr); ctx.scale(sx, sy);
  ctx.globalAlpha = a;
  if (elev > 0) {
    const m = ctx.getTransform(), sc = Math.hypot(m.a, m.b);
    ctx.shadowColor = `rgba(38,24,12,${Math.min(.5, .22 + elev * .06) * (o.shadowAlpha ?? 1)})`;
    ctx.shadowBlur = (5 + elev * 9) * sc; ctx.shadowOffsetX = (2 + elev * 5) * sc; ctx.shadowOffsetY = (3 + elev * 7.5) * sc;
  }
  ctx.drawImage(S.c, -(S.ax + S.pad), -(S.ay + S.pad), S.c.width / SS, S.c.height / SS);
  ctx.restore();
}

// ---------- Type ----------
const F = { disp: '"Fredoka", "Nunito", system-ui, sans-serif', brand: '"Ubuntu", "Fredoka", sans-serif', hand: '"Caveat", "Comic Sans MS", cursive', mono: '"JetBrains Mono", ui-monospace, Menlo, monospace' };
const mctx = canvas(10, 10).getContext('2d');
function measure(text, font) { mctx.font = font; const m = mctx.measureText(text); return { w: m.width, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent }; }
function dilate(x, text, bx, by, r) { for (const k of [1, .66, .33]) { const n = Math.ceil(28 * k); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; x.fillText(text, bx + Math.cos(a) * r * k, by + Math.sin(a) * r * k); } } x.fillText(text, bx, by); }
// Letters cut from coloured card and glued on a white backing sheet cut roughly around them.
function paperText(text, o = {}) {
  const size = o.size || 80, weight = o.weight || 600, font = `${weight} ${size}px ${o.family || F.disp}`;
  const m = measure(text, font), border = o.border ?? Math.round(size * .14), pad = border + 6;
  const w = Math.ceil(m.w + pad * 2), h = Math.ceil(m.asc + m.desc + pad * 2);
  return spr(w, h, (x) => {
    const bx = pad, by = pad + m.asc;
    if (o.backing !== null) {
      // backing sheet: dilate glyphs with a fat round stroke, then give it paper treatment
      const tmp = canvas((w + 60) * SS, (h + 60) * SS), t = tmp.getContext('2d'); t.scale(SS, SS); t.translate(30, 30);
      t.font = font; t.fillStyle = '#000'; dilate(t, text, bx, by, border);
      t.globalCompositeOperation = 'source-in'; t.fillStyle = o.backing || '#FFFDF8'; t.fillRect(-30, -30, w + 60, h + 60);
      t.globalCompositeOperation = 'soft-light'; t.globalAlpha = .7; t.fillStyle = TEX.cardP; t.fillRect(-30, -30, w + 60, h + 60);
      const mk = canvas(tmp.width, tmp.height), mm = mk.getContext('2d'); mm.scale(SS, SS); mm.translate(30, 30); mm.font = font; dilate(mm, text, bx, by, border);
      t.setTransform(1, 0, 0, 1, 0, 0); t.globalCompositeOperation = 'destination-in'; t.globalAlpha = 1; t.drawImage(mk, 0, 0);
      x.save(); x.shadowColor = 'rgba(35,22,10,.3)'; x.shadowBlur = 4 * SS; x.shadowOffsetX = 1.5 * SS; x.shadowOffsetY = 2.5 * SS;
      x.drawImage(tmp, -30, -30, w + 60, h + 60); x.restore();
    }
    const tmp2 = canvas((w + 60) * SS, (h + 60) * SS), u = tmp2.getContext('2d'); u.scale(SS, SS); u.translate(30, 30);
    u.font = font; u.fillStyle = o.color || '#222'; u.fillText(text, bx, by);
    if (o.stroke) { u.lineWidth = o.stroke; u.strokeStyle = o.color; u.lineJoin = 'round'; u.strokeText(text, bx, by); }
    u.globalAlpha = .8; u.fillStyle = TEX.cardP; u.globalCompositeOperation = 'soft-light'; u.fillRect(-30, -30, w + 60, h + 60);
    u.globalAlpha = 1; u.globalCompositeOperation = 'source-atop';
    const g = u.createLinearGradient(0, 0, w, h); g.addColorStop(0, 'rgba(255,255,255,.14)'); g.addColorStop(1, 'rgba(0,0,0,.08)'); u.fillStyle = g; u.fillRect(-30, -30, w + 60, h + 60);
    const mk2 = canvas(tmp2.width, tmp2.height), m2 = mk2.getContext('2d'); m2.scale(SS, SS); m2.translate(30, 30); m2.font = font; m2.fillText(text, bx, by); if (o.stroke) { m2.lineWidth = o.stroke; m2.lineJoin = 'round'; m2.strokeText(text, bx, by); }
    u.setTransform(1, 0, 0, 1, 0, 0); u.globalCompositeOperation = 'destination-in'; u.drawImage(mk2, 0, 0);
    x.save(); x.shadowColor = 'rgba(30,18,8,.35)'; x.shadowBlur = 3 * SS; x.shadowOffsetX = 1.2 * SS; x.shadowOffsetY = 2 * SS;
    x.drawImage(tmp2, -30, -30, w + 60, h + 60); x.restore();
  }, { elev: o.elev ?? 1.2 });
}
// Printed text on a card (no backing): used inside sprite builders.
function ink(x, text, px, py, o = {}) {
  x.save(); x.font = `${o.weight || 500} ${o.size || 24}px ${o.family || F.disp}`; x.fillStyle = o.color || '#2A2F3A';
  x.textAlign = o.align || 'left'; x.textBaseline = o.base || 'alphabetic'; x.globalAlpha = o.a ?? .92;
  if (o.ls) x.letterSpacing = o.ls + 'px';
  x.fillText(text, px, py); x.restore();
}
// Hand-drawn pencil / marker stroke with slight wobble
function pencil(x, pts, o = {}) {
  x.save(); x.strokeStyle = o.color || '#2A2F3A'; x.lineWidth = o.w || 3; x.lineCap = 'round'; x.lineJoin = 'round'; x.globalAlpha = o.a ?? .85;
  x.beginPath(); pts.forEach(([px, py], i) => { const j = (noise1(i * .7, o.seed || 3)) * (o.wob ?? .8); i ? x.lineTo(px + j, py - j) : x.moveTo(px, py); }); x.stroke(); x.restore();
}

// Background sheet (full frame) — pre-rendered per scene colour
function sheet(color, seed = 1, o = {}) {
  const c = canvas(W + 200, H + 200), x = c.getContext('2d');
  x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = 'soft-light'; x.globalAlpha = o.tex ?? .9;
  x.save(); x.translate(seed * 37 % 512, seed * 91 % 512); x.fillStyle = TEX.bgP; x.fillRect(-600, -600, c.width + 1200, c.height + 1200); x.restore();
  x.globalAlpha = .35 * (o.tex ?? .9) / .9; x.save(); x.scale(2.2, 2.2); x.translate(seed * 13 % 512, 0); x.fillStyle = TEX.bgP; x.fillRect(-600, -600, c.width, c.height); x.restore();
  x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  const g = x.createRadialGradient(c.width * .3, c.height * .15, 50, c.width * .45, c.height * .5, c.width * .75);
  g.addColorStop(0, 'rgba(255,248,230,.20)'); g.addColorStop(1, 'rgba(60,35,10,.10)'); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  // the table sits just behind the focal plane of a macro lens
  const soft = canvas(c.width, c.height), sx = soft.getContext('2d'); sx.filter = 'blur(1.6px)'; sx.drawImage(c, 0, 0);
  return soft;
}

// word-timing helpers
function wt(word, n = 1, line) { let k = 0; for (const w of VO.words) { if (w.w.toLowerCase().replace(/[^a-z0-9]/g, '') === word.toLowerCase() && (line === undefined || w.line === line)) { if (++k === n) return w.t; } } console.warn('word not found', word); return 0; }

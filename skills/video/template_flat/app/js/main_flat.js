// Frame driver: smooth camera, push transitions led by a navy edge, paper grain. Shared by the player and the renderer.
const POST = {};
const rgbA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${n >> 8 & 255},${n & 255},${a})`; };

function buildPost() {
  const size = 512, c = canvas(size, size), x = c.getContext('2d'), img = x.createImageData(size, size), R = mulberry(7);
  const grid = (g) => { const a = new Float32Array(g * g); for (let i = 0; i < a.length; i++) a[i] = R(); return a; };
  const gs = [[16, .5], [64, .25], [256, .12]].map(([g, amp]) => ({ g, amp, a: grid(g) }));
  for (let y = 0; y < size; y++) for (let xx = 0; xx < size; xx++) {
    let v = 0;
    for (const { g, amp, a } of gs) { const fx = xx / size * g, fy = y / size * g, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy; const s = (i, j) => a[((iy + j) % g) * g + (ix + i) % g]; v += (lerp(lerp(s(0, 0), s(1, 0), tx), lerp(s(0, 1), s(1, 1), tx), ty) - .5) * amp; }
    v += (R() - .5) * .35;
    const o = (y * size + xx) * 4, c8 = clamp(128 + v * 140, 0, 255); img.data[o] = img.data[o + 1] = img.data[o + 2] = c8; img.data[o + 3] = 255;
  }
  x.putImageData(img, 0, 0); POST.paper = canvas(8, 8).getContext('2d').createPattern(c, 'repeat');
  POST.grain = [0, 1, 2].map(k => {
    const g = canvas(FMT.w / 2, FMT.h / 2), gx = g.getContext('2d'), im = gx.createImageData(g.width, g.height), Rg = mulberry(50 + k);
    for (let i = 0; i < im.data.length; i += 4) { const n = 128 + (Rg() - .5) * 70; im.data[i] = im.data[i + 1] = im.data[i + 2] = n; im.data[i + 3] = 255; }
    gx.putImageData(im, 0, 0); return g;
  });
  const cw = FMT.w, ch = FMT.h, m = Math.min(cw, ch), v = canvas(cw, ch), vx = v.getContext('2d'), gr = vx.createRadialGradient(cw / 2, ch * .46, m * .45, cw / 2, ch / 2, Math.hypot(cw, ch) * .54);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, rgbA(C.navyD, .22)); vx.fillStyle = gr; vx.fillRect(0, 0, cw, ch); POST.vignette = v;
}

function camOf(S, t) {
  if (S.camAt) return S.camAt(t);
  const [z0, z1, cx, cy] = S.cam || [1, 1, 960, 540];
  return [lerp(z0, z1, E.sine(prog(t, S.start, S.end - S.start))), cx, cy];
}
function drawScene(ctx, S, t) {
  ctx.save();
  ctx.fillStyle = S.bg || C.teal; ctx.fillRect(-10, -10, W + 20, H + 20);
  const [z, cx, cy] = camOf(S, t);
  ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
  S.draw(ctx, t);
  ctx.restore();
  if (S.over) { ctx.save(); S.over(ctx, t); ctx.restore(); }
}
function drawPush(ctx, S, prev, p, t, draw = drawScene, cw = W, ch = H) {
  const e = E.inOut(p), dir = S.wipe || 'right';
  const v = { right: [1, 0], left: [-1, 0], bottom: [0, 1], top: [0, -1] }[dir];
  const span = v[0] ? cw : ch, off = span * (1 - e);
  ctx.save(); ctx.translate(-v[0] * span * e * .3, -v[1] * span * e * .3); draw(ctx, prev, t); ctx.restore();
  ctx.save(); ctx.translate(v[0] * off, v[1] * off);
  ctx.beginPath(); ctx.rect(0, 0, cw, ch); ctx.clip(); draw(ctx, S, S.start); ctx.restore();
  // the dark edge leading the new shot, like a wall passing the lens
  const band = 150, bx = v[0] * off, by = v[1] * off;
  ctx.fillStyle = C.navy;
  if (v[0] > 0) ctx.fillRect(bx - band, 0, band, ch); else if (v[0] < 0) ctx.fillRect(bx + cw, 0, band, ch);
  else if (v[1] > 0) ctx.fillRect(0, by - band, cw, band); else ctx.fillRect(0, by + ch, cw, band);
}

// ---------- formats: the 16:9 stage inside another canvas, or the scene's own layout ----------
const native = S => !FMT.wide && ((S.layouts && S.layouts[FMT.id]) || S.drawFmt);
// run fn in stage coordinates inside a rect of the canvas (default: the format's stage slot), clipped to it
function inStage(ctx, fn, r = {}) {
  const st = LAYOUT.stage, w = r.w ?? st.w, k = w / W;
  ctx.save(); ctx.translate(r.x ?? (FMT.w - w) / 2, r.y ?? st.y); ctx.scale(k, k); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); fn(ctx); ctx.restore();
}
// the scene's 16:9 picture at rect r ({x, y, w}); native layouts call it to reuse the stage, e.g. bigger and cropped
function drawStage(ctx, S, t, r) { inStage(ctx, () => drawScene(ctx, S, t), r); }
// what sits around the stage: the cream of the house walls, two faint brand discs, a soft shadow under the picture
function backdrop(ctx) {
  const st = LAYOUT.stage, g = ctx.createLinearGradient(0, 0, 0, FMT.h);
  g.addColorStop(0, C.sky); g.addColorStop(1, C.cream); ctx.fillStyle = g; ctx.fillRect(0, 0, FMT.w, FMT.h);
  ctx.save(); ctx.globalAlpha = .55; circ(ctx, FMT.w * .92, st.y * .35, FMT.w * .34, C.coralXL); circ(ctx, FMT.w * .06, st.y + st.h + (FMT.h - st.y - st.h) * .7, FMT.w * .3, C.tealXL); ctx.restore();
  ctx.save(); ctx.globalAlpha = .16; ctx.fillStyle = C.navy; ctx.fillRect(0, st.y + 10, FMT.w, st.h); ctx.restore();
}
function composeScene(ctx, S, t) {
  const f = native(S);
  if (f) { ctx.save(); ctx.fillStyle = S.bg || C.teal; ctx.fillRect(-10, -10, FMT.w + 20, FMT.h + 20); f.call(S, ctx, t, FMT); ctx.restore(); }
  else if (FMT.wide) drawScene(ctx, S, t);
  else { backdrop(ctx); drawStage(ctx, S, t); }
}

// ---------- burned-in captions: VO.burn pages (film.py captions), white brand-font bold on navy pills ----------
function capsFit() {
  if (!VO.burn) { if (CAPS.on) console.warn('no VO.burn: run film.py captions'); CAPS.on = false; return; }
  const L = LAYOUT.caps, wide = Math.max(...VO.burn.flatMap(p => p.l.map(l => textW(l.map(w => w[0]).join(' '), 100, 700, F.brand) / 100)));
  CAPS.size = Math.min(L.size, Math.floor(L.maxW / (wide + 1.1)));
}
function drawCaps(ctx, t, S) {
  if (!CAPS.on || S.noCaps) return;
  const P = VO.burn.find(p => t >= p.s && t < p.e); if (!P) return;
  const L = LAYOUT.caps, z = CAPS.size, h = z * 1.42, gap = z * .16, sp = textW(' ', z, 700, F.brand), n = P.l.length, a = E.out(prog(t, P.s, .14));
  const all = P.l.flat(), y0 = L.y - (n * h + (n - 1) * gap) * (L.anchor === 'bottom' ? 1 : .5) + (1 - a) * 12;
  ctx.save(); ctx.globalAlpha = a; let i = 0;
  P.l.forEach((line, j) => {
    const ws = line.map(w => textW(w[0], z, 700, F.brand)), lw = ws.reduce((s, v) => s + v, 0) + sp * (line.length - 1), y = y0 + j * (h + gap);
    let x = L.cx - lw / 2; rr(ctx, x - z * .55, y, lw + z * 1.1, h, h / 2, C.navy); ctx.lineWidth = Math.max(2, z * .05); ctx.strokeStyle = rgbA(C.white, .3); ctx.stroke();
    line.forEach((w, k) => {
      const nx = all[i + 1], on = t >= w[1] && t < (nx ? nx[1] : w[2] + .3);
      if (CAPS.style === 'karaoke' && on) rr(ctx, x - z * .14, y + h * .13, ws[k] + z * .28, h * .74, h * .2, C.red);
      txt(ctx, w[0], x, y + h / 2 + z * .36, { size: z, weight: 700, color: '#fff', font: F.brand });
      x += ws[k] + sp; i++;
    });
  });
  ctx.restore();
}

function renderFrame(ctx, tRaw) {
  FRAME = Math.floor(tRaw * FPS + 1e-6);
  const t = NOW = FRAME / FPS;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  let i = SCENES.findIndex(s => t >= s.start && t < s.end); if (i < 0) i = SCENES.length - 1;
  const S = SCENES[i], next = SCENES[i + 1];
  if (next && t >= next.start - WIPE) {
    const p = prog(t, next.start - WIPE, WIPE);
    if (FMT.wide) drawPush(ctx, next, S, p, t);
    else if (!native(S) && !native(next)) { backdrop(ctx); inStage(ctx, () => drawPush(ctx, next, S, p, t)); }
    else drawPush(ctx, next, S, p, t, composeScene, FMT.w, FMT.h);
  } else composeScene(ctx, S, t);
  // paper grain on every flat colour, a breath of film grain, soft vignette
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .32; ctx.fillStyle = POST.paper; ctx.fillRect(0, 0, FMT.w, FMT.h); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .05; ctx.drawImage(POST.grain[FRAME % 3], 0, 0, FMT.w, FMT.h); ctx.restore();
  ctx.drawImage(POST.vignette, 0, 0);
  drawMark(ctx, S, t);
  drawCaps(ctx, t, S);
  const fade = Math.max(1 - prog(t, 0, .3), E.inOut(prog(t, DURATION - 1.0, 1.0)));
  if (fade > 0) { ctx.fillStyle = rgbA(C.navyD, fade); ctx.fillRect(0, 0, FMT.w, FMT.h); }
  if (QS.has('safe')) safeGuides(ctx);
}
// ?safe=1: what platform UI covers (red), the caption slot (blue), the watermark slot (green)
function safeGuides(ctx) {
  ctx.save(); ctx.fillStyle = rgbA(C.red, .22);
  ctx.fillRect(0, 0, FMT.w, SAFE.top); ctx.fillRect(0, SAFE.bottom, FMT.w, FMT.h - SAFE.bottom); ctx.fillRect(0, SAFE.top, SAFE.left, SAFE.h); ctx.fillRect(SAFE.right, SAFE.top, FMT.w - SAFE.right, SAFE.h);
  ctx.lineWidth = 3; ctx.setLineDash([14, 10]);
  ctx.strokeStyle = C.blue; ctx.strokeRect(SAFE.caps.x, SAFE.caps.y, SAFE.caps.w, SAFE.caps.h);
  ctx.strokeStyle = C.green; ctx.strokeRect(MARK.x - MARK.w / 2, MARK.y - MARK.w * .17, MARK.w, MARK.w * .34);
  ctx.restore();
}

async function initFilm() {
  const faces = ['500 40px Quicksand', '600 40px Quicksand', '700 40px Quicksand', '500 40px Ubuntu', '700 40px Ubuntu', '700 20px "JetBrains Mono"'];
  await Promise.all(faces.map(f => document.fonts.load(f).catch(() => null)));
  await document.fonts.ready;
  await loadBrand();
  buildPost(); capsFit();
  for (const S of SCENES) S.build && S.build();
  SCENES.forEach(S => { if (S.wipe) { cue(S.start - WIPE, 'whoosh', { g: .5, p: 1.1, pan: { right: .6, left: -.6, top: 0, bottom: 0 }[S.wipe] }); cue(S.start - .03, 'land', { g: .45, p: .75 }); } });
  CUES.sort((a, b) => a.t - b.t);
}

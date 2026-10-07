// Frame driver: camera, sheet-of-paper wipes, lighting flicker, grain. Shared by the player and the offline renderer.
const WIPE = FILM.wipe;
const POST = {};

function buildPost() {
  const v = canvas(W, H), x = v.getContext('2d');
  const g = x.createRadialGradient(W * .48, H * .44, H * .35, W / 2, H / 2, H * 1.05);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(25,14,4,.34)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  POST.vignette = v;
  // warm key light from top-left, falling off toward the bottom-right
  const l = canvas(W, H), lx = l.getContext('2d'), lg = lx.createRadialGradient(W * .22, H * .05, 60, W * .35, H * .3, W * .95);
  lg.addColorStop(0, 'rgba(255,236,200,.55)'); lg.addColorStop(.45, 'rgba(255,236,200,.12)'); lg.addColorStop(1, 'rgba(40,24,60,.35)');
  lx.fillStyle = lg; lx.fillRect(0, 0, W, H); POST.light = l;
  POST.grain = [0, 1, 2, 3].map(k => {
    const c = canvas(W / 2, H / 2), gx = c.getContext('2d'), img = gx.createImageData(c.width, c.height), R = mulberry(99 + k);
    for (let i = 0; i < img.data.length; i += 4) { const n = 128 + (R() - .5) * 90; img.data[i] = img.data[i + 1] = img.data[i + 2] = n; img.data[i + 3] = 255; }
    gx.putImageData(img, 0, 0); return c;
  });
}

function camera(ctx, S, t) {
  let [z0, z1, cx, cy] = S.cam, z = lerp(z0, z1, E.inOut(prog(t, S.start, S.end - S.start)));
  if (S.camAt) [z, cx, cy] = S.camAt(t);
  const bf = Math.floor(FRAME / 2), jx = (rnd('cam', bf, 'x') - .5) * 1.2, jy = (rnd('cam', bf, 'y') - .5) * 1.2;
  ctx.translate(cx + jx, cy + jy); ctx.scale(z, z); ctx.translate(-cx, -cy);
}

function drawScene(ctx, S, t) {
  ctx.save(); camera(ctx, S, t);
  ctx.drawImage(S.sheet, -100, -100);
  S.draw(ctx, t);
  ctx.restore();
}

function drawWipe(ctx, S, p) {
  const e = E.inOut(p), dir = S.wipe;
  const off = { right: [W + 60, 0], left: [-W - 60, 0], bottom: [0, H + 60], top: [0, -H - 60] }[dir] || [W, 0];
  ctx.save();
  ctx.translate(off[0] * (1 - e), off[1] * (1 - e));
  ctx.translate(W / 2, H / 2); ctx.rotate((1 - e) * .05 * (dir === 'left' || dir === 'top' ? -1 : 1)); ctx.translate(-W / 2, -H / 2);
  ctx.save(); ctx.shadowColor = 'rgba(30,18,6,.45)'; ctx.shadowBlur = 50; ctx.shadowOffsetX = -Math.sign(off[0]) * 14; ctx.shadowOffsetY = -Math.sign(off[1]) * 14 + 8;
  ctx.drawImage(S.sheet, -100, -100); ctx.restore();
  // the sheet arrives with its first cut-outs already lying on it
  ctx.beginPath(); ctx.rect(-100, -100, W + 200, H + 200); ctx.clip();
  camera(ctx, S, S.start); S.draw(ctx, S.start);
  ctx.restore();
}

function renderFrame(ctx, tRaw) {
  FRAME = Math.floor(tRaw * FPS + 1e-6);
  const t = FRAME / FPS;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  let i = SCENES.findIndex(s => t >= s.start && t < s.end); if (i < 0) i = SCENES.length - 1;
  drawScene(ctx, SCENES[i], t);
  const next = SCENES[i + 1];
  if (next && t >= next.start - WIPE) drawWipe(ctx, next, prog(t, next.start - WIPE, WIPE));
  // lighting: vignette, stop-motion exposure flicker, film grain
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .55; ctx.drawImage(POST.light, 0, 0); ctx.restore();
  ctx.drawImage(POST.vignette, 0, 0);
  const fl = (rnd('flicker', FRAME) - .5) * .045;
  ctx.fillStyle = fl > 0 ? `rgba(255,246,228,${fl})` : `rgba(20,10,0,${-fl})`; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .07;
  ctx.drawImage(POST.grain[FRAME % 4], 0, 0, W, H); ctx.restore();
  const fade = Math.max(1 - prog(t, 0, .25), E.inOut(prog(t, DURATION - 1.0, 1.0)));
  if (fade > 0) { ctx.fillStyle = `rgba(8,6,4,${fade})`; ctx.fillRect(0, 0, W, H); }
}

async function initFilm() {
  const faces = ['400 40px Fredoka', '500 40px Fredoka', '600 40px Fredoka', '700 40px Fredoka', '500 40px Ubuntu', '700 40px Caveat', '500 20px "JetBrains Mono"', '600 20px "JetBrains Mono"', '700 20px "JetBrains Mono"'];
  await Promise.all(faces.map(f => document.fonts.load(f).catch(() => null)));
  await document.fonts.ready;
  makeTextures(); buildAll(); buildPost();
  for (const S of SCENES) { S.sheet = sheet(S.bg, S.seed, { tex: S.tex }); S.build(); }
  SCENES.forEach(S => { if (S.wipe) { cue(S.start - WIPE, 'whoosh', { g: .5, p: 1.1, pan: { right: .6, left: -.6, top: 0, bottom: 0 }[S.wipe] }); cue(S.start - .03, 'land', { g: .45, p: .75 }); } });
  CUES.sort((a, b) => a.t - b.t);
}

// Rental Ninja house brand: the official logos, the red banner placed in scenes, and the corner watermark.
const LOGO = {};
function loadBrand() {
  const load = (k, src) => new Promise(r => { const i = new Image(); i.onload = () => { LOGO[k] = i; r(); }; i.onerror = () => { console.warn('logo missing', src); r(); }; i.src = src; });
  return Promise.all([load('color', 'img/logo_color.svg'), load('neg', 'img/logo_neg.png'), load('iso', 'img/iso.svg')]);
}
// k: 'color' (dark text, for light grounds) | 'neg' (all white, for dark grounds) | 'iso' (the ninja head)
function logoImg(x, k, cx, cy, w) { const i = LOGO[k]; if (!i) return; const h = w * i.height / i.width; x.drawImage(i, cx - w / 2, cy - h / 2, w, h); }

// product placement: a red banner hanging on a wall, the ninja on a white disc and the name below
function banner(x, cx, top, o = {}) {
  const s = o.s ?? 1, sw = o.sway ? Math.sin(NOW * 1.3 + cx) * .012 : 0;
  at(x, cx, top, { s, rot: sw }, (x) => {
    rr(x, -85, 12, 170, 400, 0, C.red);
    poly(x, [[-85, 412], [0, 372], [85, 412], [85, 452], [0, 412], [-85, 452]], C.red);
    x.save(); x.globalAlpha *= .18; rr(x, 55, 12, 30, 440, 0, C.redD); x.restore();
    rr(x, -100, 0, 200, 16, 6, C.navyL);
    circ(x, 0, 132, 70, C.white); logoImg(x, 'iso', 0, 132, 125);
    txt(x, 'RENTAL', 0, 272, { size: 34, weight: 700, color: '#fff', align: 'center', font: F.brand });
    txt(x, 'NINJA', 0, 317, { size: 34, weight: 700, color: '#fff', align: 'center', font: F.brand });
  });
}

// the watermark, in canvas space: white logo on dark ground, colour logo on light ground. 16:9 = bottom-right corner;
// the other formats centre it above the stage (LAYOUT.mark); a scene moves it per format with mark: {'9x16': {x, y, w}}
// or hides it with noMark
const MARK = LAYOUT.mark;
function drawMark(ctx, S, t) {
  const M = (S.mark || {})[FMT.id] || MARK;
  if (S.noMark || !LOGO.neg) return;
  const a = clamp(prog(t, .6, .6)) * (1 - clamp(prog(t, DURATION - 7, .6)));
  if (a <= 0) return;
  const d = ctx.getImageData(M.x - M.w / 2, M.y - M.w * .09, M.w, M.w * .18).data;
  let lum = 0; for (let i = 0; i < d.length; i += 16) lum += .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2];
  lum /= d.length / 16 * 255;
  ctx.save(); ctx.globalAlpha = a * .92; logoImg(ctx, lum > .55 ? 'color' : 'neg', M.x, M.y, M.w); ctx.restore();
}

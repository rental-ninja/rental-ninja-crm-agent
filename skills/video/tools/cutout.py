"""Chroma-key cut-out with a white die-cut paper border. usage: cutout.py in.png out.png [border_px=14] [green|magenta] [all|edge]

edge: only key colour touching the frame is background (use when the subject contains the key colour, e.g. flowers);
all (default): every key-coloured pixel goes, which also clears enclosed gaps such as between the legs."""
import sys
import numpy as np
from PIL import Image, ImageFilter
src, dst = sys.argv[1], sys.argv[2]; border = int(sys.argv[3]) if len(sys.argv) > 3 else 14
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32) / 255
r, g, b = im[..., 0], im[..., 1], im[..., 2]
key = sys.argv[4] if len(sys.argv) > 4 else 'green'
spill = g - np.maximum(r, b) if key == 'green' else np.minimum(r, b) - g
alpha = 1 - np.clip((spill - .06) / .14, 0, 1)                      # green-dominant pixels go transparent
a = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.8))
alpha = np.asarray(a).astype(np.float32) / 255
# only key colour connected to the frame edge is background: the subject may contain the key colour (flowers, shirts)
if (sys.argv[5] if len(sys.argv) > 5 else 'all') == 'edge':
  keyish = Image.fromarray((alpha < .5).astype(np.uint8) * 255).copy()
  from PIL import ImageDraw
  Hh, Ww = alpha.shape
  for sx, sy in [(x, 0) for x in range(0, Ww, 16)] + [(x, Hh - 1) for x in range(0, Ww, 16)] + [(0, y) for y in range(0, Hh, 16)] + [(Ww - 1, y) for y in range(0, Hh, 16)]:
      if keyish.getpixel((sx, sy)) == 255: ImageDraw.floodfill(keyish, (sx, sy), 128)
  bgzone = np.asarray(keyish.filter(ImageFilter.MaxFilter(5))) == 128
  alpha = np.where(bgzone, alpha, 1.0)
specks = Image.fromarray((alpha > .5).astype(np.uint8) * 255).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.MaxFilter(11))   # opening drops stray specks
alpha *= np.asarray(specks).astype(np.float32) / 255
edge = alpha < .98                                                     # despill the edges
if key == 'green': rgb = np.stack([r, np.where(edge, np.minimum(g, np.maximum(r, b) + .02), g), b], -1)
else: cap = g + .02; rgb = np.stack([np.where(edge, np.minimum(r, cap), r), g, np.where(edge, np.minimum(b, cap), b)], -1)
ys, xs = np.where(alpha > .02); pad = border + 12
y0, y1, x0, x1 = max(0, ys.min() - pad), min(im.shape[0], ys.max() + pad), max(0, xs.min() - pad), min(im.shape[1], xs.max() + pad)
rgb, alpha = rgb[y0:y1, x0:x1], alpha[y0:y1, x0:x1]
H, W = alpha.shape; P = border + 8
canvasA = np.zeros((H + 2 * P, W + 2 * P), np.float32); canvasA[P:P + H, P:P + W] = alpha
die = Image.fromarray((canvasA > .3).astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(2 * (border // 2) + 1)).filter(ImageFilter.MaxFilter(2 * (border - border // 2) + 1)).filter(ImageFilter.GaussianBlur(1.2))
die = np.asarray(die).astype(np.float32) / 255
rng = np.random.default_rng(3); paper = np.clip(.965 + rng.normal(0, .012, die.shape), 0, 1)
out = np.zeros((H + 2 * P, W + 2 * P, 4), np.float32)
out[..., 0] = paper; out[..., 1] = paper * .995; out[..., 2] = paper * .975; out[..., 3] = die
fg = np.zeros_like(out[..., :3]); fg[P:P + H, P:P + W] = rgb
out[..., :3] = out[..., :3] * (1 - canvasA[..., None]) + fg * canvasA[..., None]
Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), 'RGBA').save(dst)
print(dst, out.shape[1], 'x', out.shape[0])

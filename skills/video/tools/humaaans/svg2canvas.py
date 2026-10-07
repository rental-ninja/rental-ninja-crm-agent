#!/usr/bin/env python3
"""Convert an SVG into a JS module of flat {d, fill} path lists for canvas Path2D.

    python3 svg2canvas.py in.svg out.js [--name foo] [--precision 2]

Every transform (group, element, <use>) is baked into the path coordinates: paths are
normalised to absolute M/L/C/Q/Z (H/V/S/T/A expanded, arcs -> cubics) and then mapped
through the accumulated affine matrix, so all parts share one coordinate space (the
viewBox) and can be re-rigged with plain ctx.translate/rotate.

Output:
    export default {
      name, viewBox: [x, y, w, h],
      parts: [{ id, g, d, fill, rule?, op?, stroke?, lw?, clip? }, ...],
      fills: ['#191847', ...]          // unique colours, for recolour maps
    }
  id   = element id (Sketch layer name), g = '/'-joined chain of ancestor group ids
  clip = d of the <mask>/<clipPath> applied to the part (already in viewBox space)

Supported: path, rect (rx/ry), circle, ellipse, polygon, polyline, line, g, use,
<style> class rules, style="" attributes, fill/stroke/opacity/fill-opacity/fill-rule,
mask/clip-path (treated as a clip). Not supported: gradients/patterns (first stop colour
is used), filters, text.
"""
import argparse
import json
import math
import re
import sys
import xml.etree.ElementTree as ET

SVG_NS = "{http://www.w3.org/2000/svg}"
XLINK = "{http://www.w3.org/1999/xlink}href"
IDENT = (1.0, 0.0, 0.0, 1.0, 0.0, 0.0)
NUM = r"[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?"


def tag(el):
    return el.tag.replace(SVG_NS, "")


def mul(m, n):
    a, b, c, d, e, f = m
    A, B, C, D, E, F = n
    return (a * A + c * B, b * A + d * B, a * C + c * D, b * C + d * D, a * E + c * F + e, b * E + d * F + f)


def apply(m, x, y):
    a, b, c, d, e, f = m
    return a * x + c * y + e, b * x + d * y + f


def parse_transform(s):
    m = IDENT
    for name, args in re.findall(r"(\w+)\s*\(([^)]*)\)", s or ""):
        v = [float(x) for x in re.findall(NUM, args)]
        if name == "matrix":
            t = tuple(v)
        elif name == "translate":
            t = (1, 0, 0, 1, v[0], v[1] if len(v) > 1 else 0)
        elif name == "scale":
            t = (v[0], 0, 0, v[1] if len(v) > 1 else v[0], 0, 0)
        elif name == "rotate":
            r = math.radians(v[0])
            t = (math.cos(r), math.sin(r), -math.sin(r), math.cos(r), 0, 0)
            if len(v) == 3:
                t = mul(mul((1, 0, 0, 1, v[1], v[2]), t), (1, 0, 0, 1, -v[1], -v[2]))
        elif name == "skewX":
            t = (1, 0, math.tan(math.radians(v[0])), 1, 0, 0)
        elif name == "skewY":
            t = (1, math.tan(math.radians(v[0])), 0, 1, 0, 0)
        else:
            continue
        m = mul(m, t)
    return m


def arc_to_cubics(x1, y1, rx, ry, phi, fa, fs, x2, y2):
    """SVG endpoint arc -> list of cubic segments (each 6 floats)."""
    if rx == 0 or ry == 0:
        return [(x1, y1, x2, y2, x2, y2)]
    rx, ry = abs(rx), abs(ry)
    cp, sp = math.cos(math.radians(phi)), math.sin(math.radians(phi))
    dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
    x1p, y1p = cp * dx + sp * dy, -sp * dx + cp * dy
    lam = x1p**2 / rx**2 + y1p**2 / ry**2
    if lam > 1:
        rx, ry = rx * math.sqrt(lam), ry * math.sqrt(lam)
    num = rx**2 * ry**2 - rx**2 * y1p**2 - ry**2 * x1p**2
    den = rx**2 * y1p**2 + ry**2 * x1p**2
    co = math.sqrt(max(0, num / den)) * (-1 if fa == fs else 1)
    cxp, cyp = co * rx * y1p / ry, -co * ry * x1p / rx
    cx, cy = cp * cxp - sp * cyp + (x1 + x2) / 2, sp * cxp + cp * cyp + (y1 + y2) / 2

    def ang(ux, uy, vx, vy):
        a = math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
        return a

    t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
    dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
    if not fs and dt > 0:
        dt -= 2 * math.pi
    elif fs and dt < 0:
        dt += 2 * math.pi
    n = max(1, math.ceil(abs(dt) / (math.pi / 2)))
    step = dt / n
    k = 4 / 3 * math.tan(step / 4)
    out = []
    for i in range(n):
        a1, a2 = t1 + i * step, t1 + (i + 1) * step

        def pt(a, dx_=0.0, dy_=0.0):
            ex, ey = rx * math.cos(a), ry * math.sin(a)
            return cx + cp * ex - sp * ey, cy + sp * ex + cp * ey

        def dpt(a):
            ex, ey = -rx * math.sin(a), ry * math.cos(a)
            return cp * ex - sp * ey, sp * ex + cp * ey

        p1, p2 = pt(a1), pt(a2)
        d1, d2 = dpt(a1), dpt(a2)
        out.append((p1[0] + k * d1[0], p1[1] + k * d1[1], p2[0] - k * d2[0], p2[1] - k * d2[1], p2[0], p2[1]))
    return out


def normalise(d):
    """Path data -> list of (cmd, [abs coords]) with cmd in M L C Q Z."""
    toks = re.findall(r"[MmLlHhVvCcSsQqTtAaZz]|" + NUM, d)
    out, i, cmd = [], 0, None
    x = y = sx = sy = 0.0
    lc = lq = None  # last cubic / quad control point for S/T reflection

    def nums(k):
        nonlocal i
        v = [float(t) for t in toks[i : i + k]]
        i += k
        return v

    while i < len(toks):
        if re.match(r"[A-Za-z]", toks[i]):
            cmd = toks[i]
            i += 1
            if cmd in "Zz":
                out.append(("Z", []))
                x, y = sx, sy
                lc = lq = None
                continue
        rel = cmd.islower()
        C = cmd.upper()
        ox, oy = (x, y) if rel else (0.0, 0.0)
        if C == "M":
            px, py = nums(2)
            x, y = px + ox, py + oy
            sx, sy = x, y
            out.append(("M", [x, y]))
            cmd = "l" if rel else "L"
            lc = lq = None
        elif C == "L":
            px, py = nums(2)
            x, y = px + ox, py + oy
            out.append(("L", [x, y]))
            lc = lq = None
        elif C == "H":
            (px,) = nums(1)
            x = px + ox
            out.append(("L", [x, y]))
            lc = lq = None
        elif C == "V":
            (py,) = nums(1)
            y = py + oy
            out.append(("L", [x, y]))
            lc = lq = None
        elif C == "C":
            a = nums(6)
            p = [a[0] + ox, a[1] + oy, a[2] + ox, a[3] + oy, a[4] + ox, a[5] + oy]
            out.append(("C", p))
            lc, lq = (p[2], p[3]), None
            x, y = p[4], p[5]
        elif C == "S":
            a = nums(4)
            c1 = (2 * x - lc[0], 2 * y - lc[1]) if lc else (x, y)
            p = [c1[0], c1[1], a[0] + ox, a[1] + oy, a[2] + ox, a[3] + oy]
            out.append(("C", p))
            lc, lq = (p[2], p[3]), None
            x, y = p[4], p[5]
        elif C == "Q":
            a = nums(4)
            p = [a[0] + ox, a[1] + oy, a[2] + ox, a[3] + oy]
            out.append(("Q", p))
            lq, lc = (p[0], p[1]), None
            x, y = p[2], p[3]
        elif C == "T":
            a = nums(2)
            c1 = (2 * x - lq[0], 2 * y - lq[1]) if lq else (x, y)
            p = [c1[0], c1[1], a[0] + ox, a[1] + oy]
            out.append(("Q", p))
            lq, lc = (p[0], p[1]), None
            x, y = p[2], p[3]
        elif C == "A":
            rx, ry, phi, fa, fs, px, py = nums(7)
            ex, ey = px + ox, py + oy
            for seg in arc_to_cubics(x, y, rx, ry, phi, int(fa), int(fs), ex, ey):
                out.append(("C", list(seg)))
            x, y = ex, ey
            lc = lq = None
    return out


def emit(segs, m, prec):
    fmt = lambda v: (f"{v:.{prec}f}").rstrip("0").rstrip(".") if prec else str(round(v))
    parts = []
    for c, p in segs:
        if c == "Z":
            parts.append("Z")
            continue
        pts = []
        for j in range(0, len(p), 2):
            tx, ty = apply(m, p[j], p[j + 1])
            pts += [fmt(tx), fmt(ty)]
        parts.append(c + " ".join(pts))
    return "".join(parts).replace("-0 ", "0 ")


def shape_to_d(el):
    t, g = tag(el), lambda k, dft=0.0: float(re.findall(NUM, el.get(k, str(dft)))[0])
    if t == "path":
        return el.get("d", "")
    if t == "rect":
        x, y, w, h = g("x"), g("y"), g("width"), g("height")
        rx = g("rx", el.get("ry", 0)) if el.get("rx") or el.get("ry") else 0
        ry = g("ry", rx) if el.get("ry") else rx
        rx, ry = min(rx, w / 2), min(ry, h / 2)
        if not rx:
            return f"M{x} {y}H{x + w}V{y + h}H{x}Z"
        return (
            f"M{x + rx} {y}H{x + w - rx}A{rx} {ry} 0 0 1 {x + w} {y + ry}V{y + h - ry}"
            f"A{rx} {ry} 0 0 1 {x + w - rx} {y + h}H{x + rx}A{rx} {ry} 0 0 1 {x} {y + h - ry}"
            f"V{y + ry}A{rx} {ry} 0 0 1 {x + rx} {y}Z"
        )
    if t in ("circle", "ellipse"):
        cx, cy = g("cx"), g("cy")
        rx = g("r") if t == "circle" else g("rx")
        ry = g("r") if t == "circle" else g("ry")
        return f"M{cx - rx} {cy}A{rx} {ry} 0 1 0 {cx + rx} {cy}A{rx} {ry} 0 1 0 {cx - rx} {cy}Z"
    if t in ("polygon", "polyline"):
        v = re.findall(NUM, el.get("points", ""))
        if len(v) < 4:
            return ""
        d = "M" + " ".join(v[:2]) + "L" + " ".join(v[2:])
        return d + ("Z" if t == "polygon" else "")
    if t == "line":
        return f"M{g('x1')} {g('y1')}L{g('x2')} {g('y2')}"
    return ""


class Converter:
    INHERIT = ("fill", "fill-rule", "stroke", "stroke-width", "fill-opacity", "stroke-opacity")

    def __init__(self, root, prec):
        self.root, self.prec, self.parts = root, prec, []
        self.ids = {el.get("id"): el for el in root.iter() if el.get("id")}
        self.css = {}
        self.grad = {}
        for st in root.iter(SVG_NS + "style"):
            for sels, body in re.findall(r"([^{}]+)\{([^}]*)\}", st.text or ""):
                decl = dict(
                    (k.strip(), v.strip()) for k, v in (p.split(":", 1) for p in body.split(";") if ":" in p)
                )
                for sel in sels.split(","):
                    sel = sel.strip()
                    if sel.startswith("."):
                        self.css.setdefault(sel[1:], {}).update(decl)
        for gtag in ("linearGradient", "radialGradient"):
            for gr in root.iter(SVG_NS + gtag):
                stops = list(gr.iter(SVG_NS + "stop"))
                if stops:
                    s0 = stops[0]
                    style = dict(
                        (k.strip(), v.strip())
                        for k, v in (p.split(":", 1) for p in (s0.get("style") or "").split(";") if ":" in p)
                    )
                    self.grad[gr.get("id")] = s0.get("stop-color") or style.get("stop-color", "#000")

    def props(self, el, inherited):
        p = {k: v for k, v in inherited.items() if k not in ("opacity", "fill-opacity")}
        p["fill-opacity"] = inherited.get("fill-opacity", 1)
        own = {}
        for cls in (el.get("class") or "").split():
            own.update(self.css.get(cls, {}))
        for k in self.INHERIT + ("opacity",):
            if el.get(k) is not None:
                own[k] = el.get(k)
        own.update((k.strip(), v.strip()) for k, v in (s.split(":", 1) for s in (el.get("style") or "").split(";") if ":" in s))
        p["opacity"] = float(inherited.get("opacity", 1.0)) * float(own.pop("opacity", 1))
        p.update(own)
        return p

    def colour(self, v):
        if not v or v == "none":
            return None
        m = re.match(r"url\(#([^)]+)\)", v)
        if m:
            return self.grad.get(m.group(1), "#888")
        return v

    def clip_d(self, el, m):
        ref = el.get("mask") or el.get("clip-path")
        if not ref:
            return None
        mid = re.findall(r"#([^)]+)", ref)
        node = self.ids.get(mid[0]) if mid else None
        if node is None:
            return None
        ds = []
        for sub in node.iter():
            if tag(sub) == "use":
                tgt = self.ids.get((sub.get(XLINK) or sub.get("href") or "#").lstrip("#"))
                if tgt is not None:
                    ds.append(emit(normalise(shape_to_d(tgt)), mul(m, parse_transform(sub.get("transform"))), self.prec))
            elif tag(sub) in ("path", "rect", "circle", "ellipse", "polygon", "polyline"):
                ds.append(emit(normalise(shape_to_d(sub)), mul(m, parse_transform(sub.get("transform"))), self.prec))
        return "".join(ds) or None

    def walk(self, el, m, inh, chain, clip):
        t = tag(el)
        if t in ("defs", "mask", "clipPath", "title", "desc", "style", "metadata", "linearGradient", "radialGradient", "symbol"):
            return
        m = mul(m, parse_transform(el.get("transform")))
        p = self.props(el, inh)
        clip = self.clip_d(el, m) or clip
        if t == "use":
            tgt = self.ids.get((el.get(XLINK) or el.get("href") or "#").lstrip("#"))
            if tgt is not None:
                x, y = float(el.get("x", 0)), float(el.get("y", 0))
                self.walk_target(tgt, mul(m, (1, 0, 0, 1, x, y)), p, chain + [el.get("id") or tgt.get("id") or "use"], clip)
            return
        if t in ("svg", "g", "a"):
            sub = chain + ([el.get("id")] if el.get("id") and t == "g" else [])
            for ch in el:
                self.walk(ch, m, p, sub, clip)
            return
        d = shape_to_d(el)
        if not d:
            return
        self.add(el, d, m, p, chain, clip)

    def walk_target(self, tgt, m, p, chain, clip):
        if tag(tgt) in ("g", "symbol"):
            for ch in tgt:
                self.walk(ch, m, p, chain, clip)
        else:
            m2 = mul(m, parse_transform(tgt.get("transform")))
            p2 = self.props(tgt, p)
            d = shape_to_d(tgt)
            if d:
                self.add(tgt, d, m2, p2, chain, clip)

    def add(self, el, d, m, p, chain, clip):
        fill = self.colour(p.get("fill", "#000"))
        stroke = self.colour(p.get("stroke"))
        if not fill and not stroke:
            return
        part = {"id": el.get("id") or tag(el), "g": "/".join(c for c in chain if c), "d": emit(normalise(d), m, self.prec)}
        if fill:
            part["fill"] = fill
        if p.get("fill-rule") == "evenodd":
            part["rule"] = "evenodd"
        op = p["opacity"] * float(p.get("fill-opacity", 1))
        if op < 0.999:
            part["op"] = round(op, 3)
        if stroke:
            part["stroke"] = stroke
            sc = math.sqrt(abs(m[0] * m[3] - m[1] * m[2]))
            part["lw"] = round(float(re.findall(NUM, str(p.get("stroke-width", 1)))[0]) * sc, 2)
        if clip:
            part["clip"] = clip
        self.parts.append(part)


def convert(path, name=None, prec=2, matrix=IDENT):
    """matrix: optional extra affine (a,b,c,d,e,f) applied to everything, e.g. to re-anchor and rescale."""
    root = ET.parse(path).getroot()
    vb = [float(v) for v in re.findall(NUM, root.get("viewBox", ""))] or [
        0,
        0,
        float(re.findall(NUM, root.get("width", "100"))[0]),
        float(re.findall(NUM, root.get("height", "100"))[0]),
    ]
    cv = Converter(root, prec)
    cv.walk(root, tuple(matrix), {"fill": "#000", "opacity": 1.0}, [], None)
    fills = sorted({p["fill"] for p in cv.parts if p.get("fill")})
    return {"name": name or re.sub(r"\W+", "_", path.rsplit("/", 1)[-1][:-4]), "viewBox": vb, "parts": cv.parts, "fills": fills}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("svg")
    ap.add_argument("out")
    ap.add_argument("--name")
    ap.add_argument("--precision", type=int, default=2)
    a = ap.parse_args()
    data = convert(a.svg, a.name, a.precision)
    js = "export default " + json.dumps(data, indent=1) + ";\n"
    if a.out.endswith(".json"):
        js = json.dumps(data)
    open(a.out, "w").write(js)
    print(f"{a.out}: {len(data['parts'])} parts, fills={data['fills']}", file=sys.stderr)

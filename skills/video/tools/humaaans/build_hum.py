"""Build hum_data.js from the Humaaans single pieces.
usage: build_hum.py "<humaaans>/Single Pieces" out/hum_data.js   (defaults: the old mirror layout, ./hum_data.js)

Humaaans pieces compose at fixed offsets in a 'human frame': head box at (82,0), body at (22,82),
bottom at (0,187). Here every piece is re-anchored (heads/bodies to the neck, bottoms to the hip)
and scaled so a standing person (skull top to soles) is 1.0 unit tall.
"""
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from svg2canvas import convert  # noqa: E402

SRC = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else HERE.parent / "humaaans" / "Single Pieces"
OUT = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else HERE / "hum_data.js"
OFFSET = {"head": (82, 0), "body": (22, 82), "bottom": (0, 187)}
NECK = (148.0, 100.0)
HIP = (150.0, 190.0)
FEET_Y = 426.0
SKULL_TOP_Y = 28.0
U = 1.0 / (FEET_Y - SKULL_TOP_Y)
SKIN = {"#B28B67", "#997659"}
SEAT_IDS = re.compile(r"Seat|Ball|Wheel|Base|^path$", re.I)


def lum(hex_):
    h = hex_.lstrip("#")
    r, g, b = (int(h[i : i + 2], 16) for i in (0, 2, 4))
    return 0.299 * r + 0.587 * g + 0.114 * b


def points(d):
    """On-curve points of an absolute M/L/C/Q/Z path (as emitted by svg2canvas)."""
    pts = []
    for cmd, args in re.findall(r"([MLCQZ])([^MLCQZ]*)", d):
        v = [float(x) for x in args.split()]
        if v:
            pts.append((v[-2], v[-1]))
    return pts


def bbox(d):
    p = points(d)
    xs, ys = [q[0] for q in p], [q[1] for q in p]
    return [min(xs), min(ys), max(xs), max(ys)]


def load(kind, path):
    ox, oy = OFFSET[kind]
    ax, ay = NECK if kind in ("head", "body") else HIP
    m = (U, 0, 0, U, (ox - ax) * U, (oy - ay) * U)
    return convert(str(path), prec=4, matrix=m)["parts"]


def split_by_luma(parts, base_role, shade_role):
    fills = sorted({p["fill"] for p in parts}, key=lum, reverse=True)
    for p in parts:
        p["role"] = base_role if p["fill"] == fills[0] or len(fills) == 1 else shade_role


def slim(p, **extra):
    out = {"d": p["d"], "fill": p["fill"], "role": p["role"]}
    for k in ("op", "rule", "clip"):
        if k in p:
            out[k] = p[k]
    if p["fill"] == "#997659" and p["role"] == "skin":
        out["k"] = -0.16
    out.update(extra)
    return out


def head_parts(parts):
    for p in parts:
        if p["fill"] in SKIN:
            p["role"] = "skin"
        elif p.get("op", 1) < 1 or p["fill"] == "#2C2C2C":
            p["role"] = "other"
        else:
            p["role"] = "hair"
    return [slim(p) for p in parts]


def body_parts(name, parts):
    back = None
    for p in parts:
        i = p["id"]
        if i == "Skin":
            p["role"] = "skin"
        elif p.get("op", 1) < 1:
            p["role"] = "other"
        elif re.search(r"Back|Sleeve", i):
            p["role"] = "topShade"
            back = p
        elif i == "Shirt" and name != "Pregnant":
            p["role"] = "other"
            p["inner"] = 1
        else:
            p["role"] = "top"
    out, pivot = [], None
    # Back arm = the *-Back layer (it only spans shoulder->wrist) plus the skin subpath touching its far end.
    if back is not None and name not in ("Pointing Forward",):
        bx0, by0, bx1, by1 = bbox(back["d"])
        far = max(points(back["d"]), key=lambda q: q[0])
        pivot = [round(bx0 + 0.035, 4), round(by0 + 0.035, 4)]
    for p in parts:
        if p["id"] == "Skin" and pivot:
            subs = [s for s in re.split(r"(?=M)", p["d"]) if s]
            dist = lambda s: min((q[0] - far[0]) ** 2 + (q[1] - far[1]) ** 2 for q in points(s))
            hand = min(subs, key=dist)
            for s in subs:
                out.append(slim({**p, "d": s}, **({"arm": 1} if s is hand else {})))
            continue
        extra = {"arm": 1} if p is back and pivot else {}
        if p.get("inner"):
            extra["inner"] = 1
        out.append(slim(p, **extra))
    return out, pivot


def bottom_parts(name, parts, sitting):
    for p in parts:
        i = p["id"]
        if sitting and SEAT_IDS.search(i) and p["fill"] not in SKIN:
            p["role"], p["seat"] = "other", 1
        elif p.get("op", 1) < 1:
            p["role"] = "other"
        elif re.match(r"shoe", i, re.I):
            p["role"] = "shoe"
        elif p["fill"] in SKIN:
            p["role"] = "skin"
        else:
            p["role"] = "cloth"
    split_by_luma([p for p in parts if p["role"] == "cloth"], "bottom", "bottomShade")
    for p in parts:
        if p["id"] == "Skirt-Shadow":
            p["role"] = "bottomShade"
    out = []
    legs = None
    if not sitting:
        legs = assign_legs(name, parts)
    for p in parts:
        extra = {}
        if p.get("seat"):
            extra["seat"] = 1
        if legs and id(p) in legs["of"]:
            extra["leg"] = legs["of"][id(p)]
        out.append(slim(p, **extra))
    solid = [bbox(p["d"])[3] for p in parts if p.get("op", 1) >= 1]
    ground = round(max(solid), 4)
    meta = {"ground": ground}
    if legs:
        meta["legs"] = legs["geo"]
    return out, meta


def assign_legs(name, parts):
    """Back/front leg = darker/lighter Leg layer; pants likewise; each shoe joins the leg whose ankle is nearest."""
    legs = [p for p in parts if p["id"] == "Leg"]
    if len(legs) != 2:
        return None
    back_leg, front_leg = sorted(legs, key=lambda p: lum(p["fill"]))
    of = {id(back_leg): "b", id(front_leg): "f"}
    pants = [p for p in parts if p["id"] == "Pant"]
    if len(pants) == 2:
        bp, fp = sorted(pants, key=lambda p: lum(p["fill"]))
        of[id(bp)], of[id(fp)] = "b", "f"
    geo = {}
    for key, leg in (("b", back_leg), ("f", front_leg)):
        pts = points(leg["d"])
        top = min(q[1] for q in pts)
        tops = [q for q in pts if q[1] < top + 0.01]
        hip = [sum(q[0] for q in tops) / len(tops), top + 0.02]
        low = max(pts, key=lambda q: q[1])
        geo[key] = {"hip": [round(v, 4) for v in hip], "ankle": [round(low[0], 4), round(low[1], 4)]}
    for s in (p for p in parts if p["role"] == "shoe"):
        sx, sy, sx1, sy1 = bbox(s["d"])
        c = ((sx + sx1) / 2, sy)
        near = min(geo, key=lambda k: (geo[k]["ankle"][0] - c[0]) ** 2 + (geo[k]["ankle"][1] - c[1]) ** 2)
        of[id(s)] = near
    for p in parts:
        if id(p) not in of and p["role"] in ("bottom", "bottomShade") and p["id"] not in ("Skirt", "Skirt-Shadow", "Bottom"):
            of[id(p)] = "f"
    return {"of": of, "geo": geo}


def main():
    hum = {"unit": U, "neck": [round((NECK[0] - HIP[0]) * U, 4), round((NECK[1] - HIP[1]) * U, 4)], "heads": {}, "bodies": {}, "bottoms": {}, "sitting": {}}
    for f in sorted((SRC / "Head" / "Front").glob("*.svg")):
        hum["heads"][f.stem] = {"parts": head_parts(load("head", f))}
    for f in sorted((SRC / "Body").glob("*.svg")):
        parts, pivot = body_parts(f.stem, load("body", f))
        hum["bodies"][f.stem] = {"parts": parts, "armPivot": pivot}
    for kind, sitting in (("Standing", False), ("Sitting", True)):
        for f in sorted((SRC / "Bottom" / kind).glob("*.svg")):
            parts, meta = bottom_parts(f.stem, load("bottom", f), sitting)
            (hum["sitting"] if sitting else hum["bottoms"])[f.stem] = {"parts": parts, **meta}
    js = "// Generated by build_hum.py from Humaaans (Pablo Stanley, CC0). Units: standing person = 1.0; heads/bodies anchored at the neck, bottoms at the hip.\nconst HUM = " + json.dumps(hum, separators=(",", ":")) + ";\nif (typeof module !== 'undefined') module.exports = HUM;\n"
    OUT.write_text(js)
    print("heads", len(hum["heads"]), "bodies", len(hum["bodies"]), "bottoms", len(hum["bottoms"]), "sitting", len(hum["sitting"]), f"{len(js)/1024:.0f} KB")
    print("arm support:", [k for k, v in hum["bodies"].items() if v["armPivot"]])
    for k, v in hum["bottoms"].items():
        print(k, v.get("legs"), "ground", v["ground"])


main()

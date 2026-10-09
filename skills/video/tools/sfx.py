"""Foley synthesiser: renders every animation cue (cues.json) into a stereo SFX stem."""
import json, sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(d * SR)) / SR


def bandnoise(d, lo, hi, tilt=0.0):
    n = max(16, int(d * SR))
    X = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    m = ((f >= lo) & (f <= hi)).astype(float)
    edge = 0.15
    m = np.clip(np.minimum((f - lo * (1 - edge)) / (lo * edge + 1e-9), (hi * (1 + edge) - f) / (hi * edge + 1e-9)), 0, 1)
    if tilt:
        m *= (np.maximum(f, 1) / 1000.0) ** tilt
    y = np.fft.irfft(X * m, n)
    return y / (np.abs(y).max() + 1e-9)


def env(n, a, r, shape=1.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(r, 1e-4))
    return e ** shape


def adsr(n, a, d_sus, r):
    t = np.arange(n) / SR
    total = n / SR
    e = np.ones(n)
    e = np.where(t < a, t / a, e)
    e = np.where(t > total - r, np.maximum(0, (total - t) / r), e)
    return e


def sine(f, d, ph=0):
    t = t_(d)
    if callable(f):
        return np.sin(2 * np.pi * np.cumsum(f(t)) / SR + ph)
    return np.sin(2 * np.pi * f * t + ph)


def crinkle(d, density, lo=1800, hi=9000):
    n = int(d * SR)
    y = np.zeros(n)
    k = int(density * d)
    pos = rng.integers(0, n, k)
    amps = rng.uniform(.2, 1, k)
    for p, a in zip(pos, amps):
        L = rng.integers(30, 260)
        seg = rng.standard_normal(L) * np.exp(-np.arange(L) / (L / 4)) * a
        e = min(n, p + L)
        y[p:e] += seg[:e - p]
    Y = np.fft.rfft(y)
    f = np.fft.rfftfreq(n, 1 / SR)
    Y *= ((f > lo) & (f < hi)) + .15
    y = np.fft.irfft(Y, n)
    return y / (np.abs(y).max() + 1e-9)


def thump(f0, d, drop=.5):
    return sine(lambda t: f0 * (1 + drop * np.exp(-t * 40)), d) * env(int(d * SR), .002, d / 4)


def bell(f, d=1.2, amp=1.0):
    y = sine(f, d) + .35 * sine(f * 2.0, d) + .18 * sine(f * 3.01, d) + .08 * sine(f * 4.2, d)
    return y * env(len(y), .002, d / 5) * amp


C_PENTA = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0, 2349.3, 2637.0]


def body(dur, p=1.0, amt=.35):
    n = int(dur * SR)
    return bandnoise(dur, 140 * p, 700 * p) * env(n, .002, .03) * amt


def make(kind, p=1.0, d=0.0):
    y = make_raw(kind, p, d)
    if kind in ('slide', 'land', 'tap', 'stamp', 'popup', 'flip', 'thud', 'staple'):
        b = body(min(.2, len(y) / SR), p, .3 if kind != 'slide' else .15)
        y = y.copy(); y[:len(b)] += b[:len(y)]
    return y


def make_raw(kind, p=1.0, d=0.0):
    if kind == 'slide':
        dur = .32 / p ** .3
        y = bandnoise(dur, 700 * p, 5500 * p, -.2)
        mod = 1 + .5 * np.sin(2 * np.pi * rng.uniform(5, 9) * t_(dur) + rng.uniform(0, 6))
        return y * adsr(len(y), .05, 0, .12) * mod * .45
    if kind in ('land', 'tap'):
        light = kind == 'tap'
        dur = .16 if light else .22
        n = int(dur * SR)
        body = thump(150 * p if light else 95 * p, dur) * (.35 if light else .6)
        nz = bandnoise(dur, 300 * p, 4500 * p) * env(n, .001, .018 if light else .03) * (.6 if light else .75)
        cr = crinkle(dur, 60, 2500, 9000) * env(n, .003, .05) * .25
        return body + nz + cr
    if kind == 'thud':
        dur = .5
        n = int(dur * SR)
        return thump(120, dur, .7) * .55 + bandnoise(dur, 180, 2000) * env(n, .002, .05) * .6 + crinkle(dur, 160, 1500, 8000) * env(n, .005, .12) * .3
    if kind == 'stamp':
        dur = .3
        n = int(dur * SR)
        return thump(150 * p, dur, .6) * .45 + bandnoise(dur, 250, 3000) * env(n, .001, .03) * .7 + crinkle(dur, 90, 2000, 7000) * env(n, .004, .06) * .2
    if kind == 'tear':
        dur = .28
        y = crinkle(dur, 900 * p, 1500, 9000)
        return y * adsr(len(y), .02, 0, .08) * np.linspace(.6, 1, len(y)) * .5
    if kind in ('whoosh', 'swoosh', 'swing'):
        dur = {'whoosh': .5, 'swoosh': .24, 'swing': .6}[kind] / p ** .2
        n = int(dur * SR)
        bands = [(300, 900), (700, 1800), (1500, 3500), (3000, 7000)]
        y = np.zeros(n)
        tt = np.linspace(0, 1, n)
        centre = np.sin(np.pi * tt) if kind != 'swing' else np.abs(np.sin(np.pi * 2 * tt)) * np.exp(-tt * 1.5)
        for i, (lo, hi) in enumerate(bands):
            w = np.exp(-((centre * 3 - i) ** 2) / .8)
            y += bandnoise(dur, lo * p, hi * p) * w
        return y * np.sin(np.pi * tt) ** 1.5 * .5
    if kind == 'pop':
        dur = .09
        n = int(dur * SR)
        y = sine(lambda t: 380 * p * np.exp(-t * 30) + 170 * p, dur) * env(n, .001, .018)
        return y * .35 + bandnoise(dur, 500 * p, 3500 * p) * env(n, .0008, .012) * .45
    if kind == 'popup':
        dur = .16
        n = int(dur * SR)
        return bandnoise(dur, 900 * p, 6000 * p) * adsr(n, .03, 0, .06) * .35 + np.pad(make('pop', p * .8), (int(.08 * SR), 0))[:n] * .6
    if kind == 'sticker':
        return make('pop', 1.25 * p) * .8 + np.pad(make('tap', 1.3), (0, 0))[:int(.09 * SR)] * .4
    if kind == 'type':
        dur = .03
        n = int(dur * SR)
        return (bandnoise(dur, 1800 * p, 7000) * env(n, .0003, .004) + sine(2200 * p, dur) * env(n, .0003, .006) * .3) * .5
    if kind in ('click', 'tick'):
        dur = .05
        n = int(dur * SR)
        # a fingertip on card rather than a UI blip
        if kind == 'click':
            return (bandnoise(dur, 700, 3400) * env(n, .0006, .006) + sine(640, dur) * env(n, .0006, .014) * .4) * .6
        return (bandnoise(dur, 1400, 5500) * env(n, .0004, .004) + sine(1700, dur) * env(n, .0004, .01) * .3) * .45
    if kind == 'staple':
        dur = .12
        n = int(dur * SR)
        y = bandnoise(dur, 2000, 9000) * env(n, .0003, .005) + (sine(3100, dur) + sine(4700, dur) * .6) * env(n, .0005, .03) * .25
        return (y + np.pad(y, (int(.035 * SR), 0))[:n] * .5) * .55 + make('tap', 1.1 * p)[:n] * .5
    if kind == 'button':
        dur = .2
        n = int(dur * SR)
        return thump(120, dur) * .6 + np.pad(make('click'), (0, n))[:n] * .8 + bandnoise(dur, 200, 3000) * env(n, .001, .02) * .4
    if kind == 'blink':
        dur = .35
        n = int(dur * SR)
        return (sine(1568 * p, dur) + .2 * sine(3136 * p, dur)) * env(n, .002, .06) * .3
    if kind == 'ding':
        dur = 1.6
        n = int(dur * SR)
        mar = lambda f, a: (sine(f, dur) + .12 * sine(f * 4, dur)) * env(n, .002, .22) * a
        y = mar(523.3, .6) + np.pad(mar(659.3, .55), (int(.08 * SR), 0))[:n] + np.pad(mar(784, .5), (int(.16 * SR), 0))[:n] + np.pad(mar(1046.5, .45), (int(.24 * SR), 0))[:n]
        return y * .3
    if kind == 'sparkle':
        dur = 1.0
        n = int(dur * SR)
        y = np.zeros(n)
        notes = rng.choice(C_PENTA[2:] if p > 1.2 else C_PENTA, 5, replace=False)
        for i, f in enumerate(sorted(notes)):
            off = int(i * .045 * SR)
            b = bell(f * (1 if p <= 1.2 else 1), dur - i * .045, .5)
            y[off:off + len(b)] += b[:n - off]
        y += bandnoise(dur, 5000, 11000) * env(n, .05, .2) * .05
        return y * .25
    if kind == 'boing':
        dur = .32
        n = int(dur * SR)
        y = sine(lambda t: 260 + 120 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 6) + 180 * t, dur) * env(n, .003, .1)
        return y * .3
    if kind == 'fan':
        dur = .5
        n = int(dur * SR)
        y = np.zeros(n)
        for i in range(18):
            off = int((i / 18) ** .8 * .42 * SR)
            c = make('tap', 1.6 + i * .02)[: int(.05 * SR)] * .5
            y[off:off + len(c)] += c[:n - off]
        return y * .7 + crinkle(dur, 300, 2000, 8000) * adsr(n, .05, 0, .2) * .2
    if kind == 'flip':
        dur = .14
        n = int(dur * SR)
        return bandnoise(dur, 700, 4500) * adsr(n, .03, 0, .06) * .35 + np.pad(make('tap', 1.0), (int(.07 * SR), 0))[:n] * .3
    if kind == 'rustle':
        dur = .5
        y = crinkle(dur, 700, 1800, 8000)
        return y * adsr(len(y), .05, 0, .2) * .35
    if kind == 'confetti':
        dur = 1.3
        n = int(dur * SR)
        y = crinkle(dur, 1500, 2500, 11000) * np.exp(-t_(dur) * 2.5) * .45
        return y + np.pad(make('pop', 1.3), (0, n))[:n] * .6
    if kind == 'scribble':
        dur = max(.15, d)
        n = int(dur * SR)
        y = bandnoise(dur, 1100, 5200, .3)
        strokes = np.abs(np.sin(2 * np.pi * rng.uniform(7, 10) * t_(dur) + rng.uniform(0, 6))) ** 1.5
        grain = 1 + .6 * rng.standard_normal(n).cumsum() / np.sqrt(np.arange(1, n + 1))
        return y * strokes * adsr(n, .02, 0, .05) * .22 * np.clip(grain, .4, 1.6)
    raise ValueError(kind)


def reverb(x, secs=.45, wet=.14):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * secs / 6))
    ir[: int(.012 * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum())
    L = len(x) + n
    N = 1 << (L - 1).bit_length()
    out = np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(ir, N), N)[: len(x)]
    return x + out * wet


def main(cues_path, out_path, duration):
    cues = json.load(open(cues_path))
    n = int(duration * SR) + SR
    L = np.zeros(n)
    R = np.zeros(n)
    for c in cues:
        y = make(c['type'], c.get('p', 1), c.get('d', 0)) * c.get('g', 1)
        y = np.asarray(y, dtype=float)
        s = int(c['t'] * SR)
        if s >= n:
            continue
        e = min(n, s + len(y))
        pan = np.clip(c.get('pan', 0), -1, 1)
        a = (pan + 1) * np.pi / 4
        L[s:e] += y[: e - s] * np.cos(a)
        R[s:e] += y[: e - s] * np.sin(a)
    L, R = reverb(L), reverb(R)
    peak = max(np.abs(L).max(), np.abs(R).max())
    st = np.stack([L, R], 1) / peak * .8
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    print('sfx', len(cues), 'cues, peak norm', peak)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], float(sys.argv[3]))

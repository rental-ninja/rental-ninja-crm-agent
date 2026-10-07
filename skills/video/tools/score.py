"""Assembles music/score.wav: the composed score (music/composed.wav, engines elevenlabs and hub) at 0, then the clips in
film.yml (music.clips) on top, after running any synth scripts (music.synth); music.stops silence it at the given beats.

Clip fields: file (film-relative path), in/out (source seconds),
at (film seconds), gain_db, norm (groove | rms | none), norm_span ([a, b] source seconds for rms), fade ([in, out] seconds).
"""
import os, subprocess, sys, wave
import numpy as np
import music, spec

SR = 48000
s = spec.load(sys.argv[1]); ROOT = s['root']; DUR = spec.duration(s); M = s['music']


def path(f):
    if not f.startswith('lib:'): return os.path.join(ROOT, f)
    p = os.path.join(spec.SKILL, 'library/music', f[4:])
    if not os.path.exists(p): sys.exit(f'{f}: this skill has no music library; compose the score instead (music.engine hub or elevenlabs)')
    return p


def dec(p):
    raw = subprocess.check_output(['ffmpeg', '-loglevel', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'])
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


def db(x): return 10 ** (x / 20)


def groove(x):  # level of the louder half of the track, dB
    k = int(.4 * SR); m = np.array([np.sqrt((x[i:i + k] ** 2).mean()) for i in range(0, len(x) - k, k)])
    return 20 * np.log10(np.median(np.sort(m)[len(m) // 2:]) + 1e-9)


def fade(x, a=0.0, b=0.0):
    x = x.copy(); na, nb = int(a * SR), int(b * SR)
    if na: x[:na] *= (np.sin(np.linspace(0, np.pi / 2, na)) ** 2)[:, None]
    if nb: x[-nb:] *= (np.cos(np.linspace(0, np.pi / 2, nb)) ** 2)[:, None]
    return x


for job in M['synth']:
    subprocess.run([sys.executable, os.path.join(ROOT, job['script']), ROOT, str(DUR), *map(str, job.get('args', []))], check=True)

base = music.base_clip(s)
n = int(DUR * SR) + SR
out = np.zeros((n, 2)); cache = {}
for c in ([base] if base else []) + M['clips']:
    src = cache.setdefault(c['file'], dec(path(c['file'])))
    a, b = c.get('in', 0.0), c.get('out', len(src) / SR)
    x = src[int(a * SR):int(b * SR)]
    mode = c.get('norm', 'groove')
    if mode == 'groove': lvl = groove(src)
    elif mode == 'rms':
        sa, sb = c.get('norm_span', [a, b]); seg = src[int(sa * SR):int(sb * SR)]; lvl = 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9)
    else: lvl = M['ref_db']
    g = db(M['ref_db'] - lvl + c.get('gain_db', 0.0))
    x = fade(x, *c.get('fade', [0, 0])) * g
    p = int(c['at'] * SR); e = min(n, p + len(x)); out[p:e] += x[:e - p]
    print(f"{c['file']:<22} src {a:7.2f}-{b:7.2f}  at {c['at']:7.2f}-{c['at'] + (b - a):7.2f}  level {lvl:6.1f} dB  gain {20 * np.log10(g):+5.1f} dB")
out = out[:int(DUR * SR)]
for t0, t1 in music.stops(s, music.plan(s) if base else None):   # hard stops: choke in 20 ms, back on the next chunk's downbeat
    a, b, k = int(t0 * SR), int(t1 * SR), int(.02 * SR)
    out[a:a + k] *= np.linspace(1, 0, len(out[a:a + k]))[:, None]; out[a + k:b] = 0
    out[b:b + int(.06 * SR)] *= np.linspace(0, 1, len(out[b:b + int(.06 * SR)]))[:, None]
    print(f'stop {t0:7.2f}-{t1:7.2f}')
out /= max(1, np.abs(out).max() / .95)
os.makedirs(f'{ROOT}/music', exist_ok=True)
with wave.open(f'{ROOT}/music/score.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())

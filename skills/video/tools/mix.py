"""Mixes VO + ducked music + foley into mix/master.wav. Every level comes from the mix: block of film.yml."""
import json, os, re, subprocess, sys, wave
import numpy as np
import spec
SR = 48000
s = spec.load(sys.argv[1]); ROOT = s['root']; VO = spec.vo_data(s); DUR = spec.duration(s, VO); X = s['mix']
def dec(path, ch):
    raw = subprocess.check_output(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-'])
    return np.frombuffer(raw, np.float32).reshape(-1, ch).astype(np.float64)
def lufs(x):
    p = subprocess.run(['ffmpeg', '-hide_banner', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], input=x.astype(np.float32).tobytes(), capture_output=True)
    j = json.loads(re.search(r'\{[^{}]*\}', p.stderr.decode()[-1500:], re.S).group(0)); return float(j['input_i']), float(j['input_tp'])
def db(x): return 10 ** (x / 20)
n = int(DUR * SR)
starts = [v['start'] for v in VO['vo']]
vo = np.zeros((n, 2))
for i, s in enumerate(starts):
    y = dec(f'{ROOT}/vo/final/vo{i+1}.wav', 1)[:, 0]
    a = int(s * SR); e = min(n, a + len(y)); vo[a:e] += y[:e - a, None]
mus = dec(f'{ROOT}/music/score.wav', 2)[:n]
mus = np.pad(mus, ((0, n - len(mus)), (0, 0)))
sfx = dec(f'{ROOT}/mix/sfx.wav', 2)[:n]
vi, _ = lufs(vo); mi, _ = lufs(mus); si, _ = lufs(sfx)
print(f'stems LUFS  vo {vi:.1f}  music {mi:.1f}  sfx {si:.1f}')
def eq(x, bands):
    X = np.fft.rfft(x, axis=0); fr = np.fft.rfftfreq(len(x), 1 / SR); gdb = np.zeros_like(fr)
    for kind, f0, g, q in bands:
        if kind == 'hp': gdb += np.where(fr < f0, -40 * np.clip((f0 - fr) / f0, 0, 1) ** .5, 0)
        else: gdb += g * np.exp(-(np.log2(np.maximum(fr, 1) / f0) ** 2) / (2 * q ** 2))
    return np.fft.irfft(X * db(gdb)[:, None], len(x), axis=0)
vo = eq(vo, [('hp', 85, 0, 0), ('peak', 3200, -1.5, .5), ('peak', 6400, -2.5, .35)])
mus = eq(mus, [('peak', 1800, -2.5, .6), ('peak', 3000, -1.5, .4)])
sfx = eq(sfx, [('hp', 95, 0, 0), ('peak', 4200, -2.0, .4), ('peak', 10000, -3.5, .9)])
# ride the score: it swings ~10 dB between its verses and its lifts, which would bury the quiet parts under the voice
def movavg(v, k):
    c = np.cumsum(np.pad(v, (k // 2, k - k // 2), mode='edge')); return (c[k:] - c[:-k]) / k
def ride(x, win=3.0, ratio=X['ride']['ratio'], maxg=X['ride']['max_db']):
    lvl = 10 * np.log10(movavg((x ** 2).mean(1), int(win * SR)) + 1e-10)
    ref = np.percentile(lvl[lvl > -60], 88); g = movavg(np.clip(ratio * (ref - lvl), 0, maxg), int(1.2 * SR))
    return x * db(g)[:, None]
mus = ride(mus)
vi, _ = lufs(vo); mi, _ = lufs(mus); si, _ = lufs(sfx)
vo *= db(X['vo_lufs'] - vi)
mus *= db(X['music_lufs'] - mi)   # pre-duck
sfx *= db(X['sfx_lufs'] - si)
# duck music under the voice: smoothed voice envelope drives a gain curve (attack 60 ms, release 450 ms)
envv = np.abs(vo[:, 0]); k = int(.02 * SR)
envv = np.convolve(envv, np.ones(k) / k, 'same')
act = (envv > db(-40)).astype(float)
hold = int(X['duck_hold'] * SR); cs = np.cumsum(np.pad(act, (hold // 2, hold - hold // 2))); act = (cs[hold:] - cs[:-hold]) > 0  # bridge short gaps so the bed does not breathe
act = act.astype(float)
vo_end = max(v['end'] for v in VO['vo']); act[int((vo_end + .12) * SR):] = 0   # let the final chord ring at full level
g = np.zeros(n); cur = 0.0; a_c = np.exp(-1 / (.08 * SR)); r_c = np.exp(-1 / (.9 * SR))
for i in range(0, n, 48):  # 1 ms control rate
    target = act[i]; c = a_c ** 48 if target > cur else r_c ** 48
    cur = target + (cur - target) * c; g[i:i + 48] = cur
depth = X['duck_db']
t = np.arange(n) / SR
lift_at = X['outro_lift']['from'] if X['outro_lift']['from'] is not None else vo_end
swell = np.clip((X['intro_swell']['until'] - t) / .5, 0, 1) * X['intro_swell']['db'] + np.clip((t - lift_at) / .4, 0, 1) * X['outro_lift']['db']   # music leads the opening and the final chord
mus *= db(-depth * g + swell)[:, None]
room = eq(np.random.default_rng(3).standard_normal((n, 2)), [('peak', 300, 6, 1.2), ('peak', 6000, -12, 1.5)]); room *= db(X['room_db']) / room.std()
mixd = vo + mus + sfx + room
end = int((DUR - X['fade_out']) * SR); mixd[end:] *= (np.cos(np.linspace(0, np.pi, n - end)) * .5 + .5)[:, None]
mixd[: int(.02 * SR)] *= np.linspace(0, 1, int(.02 * SR))[:, None]
mi2, tp = lufs(mixd); print(f'premaster {mi2:.1f} LUFS, tp {tp:.1f}')
mixd *= db(X['master_lufs'] - mi2)
# brickwall limiter (4x oversampled look-ahead) to keep true peak under -1 dBTP
p = subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-af', f"aresample=192000,alimiter=limit={X['limit']}:attack=2:release=60:level=disabled,aresample=48000", '-f', 'f32le', '-'], input=mixd.astype(np.float32).tobytes(), capture_output=True)
mixd = np.frombuffer(p.stdout, np.float32).reshape(-1, 2).astype(np.float64)[:n]
fi, ftp = lufs(mixd); print(f'master {fi:.1f} LUFS, tp {ftp:.1f}')
os.makedirs(f'{ROOT}/mix', exist_ok=True)
for name, arr in [('master', mixd), ('vo_stem', vo), ('music_stem', mus), ('sfx_stem', sfx)]:
    with wave.open(f'{ROOT}/mix/{name}.wav', 'wb') as wv:
        wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((np.clip(arr, -1, 1) * 32767).astype(np.int16).tobytes())

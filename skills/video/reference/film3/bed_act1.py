"""Film 3 act-one cue: a busy, slightly anxious G-minor bed (108 bpm) that stops dead on the double-booking stamp.
usage (music.synth in film.yml): bed_act1.py ROOT DUR STOP -> music/bed.wav on the film timeline."""
import sys, wave
import numpy as np
SR = 48000
ROOT = sys.argv[1]; DUR = float(sys.argv[2])
rng = np.random.default_rng(11)

# ---------- act one: a small, busy, slightly anxious cue in G minor ----------
BEAT = 60 / 108; BAR = 4 * BEAT; STOP = float(sys.argv[3]); T0 = STOP - 9 * BAR
N = {'Eb2': 77.78, 'G2': 98.0, 'A2': 110.0, 'Bb2': 116.54, 'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.0, 'G3': 196.0, 'Ab3': 207.65, 'A3': 220.0, 'Bb3': 233.08, 'B3': 246.94,
     'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'G4': 392.0, 'A4': 440.0, 'Bb4': 466.16, 'C5': 523.25, 'D5': 587.33, 'Eb5': 622.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99}
def pluck(f, dur, bright=.45):
    m = int(dur * SR); P = int(SR / f); buf = rng.uniform(-1, 1, P)
    k = max(1, int(P * (1 - bright) * .25)); buf = np.convolve(np.r_[buf, buf[:k]], np.ones(k + 1) / (k + 1), 'valid')[:P]
    y = np.empty(m); reps = m // P + 1; dec_ = .992 if f > 150 else .996
    for r in range(reps):
        a = r * P; b = min(m, a + P); y[a:b] = buf[:b - a]; buf = dec_ * .5 * (buf + np.roll(buf, -1))
    t = np.arange(m) / SR
    return y * np.minimum(1, t / .003) * np.exp(-t * (3.2 if f < 150 else 5.5))
def marimba(f, dur=.5):
    t = np.arange(int(dur * SR)) / SR
    y = np.sin(2 * np.pi * f * t) * np.exp(-t * 9) + .32 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 28) + .12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 60)
    return y * np.minimum(1, t / .002)
def block(f, dur=.09):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.4 * t)) * np.exp(-t * 70) * np.minimum(1, t / .001)
def shaker(dur=.06):
    m = int(dur * SR); x = rng.standard_normal(m); X = np.fft.rfft(x); fr = np.fft.rfftfreq(m, 1 / SR); X[fr < 5000] = 0
    return np.fft.irfft(X, m) * np.exp(-np.arange(m) / SR * 55)
bed = np.zeros((int((STOP + 2) * SR), 2))
def put(y, t, g=1.0, pan=0.0):
    a = int(t * SR); e = min(len(bed), a + len(y)); ang = (pan + 1) * np.pi / 4
    if a < 0 or e <= a: return
    bed[a:e, 0] += y[:e - a] * g * np.cos(ang); bed[a:e, 1] += y[:e - a] * g * np.sin(ang)
at = lambda bar, eighth=0.0: T0 + bar * BAR + eighth * BEAT / 2
# clock
k = 0; t = at(-1, 2)
while t < STOP - .01:
    ramp = min(1, (t - at(-1, 2)) / 3 + .35)
    put(block(1250 if k % 2 == 0 else 930), t, .42 * ramp, -.35 if k % 2 == 0 else .35); t += BEAT; k += 1
# bass
BASS = [['G2', 0, 'D3', 0, 'Bb2', 0, 'D3', 0], ['G2', 0, 'D3', 0, 'Bb2', 0, 'D3', 0], ['Eb2', 0, 'Bb2', 0, 'C3', 0, 'D3', 0], ['G2', 0, 'D3', 0, 'Bb2', 0, 'D3', 0],
        ['Eb2', 0, 'Bb2', 0, 'G2', 0, 'Bb2', 0], ['C3', 0, 'G2', 0, 'Eb3', 0, 'G2', 0], ['D3', 'A2', 'F#3', 'A2', 'D3', 'A2', 'F#3', 'A2'], ['G2', 'D3', 'Bb2', 'D3', 'G2', 'D3', 'Bb2', 'D3']]
for b, pat in enumerate(BASS):
    for i, nn in enumerate(pat):
        if nn: put(pluck(N[nn], .7), at(b, i), .62 + .04 * b, 0)
# marimba
MEL = {1: [0, 0, 'D5', 0, 'C5', 0, 'Bb4', 0], 2: ['A4', 0, 0, 0, 'G4', 0, 0, 0], 3: [0, 0, 'D5', 'D5', 0, 'C5', 0, 'Bb4'], 4: [0, 'Eb5', 0, 'Eb5', 0, 'D5', 0, 'C5'], 5: [0, 'Eb5', 'D5', 'C5', 0, 'Eb5', 'D5', 'C5'],
       6: ['F#5', 0, 'F#5', 0, 'F#5', 'F#5', 'F#5', 'F#5'], 7: ['G5', 'F5', 'Eb5', 'D5', 'C5', 'Bb4', 'A4', 'G4']}
for b, pat in MEL.items():
    for i, nn in enumerate(pat):
        if nn: put(marimba(N[nn]), at(b, i), .30 + .025 * b, .3)
# shaker sixteenths from the third bar on, slowly louder
for b in range(3, 9):
    for i in range(16): put(shaker(), at(b, i / 2), (.05 + .018 * (b - 3)) * (1.5 if i % 4 == 0 else 1), -.2 if i % 2 else .2)
# last bar: a chromatic scramble up to the stop
RUN = ['D3', 'Eb3', 'E3', 'F3', 'F#3', 'G3', 'Ab3', 'A3', 'Bb3', 'B3', 'C4', 'C#4', 'D4', 'Eb4', 'E4', 'F4']
for i, nn in enumerate(RUN):
    put(pluck(N[nn], .4, .6), at(8, i / 2), .45 + .02 * i, -.1); put(marimba(N[nn] * 2, .3), at(8, i / 2), .16 + .014 * i, .3)
for nn, g in [('G2', .9), ('G3', .6), ('Bb3', .5), ('D4', .5)]: put(pluck(N[nn], .5, .7), STOP, g, 0)
put(marimba(N['G4'], .4), STOP, .4, .2)
# everything is choked shortly after the stop
cut = int((STOP + .16) * SR); tail = int(.12 * SR); bed[cut:cut + tail] *= np.linspace(1, 0, tail)[:, None]; bed[cut + tail:] = 0
# a little room
ir = rng.standard_normal((int(.35 * SR), 2)) * np.exp(-np.arange(int(.35 * SR)) / (SR * .06))[:, None]; ir[:int(.01 * SR)] = 0; ir /= np.sqrt((ir ** 2).sum(0))
L = len(bed) + len(ir); NF = 1 << (L - 1).bit_length()
wet = np.fft.irfft(np.fft.rfft(bed, NF, axis=0) * np.fft.rfft(ir, NF, axis=0), NF, axis=0)[:len(bed)]
bed = bed + wet * .12


bed /= max(1, np.abs(bed).max() / .95)
with wave.open(f'{ROOT}/music/bed.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((bed * 32767).astype(np.int16).tobytes())
print(f'bed: bars from {T0 - BAR:.3f}, rms span {T0:.3f}-{STOP:.3f}')

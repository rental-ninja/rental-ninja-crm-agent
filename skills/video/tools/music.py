"""The film's score from ElevenLabs Music, planned from the film's own timing (app/js/words.js).

One chunk per act: the intro before the first word, the acts (music.sections maps line ranges to a mood; lines left out
follow the default problem / turn / features / proof split) and the end card (last line + tail), whose chunk ends on a
clean final chord at the film's DURATION, so the music ends with the end card. Chunks change where the scene sheets
wipe in (a line's start minus timing.lead). engine elevenlabs calls ElevenLabs directly (Keychain key); engine hub
writes music/hub_jobs.json for the Hub MCP tool generate_music and `film.py import-music` brings the result in.
generate_music takes at most 90 s per call, so a longer plan is cut into parts at chunk boundaries (a longer section is
first split into equal sub-sections with the same styles); every part overlaps its neighbours by music.crossfade and
carries the same seed, key, BPM and instrumentation. The direct engine splits the same way. The parts are joined with
an equal-power crossfade centred on each boundary, so the total stays the film's length.
The score lands in music/composed.wav (48 kHz stereo) + music/composed.json (plan hash, credits, model, seed).
"""
import hashlib, json, math, os, re, shlex, shutil, subprocess, sys, urllib.parse
import numpy as np
import spec

NAME = 'composed'
CREDITS_PER_S = 15
MIN_MS, MAX_MS, MAX_CHUNKS, PART_MAX_MS, SR = 3000, 120000, 30, 90000, 48000
CONTINUES, RESUMES = 'keeps going into the next part, no ending', 'continues the same piece mid-phrase, no intro'
# The model plays styles literally ('ticking clock' gives ticks, 'sparse' gives lone chords), so every act names a full,
# continuous arrangement; section names are musical, as in ElevenLabs' own plans (POST /v1/music/plan).
ACTS = {
    'intro': ('Bright Intro', 'short bright pickup, marimba melody enters, light percussion builds in'),
    'problem': ('Playful Tension Groove', 'busy playful marimba ostinato, staccato acoustic guitar plucks, steady light drum groove, a hint of suspense, anticipatory build-up'),
    'turn': ('Calm Breakdown', 'drums drop out, warm sustained acoustic guitar chords, gentle marimba, relaxed and relieved'),
    'features': ('Confident Main Groove', 'bright bouncy marimba melody, strummed acoustic guitar, steady light drum kit and bass, confident and upbeat'),
    'proof': ('Uplifting Full Chorus', 'full acoustic pop band, handclaps, glockenspiel sparkle, proud uplifting lift'),
    'outro': ('Warm Resolution and Final Chord', 'warmly resolved main theme, full acoustic pop band, cheerful marimba counterpoint, soft bass and light drum kit'),
}
OPENING = 'starts right away with a bright pickup'
ENDING = 'clean final ringing chord exactly at the end'


def items(x):
    return [t.strip() for t in (x if isinstance(x, list) else re.split(r',(?![^(]*\))', x or '')) if str(t).strip()]


def dedupe(xs):
    seen = set(); return [x for x in xs if not (x.lower() in seen or seen.add(x.lower()))]


def default_acts(n):
    """Act per line range for an n-line script whose last line is the end card."""
    b = n - 1
    if b <= 0: return [('outro', 1, n)]
    p = max(1, round(b * .2)); turn = 1 if b >= 4 else 0; q = round(b * .15) if b >= 6 else 0
    acts = [('problem', 1, p)] + ([('turn', p + 1, p + 1)] if turn else [])
    if b - q >= p + turn + 1: acts.append(('features', p + turn + 1, b - q))
    return acts + ([('proof', b - q + 1, b)] if q else []) + [('outro', n, n)]


def sections(s):
    """Line-range sections: music.sections where given, the default acts elsewhere; consecutive lines of one section merge."""
    n = len(s['lines']); own = [None] * n; defs = {}
    for k, (act, a, b) in enumerate(default_acts(n)):
        defs[f'd{k}'] = {'name': ACTS[act][0], 'mood': ACTS[act][1], 'avoid': ''}
        for i in range(a - 1, b): own[i] = f'd{k}'
    for k, sec in enumerate(s['music'].get('sections') or []):
        a, b = (sec['lines'] + sec['lines'])[:2] if isinstance(sec['lines'], list) else (sec['lines'], sec['lines'])
        if not 1 <= a <= b <= n: sys.exit(f'music.sections[{k}]: lines {sec["lines"]} outside 1..{n}')
        act = ACTS.get(sec.get('act', ''), (None, ''))
        defs[f'u{k}'] = {'name': sec.get('name') or act[0] or f'Section {k + 1}', 'mood': sec.get('mood', act[1]), 'avoid': sec.get('avoid', '')}
        for i in range(a - 1, b): own[i] = f'u{k}'
    out = []
    for i, key in enumerate(own):
        if out and out[-1]['key'] == key: out[-1]['b'] = i + 1
        else: out.append({'key': key, 'a': i + 1, 'b': i + 1, 'pre': [], 'post': [], **defs[key]})
    return out


def plan(s, vo=None):
    """{'chunks': [...ElevenLabs chunks], 'parts': [...printable], 'seconds', 'sha', ...} for the current words.js."""
    M = s['music']; vo = vo or spec.vo_data(s); dur = spec.duration(s, vo); lead = s['timing']['lead']
    xf = round(float(M.get('crossfade', .8)) * 1000); max_ms = min(MAX_MS, PART_MAX_MS - xf)
    if M.get('prompt') and dur * 1000 > PART_MAX_MS: sys.exit(f'music.prompt makes one piece of at most {PART_MAX_MS // 1000}s; drop it and use the plan, which is split into parts')
    secs = sections(s)
    for sec in secs: sec['t'] = max(0., vo['vo'][sec['a'] - 1]['start'] - lead)
    if secs[0]['t'] * 1000 >= MIN_MS: secs.insert(0, {'name': ACTS['intro'][0], 'mood': ACTS['intro'][1], 'avoid': '', 'a': 0, 'b': 0, 'pre': [], 'post': [], 't': 0.})
    else: secs[0]['pre'].append(OPENING)
    secs[0]['t'] = 0.
    secs[-1]['post'].append(M.get('ending') or ENDING)
    edges = lambda: [round(x['t'] * 1000) for x in secs[1:]] + [round(dur * 1000)]
    while len(secs) > 1:
        ms = [e - round(x['t'] * 1000) for x, e in zip(secs, edges())]
        k = next((i for i, m in enumerate(ms) if m < MIN_MS), None)
        if k is None: break
        j = k - 1 if k else 1; lo, hi = sorted((j, k)); big = secs[j] if ms[j] >= ms[k] else secs[k]
        secs[lo] = {**big, 't': secs[lo]['t'], 'a': secs[lo]['a'] or secs[hi]['a'], 'b': secs[hi]['b'],
                    'pre': secs[lo]['pre'] + secs[hi]['pre'], 'post': secs[lo]['post'] + secs[hi]['post']}
        del secs[hi]
    rows = []
    for x, e in zip(secs, edges()):
        t0 = round(x['t'] * 1000); k = max(1, math.ceil((e - t0) / max_ms))
        for i in range(k):
            a, b = t0 + (e - t0) * i // k, t0 + (e - t0) * (i + 1) // k
            rows.append({**x, 'name': x['name'] + (f' ({i + 1}/{k})' if k > 1 else ''), 'ms': (a, b), 'cues': (x['pre'] if i == 0 else []) + (x['post'] if i == k - 1 else [])})
    if len(rows) > MAX_CHUNKS: sys.exit(f'{len(rows)} music chunks, ElevenLabs takes {MAX_CHUNKS}: group lines into fewer music.sections')
    style, neg = items(M['style']), items(M['negative'])
    chunk = lambda r, extra=(), ms=None: {'text': f"[{r['name']}]", 'duration_ms': ms or r['ms'][1] - r['ms'][0],
                                          'positive_styles': dedupe(style + items(r['mood']) + r['cues'] + list(extra))[:50],
                                          'negative_styles': dedupe(neg + items(r['avoid']))[:50], 'context_adherence': M['adherence']}
    chunks = [chunk(r) for r in rows]
    spans, i = [], 0
    while i < len(rows):
        head, j = (xf // 2 if spans else 0), i + 1
        while j < len(rows) and rows[j]['ms'][1] - rows[i]['ms'][0] + head + (0 if j == len(rows) - 1 else xf - xf // 2) <= PART_MAX_MS: j += 1
        spans.append((i, j)); i = j
    core = {'model': M['model'], 'seed': M.get('seed'), **({'prompt': M['prompt'], 'length_ms': round(dur * 1000)} if M.get('prompt') else {'chunks': chunks}),
            **({'crossfade_ms': xf} if len(spans) > 1 else {})}
    sha = hashlib.sha1(json.dumps(core, sort_keys=True).encode()).hexdigest()[:12]
    seed = M.get('seed') if M.get('seed') is not None or len(spans) == 1 else int(sha[:7], 16) % 1000000
    parts = []
    for k, (i, j) in enumerate(spans):
        head = xf // 2 if k else 0; tail = xf - xf // 2 if k < len(spans) - 1 else 0; cs = []
        for r in range(i, j):
            extra = ([RESUMES] if k and r == i else []) + ([CONTINUES] if tail and r == j - 1 else [])
            cs.append(chunk(rows[r], extra, rows[r]['ms'][1] - rows[r]['ms'][0] + (head if r == i else 0) + (tail if r == j - 1 else 0)))
        at = rows[i]['ms'][0] - head; ms = sum(c['duration_ms'] for c in cs)
        parts.append({'name': NAME if len(spans) == 1 else f'{NAME}.p{k + 1}', 'at_ms': at, 'ms': ms, 'boundary_ms': rows[i]['ms'][0],
                      'rows': (i + 1, j), 'chunks': cs, 'credits': math.ceil(ms / 1000) * CREDITS_PER_S})
    return {'chunks': chunks, 'rows': rows, 'parts': parts, 'crossfade_ms': xf, 'seconds': dur, 'model': M['model'], 'seed': seed,
            'prompt': M.get('prompt'), 'credits': sum(x['credits'] for x in parts), 'sha': sha}


def show(s, p):
    M = s['music']
    print(f"music plan: {M['engine']}, {p['model']}, seed {p['seed'] if p['seed'] is not None else '-'}, {len(p['chunks'])} chunks, "
          f"{p['seconds']:.1f}s = the film's length  [plan {p['sha']}]")
    if p['prompt']: print(f"  prompt mode (music.prompt; the plan below is not sent): {p['prompt']}")
    for c, x in zip(p['chunks'], p['rows']):
        ln = f"lines {x['a']}-{x['b']}" if x['a'] else 'before line 1'
        print(f"  {x['ms'][0] / 1000:7.2f}-{x['ms'][1] / 1000:7.2f}  {c['text']:<42} {ln:<14} {', '.join(items(x['mood']) + x['cues'])}")
    print('  style:', ', '.join(items(M['style'])))
    print('  avoid:', ', '.join(items(M['negative'])))
    for t0, t1 in stops(s, p): print(f'  stop: silent {t0:.2f}-{t1:.2f}')
    if len(p['parts']) > 1:
        print(f"  {len(p['parts'])} parts of <= {PART_MAX_MS // 1000}s (one generate_music call each), same seed {p['seed']}, "
              f"{p['crossfade_ms'] / 1000:.1f}s equal-power crossfade centred on each boundary:")
        for x in p['parts']: print(f"    {x['name']:<12} {x['at_ms'] / 1000:7.2f}-{(x['at_ms'] + x['ms']) / 1000:7.2f}  ({x['ms'] / 1000:.1f}s, chunks {x['rows'][0]}-{x['rows'][1]})")
    print(f"estimate: {p['credits']} credits ({CREDITS_PER_S} per second of music)", end='')
    if M['engine'] == 'elevenlabs':
        try:
            import eleven
            used, limit, _ = eleven.quota(); print(f'; the ElevenLabs key has {limit - used:,} left this period', end='')
        except (Exception, SystemExit): pass
    print('' if M['engine'] == 'elevenlabs' else '; through the Hub it is billed to the company ElevenLabs account')
    os.makedirs(os.path.join(s['root'], 'music'), exist_ok=True)
    json.dump({k: p[k] for k in ('sha', 'model', 'seed', 'prompt', 'seconds', 'credits', 'crossfade_ms', 'chunks', 'parts')},
              open(os.path.join(s['root'], 'music/plan.json'), 'w'), indent=1, ensure_ascii=False)


def word_time(s, vo, line, word, n=1):
    hits = [w['t'] for w in vo['words'] if w['line'] == line - 1 and spec.norm(w['w']) == spec.norm(str(word))]
    if len(hits) < n: sys.exit(f"music.stops: '{word}' #{n} not heard in line {line} (`film.py words` lists the tokens)")
    return hits[n - 1]


def stops(s, p=None):
    """[(t0, t1)] silences: music.stops [{line, word, n, offset} | {at}], held until the next chunk starts (or `hold` s)."""
    out = []; vo = spec.vo_data(s)
    edges = [x['ms'][0] / 1000 for x in p['rows']] if p else []
    for st in s['music'].get('stops') or []:
        t0 = st['at'] if 'at' in st else word_time(s, vo, st['line'], st['word'], st.get('n', 1)) + st.get('offset', 0.)
        nxt = [e for e in edges if t0 < e <= t0 + 3]
        out.append((t0, t0 + st['hold'] if 'hold' in st else nxt[0] if nxt else t0 + .9))
    return out


def body(p, part):
    """The /v1/music request for one part. force_instrumental only goes with a prompt: ElevenLabs answers 422 when it
    comes with a composition_plan, whose styles exclude vocals instead. seed only goes with a plan (422 with a prompt)."""
    b = {'model_id': p['model']}
    if p['prompt']: b.update(prompt=p['prompt'], music_length_ms=round(p['seconds'] * 1000), force_instrumental=True)
    else:
        b['composition_plan'] = {'chunks': part['chunks']}
        if p['seed'] is not None: b['seed'] = int(p['seed'])
    return b


def manifest(s, p):
    """music/composed.parts.json: where each part lands, for assemble(); removed when the plan fits one call."""
    path = os.path.join(s['root'], f'music/{NAME}.parts.json')
    if len(p['parts']) == 1:
        if os.path.exists(path): os.remove(path)
        return
    json.dump({'plan_sha': p['sha'], 'film_ms': round(p['seconds'] * 1000), 'crossfade_ms': p['crossfade_ms'],
               'parts': [{k: x[k] for k in ('name', 'at_ms', 'ms', 'boundary_ms')} for x in p['parts']]}, open(path, 'w'), indent=1)


def credits_used():
    try:
        import eleven
        return eleven.quota()[0]
    except (Exception, SystemExit):
        return None


def compose(s, p):
    """engine elevenlabs: one ElevenLabs Music call per part -> music/composed.wav (parts joined by assemble())."""
    import eleven
    d = os.path.join(s['root'], 'music'); os.makedirs(d, exist_ok=True); manifest(s, p)
    before = credits_used()
    for x in p['parts']:
        raw = f"{d}/{x['name']}.orig.mp3"
        print(f"composing {x['name']} ({x['ms'] / 1000:.1f}s) with ElevenLabs Music ({p['model']}, ~{x['credits']} credits)...", flush=True)
        hdr = eleven.music(body(p, x), raw)
        finish(s, raw, x['name'], {'source': 'elevenlabs', 'plan_sha': p['sha'], 'model': p['model'], 'seed': p['seed'], 'song_id': hdr.get('song-id'),
                                   'credits_estimate': x['credits'], 'headers': {k: v for k, v in hdr.items() if re.search(r'cost|credit|character|song', k)}},
               x['ms'] / 1000 if len(p['parts']) > 1 else None)
    after = credits_used()
    if len(p['parts']) > 1: assemble(s)
    if before is not None and after is not None:
        print(f'  account counter: {after - before:+,} credits' + (' (it lags a minute behind: `film.py budget` shows the spend)' if after <= before else ''))


def hub_jobs(s, p, film_py):
    """engine hub: one generate_music call per part (<= 90 s each), written to music/hub_jobs.json for Claude to run."""
    R = s['root']; d = os.path.join(R, 'music'); os.makedirs(d, exist_ok=True); manifest(s, p); jobs = []; n = len(p['parts'])
    for k, x in enumerate(p['parts']):
        b = body(p, x); inp = {'model': p['model'], 'label': f"{s['film']['slug']} score" + (f' part {k + 1}/{n}' if n > 1 else '')}
        if p['prompt']: inp.update(prompt=p['prompt'], length_s=p['seconds'], instrumental=True)
        else: inp.update(composition_plan=b['composition_plan'], instrumental=False)
        if 'seed' in b: inp['seed'] = b['seed']
        res = f"{d}/{x['name']}.hub.json"
        jobs.append({'name': x['name'], 'part': k + 1, 'parts': n, 'input': inp, 'plan_sha': p['sha'], 'length_s': x['ms'] / 1000, 'at_s': x['at_ms'] / 1000,
                     'credits_estimate': x['credits'], 'save_result_as': res,
                     'import': ' '.join(shlex.quote(str(v)) for v in ['python3', film_py, 'import-music', R, x['name'], res])})
    out = os.path.join(d, 'hub_jobs.json'); json.dump(jobs, open(out, 'w'), indent=1, ensure_ascii=False)
    print(f"{n} generate_music job{'s' if n > 1 else ''} ({p['seconds']:.1f}s, ~{p['credits']} credits, billed to the company ElevenLabs account) -> {out}\n"
          'For each job, in order: call the Hub MCP tool generate_music with job.input exactly as written, save its JSON result to\n'
          'job.save_result_as, then run job.import right away (the audio URL expires).'
          + (f"\nThe {n} parts are one piece: keep every input as written (the same seed {p['seed']}, and the same key, BPM and\n"
             'instrumentation in every chunk); do not reword a part. The last import joins them into music/composed.wav.' if n > 1 else '')
          + '\nIf the Hub refuses (the ElevenLabs balance is exhausted), show its notice to the user verbatim and stop; pass on any\n'
          '`warning` in a result (under 10 % left) verbatim too.')


def import_music(s, name, src):
    """An audio URL / path, or a saved generate_music result (.json) -> music/<name>.wav."""
    R = s['root']; d = os.path.join(R, 'music'); os.makedirs(d, exist_ok=True)
    loc = lambda x: x if os.path.exists(x) else os.path.join(R, x); res = {}
    if src.endswith('.json') and os.path.exists(loc(src)): res = json.load(open(loc(src))); src = res['audio_url']
    ext = os.path.splitext(urllib.parse.urlparse(src).path)[1] or '.mp3'; raw = f'{d}/{name}.orig{ext}'
    if re.match(r'https?://', src): subprocess.run(['curl', '-fsSL', '--retry', '2', '--max-time', '300', '-o', raw, src], check=True)
    elif os.path.realpath(loc(src)) != os.path.realpath(raw): shutil.copy(loc(src), raw)
    jobs = os.path.join(d, 'hub_jobs.json'); job = next((j for j in (json.load(open(jobs)) if os.path.exists(jobs) else []) if j['name'] == name), {})
    for k in ('notice', 'warning'):
        if res.get(k): print(f'Hub {k} (show it to the user verbatim): {res[k]}')
    finish(s, raw, name, {'source': 'hub' if res else 'import', 'plan_sha': job.get('plan_sha'), 'model': res.get('model') or job.get('input', {}).get('model'),
                          'seed': job.get('input', {}).get('seed'), 'credits': res.get('credits'), 'credits_estimate': job.get('credits_estimate'), 'label': res.get('label')},
           job.get('length_s') if job.get('parts', 1) > 1 else None)
    if name.startswith(NAME + '.p'): assemble(s)


def decode(path):
    raw = subprocess.check_output(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'])
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


def assemble(s):
    """Joins music/composed.pN.wav into music/composed.wav once every part is in: part k starts crossfade/2 before its
    boundary and fades in (sin) while part k-1 fades out (cos) over the crossfade, centred on the boundary; the result
    is cut or padded to the film's length. Returns False while parts are missing."""
    d = os.path.join(s['root'], 'music'); path = f'{d}/{NAME}.parts.json'
    if not os.path.exists(path): return False
    man = json.load(open(path)); parts = man['parts']; missing = [x['name'] for x in parts if not os.path.exists(f"{d}/{x['name']}.wav")]
    if missing:
        print(f"{len(parts) - len(missing)} of {len(parts)} parts in; still to import: {', '.join(missing)}"); return False
    metas = [json.load(open(f"{d}/{x['name']}.json")) if os.path.exists(f"{d}/{x['name']}.json") else {} for x in parts]
    old = [x['name'] for x, m in zip(parts, metas) if m.get('plan_sha') and m['plan_sha'] != man['plan_sha']]
    if old: print(f"WARNING: {', '.join(old)} were made for another plan: re-run `film.py score DIR` and import them again", flush=True)
    n = man['film_ms'] * SR // 1000; X = man['crossfade_ms'] * SR // 1000; out = np.zeros((n, 2))
    fin, fout = np.sin(np.linspace(0, np.pi / 2, X))[:, None], np.cos(np.linspace(0, np.pi / 2, X))[:, None]
    for k, x in enumerate(parts):
        y = decode(f"{d}/{x['name']}.wav").copy(); a = x['at_ms'] * SR // 1000
        if k: y[:X] *= fin[:len(y[:X])]
        if k < len(parts) - 1:
            c = (parts[k + 1]['at_ms'] - x['at_ms']) * SR // 1000
            y[c:c + X] *= fout[:len(y[c:c + X])]; y[c + X:] = 0
        e = min(n, a + len(y)); out[a:e] += y[:e - a]
    out /= max(1, np.abs(out).max() / .99)
    import wave
    with wave.open(f'{d}/{NAME}.wav', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
    length, until = sounding(f'{d}/{NAME}.wav'); cr = [m.get('credits') for m in metas]
    meta = {'source': metas[0].get('source'), 'plan_sha': man['plan_sha'], 'model': metas[0].get('model'), 'seed': metas[0].get('seed'),
            'parts': [x['name'] for x in parts], 'crossfade_s': man['crossfade_ms'] / 1000, 'boundaries_s': [x['boundary_ms'] / 1000 for x in parts[1:]],
            'credits': sum(cr) if all(c is not None for c in cr) else None, 'length_s': round(length, 3), 'sounds_until_s': round(until, 3), 'film_s': man['film_ms'] / 1000}
    json.dump({k: v for k, v in meta.items() if v is not None}, open(f'{d}/{NAME}.json', 'w'), indent=1)
    print(f"music/{NAME}.wav assembled from {len(parts)} parts: {length:.2f}s (film {man['film_ms'] / 1000:.2f}s), "
          f"crossfades at {', '.join(f'{b:.2f}' for b in meta['boundaries_s'])}s, sounds until {until:.2f}s")
    return True


def sounding(path):
    """(length, last moment louder than 40 dB under the peak) in seconds."""
    raw = subprocess.check_output(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', '8000', '-'])
    x = np.frombuffer(raw, np.float32); w = 400; n = len(x) // w
    rms = np.sqrt((x[:n * w].reshape(n, w).astype(np.float64) ** 2).mean(1)) if n else np.zeros(1)
    loud = np.nonzero(rms > rms.max() * 10 ** (-40 / 20))[0]
    return len(x) / 8000, (loud[-1] + 1) * w / 8000 if len(loud) else 0.


def finish(s, raw, name, meta, expect=None):
    """raw audio -> music/<name>.wav + .json; expect = the planned length of a part (default: the film's)."""
    d = os.path.join(s['root'], 'music'); wav = f'{d}/{name}.wav'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', raw, '-ar', '48000', '-ac', '2', wav], check=True)
    length, until = sounding(wav)
    try: film = spec.duration(s)
    except (OSError, ValueError): film = None
    meta = {**{k: v for k, v in meta.items() if v is not None}, 'length_s': round(length, 3), 'sounds_until_s': round(until, 3), 'film_s': film}
    json.dump(meta, open(f'{d}/{name}.json', 'w'), indent=1)
    want, what = (expect, 'its planned length') if expect else (film, 'the film')
    print(f'music/{name}.wav {length:.2f}s, sounds until {until:.2f}s' + (f' ({what}: {want:.2f}s)' if want else '')
          + (f", {meta['credits']} credits" if meta.get('credits') is not None else '') + (f", song {meta['song_id']}" if meta.get('song_id') else ''))
    if want and abs(length - want) > .25: print(f'  note: {length - want:+.2f}s against {what}; it is cut or padded when the score is put together')


def base_clip(s):
    """engine elevenlabs / hub: the composed score as the first clip of music/score.wav (None for engine library)."""
    M = s['music']
    if M['engine'] == 'library': return None
    wav = os.path.join(s['root'], f'music/{NAME}.wav'); man = wav[:-4] + '.parts.json'
    if os.path.exists(man):
        names = [x['name'] for x in json.load(open(man))['parts']]; got = [os.path.join(s['root'], f'music/{x}.wav') for x in names]
        if all(map(os.path.exists, got)) and (not os.path.exists(wav) or os.path.getmtime(wav) < max(map(os.path.getmtime, got))): assemble(s)
    if not os.path.exists(wav):
        sys.exit(f"no composed score yet (music.engine {M['engine']}): run `film.py score {s['root']} --dry` to see the plan and the credits, then without --dry")
    meta = json.load(open(wav[:-4] + '.json')) if os.path.exists(wav[:-4] + '.json') else {}
    sha = plan(s)['sha']
    if meta.get('plan_sha') and meta['plan_sha'] != sha:
        print(f"WARNING: the film's timing or music settings changed since the score was composed (plan {meta['plan_sha']} -> {sha}): "
              '`film.py score DIR` recomposes it', flush=True)
    return {'file': f'music/{NAME}.wav', 'at': 0., 'norm': 'groove', 'gain_db': M.get('gain_db', 0.)}

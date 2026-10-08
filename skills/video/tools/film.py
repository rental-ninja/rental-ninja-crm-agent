#!/usr/bin/env python3
"""Rental Ninja film pipeline. Every command takes the film folder (the one holding film.yml).

  setup [--install] [--whisper]   check the prerequisites and print the exact install command for anything missing;
                          --install creates/updates the tools venv (pyyaml, numpy, playwright + its Chromium, pillow),
                          --whisper adds faster-whisper (local word timings). Never installs Homebrew packages.
  new DIR [paper]         scaffold a film folder, e.g. ~/Videos/rn-films/<slug> (house style; 'paper' = paper-craft)
  check DIR               validate film.yml and print the line plan
  budget                  how the Hub bills narration and music (engine hub) and a personal ElevenLabs key's credits
  voices [FILTER]         ElevenLabs voices on a personal account (id, name, labels)
  takes DIR [--lines 1,4] [--takes a,b] [--force]    narration takes -> vo/lines/l<N>_<take>.wav
                          (+ .words.json timings with elevenlabs; engine hub only writes vo/hub_jobs.json for the
                          Hub MCP tool generate_voiceover, then run import-take per job)
  import-take DIR LINE TAKE AUDIO [WORDS]   audio URL/path (or a saved generate_voiceover result .json) ->
                          vo/lines/l<N>_<take>.wav; WORDS = JSON path or inline [{text, start, end}] -> .words.json
  vo DIR                  picks -> vo/final (cleanup chain), word timings (provider .words.json, else local
                          faster-whisper), app/js/words.js, captions, page
  words DIR [LINE]        word times, for choreography
  page DIR                regenerate app/index.html and app/js/film.js from film.yml
  captions DIR            final/<slug>.<lang>.srt, VO.caps and VO.burn (the burned-in caption pages)
  peek DIR NAME t1 t2... [--fmt 9x16|all] [--caps 0|1|pill|karaoke] [--safe]
                          stills at film times + 2x2 contact sheets in stills/ (--fmt all: one sheet per time
                          with the four formats side by side; --safe: platform-UI zones and caption/logo slots)
  score DIR [--dry] [--force]   the film's music: a composition plan built from words.js (acts from music.sections, end
                          card ending at the film's length), printed with its credit estimate; without --dry, engine hub
                          writes music/hub_jobs.json for the Hub MCP tool generate_music (then import-music), engine
                          elevenlabs composes it with a personal key (music/composed.wav)
  import-music DIR NAME AUDIO   audio URL/path or a saved generate_music result .json -> music/NAME.wav
                          (NAME composed = the score `audio` builds on)
  audio DIR               cues -> foley -> score (composed score + clips) -> mix -> app/audio/mix.mp3
  render DIR NAME [crf] [--fmt F] [--span A B] [--caps X]   out/NAME.mp4 (--span: only film seconds A..B)
  build DIR NAME          audio + render
  deliver DIR NAME        final/: <slug>.mp4 + -720p (16x9) or <slug>-<fmt>.mp4 + -<fmt>-720p, srt, poster, loudness
  pagecheck DIR           player page at 1280 and 400 px
  artifact DIR            files map for publishing the film with the Artifact tool
  publish DIR [DIR2...] [--name N] [--description D] [--force]
                          the Hub media library hand-off (tools/library.py): the delivered MP4s per format, posters and
                          WebVTT subtitles of one or more film folders (one per language) -> DIR/library/manifest.json
                          + upload_request.json (the input of the Hub MCP tool get_marketing_asset_upload_urls)
  upload DIR [--dry]      POSTs every file with curl to the URLs saved in DIR/library/upload_urls.json, then writes
                          DIR/library/publish_request.json (the input of publish_marketing_asset); standard library only

Formats and captions live in film.yml: film.format (16x9 | 9x16 | 1x1 | 4x5) and captions {burn, style pill|karaoke,
max_chars, max_lines}; the player page also takes ?fmt=, ?caps=0|1|pill|karaoke and ?safe=1 (see SKILL.md).

Nothing is written inside the skill folder (a plugin update replaces it): films live wherever DIR points, and the tools
venv and Python bytecode live in ~/.cache/rental-ninja-video (RN_VIDEO_HOME overrides it).
"""
import concurrent.futures as cf, difflib, glob, json, math, os, re, shlex, shutil, subprocess, sys

SKILL = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
HOME = os.path.expanduser(os.environ.get('RN_VIDEO_HOME', '~/.cache/rental-ninja-video'))
VENV = os.path.join(HOME, 'venv')
VENV_PY = os.path.join(VENV, 'bin/python')
os.environ.setdefault('PYTHONPYCACHEPREFIX', os.path.join(HOME, 'pycache'))
sys.pycache_prefix = os.environ['PYTHONPYCACHEPREFIX']
if __name__ == '__main__' and os.path.exists(VENV_PY) and os.path.realpath(sys.prefix) != os.path.realpath(VENV) and not os.environ.get('RN_VIDEO_REEXEC'):
    os.environ['RN_VIDEO_REEXEC'] = '1'
    os.execv(VENV_PY, [VENV_PY, os.path.abspath(__file__), *sys.argv[1:]])

try:
    import spec
except ModuleNotFoundError as e:
    spec = None; MISSING = e.name

T = os.path.join(SKILL, 'tools')
PY = sys.executable
BASE_PKGS = ['pyyaml', 'numpy', 'playwright', 'pillow']
WHISPER_PKGS = ['faster-whisper==1.2.1', 'av<19']
CTA_EMPTY = "end_card.cta is empty, so the end card says 'Book a demo': an in-app film takes the action of the campaign's button"


def cta_set(s):
    return bool(str((s.get('end_card') or {}).get('cta') or '').strip())


def sh(*a, **k):
    return subprocess.run([str(x) for x in a], check=True, **k)


def has_module(name):
    import importlib.util
    return importlib.util.find_spec(name) is not None


def dur_of(p):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))


# ---------- scaffold ----------
def cmd_new(root, style='flat'):
    root = spec.film_root(root)
    if os.path.exists(os.path.join(root, 'film.yml')): sys.exit(f'{root}/film.yml exists')
    tpl = spec.template_dir(style)
    for d in ['app/js', 'app/img', 'app/audio', 'vo/lines', 'vo/final', 'music', 'mix', 'out', 'stills', 'final']: os.makedirs(os.path.join(root, d), exist_ok=True)
    for f in glob.glob(os.path.join(tpl, 'app/js/*.js')): shutil.copy(f, os.path.join(root, 'app/js'))
    for f in glob.glob(os.path.join(tpl, 'app/img/*')): shutil.copy(f, os.path.join(root, 'app/img'))
    slug = re.sub(r'[^a-z0-9]+', '-', os.path.basename(root).lower()).strip('-') or 'my-film'
    yml = re.sub(r'slug: my-film( *)#', lambda m: f'slug: {slug}'.ljust(len(m.group(0)) - 2) + ' #', open(os.path.join(tpl, 'film.yml')).read(), 1)
    open(os.path.join(root, 'film.yml'), 'w').write(yml)
    print('scaffolded', root, '- edit film.yml, then: takes -> vo -> scenes -> audio -> render')


def cmd_check(root):
    s = spec.load(root); L = s['lines']; tk = s['voice']['takes']; ok = True; f = s['film']; cap = s['captions']
    if f['format'] not in spec.FORMATS: print(f"film.format {f['format']!r}: use one of {list(spec.FORMATS)}"); ok = False
    elif f['format'] != '16x9' and f['style'] != 'flat': print('film.format other than 16x9 needs style: flat'); ok = False
    if cap['style'] not in ('pill', 'karaoke'): print(f"captions.style {cap['style']!r}: pill or karaoke"); ok = False
    if not cta_set(s): print(CTA_EMPTY); ok = False
    import library
    if f['lang'] not in library.LOCALES:
        print(f"film.lang {f['lang']!r} is not a Hub app language ({', '.join(library.LOCALES)}): no brand voice and no media library for it")
        ok = ok and s['voice']['engine'] != 'hub'
    for i, ln in enumerate(L, 1):
        if ln['pick'] not in tk and not os.path.exists(os.path.join(s['root'], f"vo/lines/l{i}_{ln['pick']}.wav")): print(f'line {i}: pick {ln["pick"]} not in takes {tk}'); ok = False
        sp = ln.get('split')
        if sp:
            try: caption_first(ln, sp)
            except ValueError as e: print(f'line {i}: split: {e}'); ok = False
    words = sum(len(ln['text'].split()) for ln in L)
    est = s['timing']['first_line_at'] + words / 2.55 + sum(ln.get('gap', s['timing']['default_gap']) for ln in L[:-1]) + s['timing']['tail']
    print(f'{len(L)} lines, {words} words, estimated length {est:.0f}s ({est / 60:.1f} min) at ~153 wpm')
    print(f"format {f['format']}, voice {s['voice']['engine']}, burned captions {cap['style'] if spec.burn(s) else 'off'}"
          + ('  <- social cut: aim for 15-30 s' if f['format'] != '16x9' and not 12 <= est <= 32 else ''))
    M = s['music']
    print(f"music {M['engine']}" + (f" ({M['model']}): ~{math.ceil(est) * 15} credits for ~{est:.0f}s, planned after `vo` with `score <folder> --dry`" if M['engine'] != 'library' else f": {len(M['clips'])} clip(s)"))
    for sc in s.get('scenes', []): print(f"  scene {sc['lines']}: {sc.get('name', '')} — {sc.get('idea', '')}")
    print('OK' if ok else 'problems above')


# ---------- narration ----------
def hub_jobs(s, idx, tk, force):
    """engine hub: one generate_voiceover call per line x take, written to vo/hub_jobs.json for Claude to run."""
    R = s['root']; V = s['voice']; d = os.path.join(R, 'vo/lines'); jobs = []
    keys = ('stability', 'similarity_boost', 'style', 'use_speaker_boost')
    for n in idx:
        ln = s['lines'][n - 1]; text = ln.get('say', ln['text'])
        if len(text) > 2500: sys.exit(f'line {n}: {len(text)} characters, generate_voiceover takes at most 2500')
        open(f'{d}/l{n}.txt', 'w').write(text + '\n')
        for t in tk:
            if not force and os.path.exists(f'{d}/l{n}_{t}.wav'): continue
            inp = {'text': text, 'locale': s['film']['lang'], 'model': V['model'],
                   'settings': {k: v for k, v in {**V['settings'], **ln.get('settings', {})}.items() if k in keys}, 'label': f"{s['film']['slug']} line {n} take {t}"}
            if V.get('voice'): inp['voice_id'] = V['voice']
            res = f'{d}/l{n}_{t}.hub.json'
            imp = ' '.join(shlex.quote(str(x)) for x in ['python3', os.path.abspath(__file__), 'import-take', R, n, t, res])
            jobs.append({'line': n, 'take': t, 'input': inp, 'save_result_as': res, 'import': imp})
    out = os.path.join(R, 'vo/hub_jobs.json'); json.dump(jobs, open(out, 'w'), indent=1, ensure_ascii=False)
    print(f"{len(jobs)} takes for the Hub ({sum(len(j['input']['text']) for j in jobs)} characters = credits, billed to the company ElevenLabs account) -> {out}")
    if jobs: print('Run the jobs sequentially, one at a time, never as parallel tool calls: call the Hub MCP tool generate_voiceover\n'
                   'with job.input, save its JSON result to job.save_result_as, run job.import (or: import-take DIR LINE TAKE\n'
                   '<audio_url> <words JSON>) right away (the audio URL expires), then go on to the next job.\n'
                   '"... still being generated" means the previous job is still running: wait, then call again (not a refusal).\n'
                   'If the Hub refuses a job (the credits left are fewer than it needs), show its notice to the user verbatim and stop;\n'
                   'pass on any `warning` in a result (under 10 % left) verbatim too.\n'
                   'Then set pick per line and run `film.py vo DIR` (it uses the Hub word timings, no transcription).')


def cmd_takes(root, lines=None, takes=None, force=False):
    s = spec.load(root); V = s['voice']
    idx = [int(x) for x in lines.split(',')] if lines else range(1, len(s['lines']) + 1)
    tk = takes.split(',') if takes else V['takes']
    os.makedirs(os.path.join(s['root'], 'vo/lines'), exist_ok=True)
    if V['engine'] == 'hub': return hub_jobs(s, idx, tk, force)
    if not V.get('voice'): sys.exit('set voice.voice in film.yml to an ElevenLabs voice id (`film.py voices` lists them)')
    d = os.path.join(s['root'], 'vo/lines')
    jobs = []
    for n in idx:
        ln = s['lines'][n - 1]
        open(f'{d}/l{n}.txt', 'w').write(ln.get('say', ln['text']) + '\n')
        for t in tk:
            if force or not os.path.exists(f'{d}/l{n}_{t}.wav'):
                jobs.append([PY, f'{T}/tts.py', V['engine'], V['voice'], V['model'], f'{d}/l{n}.txt', f'{d}/l{n}_{t}', json.dumps({**V['settings'], **ln.get('settings', {})})])
    print(len(jobs), 'takes to record', f"({sum(len(open(j[5]).read().strip()) for j in jobs)} characters)")
    with cf.ThreadPoolExecutor(4) as ex:
        for r in ex.map(lambda j: subprocess.run(j, capture_output=True, text=True), jobs):
            print((r.stdout or r.stderr).strip().splitlines()[-1] if (r.stdout or r.stderr) else r.returncode)


def cmd_import_take(root, line, take, audio, words=None):
    s = spec.load(root); R = s['root']; n = int(line); ln = s['lines'][n - 1]; d = os.path.join(R, 'vo/lines'); os.makedirs(d, exist_ok=True)
    base = f'{d}/l{n}_{take}'; loc = lambda p: p if os.path.exists(p) else os.path.join(R, p)
    import library
    if audio.endswith('.json') and os.path.exists(loc(audio)):
        res = library.mcp_result(json.load(open(loc(audio))), audio)
        for k in ('notice', 'warning'):
            if res.get(k): print(f'Hub {k} (show it to the user verbatim): {res[k]}')
        if not res.get('audio_url'): sys.exit(f'{audio}: no audio_url in this generate_voiceover result')
        audio = res['audio_url']; words = words or res
    src = loc(audio)
    if re.match(r'https?://', audio): src = base + '.download'; sh('curl', '-fsSL', '--retry', '2', '--max-time', '300', '-o', src, audio)
    sh('ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-ar', '48000', '-ac', '1', base + '.wav')
    if src.endswith('.download'): os.remove(src)
    open(f'{d}/l{n}.txt', 'w').write(ln.get('say', ln['text']) + '\n')
    if words is None:
        if os.path.exists(base + '.words.json'): os.remove(base + '.words.json')
        note = 'no word timings: vo will transcribe it'
    else:
        if isinstance(words, str): words = json.load(open(loc(words))) if os.path.exists(loc(words)) else json.loads(words)
        words = library.mcp_result(words, 'the words JSON')
        ws = [{'word': re.sub(r'\[[^\]]*\]', '', w.get('text', w.get('word', ''))).strip(), 'start': round(float(w['start']), 3), 'end': round(float(w['end']), 3)}
              for w in (words['words'] if isinstance(words, dict) else words)]
        ws = [w for w in ws if re.sub(r'\W', '', w['word'])]
        json.dump({'source': 'hub', 'text': ' '.join(w['word'] for w in ws), 'words': ws}, open(base + '.words.json', 'w'), ensure_ascii=False)
        note = f'{len(ws)} words timed'
    print(f'{os.path.basename(base)}.wav {dur_of(base + ".wav"):.2f}s, {note}' + (f'; set pick: {take} on line {n} to use it' if ln['pick'] != take else ''))


def lead_trim(src, chain, tmp):
    """Seconds the cleanup chain cuts from the start of a take: its first filter, when that is a silenceremove, run alone."""
    first = chain.split(',')[0]
    if not first.startswith('silenceremove'): return 0.
    sh('ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-af', first, tmp); d = dur_of(src) - dur_of(tmp); os.remove(tmp)
    return max(0., d)


def cmd_vo(root):
    s = spec.load(root); V = s['voice']; R = s['root']
    fin = os.path.join(R, 'vo/final'); os.makedirs(fin, exist_ok=True)
    made = os.path.join(fin, 'made.json'); was = json.load(open(made)) if os.path.exists(made) else {}
    for n, ln in enumerate(s['lines'], 1):
        src = os.path.join(R, f"vo/lines/l{n}_{ln['pick']}.wav"); dst = f'{fin}/vo{n}.wav'; key = f"{ln['pick']}|{V['chain']}"
        if not os.path.exists(src): sys.exit(f'missing take {src}')
        if os.path.exists(dst) and was.get(str(n)) == key and os.path.getmtime(dst) > os.path.getmtime(src): continue
        sh('ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-af', V['chain'], '-ar', '48000', '-ac', '1', dst); was[str(n)] = key
    json.dump(was, open(made, 'w'))
    src_of = {}
    for n, ln in enumerate(s['lines'], 1):  # provider word timings (ElevenLabs / Hub), shifted by the chain's leading trim
        wj = os.path.join(R, f"vo/lines/l{n}_{ln['pick']}.words.json")
        if not os.path.exists(wj): continue
        d = json.load(open(wj)); off = lead_trim(os.path.join(R, f"vo/lines/l{n}_{ln['pick']}.wav"), V['chain'], f'{fin}/_trim.wav'); end = dur_of(f'{fin}/vo{n}.wav')
        ws = [{'word': w['word'], 'start': round(min(end, max(0, w['start'] - off)), 3), 'end': round(min(end, max(0, w['end'] - off)), 3)} for w in d['words']]
        json.dump({'text': ' '.join(w['word'] for w in ws), 'words': ws, 'source': d.get('source', 'provider'), 'shift': round(off, 3)}, open(f'{fin}/vo{n}.json', 'w'), ensure_ascii=False)
        src_of[n] = d.get('source', 'provider')
    stale = [f'{fin}/vo{n}.wav' for n in range(1, len(s['lines']) + 1) if n not in src_of and (
             not os.path.exists(f'{fin}/vo{n}.json') or os.path.getmtime(f'{fin}/vo{n}.json') < os.path.getmtime(f'{fin}/vo{n}.wav')
             or 'source' in json.load(open(f'{fin}/vo{n}.json')))]
    if stale:
        if not has_module('faster_whisper'):
            nums = ', '.join(re.sub(r'\D', '', os.path.basename(p)) for p in stale)
            sys.exit(f'line(s) {nums} have no word timings and there is no local transcriber: record them with engine hub or\n'
                     'elevenlabs (their takes carry timings), or run `film.py setup --install --whisper` once')
        print(f'transcribing {len(stale)} line(s) locally (faster-whisper)', flush=True)
        sh(PY, f'{T}/stt.py', s['film']['lang'], s['stt']['model'], fin, *stale)
    out = {'vo': [], 'words': []}; t = s['timing']['first_line_at']
    for i, ln in enumerate(s['lines']):
        d = json.load(open(f'{fin}/vo{i + 1}.json')); dur = dur_of(f'{fin}/vo{i + 1}.wav')
        out['vo'].append({'start': round(t, 3), 'end': round(t + dur, 3), 'text': ln['text']})
        for w in d['words']: out['words'].append({'w': w['word'], 't': round(t + w['start'], 3), 'e': round(t + w['end'], 3), 'line': i})
        sim = difflib.SequenceMatcher(None, spec.norm(d['text']), spec.norm(re.sub(r'\[[^]]*\]', ' ', ln.get('say', ln['text'])))).ratio()
        flag = '' if sim > .9 else f'   <- heard {sim:.0%} of the script: listen to this take'
        print(f'{i + 1:2d} {t:7.2f}-{t + dur:7.2f}  {src_of.get(i + 1, "whisper"):10s} {ln["text"][:64]}{flag}')
        t += dur + ln.get('gap', s['timing']['default_gap'])
    os.makedirs(os.path.join(R, 'app/js'), exist_ok=True)
    open(os.path.join(R, 'app/js/words.js'), 'w').write('const VO = ' + json.dumps(out) + ';\n')
    print(f"speech ends {out['vo'][-1]['end']:.2f}s, film {spec.duration(s, out)}s")
    cmd_captions(root); cmd_page(root)


def cmd_words(root, line=None):
    vo = spec.vo_data(spec.load(root))
    for i, v in enumerate(vo['vo']):
        if line and i + 1 != int(line): continue
        print(f"{i + 1:2d} [{v['start']:.2f}-{v['end']:.2f}] " + ' '.join(f"{w['w']}@{w['t']:.2f}" for w in vo['words'] if w['line'] == i))


# ---------- captions ----------
def caption_first(ln, sp):
    """Text of the first half of a split caption: the script words before the n-th occurrence of `at`, minus `back` words."""
    if sp.get('first'): return sp['first']
    toks = ln['text'].split(); k = 0
    for match in (lambda a, b: a == b, lambda a, b: a.startswith(b)):
        k = 0
        for j, tok in enumerate(toks):
            if match(spec.norm(tok), sp['at']):
                k += 1
                if k == sp.get('n', 1): return ' '.join(toks[:j - sp.get('back', 0)])
    raise ValueError(f"token {sp['at']!r} #{sp.get('n', 1)} not in the script line")


def align(text, heard, a):
    """The caption's own words with times from the heard ones; words heard differently share the span of what was heard."""
    disp = text.split(); T = [None] * len(disp)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, [spec.norm(x) for x in disp], [spec.norm(w['w']) for w in heard], autojunk=False).get_opcodes():
        if op == 'equal':
            for k in range(i2 - i1): T[i1 + k] = (heard[j1 + k]['t'], heard[j1 + k]['e'])
        elif op == 'replace':
            t0, t1 = heard[j1]['t'], heard[j2 - 1]['e']; L = [len(x) + 1 for x in disp[i1:i2]]; c = 0
            for k, n in enumerate(L): T[i1 + k] = (t0 + (t1 - t0) * c / sum(L), t0 + (t1 - t0) * (c + n) / sum(L)); c += n
    for k in range(len(T)):
        if T[k] is None: T[k] = (T[k - 1][1],) * 2 if k else (a, a)
    return [[w, round(t, 3), round(e, 3)] for w, (t, e) in zip(disp, T)]


def pages(ws, maxc, maxl):
    """Timed words -> caption pages of <= maxl lines of <= maxc characters, balanced, breaking after punctuation when it can."""
    L = lambda g: len(' '.join(w[0] for w in g)); punct = lambda w: w[0][-1] in ',.;:!?'

    def lines(g, m):
        if L(g) <= maxc or len(g) == 1: return [g]
        best = None
        for k in range(1, len(g)):
            if L(g[:k]) > maxc: break
            rest = lines(g[k:], m - 1) if m > 1 else None
            if rest:
                cost = max(L(x) for x in [g[:k]] + rest) - 4 * punct(g[k - 1])
                if not best or cost < best[0]: best = (cost, [g[:k]] + rest)
        return best and best[1]
    n = max(1, -(-L(ws) // (maxc * maxl)))
    while True:
        cuts = [0]
        for p in range(1, n):
            ks = range(cuts[-1] + 1, len(ws))
            if ks: cuts.append(min(ks, key=lambda k: abs(L(ws[:k]) - L(ws) * p / n) - 6 * punct(ws[k - 1])))
        groups = [ws[a:b] for a, b in zip(cuts, cuts[1:] + [len(ws)]) if b > a]
        ls = [lines(g, maxl) for g in groups]
        if all(ls) or n >= len(ws): return [x or [g] for x, g in zip(ls, groups)]
        n += 1


def cmd_captions(root):
    s = spec.load(root); vo = spec.vo_data(s); cues = []
    for i, v in enumerate(vo['vo']):
        ln = s['lines'][i]; sp = ln.get('split'); ws = [w for w in vo['words'] if w['line'] == i]; txt = v['text']
        if not sp: cues.append((v['start'], v['end'], txt, ws)); continue
        first = caption_first(ln, sp); assert txt.startswith(first), (i + 1, first)
        hits = [j for j, w in enumerate(ws) if spec.norm(w['w']) == sp['at']]
        if len(hits) < sp.get('n', 1): sys.exit(f"line {i + 1}: '{sp['at']}' #{sp.get('n', 1)} not heard in the take; use `film.py words` to pick another token")
        k = hits[sp.get('n', 1) - 1] - sp.get('back', 0)
        cues.append((v['start'], ws[k]['t'] - .1, first, ws[:k])); cues.append((ws[k]['t'] - .06, v['end'], txt[len(first):].strip(), ws[k:]))

    def ts(t):
        h = int(t // 3600); m = int(t % 3600 // 60); sec = t % 60; ms = int(round((sec - int(sec)) * 1000))
        return f'{h:02d}:{m:02d}:{int(sec):02d},{min(ms, 999):03d}'
    srt, caps, burn = [], [], []; C = s['captions']
    for n, (a, b, t, ws) in enumerate(cues):
        b = b + .3
        if n + 1 < len(cues): b = min(b, cues[n + 1][0] - .04)
        srt.append(f'{n + 1}\n{ts(a)} --> {ts(b)}\n{t}\n'); caps.append({'start': round(a, 3), 'end': round(b, 3), 'text': t})
        pg = pages(align(t, ws, a), C['max_chars'], C['max_lines'])
        for j, p in enumerate(pg):
            burn.append({'s': round(a if j == 0 else max(a, p[0][0][1] - .05), 3), 'e': round(b if j + 1 == len(pg) else max(a, pg[j + 1][0][0][1] - .07), 3), 'l': p})
    os.makedirs(os.path.join(s['root'], 'final'), exist_ok=True)
    import library
    base = os.path.join(s['root'], f"final/{s['film']['slug']}.{s['film']['lang']}")
    open(base + '.srt', 'w').write('\n'.join(srt)); open(base + '.vtt', 'w').write(library.srt_to_vtt('\n'.join(srt)))
    vo['caps'] = caps; vo['burn'] = burn
    open(os.path.join(s['root'], 'app/js/words.js'), 'w').write('const VO = ' + json.dumps(vo, ensure_ascii=False) + ';\n')
    longest = max(len(c[2]) for c in cues); wide = max(len(' '.join(w[0] for w in l)) for p in burn for l in p['l'])
    print(len(cues), 'captions; longest', longest, 'chars' + ('  <- split it (aim for <= 70)' if longest > 70 else '')
          + f"; {len(burn)} burned-in pages, widest line {wide} chars" + (f"  <- over {C['max_chars']}: one word too long" if wide > C['max_chars'] else ''))


# ---------- page ----------
def cmd_page(root):
    s = spec.load(root); f = s['film']; tm = s['timing']
    film = {'slug': f['slug'], 'title': f['title'], 'lead': tm['lead'], 'tail': tm['tail'], 'wipe': tm['wipe'], 'posterOffset': f['poster_offset'], 'builders': s['app'].get('builders', []), 'endCard': s['end_card'],
            'format': f['format'], 'captions': {'burn': s['captions']['burn'], 'style': s['captions']['style']}, 'safe': f.get('safe')}
    open(os.path.join(s['root'], 'app/js/film.js'), 'w').write('const FILM = ' + json.dumps(film, ensure_ascii=False) + ';\n')
    html = open(os.path.join(spec.template_dir(f['style']), 'app/index.html')).read()
    tags = '\n'.join(f'<script charset="utf-8" src="js/{x}"></script>' for x in s['app']['scripts'])
    for k, v in {'TITLE': f['title'], 'HEADLINE': f['headline'], 'SUBHEAD': f.get('subhead', ''), 'ARIA': f['aria'], 'SCRIPTS': tags}.items():
        html = html.replace('{{' + k + '}}', v)
    open(os.path.join(s['root'], 'app/index.html'), 'w').write(html)
    missing = [x for x in s['app']['scripts'] if not os.path.exists(os.path.join(s['root'], 'app/js', x))]
    print('page written' + (f'; missing scripts: {missing}' if missing else '') + ('' if cta_set(s) else f'; {CTA_EMPTY}'))


# ---------- pictures ----------
def query(fmt=None, caps=None, safe=False):
    return '&'.join(f'{k}={v}' for k, v in (('fmt', fmt), ('caps', caps), ('safe', 1 if safe else None)) if v is not None)


def sheet(fs, dst, grid=True):
    """2x2 contact sheet of four same-size stills, or (grid False) one row scaled to a common height."""
    ins = [a for f in fs for a in ('-i', f)]
    fc = '[0][1]hstack[a];[2][3]hstack[b];[a][b]vstack' if grid else ';'.join(f'[{i}]scale=-2:960[s{i}]' for i in range(len(fs))) + ';' + ''.join(f'[s{i}]' for i in range(len(fs))) + f'hstack={len(fs)}'
    sh('ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', fc, '-q:v', 3, dst); print(dst)


def cmd_peek(root, name, *times, fmt=None, caps=None, safe=False):
    R = os.path.abspath(root)
    if fmt == 'all':
        for f in spec.FORMATS: sh(PY, f'{T}/stills.py', R, os.path.join(R, 'stills', name, f), .5, '--q', query(f, caps, safe), *times)
        for t in times: sheet([os.path.join(R, 'stills', name, f, f't{float(t):06.2f}.jpg') for f in spec.FORMATS], os.path.join(R, 'stills', f'{name}_t{float(t):06.2f}.jpg'), False)
        return
    out = os.path.join(R, 'stills', name)
    sh(PY, f'{T}/stills.py', R, out, .5, '--q', query(fmt, caps, safe), *times)
    fs = [os.path.join(out, f't{float(t):06.2f}.jpg') for t in times]
    for n in range(0, len(fs) - len(fs) % 4, 4): sheet(fs[n:n + 4], os.path.join(R, 'stills', f'{name}_{n // 4 + 1}.jpg'))
    for f in fs[len(fs) - len(fs) % 4:]: print(f)


# ---------- sound ----------
def cmd_score(root, dry=False, force=False):
    import music
    s = spec.load(root); M = s['music']
    if M['engine'] == 'library': sys.exit('music.engine is library: the score is music.clips (+ synth). Set engine hub (or elevenlabs) to compose one.')
    p = music.plan(s); music.show(s, p)
    if dry: return
    if M['engine'] == 'hub': return music.hub_jobs(s, p, os.path.abspath(__file__))
    meta = os.path.join(s['root'], f'music/{music.NAME}.json')
    if not force and os.path.exists(meta) and json.load(open(meta)).get('plan_sha') == p['sha']:
        sys.exit(f"music/{music.NAME}.wav was already composed from this plan: --force composes it again (~{p['credits']} credits)")
    music.compose(s, p)


def cmd_import_music(root, name, audio):
    import music
    music.import_music(spec.load(root), name, audio)


def cmd_audio(root):
    s = spec.load(root); R = s['root']; dur = spec.duration(s)
    if s['music']['engine'] != 'library' and not os.path.exists(os.path.join(R, 'music/composed.wav')):
        sys.exit(f"no composed score yet: `film.py score {shlex.quote(R)} --dry` shows the plan and the credits, then run it without --dry")
    for d in ['mix', 'music', 'app/audio']: os.makedirs(os.path.join(R, d), exist_ok=True)
    sh(PY, f'{T}/stills.py', R, os.path.join(R, 'stills/_cues'), .25)
    sh(PY, f'{T}/sfx.py', os.path.join(R, 'cues.json'), os.path.join(R, 'mix/sfx.wav'), dur)
    sh(PY, f'{T}/score.py', R)
    sh(PY, f'{T}/mix.py', R)
    sh('ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(R, 'mix/master.wav'), '-c:a', 'libmp3lame', '-b:a', f"{s['render']['mp3_kbps']}k", os.path.join(R, 'app/audio/mix.mp3'))
    print('app/audio/mix.mp3 written')


def cmd_render(root, name, crf=None, fmt=None, span=None, caps=None):
    R = os.path.abspath(root); os.makedirs(os.path.join(R, 'out'), exist_ok=True)
    sh(PY, f'{T}/render.py', R, os.path.join(R, f'out/{name}.mp4'), os.path.join(R, 'mix/master.wav'), crf or spec.load(R)['render']['draft_crf'],
       '--q', query(fmt, caps), *(['--span', *span] if span else []))


def cmd_build(root, name):
    cmd_audio(root); cmd_render(root, name)


def loudness(p):
    e = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    i = re.findall(r'I:\s+(-?[\d.]+) LUFS', e); tp = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', e)
    return f'{i[-1]} LUFS, true peak {tp[-1]} dBTP' if i and tp else '?'


def cmd_deliver(root, name):
    s = spec.load(root); R = s['root']; slug = s['film']['slug']; Rd = s['render']; src = os.path.join(R, f'out/{name}.mp4')
    fin = os.path.join(R, 'final'); os.makedirs(fin, exist_ok=True)
    vw, vh = map(int, subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', src], text=True).strip().split(','))
    fmt = spec.fmt_of(vw, vh); tag = '' if fmt == '16x9' else f'-{fmt}'
    big, small = f'{fin}/{slug}{tag}.mp4', f'{fin}/{slug}{tag}-720p.mp4'
    sh('ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-c:v', 'libx264', '-preset', 'slow', '-crf', Rd['final_crf'], '-tune', 'film', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', big)
    scale = f"scale={Rd['small_width']}:-2" if vw > vh else 'scale=720:-2'
    sh('ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-vf', scale + ':flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', Rd['small_crf'], '-tune', 'film', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', small)
    t = spec.duration(s) - s['film']['poster_offset']
    sh(PY, f'{T}/stills.py', R, os.path.join(R, f'stills/_poster{tag}'), 1, '--q', query(fmt), t)
    shutil.copy(os.path.join(R, f'stills/_poster{tag}/t{t:06.2f}.jpg'), f'{fin}/poster{tag}.jpg')
    for p in [big, small]: print(f'{os.path.basename(p)}: {os.path.getsize(p) / 1e6:.1f} MB, {dur_of(p):.1f}s, {loudness(p)}')
    print('captions:', sorted(os.path.basename(x) for x in glob.glob(f'{fin}/*.srt') + glob.glob(f'{fin}/*.vtt')), '| poster at', round(t, 2))


def cmd_pagecheck(root):
    sh(PY, f'{T}/pagecheck.py', os.path.abspath(root))


def cmd_artifact(root):
    s = spec.load(root); R = s['root']
    files = {os.path.relpath(f, os.path.join(R, 'app')): f for f in sorted(glob.glob(os.path.join(R, 'app/js/*.js')))}
    files.update({os.path.relpath(f, os.path.join(R, 'app')): f for f in sorted(glob.glob(os.path.join(R, 'app/img/*')))})
    files['audio/mix.mp3'] = os.path.join(R, 'app/audio/mix.mp3')
    files['src/film.yml'] = {'from': os.path.join(R, 'film.yml'), 'contentType': 'text/plain'}
    print(json.dumps({'file_path': os.path.join(R, 'app/index.html'), 'icon': s['film']['icon'], 'files': files}, indent=1))


def film_info(s):
    """What library.build needs from one film.yml (library.py itself stays standard library only)."""
    f = s['film']
    return {'root': s['root'], 'slug': f['slug'], 'lang': f['lang'], 'title': f['title'], 'subhead': f.get('subhead', ''), 'style': f['style'],
            'duration': spec.duration(s), 'sizes': spec.FORMATS, 'burned': {k: spec.burn(s, k) for k in spec.FORMATS},
            'picks': [(n, ln['pick']) for n, ln in enumerate(s['lines'], 1)], 'voice': s['voice'], 'music': s['music'],
            'brief': s.get('brief') or {}, 'rights': s.get('rights') or {}}


def cmd_publish(*roots, name=None, description=None, force=False):
    import library
    if not roots: sys.exit('publish DIR [DIR2 ...]: the delivered film folder(s), one per language, become one library asset')
    infos = [film_info(spec.load(r)) for r in roots]
    library.build(infos, os.path.join(infos[0]['root'], 'library'), name, description, force)


def cmd_upload(root, dry=False):
    import library
    library.upload(library.library_dir(root), dry)


def install_venv(whisper):
    """User space only: the tools venv in RN_VIDEO_HOME and Playwright's Chromium (in ~/Library/Caches/ms-playwright)."""
    if not os.path.exists(VENV_PY):
        if shutil.which('uv'): sh('uv', 'venv', '--python', '3.12', VENV)
        else: sh(PY, '-m', 'venv', VENV)
    pkgs = BASE_PKGS + (WHISPER_PKGS if whisper else [])
    if subprocess.run([VENV_PY, '-m', 'pip', '--version'], capture_output=True).returncode == 0: sh(VENV_PY, '-m', 'pip', 'install', '--upgrade', *pkgs)
    else: sh('uv', 'pip', 'install', '--python', VENV_PY, '--upgrade', *pkgs)
    sh(VENV_PY, '-m', 'playwright', 'install', 'chromium')


def cmd_setup(install=False, whisper=False):
    """Checks the prerequisites and prints the exact install command for each missing one. Homebrew packages are only printed."""
    if install:
        try: install_venv(whisper)
        except subprocess.CalledProcessError as e:
            sys.exit(f"setup --install stopped at: {' '.join(shlex.quote(str(x)) for x in e.cmd)}\n"
                     'Check the network (a Chromium download needs a few hundred MB) and run the same setup command again.')
        os.environ['RN_VIDEO_REEXEC'] = '1'
        os.execv(VENV_PY, [VENV_PY, os.path.abspath(__file__), 'setup'])
    import platform
    q = shlex.quote; me = q(os.path.abspath(__file__)); in_venv = os.path.realpath(sys.prefix) == os.path.realpath(VENV)
    rows, need = [], 0

    def row(ok, what, fix='', required=True):
        nonlocal need
        need += required and not ok
        rows.append(f"  {'ok' if ok else 'MISSING' if required else 'optional':<9}{what}" + ('' if ok or not fix else '\n' + '\n'.join('             $ ' + f for f in fix.split('\n'))))
    if platform.system() != 'Darwin': rows.append('  note     written for macOS; elsewhere install the same tools with your package manager')
    venv_cmds = f'python3 -m venv {q(VENV)}\n{q(VENV_PY)} -m pip install ' + ' '.join(BASE_PKGS) + f'\n{q(VENV_PY)} -m playwright install chromium'
    row(sys.version_info >= (3, 9), f"python {platform.python_version()} ({sys.executable}{', the tools venv' if in_venv else ''})", 'brew install python   # 3.9 or newer')
    miss = [p for p, m in (('pyyaml', 'yaml'), ('numpy', 'numpy'), ('playwright', 'playwright')) if not has_module(m)]
    row(not miss, 'python packages: pyyaml, numpy, playwright' + (f" (missing {', '.join(miss)})" if miss else ''), f'python3 {me} setup --install   # or by hand:\n{venv_cmds}')
    if has_module('playwright'):
        try: launched = subprocess.run([PY, '-c', 'from playwright.sync_api import sync_playwright\nwith sync_playwright() as p: p.chromium.launch().close()'], capture_output=True, timeout=180).returncode == 0
        except subprocess.TimeoutExpired: launched = False
        row(launched, 'Chromium for Playwright (renders the frames)', f'{q(PY)} -m playwright install chromium')
    brew = shutil.which('brew') or next((b for b in ('/opt/homebrew/bin/brew', '/usr/local/bin/brew') if os.path.exists(b)), None)
    ff = shutil.which('ffmpeg') and shutil.which('ffprobe')
    row(bool(ff), 'ffmpeg + ffprobe (audio, video, stills)', ('' if brew else '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"   # Homebrew first\n') + 'brew install ffmpeg')
    row(bool(shutil.which('curl')), 'curl (downloads Hub takes and music)', 'brew install curl')
    row(has_module('PIL'), 'pillow (paper-style cut-outs, tools/cutout.py)', f'python3 {me} setup --install', False)
    row(has_module('faster_whisper'), 'faster-whisper (local word timings; Hub and ElevenLabs takes do not need it)', f'python3 {me} setup --install --whisper', False)
    import eleven
    row(eleven.has_key(), f'ElevenLabs personal key (engine elevenlabs, narration and music): ELEVEN_KEY or Keychain service {eleven.SERVICE}', f'security add-generic-password -a "$USER" -s {eleven.SERVICE} -w', False)
    print('Rental Ninja video: prerequisites\n' + '\n'.join(rows))
    print(f'Tools venv and caches: {HOME} (outside the plugin, survives updates). Engine hub (narration and music) needs the Hub MCP of this plugin connected.')
    print('Ready.' if not need else f'{need} required item(s) missing: run the commands above (Homebrew ones in your own Terminal).')
    sys.exit(1 if need else 0)


def cmd_budget():
    print('Hub (engine hub, the default): narration (1 credit per character) and music (~15 credits per second) are billed to\n'
          "the company's ElevenLabs account, with no per-person cap. The Hub runs one job per person at a time (call the tools\n"
          'sequentially, never in parallel), refuses a job when the credits left are fewer than it needs (it returns a notice)\n'
          'and adds a `warning` to results when less than 10 % is left: show either to the user verbatim.\n'
          'The Hub MCP tool get_voiceover_usage shows the credits left and this month\'s spend: call it before an estimate.')
    import eleven
    if not eleven.has_key(): return print('ElevenLabs (engine elevenlabs): no personal key')
    used, limit, reset = eleven.quota(); left = limit - used
    print(f'ElevenLabs personal key: {used:,} of {limit:,} credits used this period, {left:,} left = {left:,} narration characters'
          f' or {left / 15 / 60:.1f} min of music')


def cmd_voices(q=''):
    import eleven
    for v in eleven.voices():
        lab = v.get('labels') or {}
        line = f"{v['voice_id']}  {v['name']:<28} {v.get('category', ''):<10} {' '.join(str(x) for x in lab.values())}"
        if q.lower() in line.lower(): print(line)


FLAGS = {'--lines': 1, '--takes': 1, '--force': 0, '--fmt': 1, '--caps': 1, '--span': 2, '--safe': 0, '--install': 0, '--whisper': 0, '--dry': 0,
         '--name': 1, '--description': 1}

if __name__ == '__main__':
    a = sys.argv[1:]
    if not a or a[0] in ('-h', '--help'): print(__doc__); sys.exit()
    c, rest, pos, kw = a[0], iter(a[1:]), [], {}
    for x in rest:
        if x not in FLAGS: pos.append(x); continue
        k, n = x[2:], FLAGS[x]
        kw[k] = True if n == 0 else next(rest) if n == 1 else [next(rest) for _ in range(n)]
    fn = globals().get('cmd_' + c.replace('-', '_'))
    if not fn: sys.exit(f'unknown command {c!r}: see film.py --help')
    if c not in ('setup', 'budget', 'voices', 'upload'):
        if spec is None: sys.exit(f'missing Python module {MISSING!r}: run `python3 {shlex.quote(os.path.abspath(__file__))} setup`')
        if pos: pos[0] = spec.film_root(pos[0])
    fn(*pos, **kw)

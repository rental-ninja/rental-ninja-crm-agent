#!/usr/bin/env python3
"""Hands delivered films to the Hub media library (Hub -> Marketing -> Media library). Standard library only,
Python 3.9+, system curl; ffprobe (already needed by the pipeline) only to read sizes and lengths.

Python cannot call the Hub MCP tools, so the hand-off is split between this file and Claude:

  film.py publish DIR [DIR2 ...]   build(): one asset from one or more film folders (one per language). Writes
                                   <first DIR>/library/manifest.json (files, sizes, metadata, rights, checks) and
                                   library/upload_request.json (the exact input of get_marketing_asset_upload_urls).
  Claude                           get_marketing_asset_upload_urls(upload_request.json) -> saves the result as
                                   library/upload_urls.json
  film.py upload DIR [--dry]       upload(): one curl multipart POST per file to its presigned URL (storage answers 204),
  python3 library.py upload DIR    then library/publish_request.json (name, description, rights, files with their keys)
  Claude                           publish_marketing_asset(publish_request.json) -> a DRAFT asset; saves the result as
                                   library/published.json; approved once the user says so (tool or Hub)
"""
import datetime, json, os, re, shlex, shutil, subprocess, sys

LOCALES = ('es', 'en', 'ca', 'fr', 'de', 'it', 'nl', 'pt')
CONTENT_TYPES = {'.mp4': 'video/mp4', '.webm': 'video/webm', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
                 '.webp': 'image/webp', '.vtt': 'text/vtt', '.srt': 'application/x-subrip'}
MAX_BYTES = {'video': 500 * 1024 * 1024, 'poster': 10 * 1024 * 1024, 'subtitles': 1024 * 1024}
MAX_FILES, NAME_MAX, DESCRIPTION_MAX, MUSIC_NOTE_MAX, RIGHTS_NOTE_MAX = 40, 160, 2000, 500, 2000
TEMPLATE_IMAGES = {'logo_color.svg', 'logo_neg.png', 'iso.svg'}
# Voices known to come from the public ElevenLabs Voice Library: their owner's terms decide paid-ads use.
VOICE_LIBRARY = {'1CeqBeXMOqCleeQjfYfO': 'Cristina'}
VISUALS = 'In-house flat vector animation (canvas code); Humaaans characters by Pablo Stanley (CC0); official Rental Ninja logos.'
CURL = '/usr/bin/curl' if os.path.exists('/usr/bin/curl') else shutil.which('curl')
FILM_PY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'film.py')


def srt_to_vtt(srt):
    """SubRip text -> WebVTT text (same cues, '.' before the milliseconds)."""
    body = re.sub(r'(\d{2}:\d{2}:\d{2}),(\d{3})', r'\1.\2', srt.replace('\r\n', '\n').strip())
    return 'WEBVTT\n\n' + body + '\n'


def human(n):
    return f'{n / 1e6:.1f} MB' if n >= 1e5 else f'{n / 1e3:.1f} KB'


def probe(path):
    """{width, height, duration_s} from ffprobe; {} when ffprobe is missing or cannot read it."""
    if not shutil.which('ffprobe'): return {}
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration',
                        '-of', 'json', path], capture_output=True, text=True)
    try: d = json.loads(r.stdout)
    except ValueError: return {}
    st = (d.get('streams') or [{}])[0]; out = {}
    if st.get('width'): out.update(width=int(st['width']), height=int(st['height']))
    try: out['duration_s'] = round(float(d.get('format', {}).get('duration')), 2)
    except (TypeError, ValueError): pass
    return out


def write_json(path, data):
    with open(path, 'w') as f: json.dump(data, f, indent=1, ensure_ascii=False); f.write('\n')


def read_json(path):
    with open(path) as f: return json.load(f)


def mcp_result(res, what='the saved tool result'):
    """A saved Hub tool result, unwrapped when it was saved as the MCP envelope {content: [{type: text, text: JSON}]}."""
    if not (isinstance(res, dict) and isinstance(res.get('content'), list)): return res
    if isinstance(res.get('structuredContent'), dict): return res['structuredContent']
    text = next((c.get('text') for c in res['content'] if isinstance(c, dict) and c.get('type') == 'text'), None)
    try: return json.loads(text)
    except (TypeError, ValueError): sys.exit(f'{what} is not the JSON a Hub tool returns: {str(text)[:300]}')


# ---------- publish: manifest ----------
def collect(info, problems, checks):
    """The delivered files of one film: per format its 1080p MP4, its poster and (formats without burned-in captions)
    the WebVTT subtitles. The 720p copies are for chat and email, not the library."""
    R, slug, lang = info['root'], info['slug'], info['lang']; fin = os.path.join(R, 'final'); out = []
    if lang not in LOCALES: problems.append(f'{R}: film.lang {lang!r} is not a Hub app language ({", ".join(LOCALES)})'); return out

    def add(path, name, role, fmt, w, h, video=False):
        size = os.path.getsize(path); meta = probe(path) if role != 'subtitles' else {}
        if size > MAX_BYTES[role]: problems.append(f'{os.path.relpath(path, R)}: {human(size)}, a {role} takes at most {human(MAX_BYTES[role])}')
        f = {'filename': name, 'path': path, 'size_bytes': size, 'content_type': CONTENT_TYPES[os.path.splitext(name)[1]], 'locale': lang, 'format': fmt, 'role': role}
        if role != 'subtitles': f.update(width=meta.get('width', w), height=meta.get('height', h))
        if video: f['duration_s'] = meta.get('duration_s', info['duration'])
        out.append(f)
    for fmt, (w, h) in info['sizes'].items():
        tag = '' if fmt == '16x9' else f'-{fmt}'; video = os.path.join(fin, f'{slug}{tag}.mp4'); base = f'{slug}-{fmt}-{lang}'
        if not os.path.exists(video): continue
        add(video, base + '.mp4', 'video', fmt, w, h, True)
        poster = os.path.join(fin, f'poster{tag}.jpg')
        if os.path.exists(poster): add(poster, base + '-poster.jpg', 'poster', fmt, w, h)
        else: checks.append(f'{slug} {fmt}: no final/poster{tag}.jpg (deliver writes it): the library shows the video without a poster')
        if info['burned'][fmt]: continue
        vtt, srt = (os.path.join(fin, f'{slug}.{lang}.{x}') for x in ('vtt', 'srt'))
        if os.path.exists(srt) and (not os.path.exists(vtt) or os.path.getmtime(vtt) < os.path.getmtime(srt)):
            with open(srt) as a, open(vtt, 'w') as b: b.write(srt_to_vtt(a.read()))
        if os.path.exists(vtt): add(vtt, base + '.vtt', 'subtitles', fmt, w, h)
        else: checks.append(f'{slug} {fmt}: no subtitles (final/{slug}.{lang}.srt is missing: run `film.py captions`)')
    imgs = sorted(set(os.listdir(os.path.join(R, 'app/img'))) - TEMPLATE_IMAGES) if os.path.isdir(os.path.join(R, 'app/img')) else []
    if imgs and not info['rights'].get('visuals'):
        checks.append(f"{slug}: app/img holds {', '.join(imgs)}: say where they come from (screenshot, stock, own photo) in film.yml rights.visuals")
    return out


def voice_of(info, checks):
    """(voice_id, voice_name, from_voice_library) of one film: the voice of the picked Hub takes, else film.yml voice.voice."""
    V = info['voice']; ids = []
    for n, pick in info['picks']:
        p = os.path.join(info['root'], f'vo/lines/l{n}_{pick}.hub.json')
        if os.path.exists(p):
            vid = mcp_result(read_json(p), p).get('voice_id')
            if vid and vid not in ids: ids.append(vid)
    if V.get('voice') and V['voice'] not in ids: ids.append(V['voice'])
    if len(ids) > 1: checks.append(f"{info['slug']}: the picked takes use {len(ids)} voices ({', '.join(ids)}): the rights record the first")
    vid = ids[0] if ids else None; name = V.get('name') or VOICE_LIBRARY.get(vid or '')
    if not vid: checks.append(f"{info['slug']}: voice id unknown (no Hub take results): set voice.voice in film.yml")
    if not name: checks.append(f"{info['slug']}: voice name unknown: set voice.name in film.yml from list_marketing_voices")
    lib = V.get('from_voice_library')
    if lib is None:
        lib = True
        if vid not in VOICE_LIBRARY:
            checks.append(f"{info['slug']}: is voice {name or vid} from the public ElevenLabs Voice Library? Recorded as yes (paid ads: check first) "
                          'until film.yml says voice.from_voice_library: false (a premade or company voice)')
    return vid, name, bool(lib)


def music_of(info, checks):
    """rights.music of one film: ElevenLabs only when its composed score exists; None when it has no music at all."""
    M, slug, R = info['music'], info['slug'], info['root']
    note = lambda parts: '; '.join(p for p in parts if p)[:MUSIC_NOTE_MAX] or None
    if M['engine'] == 'library':
        if not M.get('licence'): checks.append(f"{slug}: music.engine library: write the music's licence in film.yml music.licence")
        return {'provider': M.get('provider') or 'library', 'model': None, 'note': note([M.get('licence')])}
    extra = []
    if M.get('clips'):
        extra.append('clips: ' + ', '.join(os.path.basename(c['file']) for c in M['clips']))
        checks.append(f"{slug}: music.clips in the mix: name their licence in film.yml rights.other")
    if M.get('synth'): extra.append('in-house synthesised cues')
    if os.path.exists(os.path.join(R, 'music/composed.wav')):
        meta = os.path.join(R, 'music/composed.json'); model = (read_json(meta).get('model') if os.path.exists(meta) else None) or M['model']
        return {'provider': 'elevenlabs', 'model': model, 'note': note(['plus ' + x for x in extra])}
    if not extra:
        checks.append(f"{slug}: no composed score (music/composed.wav) and no clips or synth: recorded as a film without music")
        return None
    checks.append(f"{slug}: no composed score (music/composed.wav): the music is recorded as {' and '.join(extra)}, not ElevenLabs")
    return {'provider': 'in-house' if not M.get('clips') else 'film clips', 'model': None, 'note': note(extra)}


def rights_of(infos, checks):
    voices = [(i['lang'],) + voice_of(i, checks) for i in infos]; musics = [music_of(i, checks) for i in infos]
    first = voices[0]; ids = []
    for v in voices:
        if v[1] and v[1] not in ids: ids.append(v[1])
    joined = ', '.join(ids)
    voice = {'provider': 'elevenlabs', 'voice_id': joined if len(joined) <= 64 else first[1],
             'voice_name': ', '.join(f'{v[2] or v[1]} ({v[0]})' for v in voices)[:120] if len(voices) > 1 else first[2],
             'from_voice_library': any(v[3] for v in voices)}
    other = [x for x in (i['rights'].get('other') for i in infos) if x]
    if len(voices) > 1: other.insert(0, 'Voices per language: ' + '; '.join(f"{v[0]} {v[2] or '?'} {v[1] or '?'}{' (Voice Library)' if v[3] else ''}" for v in voices))
    if any(m != musics[0] for m in musics):
        other.append('Music per film: ' + '; '.join(f"{i['lang']} {m['provider']} {m['model'] or ''}".strip() if m else f"{i['lang']} none"
                                                     for i, m in zip(infos, musics)))
    visuals = ' '.join(dict.fromkeys([VISUALS] + [i['rights']['visuals'] for i in infos if i['rights'].get('visuals')]))
    return {'voice': voice, 'music': musics[0], 'visuals': visuals[:1000], 'other': '; '.join(other)[:1000] or None}


def rights_note(rights):
    """The media library keeps rights as one free-text note: voice, music, visuals and anything else, one per line."""
    v, m = rights['voice'], rights['music']
    lines = [f"Voice: {v['provider']} {v['voice_name'] or '?'} ({v['voice_id'] or '?'}){', public Voice Library' if v['from_voice_library'] else ''}",
             f"Music: {m['provider']} {m.get('model') or ''}{'; ' + m['note'] if m.get('note') else ''}".rstrip() if m else 'Music: none',
             f"Visuals: {rights['visuals']}"]
    if rights['other']: lines.append(f"Other: {rights['other']}")
    return '\n'.join(lines)[:RIGHTS_NOTE_MAX]


def strip_html(s):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>|&[a-z]+;', ' ', s or '')).strip()


def describe(infos, files):
    i = infos[0]; b = i['brief']; parts = []
    if i.get('subhead'): parts.append(strip_html(i['subhead']) + '.')
    if b.get('goal'): parts.append(f"Goal: {b['goal']}.")
    if b.get('audience'): parts.append(f"Audience: {b['audience']}.")
    item = lambda x: ', '.join(f'{k}: {v}' for k, v in x.items()) if isinstance(x, dict) else str(x)
    if b.get('features'): parts.append('Shows: ' + '; '.join(item(x) for x in b['features']) + '.')
    fm = sorted({f['format'] for f in files if f['role'] == 'video'}); lg = sorted({f['locale'] for f in files})
    parts.append(f"Formats: {', '.join(fm)}. Languages: {', '.join(lg)}. Made with the Rental Ninja video skill.")
    return ' '.join(parts)[:DESCRIPTION_MAX]


def build(infos, lib, name=None, description=None, force=False):
    """infos: one dict per film (film.py publish builds them from film.yml). Writes the manifest and prints the plan."""
    os.makedirs(lib, exist_ok=True); done = os.path.join(lib, 'published.json')
    if os.path.exists(done) and not force:
        d = read_json(done)
        sys.exit(f"already published as asset #{d.get('asset_id')} ({d.get('hub_url')}): add the new files in the Hub, or `publish ... --force` for a new asset")
    problems, checks, files = [], [], []
    for info in infos: files += collect(info, problems, checks)
    if not any(f['role'] == 'video' for f in files): problems.append('no delivered video in final/: run `film.py deliver DIR NAME` first')
    seen = {}
    for f in files:
        k = (f['locale'], f['format'], f['role'])
        if k in seen: problems.append(f"two films deliver the {f['format']} {f['role']} in {f['locale']}: {seen[k]} and {f['path']}")
        seen[k] = f['path']
    if len(files) > MAX_FILES: problems.append(f'{len(files)} files, an asset takes at most {MAX_FILES}')
    if problems: sys.exit('cannot publish:\n  ' + '\n  '.join(problems))
    if not any(f['format'] == '16x9' and f['role'] == 'video' for f in files):
        checks.append('no 16x9 video: in-app popups and email thumbnails use the 16x9 files (render and deliver one with --fmt 16x9)')
    rights = rights_of(infos, checks)
    name = (name or f"{infos[0]['title']} ({round(infos[0]['duration'])} s)")[:NAME_MAX]
    man = {'built_at': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'), 'films': [i['root'] for i in infos],
           'name': name, 'description': (description or describe(infos, files))[:DESCRIPTION_MAX], 'rights': rights, 'files': files, 'checks': checks}
    write_json(os.path.join(lib, 'manifest.json'), man)
    write_json(os.path.join(lib, 'upload_request.json'), {'files': [{k: f[k] for k in ('filename', 'size_bytes', 'content_type', 'locale', 'format', 'role')} for f in files]})
    for stale in ('upload_urls.json', 'uploaded.json', 'publish_request.json'):
        p = os.path.join(lib, stale)
        if os.path.exists(p): os.remove(p)
    print(f'Media library asset: "{name}" ({len(files)} files)')
    for f in files:
        dims = f"{f['width']}x{f['height']}" if f.get('width') else ''
        print(f"  {f['role']:<9} {f['format']:<4} {f['locale']}  {f['filename']:<44} {human(f['size_bytes']):>9}  {dims:<9} "
              f"{str(f['duration_s']) + ' s' if 'duration_s' in f else '':<8} <- {os.path.relpath(f['path'], os.path.dirname(os.path.dirname(os.path.dirname(f['path']))))}")
    print('rights:\n  ' + rights_note(rights).replace('\n', '\n  '))
    print(f'description: {man["description"]}')
    for c in checks: print(f'CHECK  {c}')
    q = shlex.quote
    print(f'\nNext (Python cannot call the Hub; you do, in this order):\n'
          f'  1. Show the user the name, description, files and rights above; fix film.yml or pass --name/--description and re-run.\n'
          f'  2. Call get_marketing_asset_upload_urls with the JSON in {q(os.path.join(lib, "upload_request.json"))}\n'
          f'     and save its JSON result to {q(os.path.join(lib, "upload_urls.json"))} (the URLs last 30 minutes).\n'
          f'  3. Run: python3 {q(FILM_PY)} upload {q(os.path.dirname(lib))}\n'
          f'     (one curl POST per file, storage answers 204; then it writes library/publish_request.json)\n'
          f'  4. Call publish_marketing_asset with the JSON in library/publish_request.json, exactly as written, and save its result\n'
          f'     to library/published.json. The asset is a DRAFT: give the user its hub_url; once they say so,\n'
          f'     approve it (manage_marketing_asset action approve, or Hub -> Marketing -> Media library).')


# ---------- upload ----------
def tickets_of(res):
    """The `files` of a saved get_marketing_asset_upload_urls result (also when saved inside an MCP content wrapper)."""
    res = mcp_result(res, 'upload_urls.json')
    if not isinstance(res, dict) or not isinstance(res.get('files'), list): sys.exit('upload_urls.json: expected the tool result {files: [...], expires_at}')
    return res['files'], res.get('expires_at')


def expired(at):
    if not at: return False
    t = datetime.datetime.fromisoformat(at.replace('Z', '+00:00'))
    return t <= datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=30)


def curl_cmd(t, path):
    fields = [x for k, v in t['upload_fields'].items() for x in ('--form-string', f'{k}={v}')]
    return [CURL, '-q', '-sS', '--retry', '2', '--connect-timeout', '30', '-w', '%{http_code}', *fields,
            '-F', f"file=@{os.path.basename(path)};type={t['content_type']}", t['upload_url']]


def upload(lib, dry=False):
    """POSTs every file of library/manifest.json to the presigned URLs in library/upload_urls.json, then writes
    library/publish_request.json. Progress is kept in library/uploaded.json, so a re-run skips what already went up."""
    man_p, urls_p, prog_p = (os.path.join(lib, x) for x in ('manifest.json', 'upload_urls.json', 'uploaded.json'))
    if not os.path.exists(man_p): sys.exit(f'no {man_p}: run `film.py publish DIR` first')
    if not os.path.exists(urls_p): sys.exit(f'no {urls_p}: call get_marketing_asset_upload_urls with library/upload_request.json and save its result there')
    if not CURL: sys.exit('curl is missing (macOS ships it as /usr/bin/curl)')
    man = read_json(man_p); tickets, at = tickets_of(read_json(urls_p)); by_name = {f['filename']: f for f in man['files']}
    got = [t.get('filename') for t in tickets]
    if sorted(got) != sorted(by_name):
        sys.exit('upload_urls.json does not match the manifest (missing: ' + (', '.join(sorted(set(by_name) - set(got))) or '-') + '; unknown: '
                 + (', '.join(sorted(set(got) - set(by_name))) or '-') + '): call get_marketing_asset_upload_urls again with library/upload_request.json')
    if expired(at) and not dry: sys.exit(f'the upload URLs expired at {at}: call get_marketing_asset_upload_urls again with library/upload_request.json, save the result, re-run')
    prog = read_json(prog_p) if os.path.exists(prog_p) else {}
    for t in tickets:
        f = by_name[t['filename']]; path = f['path']
        if not os.path.exists(path) or os.path.getsize(path) != f['size_bytes']:
            sys.exit(f'{path} is missing or changed since `publish`: run `film.py publish` again (it asks for new URLs)')
        if t['key'] in prog: print(f"  done    {t['filename']}"); continue
        cmd = curl_cmd(t, path)
        if dry:
            print(f"  (cd {shlex.quote(os.path.dirname(path))} && {' '.join(shlex.quote(x) for x in cmd)})"); continue
        print(f"  upload  {t['filename']} ({human(f['size_bytes'])})", flush=True)
        r = subprocess.run(cmd, cwd=os.path.dirname(path), capture_output=True, text=True)
        code, body = r.stdout[-3:], r.stdout[:-3].strip()
        if r.returncode or code not in ('200', '201', '204'):
            sys.exit(f"upload of {t['filename']} failed (curl exit {r.returncode}, HTTP {code or '-'}): {(body or r.stderr).strip()[:600]}\n"
                     'Files already uploaded are kept in library/uploaded.json; fix the cause and run `film.py upload` again.')
        prog[t['key']] = t['filename']; write_json(prog_p, prog)
    if dry: return print('dry run: nothing was sent')
    keys = {t['filename']: t['key'] for t in tickets}
    req = {'name': man['name'], 'description': man['description'], 'rights_note': rights_note(man['rights']),
           'files': [{'key': keys[f['filename']], **{k: f[k] for k in ('locale', 'format', 'role', 'duration_s', 'width', 'height') if f.get(k) is not None}} for f in man['files']]}
    out = os.path.join(lib, 'publish_request.json'); write_json(out, req)
    print(f'{len(tickets)} files on storage. Now call publish_marketing_asset with the JSON in {out}, exactly as written,\n'
          'save its result to library/published.json and give the user the hub_url: the asset is a draft\n'
          'until it is approved (manage_marketing_asset action approve, or Hub -> Marketing -> Media library), once the user says so.')


def library_dir(root):
    root = os.path.abspath(os.path.expanduser(root))
    return root if os.path.basename(root) == 'library' else os.path.join(root, 'library')


if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) < 2 or a[0] != 'upload': sys.exit('usage: python3 library.py upload FILM_DIR [--dry]   (publish runs through film.py publish)')
    upload(library_dir(a[1]), '--dry' in a)

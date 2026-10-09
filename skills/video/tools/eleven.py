"""ElevenLabs narration and music with a personal key (engine elevenlabs; the team default, engine hub, needs none). The key comes from
ELEVEN_KEY or the macOS Keychain (service elevenlabs-api-key), never from a repo .env."""
import base64, json, os, re, shutil, subprocess, urllib.error, urllib.request

API = 'https://api.elevenlabs.io/v1'
SERVICE = 'elevenlabs-api-key'


def key():
    k = os.environ.get('ELEVEN_KEY')
    if k: return k
    r = subprocess.run(['security', 'find-generic-password', '-s', SERVICE, '-w'], capture_output=True, text=True)
    if r.returncode: raise SystemExit(f'no ElevenLabs key: export ELEVEN_KEY or run security add-generic-password -a "$USER" -s {SERVICE} -w (engine hub needs no key)')
    return r.stdout.strip()


def has_key():
    if os.environ.get('ELEVEN_KEY'): return True
    return bool(shutil.which('security')) and subprocess.run(['security', 'find-generic-password', '-s', SERVICE], capture_output=True).returncode == 0


class Error(SystemExit):
    def __init__(self, code, msg): super().__init__(msg); self.code = code


def call(path, body=None, query=''):
    req = urllib.request.Request(f'{API}/{path}{query}', data=json.dumps(body).encode() if body is not None else None,
                                 headers={'xi-api-key': key(), 'Content-Type': 'application/json'})
    try:
        return urllib.request.urlopen(req, timeout=600)
    except urllib.error.HTTPError as e:
        try: detail = json.loads(e.read() or b'{}').get('detail', {})
        except ValueError: detail = {}
        raise Error(e.code, f"ElevenLabs {e.code} on {path}: {detail.get('message', detail) if isinstance(detail, dict) else detail}")


def char_words(al):
    """ElevenLabs character alignment -> [{word, start, end}]; [audio tags] and punctuation-only tokens are dropped."""
    out, cur, depth = [], None, 0
    for ch, a, b in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if ch == '[': depth += 1
        if depth or ch.isspace():
            if cur: out.append(cur); cur = None
            if ch == ']': depth = max(0, depth - 1)
            continue
        if cur: cur['word'] += ch; cur['end'] = b
        else: cur = {'word': ch, 'start': a, 'end': b}
    if cur: out.append(cur)
    return [{**w, 'start': round(w['start'], 3), 'end': round(w['end'], 3)} for w in out if re.sub(r'\W', '', w['word'])]


def tts(text, voice, model, settings, out_mp3, words=None):
    """One take. With `words` (a path) it uses /with-timestamps and saves the word timings there as well."""
    s = dict(settings or {})
    body = {'text': text, 'model_id': model, 'voice_settings': {k: v for k, v in s.items() if k != 'language'}}
    if s.get('language'): body['language_code'] = s['language']
    if words:
        try:
            d = json.load(call(f'text-to-speech/{voice}/with-timestamps', body, '?output_format=mp3_44100_128'))
            open(out_mp3, 'wb').write(base64.b64decode(d['audio_base64']))
            ws = char_words(d.get('alignment') or d['normalized_alignment'])
            json.dump({'source': 'elevenlabs', 'text': ' '.join(w['word'] for w in ws), 'words': ws}, open(words, 'w'))
            return True
        except Error as e:
            if e.code not in (400, 404, 422): raise
            print('no timestamps for this model, falling back to plain TTS:', e)
    open(out_mp3, 'wb').write(call(f'text-to-speech/{voice}', body, '?output_format=mp3_44100_128').read())
    return False


def music(body, out_mp3, fmt='mp3_44100_128'):
    """One ElevenLabs Music generation (POST /v1/music) -> out_mp3; returns the response headers (song-id, ...)."""
    r = call('music', body, f'?output_format={fmt}')
    open(out_mp3, 'wb').write(r.read())
    return {k.lower(): v for k, v in r.headers.items()}


def voices():
    return json.load(call('voices'))['voices']


def quota():
    d = json.load(call('user/subscription'))
    return d['character_count'], d['character_limit'], d.get('next_character_count_reset_unix')

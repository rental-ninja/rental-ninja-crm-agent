"""Loads a film's film.yml and fills in the series defaults."""
import copy, os, re
import yaml

SKILL = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

DEFAULTS = {
    'film': {'lang': 'en', 'poster_offset': 2.2, 'icon': 'video', 'style': 'flat', 'format': '16x9'},
    'captions': {'burn': None, 'style': 'pill', 'max_chars': 32, 'max_lines': 2},
    'timing': {'first_line_at': 1.6, 'default_gap': 1.35, 'lead': .55, 'tail': 5.2, 'wipe': .34},
    'voice': {
        'engine': 'hub', 'voice': None, 'name': None, 'from_voice_library': None, 'model': 'eleven_v4', 'takes': ['a', 'b', 'c'],
        'settings': {'stability': .5, 'similarity_boost': .8, 'use_speaker_boost': True},
        'chain': ('silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,areverse,'
                  'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse,'
                  'highpass=f=70,equalizer=f=250:t=q:w=1.2:g=-1.5,equalizer=f=3500:t=q:w=1.5:g=1.5,equalizer=f=7500:t=q:w=2:g=-1,'
                  'acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2,loudnorm=I=-18:TP=-2:LRA=7,'
                  'afade=t=in:d=0.01,areverse,afade=t=in:d=0.04,areverse'),
    },
    'stt': {'model': 'small'},
    'music': {'engine': 'hub', 'model': 'music_v2_5', 'seed': None, 'prompt': None, 'adherence': 'high', 'gain_db': 0.0,
              'style': ['108 BPM', 'G major', 'warm playful acoustic pop', 'marimba melody', 'plucked and strummed acoustic guitar', 'ukulele',
                        'upright bass', 'light drum kit and shaker', 'optimistic brand video tone', 'clean studio production', 'instrumental'],
              'negative': ['vocals', 'singing', 'lyrics', 'choir', 'heavy drums', 'distorted guitar', 'EDM drop', 'dark', 'sad', 'silence', 'long pauses'],
              'sections': [], 'stops': [], 'ending': None, 'crossfade': .8, 'ref_db': -12.0, 'clips': [], 'synth': []},
    'mix': {'vo_lufs': -18, 'music_lufs': -24, 'sfx_lufs': -31, 'duck_db': 5.0, 'duck_hold': 1.7,
            'ride': {'ratio': .5, 'max_db': 7.0}, 'intro_swell': {'db': 5.0, 'until': 1.7}, 'outro_lift': {'db': 3.0, 'from': None},
            'master_lufs': -14, 'limit': .83, 'room_db': -62, 'fade_out': 1.8},
    'render': {'fps': 12, 'out_fps': 24, 'draft_crf': 16, 'final_crf': 19, 'small_crf': 23, 'small_width': 1280, 'mp3_kbps': 192},
    'app': {'scripts': ['words.js', 'film.js', 'engine.js', 'kit.js', 'boot.js', 'fx.js', 'endcard.js', 'scenes.js', 'main.js'], 'builders': ['buildEndCard']},
    'end_card': {'tagline': 'Your whole rental business, in one place.', 'cta': 'Book a demo', 'url': 'rental-ninja.com'},
    'rights': {'visuals': None, 'other': None},
}


# The Rental Ninja house style (flat vector, Humaaans cast, red banner + corner watermark) is the default;
# style: paper keeps the original paper-craft stop-motion engine.
STYLE = {
    'flat': {'render': {'fps': 25, 'out_fps': 25},
             'app': {'scripts': ['words.js', 'film.js', 'flat.js', 'folk.js', 'palette.js', 'world.js', 'hands.js', 'hum_data.js', 'hum_rig.js',
                                 'person.js', 'brand.js', 'endcard.js', 'scenes.js', 'main_flat.js'], 'builders': []}},
    'paper': {},
}


# Voice engines: hub (the default) = ElevenLabs voices through the Hub MCP tool generate_voiceover, no local key
# (voice None = the brand voice for film.lang, from the Hub tool list_marketing_voices); elevenlabs = the same API with a
# personal key. `settings` are the API voice_settings (plus optional `language`, a two-letter code for the flash/turbo
# v2.5 models). `name` and `from_voice_library` only feed the media library rights (`film.py publish`).
VOICE_ENGINES = ('hub', 'elevenlabs')


# Music engines: hub (the default) = ElevenLabs Music through the Hub MCP tool generate_music, from a plan built on the
# film's timing (tools/music.py); elevenlabs = the same with a personal key; library = only music.clips (+ synth), e.g.
# licensed music in the film folder. A film.yml with music.clips and no music.engine keeps library.
MUSIC_ENGINES = ('hub', 'elevenlabs', 'library')


# Canvas sizes. Scenes are always composed on the 1920x1080 stage; other formats adapt it (main_flat.js) unless a
# scene draws its own layout. 9x16 = Reels/Stories, 1x1 and 4x5 = feed, 16x9 = YouTube, web, in-app popups.
FORMATS = {'16x9': (1920, 1080), '9x16': (1080, 1920), '1x1': (1080, 1080), '4x5': (1080, 1350)}


def fmt_of(w, h):
    return min(FORMATS, key=lambda k: abs(FORMATS[k][0] / FORMATS[k][1] - w / h))


def burn(s, fmt=None):
    b = s['captions']['burn']
    return (fmt or s['film']['format']) != '16x9' if b is None else bool(b)


def template_dir(style):
    return os.path.join(SKILL, 'template_flat' if style == 'flat' else 'template')


def merge(base, over):
    out = copy.deepcopy(base)
    for k, v in (over or {}).items():
        out[k] = merge(out[k], v) if isinstance(v, dict) and isinstance(out.get(k), dict) else v
    return out


def film_root(root):
    """Absolute film folder; refuses one inside the skill, which a plugin update replaces."""
    root = os.path.abspath(os.path.expanduser(root)); real, skill = os.path.realpath(root), os.path.realpath(SKILL)
    if real == skill or real.startswith(skill + os.sep):
        raise SystemExit(f'{root} is inside the skill folder: keep films elsewhere, e.g. ~/Videos/rn-films/<slug> (copy a reference there first)')
    return root


def load(root):
    root = film_root(root)
    raw = yaml.safe_load(open(os.path.join(root, 'film.yml')))
    style = (raw.get('film') or {}).get('style', DEFAULTS['film']['style'])
    s = merge(merge(DEFAULTS, STYLE.get(style, {})), raw)
    s['root'] = root
    if s['voice']['engine'] not in VOICE_ENGINES: raise SystemExit(f"voice.engine {s['voice']['engine']!r}: one of {', '.join(VOICE_ENGINES)}")
    mus = raw.get('music') or {}
    if 'engine' not in mus and mus.get('clips'): s['music']['engine'] = 'library'
    if s['music']['engine'] not in MUSIC_ENGINES: raise SystemExit(f"music.engine {s['music']['engine']!r}: one of {', '.join(MUSIC_ENGINES)}")
    for i, ln in enumerate(s['lines']):
        if isinstance(ln, str):
            s['lines'][i] = ln = {'text': ln}
        ln.setdefault('pick', s['voice']['takes'][0])
    return s


norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())


def vo_data(s):
    import json
    path = os.path.join(s['root'], 'app/js/words.js')
    return json.loads(open(path).read().split('=', 1)[1].rstrip(';\n'))


def duration(s, vo=None):
    vo = vo or vo_data(s)
    return round((vo['vo'][-1]['end'] + s['timing']['tail']) * 2) / 2

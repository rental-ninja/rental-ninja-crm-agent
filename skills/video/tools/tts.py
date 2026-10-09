"""One narration take with a personal ElevenLabs key. usage: tts.py elevenlabs VOICE MODEL text.txt out_base [settings JSON]
-> out_base.wav (48 kHz mono) + out_base.words.json (word timings). The team default, engine hub, does not use it."""
import json, os, subprocess, sys
import eleven
engine, voice, model, textfile, out = sys.argv[1:6]
settings = sys.argv[6] if len(sys.argv) > 6 else ''
if engine != 'elevenlabs': sys.exit(f'engine {engine!r}: tts.py only records with elevenlabs (engine hub goes through the Hub)')
text = open(textfile).read().strip()
if os.path.exists(out + '.words.json'): os.remove(out + '.words.json')
raw = out + '.mp3'
timed = eleven.tts(text, voice, model, json.loads(settings or '{}'), raw, out + '.words.json')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', raw, '-ar', '48000', '-ac', '1', out + '.wav'], check=True)
os.remove(raw)
print(out, 'audio/mpeg (elevenlabs' + (', word timings' if timed else '') + ')')

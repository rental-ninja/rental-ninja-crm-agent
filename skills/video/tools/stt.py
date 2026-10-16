"""Local word-level transcription with faster-whisper. usage: stt.py LANG MODEL out_dir file.wav ..."""
import json, os, sys
from faster_whisper import WhisperModel
lang, size, out = sys.argv[1:4]
try:
    m = WhisperModel(size, device='cpu', compute_type='int8', local_files_only=True)
except Exception:
    m = WhisperModel(size, device='cpu', compute_type='int8')
os.makedirs(out, exist_ok=True)
for f in sys.argv[4:]:
    segs, info = m.transcribe(f, language=lang, word_timestamps=True, beam_size=5, vad_filter=False, condition_on_previous_text=False)
    words = [{'word': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3), 'p': round(w.probability, 3)} for s in segs for w in s.words]
    json.dump({'text': ' '.join(w['word'] for w in words), 'words': words}, open(os.path.join(out, os.path.basename(f).rsplit('.', 1)[0] + '.json'), 'w'))
    print(os.path.basename(f), '|', ' '.join(w['word'] for w in words), flush=True)

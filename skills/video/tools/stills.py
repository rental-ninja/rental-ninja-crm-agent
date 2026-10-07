"""Frames at given film times (JPEG) and the cue list. usage: stills.py ROOT outdir scale [--q QUERY] t1 t2 ...  (no times: only cues.json)
QUERY is passed to the page, e.g. fmt=9x16&caps=karaoke."""
import asyncio, base64, json, os, subprocess, sys
from page import film_page


async def main(root, outdir, scale, times, query):
    log = []
    async with film_page(root, log=log, query=query) as pg:
        os.makedirs(outdir, exist_ok=True)
        for t in times:
            d = await pg.evaluate(f'window.__frame({t}, "image/jpeg", .9)')
            fn = os.path.join(outdir, f't{t:06.2f}.jpg'); open(fn, 'wb').write(base64.b64decode(d.split(',')[1]))
            if scale != 1: subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', fn, '-vf', f'scale=trunc(iw*{scale}/2)*2:-2', fn])
        json.dump(await pg.evaluate('window.__cues()'), open(os.path.join(root, 'cues.json'), 'w'))
    for l in log[:30]: print(l)

a = sys.argv[4:]; q = ''
if a[:1] == ['--q']: q, a = a[1], a[2:]
asyncio.run(main(os.path.abspath(sys.argv[1]), sys.argv[2], float(sys.argv[3]), [float(x) for x in a], q))

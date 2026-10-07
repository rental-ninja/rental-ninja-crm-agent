"""Renders every frame through the page and muxes the master audio.
usage: render.py ROOT out.mp4 audio.wav [crf] [--q QUERY] [--span A B]   (QUERY e.g. fmt=9x16; span = film seconds A..B;
no audio file yet = silent track)"""
import asyncio, base64, json, os, subprocess, sys, time
import spec
from page import film_page


async def main(root, out, audio, crf, query, span):
    s = spec.load(root); R = s['render']; fps = R['fps']
    a0 = span[0] if span else 0
    src = ['-ss', str(a0), '-i', audio] if os.path.exists(audio) else ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo']
    if not os.path.exists(audio): print('no', audio, 'yet: silent render')
    ff = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', str(fps), '-c:v', 'png', '-i', '-', *src,
        '-map', '0:v', '-map', '1:a', '-r', str(R['out_fps']), '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-tune', 'film', '-pix_fmt', 'yuv420p',
        '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
        '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    log = []
    try:
        async with film_page(root, log=log, query=query) as pg:
            if not span: json.dump(await pg.evaluate('window.__cues()'), open(os.path.join(root, 'cues.json'), 'w'))
            dur = await pg.evaluate('DURATION'); b = min(dur, span[1]) if span else dur
            f0, n = int(a0 * fps), int(b * fps); t0 = time.time()
            for i in range(f0, n):
                d = await pg.evaluate(f'window.__frame({(i + .5) / fps})')
                ff.stdin.write(base64.b64decode(d.split(',', 1)[1]))
                if (i - f0) % 240 == 0: print(f'frame {i - f0}/{n - f0}  {time.time() - t0:.0f}s', flush=True)
    finally:
        ff.stdin.close(); ff.wait()
    for l in log[:20]: print(l)
    print('done', out)

a = sys.argv[1:]; q = ''; span = None; pos = []
it = iter(a)
for x in it:
    if x == '--q': q = next(it)
    elif x == '--span': span = [float(next(it)), float(next(it))]
    else: pos.append(x)
asyncio.run(main(os.path.abspath(pos[0]), pos[1], pos[2], pos[3] if len(pos) > 3 else spec.load(pos[0])['render']['draft_crf'], q, span))

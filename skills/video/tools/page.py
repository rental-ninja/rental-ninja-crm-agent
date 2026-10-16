"""Headless Chromium on a film's app/ folder, served from a free local port."""
import contextlib, os, socket, subprocess, sys, time
from playwright.async_api import async_playwright


def free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0)); return s.getsockname()[1]


@contextlib.asynccontextmanager
async def film_page(root, width=1920, height=1080, render=True, log=None, query=''):
    port = free_port(); app = os.path.join(root, 'app')
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1'], cwd=app, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(.6)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(args=['--disable-gpu-vsync'])
            pg = await b.new_page(viewport={'width': width, 'height': height})
            sink = log if log is not None else []
            pg.on('pageerror', lambda e: sink.append('PAGEERROR: ' + str(e)))
            pg.on('console', lambda m: m.type in ('error', 'warning') and sink.append(m.type + ': ' + m.text))
            await pg.goto(f'http://127.0.0.1:{port}/index.html?' + ('render=1&' if render else '') + query)
            await pg.evaluate('window.__ready')
            yield pg
            await b.close()
    finally:
        srv.terminate()

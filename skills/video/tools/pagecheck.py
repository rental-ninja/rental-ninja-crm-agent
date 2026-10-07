"""Player page at desktop and phone width: horizontal overflow and console errors. usage: pagecheck.py ROOT"""
import asyncio, os, sys
from page import film_page


async def main(root):
    for w, h in [(1280, 860), (400, 760)]:
        log = []
        async with film_page(root, w, h, render=False, log=log) as pg:
            await pg.wait_for_timeout(400)
            sw = await pg.evaluate('document.documentElement.scrollWidth')
            await pg.screenshot(path=os.path.join(root, f'stills/page_{w}.png'))
        print(w, 'scrollWidth', sw, 'OK' if sw <= w else 'OVERFLOW', log)

asyncio.run(main(os.path.abspath(sys.argv[1])))

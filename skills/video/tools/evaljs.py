"""Evaluates an expression in the loaded film page. usage: evaljs.py ROOT 'expr'"""
import asyncio, os, sys
from page import film_page


async def main(root, js):
    async with film_page(root) as pg:
        print(await pg.evaluate(js))

asyncio.run(main(os.path.abspath(sys.argv[1]), sys.argv[2]))

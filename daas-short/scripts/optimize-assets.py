#!/usr/bin/env python3
"""Resize the 3000–5000px source collages from ../project/assets down to
render size (the comp is 1080 x 1920; every image is exported at ~1.5x its
on-screen size so it stays crisp in the H.264 encode) and re-encode as WebP.
Cut-outs keep their alpha. Requires Pillow: python3 -m pip install pillow

Run from anywhere: python3 scripts/optimize-assets.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT.parent / 'project' / 'assets'
OUT = ROOT / 'public' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)

# name -> (source file, max width, max height, quality)
PLAN = {
    'woman-budget':  ('woman-budget.png', 1140, 1140, 90),  # S1 hero cut-out, shown 760px tall
    'woman-laptop':  ('woman-laptop.jpg', 1000, 1500, 86),  # S2 figure, shown 820px wide
    'jump-graph':    ('jump-graph.jpg',   1300,  870, 86),  # S3 collage, shown 1080px wide
    'rocket-man':    ('rocket-man.png',    520,  350, 90),  # S4 rides the potential line, ~206px wide
    'cape-man':      ('cape-man.png',      720,  720, 90),  # S6 hero, shown 360px wide
}
VENDOR = ROOT / 'vendor' / 'sm-motion' / 'assets'
VENDOR_PLAN = {
}
COPY = ['cloud-footer.svg']  # vector, copied as-is from the motion system vendor dir

def main():
    total_in = total_out = 0
    for name, (src, mw, mh, q) in list(PLAN.items()) + list(VENDOR_PLAN.items()):
        p = (SRC if name in PLAN else VENDOR) / src
        im = Image.open(p)
        has_alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
        im = im.convert('RGBA' if has_alpha else 'RGB')
        im.thumbnail((mw, mh), Image.LANCZOS)
        dest = OUT / f'{name}.webp'
        im.save(dest, 'WEBP', quality=q, method=6)
        total_in += p.stat().st_size; total_out += dest.stat().st_size
        print(f'{name:14s} {im.size[0]}x{im.size[1]}  {p.stat().st_size/1e6:5.2f} MB -> {dest.stat().st_size/1e3:6.0f} KB')
    for f in COPY:
        (OUT / f).write_bytes((VENDOR / f).read_bytes())
        print(f'{f:14s} copied')
    print(f'\ntotal {total_in/1e6:.1f} MB -> {total_out/1e6:.2f} MB')

if __name__ == '__main__':
    main()

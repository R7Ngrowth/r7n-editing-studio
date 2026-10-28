#!/usr/bin/env python3
"""Contactblad van beelden: uv run --with pillow python tools/sheet.py out/sheet.jpg beeld1.png beeld2.png …  (4 per rij, 300 px breed)"""
import sys

from PIL import Image, ImageDraw

doel, beelden = sys.argv[1], sys.argv[2:]
B, KOL = 300, 4
dia = [Image.open(p).convert("RGB") for p in beelden]
H = int(B * dia[0].height / dia[0].width) if dia else 0
rijen = (len(dia) + KOL - 1) // KOL
blad = Image.new("RGB", (KOL * B + (KOL + 1) * 10, rijen * (H + 34) + 10), "#06070a")
teken = ImageDraw.Draw(blad)
for i, (p, im) in enumerate(zip(beelden, dia)):
    x = 10 + (i % KOL) * (B + 10)
    y = 10 + (i // KOL) * (H + 34)
    blad.paste(im.resize((B, H)), (x, y))
    teken.text((x, y + H + 8), p.rsplit("/", 1)[-1], fill="#9aa1b4")
blad.save(doel, quality=88)
print(f"{len(dia)} beelden → {doel}")

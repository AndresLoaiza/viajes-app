#!/usr/bin/env python
"""Convierte una imagen (HEIC/HEIF/JPG/PNG) a JPEG, lado mayor <= MAXD.

Usa pillow_heif: ffmpeg decodifica solo UN tile de los HEIC en mosaico del
iPhone 15 (sale un recorte 1600x1600), pillow_heif reconstruye el grid completo.
Respeta la orientación EXIF (exif_transpose).

Uso: python heic_to_jpeg.py <input> <output.jpg> [maxdim] [quality]
"""
import sys
import pillow_heif
pillow_heif.register_heif_opener()
from PIL import Image, ImageOps

inp, out = sys.argv[1], sys.argv[2]
maxd = int(sys.argv[3]) if len(sys.argv) > 3 else 1600
q = int(sys.argv[4]) if len(sys.argv) > 4 else 85

im = ImageOps.exif_transpose(Image.open(inp)).convert("RGB")
w, h = im.size
s = min(1, maxd / max(w, h))
if s < 1:
    im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
im.save(out, "JPEG", quality=q, optimize=True)
print(f"{im.size[0]}x{im.size[1]}")

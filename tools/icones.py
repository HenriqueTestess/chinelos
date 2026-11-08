"""Gera os icones do app (rodar so uma vez)."""
from pathlib import Path
from PIL import Image, ImageDraw
raiz = Path(__file__).resolve().parent.parent
for tam, nome in ((192, "icon-192.png"), (512, "icon-512.png"), (512, "icon-maskable.png")):
    s = tam * 4
    im = Image.new("RGB", (s, s), "#d6336c")
    d = ImageDraw.Draw(im)
    pad = s * (0.28 if "maskable" in nome else 0.18)
    # duas solas de chinelo
    for dx in (-0.17, 0.17):
        cx = s / 2 + dx * s
        d.ellipse([cx - s*0.13, pad + s*0.02, cx + s*0.13, s - pad], fill="white")
        d.polygon([(cx - s*0.10, s*0.50), (cx, s*0.34), (cx + s*0.10, s*0.50)], fill="#ffc2d9")
    im.resize((tam, tam), Image.LANCZOS).save(raiz / "icons" / nome)

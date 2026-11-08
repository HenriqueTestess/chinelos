"""Gera miniaturas/medias em WebP e atualiza chinelos.json.
Uso (na pasta do projeto):  python tools/gerar.py
- Le as originais em imagens/chinelos/ (nunca altera).
- Cria imagens/thumb/ (400px de largura) e imagens/medio/ (900px).
- Cria/atualiza chinelos.json SEM apagar o que voce ja preencheu.
Precisa de: pip install pillow
"""
import json, re, sys
from pathlib import Path
from PIL import Image, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
ORIG = RAIZ / "imagens" / "chinelos"
PADRAO = re.compile(r"^(\d{2})-(\d{2})(?: \((\d+)\))?\.(jpe?g|png|webp)$", re.I)

def slug(nome):
    m = PADRAO.match(nome)
    return f"{m.group(1)}-{m.group(2)}" + (f"_{m.group(3)}" if m.group(3) else "")

def main():
    validos, estranhos = [], []
    for f in sorted(ORIG.iterdir()):
        if not f.is_file(): continue
        m = PADRAO.match(f.name)
        (validos if m else estranhos).append((f, m))
    if estranhos:
        print("ATENCAO - nomes fora do padrao (ignorados):")
        for f, _ in estranhos: print("  ", f.name)
    validos.sort(key=lambda x: (int(x[1].group(1)), int(x[1].group(3) or 1)))

    for pasta, largura, q in (("thumb", 400, 72), ("medio", 900, 80)):
        (RAIZ / "imagens" / pasta).mkdir(exist_ok=True)
    for f, _ in validos:
        with Image.open(f) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            for pasta, largura, q in (("thumb", 400, 72), ("medio", 900, 80)):
                out = RAIZ / "imagens" / pasta / (slug(f.name) + ".webp")
                if out.exists() and out.stat().st_mtime >= f.stat().st_mtime: continue
                w = min(largura, im.width)
                im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(out, "WEBP", quality=q, method=6)

    jpath = RAIZ / "chinelos.json"
    antigo = {}
    if jpath.exists():
        antigo = {i["arquivo"]: i for i in json.loads(jpath.read_text(encoding="utf-8"))}
    itens = []
    for f, m in validos:
        old = antigo.get(f.name, {})
        itens.append({
            "arquivo": f.name,
            "numeracao": f"{m.group(1)}-{m.group(2)}",
            "decoracao": old.get("decoracao", ""),
            "valor": old.get("valor", ""),
        })
    jpath.write_text(json.dumps(itens, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(itens)} chinelos no chinelos.json; WebP em imagens/thumb e imagens/medio")

if __name__ == "__main__":
    sys.exit(main())

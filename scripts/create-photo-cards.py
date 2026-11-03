"""Produz imagens locais WebP para os cartões institucionais.
Fotografias ilustrativas de Unsplash (licença: https://unsplash.com/license).
Créditos e fotografias de origem documentados em CREDITOS-FOTOGRAFIAS.md.
"""
from PIL import Image, ImageOps, ImageEnhance
from pathlib import Path
import io
import time
import urllib.request

PHOTOS = {
    "aec-caf": "photo-1719159381916-062fa9f435a6",
    "aplicacao": "photo-1760199789464-7d3989e22758",
    "apoio-social": "photo-1558366361-557c7a4b31b8",
    "biblioteca": "photo-1767356326735-2da0a10cf1f0",
    "cartao": "photo-1718010571964-bac048b9ded0",
    "contactos-canal": "photo-1763810021881-49b45b0717d5",
    "contactos-email": "photo-1776797391265-01a0490d4c99",
    "contactos-instagram": "photo-1777559543138-9f5b4e0d04ca",
    "documentos-arquivo": "photo-1583521214690-73421a1829a9",
    "documentos-atas": "photo-1768055104910-8c8d213835fb",
    "documentos-estatutos": "photo-1654124803050-57ec5e258437",
    "documentos-orgaos": "photo-1781246212288-7fa538344718",
    "etica": "photo-1764044371408-dca4366b31df",
    "familias-acolhimento": "photo-1646066490017-c935b1a1eb0f",
    "familias-aec-caf": "photo-1755963248051-38f1066a0f43",
    "familias-apoio-social": "photo-1726726192155-fefdf941459a",
    "familias-cultura": "photo-1605627079912-97c3810a11a4",
    "familias-parceiros": "photo-1646066490241-d386dbb63539",
    "familias-refeitorio": "photo-1778996525694-e87e5eff7a76",
    "horta-recreios": "photo-1611843467160-25afb8df1074",
    "linha-aberta": "photo-1759215524500-8834e4935603",
    "valor-colaborar": "photo-1746014602298-c03abf9840c3",
    "valor-contas": "photo-1762427907123-c7ab022a5de7",
    "valor-representar": "photo-1726726192184-f06b888b9d5a",
}

def download(photo):
    url = f"https://images.unsplash.com/{photo}?fit=crop&w=1000&q=84&auto=format"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; APEE-Web/1.0)"})
    last = None
    for i in range(4):
        try:
            with urllib.request.urlopen(req, timeout=35) as resp:
                return resp.read()
        except Exception as err:
            last = err
            time.sleep(i+1)
    raise RuntimeError(f"Falhou download: {photo}: {last}")

def main():
    dest = Path("imagens/cartoes")
    dest.mkdir(parents=True, exist_ok=True)
    cache = {}
    for slug, photo in PHOTOS.items():
        if photo not in cache:
            image = Image.open(io.BytesIO(download(photo))).convert("RGB")
            image = ImageOps.fit(image, (760, 470), method=Image.Resampling.LANCZOS)
            image = ImageEnhance.Color(image).enhance(1.04)
            cache[photo] = image
        path = dest / f"{slug}.webp"
        cache[photo].save(path, "WEBP", quality=77, method=6)
        print(f"{path} ({path.stat().st_size // 1024} kB)", flush=True)
    print(f"{len(PHOTOS)} fotografias prontas.", flush=True)

if __name__ == "__main__":
    main()

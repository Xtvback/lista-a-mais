"""Instala o novo cartão ilustrativo de alimentação criado para a APEE.
A origem é uma exportação temporária do próprio recurso criado, não uma fotografia da escola.
"""
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
import urllib.request

URL = "https://media.canva.com/v2/image-resize/format:PNG/height:133/quality:100/uri:ifs%3A%2F%2FM%2F8cd38d05-deeb-4b43-962c-d157abf8b482/watermark:F/width:200?csig=AAAAAAAAAAAAAAAAAAAAADy88FD6Doe89SD0I5tZdZEW3J4AV2RtTA8sB9OMZJGg&exp=1793681029&osig=AAAAAAAAAAAAAAAAAAAAAKo0A42dsJ5mALqLkNq4XjB_32pRy4vaBJtVkbmXqCby&signer=media-rpc&token=AAIAAU0AJDhjZDM4ZDA1LWRlZWItNGI0My05NjJjLWQxNTdhYmY4YjQ4MgAAAAABoZ-4d4id1Hl07ewfggoqmlRByzjEOYnQxO_zKm-PhUaTDRlQ1g&x-canva-quality=thumbnail"
req = urllib.request.Request(URL,headers={"User-Agent":"Mozilla/5.0"})
with urllib.request.urlopen(req,timeout=45) as response:
    payload=response.read()
if len(payload)<5000:
    raise ValueError("Imagem de origem incompleta")
image = Image.open(BytesIO(payload)).convert("RGB")
print("Imagem original:",image.size,flush=True)
image = image.resize((480,320),Image.Resampling.LANCZOS)
image = ImageEnhance.Contrast(image).enhance(1.04)
image = image.filter(ImageFilter.UnsharpMask(radius=1.4,percent=70,threshold=3))
out=Path("imagens/cartoes/alimentacao-nova.webp")
out.parent.mkdir(parents=True,exist_ok=True)
image.save(out,format="WEBP",quality=80,method=6)
print(out,out.stat().st_size,flush=True)

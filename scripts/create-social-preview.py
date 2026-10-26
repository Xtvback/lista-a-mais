from PIL import Image, ImageDraw, ImageFont, ImageOps
from pathlib import Path

WIDTH, HEIGHT = 1200, 630
im = Image.new("RGB", (WIDTH, HEIGHT), "#123c70")
d = ImageDraw.Draw(im)
d.polygon([(870,0),(1200,0),(1200,630),(1080,630),(795,0)], fill="#1c5c9b")
d.polygon([(1120,0),(1200,0),(1200,630),(1180,630),(935,0)], fill="#ffd049")
d.rounded_rectangle((36,48,1164,582), radius=32, outline="#5b92bf", width=3)
d.rounded_rectangle((66,105,390,525), radius=25, fill="white")

logo_path = Path("_external/d2ol7oe51mr4n9.cloudfront.net/user_3EbWYhy0t8ty8Wz9RPVrhpDHVlB/6c0a90e1-f63f-4e2c-8a73-48d8610f6db5.jpg")
if not logo_path.is_file():
    raise FileNotFoundError(f"Falta o logótipo oficial: {logo_path}")
logo = Image.open(logo_path).convert("RGB")
logo.thumbnail((290, 380), Image.Resampling.LANCZOS)
im.paste(logo, (228 - logo.width // 2, 315 - logo.height // 2))

heavy = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
regular = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
d.text((430,174), "APEE", font=ImageFont.truetype(heavy,100), fill="white")
d.text((430,296), "Bairro do Restelo", font=ImageFont.truetype(heavy,51), fill="white")
d.rectangle((434,395,570,406), fill="#ffd049")
d.text((434,452), "Famílias · Escola · Comunidade", font=ImageFont.truetype(regular,27), fill="white")
im.save("partilha-apee.png", optimize=True)

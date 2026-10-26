from PIL import Image, ImageDraw, ImageFont
im=Image.new("RGB",(1200,630),"#123c70")
d=ImageDraw.Draw(im)
d.polygon([(870,0),(1200,0),(1200,630),(1080,630),(795,0)],fill="#1d5a9b")
d.polygon([(1120,0),(1200,0),(1200,630),(1180,630),(935,0)],fill="#ffd049")
d.rounded_rectangle((60,55,1150,575),radius=28,outline="#6193ba",width=2)
d.rounded_rectangle((90,91,235,235),radius=28,fill="#ffd049")
heavy="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
regular="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
d.text((103,130),"A+",font=ImageFont.truetype(heavy,55),fill="#143d71")
d.text((92,277),"APEE",font=ImageFont.truetype(heavy,88),fill="white")
d.text((92,375),"Bairro do Restelo",font=ImageFont.truetype(heavy,55),fill="white")
d.rectangle((92,468,204,476),fill="#ffd049")
d.text((92,508),"Famílias  ·  Escola  ·  Comunidade",font=ImageFont.truetype(regular,30),fill="white")
im.save("partilha-apee.png",optimize=True)

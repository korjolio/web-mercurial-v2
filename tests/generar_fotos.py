#!/usr/bin/env python3
"""Genera las variantes livianas de las fotos de portada (AVIF + WebP en 3 anchos y un JPG de respaldo).

    python tests/generar_fotos.py            # solo crea las que faltan
    python tests/generar_fotos.py --todas    # las rehace todas

Requiere Pillow >= 11.3 (trae AVIF). Las variantes quedan junto al original: las-condes.jpg ->
las-condes-640.avif, las-condes-640.webp, ..., las-condes-1024.jpg. Si cambias una foto, súbele el
nombre (o el ?v= del HTML), porque las imágenes se guardan 30 días en caché (ver server.js).
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

RAIZ = Path(__file__).resolve().parent.parent / 'src' / 'img'
FOTOS = {
    'fotos/las-condes.jpg': (640, 1024, 1440),  # va bajo un degradado oscuro: 1440 basta
    'fotos/valparaiso-puerto.jpg': (640, 1024, 1600),
    'fotos/ruta-68-letreros.jpg': (640, 1024, 1600),
    'fotos/mercado-central.jpg': (640, 1024, 1600),
    'fotos/sanhattan-torres.jpg': (640, 1024, 1600),
    'fotos/auto-promo.jpg': (640, 1024, 1600),
    'fotos/desgravamen-pareja.jpg': (640, 1024, 1600),
    'mascota.jpeg': (480, 800, 1120),
}
RESPALDO = 1024  # ancho del JPG para navegadores sin AVIF/WebP (mascota: 800)


def guardar(img, destino, todas):
    grande = img.width >= 1400  # la variante 2x de escritorio: algo más comprimida para quedar bajo 200 KB
    if destino.exists() and not todas:
        return
    ext = destino.suffix
    if ext == '.avif':
        img.save(destino, 'AVIF', quality=44 if grande else 52, speed=4)
    elif ext == '.webp':
        img.save(destino, 'WEBP', quality=60 if grande else 70, method=6)
    else:
        img.save(destino, 'JPEG', quality=74, optimize=True, progressive=True)
    print(f'{destino.relative_to(RAIZ)}: {destino.stat().st_size / 1024:.0f} KB')


def main():
    todas = '--todas' in sys.argv
    for rel, anchos in FOTOS.items():
        origen = RAIZ / rel
        with Image.open(origen) as im:
            im = ImageOps.exif_transpose(im).convert('RGB')
            base = origen.with_suffix('')
            respaldo = RESPALDO if RESPALDO in anchos else anchos[1]
            for w in anchos:
                w = min(w, im.width)
                h = round(im.height * w / im.width)
                red = im.resize((w, h), Image.LANCZOS)
                for ext in ('.avif', '.webp') + (('.jpg',) if w == respaldo else ()):
                    guardar(red, Path(f'{base}-{w}{ext}'), todas)
            print(f'  {rel}: original {im.width}x{im.height}')


if __name__ == '__main__':
    main()

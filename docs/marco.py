#!/usr/bin/env python3
"""Genera los bloques globales de mercurial.cl (enlace «Saltar al contenido», barra superior, cabecera con el menú
Seguros, panel móvil y pie) en todas las páginas, para que sean iguales en todas y cambien en un solo lugar.

    python3 docs/marco.py           # reescribe los bloques en los HTML
    python3 docs/marco.py --check   # no escribe; sale con 1 si algún HTML no coincide (lo usa tests/nav.py)

Lo propio de cada página está en PAGINAS: adónde lleva «Cotizar» (su formulario; None si la página no tiene) y el
texto prellenado de WhatsApp. aria-current="page" se marca solo según la ruta. Del pie se conservan los créditos de
fotos de cada página. No toca el contenido de <main> salvo el id="contenido" que necesita el enlace de salto.
Está en docs/ porque esa carpeta no se publica (server.js la bloquea).
"""
import re
import sys
from pathlib import Path
from urllib.parse import quote

RAIZ = Path(__file__).resolve().parent.parent
WA = '56939319546'
WA_VISIBLE = '+56 9 3931 9546'

# archivo: (ruta, destino de «Cotizar» o None, texto de WhatsApp, muestra horario en el pie)
PAGINAS = {
    'index.html': ('/', '#cotizar', 'Hola Mercurial, quiero cotizar un seguro.', True),
    'seguro-flotas.html': ('/seguros/flotas', '#cotizar', 'Hola Mercurial, quiero cotizar un seguro para la flota de mi empresa.', True),
    'seguro-transporte.html': ('/seguros/transporte', '#cotizar', 'Hola Mercurial, quiero cotizar un seguro de transporte de carga.', True),
    'seguro-carga-comex.html': ('/seguros/transporte/importaciones-exportaciones', '#contacto', 'Hola Mercurial, quiero cotizar un seguro de carga para importación o exportación.', True),
    'seguro-carga-certificado.html': ('/seguros/transporte/certificado', '#formulario', 'Hola Mercurial, quiero cotizar el seguro de carga de un embarque.', False),
    'seguro-transporte-poliza-anual.html': ('/seguros/transporte/poliza-anual', '#contacto', 'Hola Mercurial, quiero cotizar una póliza anual de transporte.', True),
    'seguro-incendio.html': ('/seguros/incendio', '#cotizar', 'Hola Mercurial, quiero cotizar un seguro de incendio.', True),
    'seguro-colectivos-salud.html': ('/seguros/colectivos-de-salud', '#cotizar', 'Hola Mercurial, quiero cotizar un seguro colectivo de salud.', True),
    'seguro-auto.html': ('/seguro-auto', '#cotizar', 'Hola Mercurial, quiero cotizar mi seguro de auto.', True),
    'preguntas-frecuentes-transporte.html': ('/seguros/transporte/preguntas-frecuentes', None, 'Hola Mercurial, tengo una pregunta sobre el seguro de transporte.', True),
    'preguntas-frecuentes-auto.html': ('/seguro-auto/preguntas-frecuentes', None, 'Hola Mercurial, tengo una pregunta sobre el seguro de auto.', True),
    'seguro-auto-promo.html': ('/seguro-auto/promocion', '#cotizar', 'Hola Mercurial, quiero cotizar mi seguro de auto con la promoción de noviembre.', True),
    'mascotas.html': ('/seguro-mascotas', '#cotizador', 'Hola Mercurial, quiero cotizar un seguro para mi mascota.', True),
    'desgravamen.html': ('/desgravamen-rechazado', '#evaluacion', 'Hola Mercurial, quiero ayuda con mi seguro de desgravamen.', True),
    'cotizar-pyme.html': ('/cotizar-pyme', '#pymeForm', 'Hola Mercurial, quiero cotizar un seguro para mi pyme.', True),
    'consultas.html': ('/consultas-y-reclamos', None, 'Hola Mercurial, tengo una consulta.', True),
    'privacidad.html': ('/politica-privacidad', None, 'Hola Mercurial, quiero hablar con un ejecutivo.', True),
    'terminos.html': ('/terminos.html', None, 'Hola Mercurial, quiero hablar con un ejecutivo.', True),
    '404.html': (None, None, 'Hola Mercurial, quiero hablar con un ejecutivo.', True),
}

# Menú Seguros. Transporte agrupa sus tres páginas (la de certificado es la landing del anuncio, pero es la única
# donde se cotiza un embarque suelto, también nacional, así que entra como subítem).
EMPRESAS = [
    ('/seguros/flotas', 'camion', 'Flotas', 'Camiones, camionetas y autos de la empresa', []),
    ('/seguros/transporte', 'caja', 'Transporte', 'Carga por ruta, puerto o importada', [
        ('/seguros/transporte/importaciones-exportaciones', 'Importaciones y exportaciones'),
        ('/seguros/transporte/certificado', 'Certificado por embarque'),
        ('/seguros/transporte/poliza-anual', 'Póliza anual'),
    ]),
    ('/seguros/incendio', 'llama', 'Incendio', 'Locales, oficinas, bodegas y plantas', []),
    ('/seguros/colectivos-de-salud', 'salud', 'Colectivos de salud', 'Complemento a la Isapre o Fonasa', []),
]
PERSONAS = [
    ('/seguro-auto', 'auto', 'Seguro de auto', 'Cobertura completa, pérdida total o RC', []),
    ('/seguro-mascotas', 'huella', 'Seguro de mascotas', 'Perros y gatos, con BCI Seguros', []),
    ('/desgravamen-rechazado', 'casa', 'Desgravamen hipotecario', 'Alternativas para tu crédito hipotecario', []),
]
# Nombres en el pie (cuando difieren del menú)
PIE_NOMBRE = {'/seguros/transporte/poliza-anual': 'Póliza anual de transporte'}


def wa(texto):
    return f'https://wa.me/{WA}?text={quote(texto, safe="")}'


def ico(nombre):
    return f'<svg class="ico" aria-hidden="true"><use href="#{nombre}"/></svg>'


def cur(href, ruta):
    return ' aria-current="page"' if ruta and href == ruta else ''


def saltar():
    return '<a class="saltar" href="#contenido">Saltar al contenido</a>'


def util(ruta, texto_wa):
    return (
        '<div class="util mc-marco"><div class="wrap">\n'
        '    <span class="util-txt">Corredora de seguros inscrita en la CMF · <a href="https://www.cmfchile.cl" target="_blank" rel="noopener">Registro N° 8929</a></span>\n'
        f'    <div class="der"><a href="/consultas-y-reclamos"{cur("/consultas-y-reclamos", ruta)}>Consultas y reclamos</a>'
        f'<a href="{wa(texto_wa)}" target="_blank" rel="noopener">WhatsApp {WA_VISIBLE}</a></div>\n'
        '  </div></div>')


def item_menu(item, ruta):
    href, icono, nombre, desc, subs = item
    li = f'              <li><a href="{href}"{cur(href, ruta)}>{ico(icono)}<div><b>{nombre}</b><span>{desc}</span></div></a>'
    if subs:
        li += f'\n                <ul class="sub-menu" aria-label="{nombre}: más opciones">' + ''.join(
            f'<li><a href="{h}"{cur(h, ruta)}>{n}</a></li>' for h, n in subs) + '</ul>\n              '
    return li + '</li>'


def acciones_cabecera(cotizar, texto_wa):
    if cotizar:
        return (f'<div class="acc"><a class="btn btn-borde" href="{wa(texto_wa)}" target="_blank" rel="noopener">Hablar con un ejecutivo</a>'
                f'<a class="btn btn-azul" href="{cotizar}">Cotizar</a></div>')
    # Sin formulario en la página: el único botón es WhatsApp (en el celular, con el texto corto).
    return (f'<div class="acc"><a class="btn btn-azul" href="{wa(texto_wa)}" target="_blank" rel="noopener">'
            '<span class="txt-largo">Hablar con un ejecutivo</span><span class="txt-corto">WhatsApp</span></a></div>')


def cabecera(ruta, cotizar, texto_wa):
    emp = '\n'.join(item_menu(i, ruta) for i in EMPRESAS)
    per = '\n'.join(item_menu(i, ruta) for i in PERSONAS)
    return (
        '<header class="nav mc-marco" id="nav"><div class="wrap">\n'
        f'    <a class="logo" href="/"><img src="/src/img/logo/mercurial-horizontal-color.svg" alt="Mercurial Corredores de Seguros, inicio" width="655" height="190"></a>\n'
        '    <nav aria-label="Principal">\n'
        '      <ul class="menu">\n'
        '        <li id="li-seguros">\n'
        '          <button type="button" id="btn-seguros" aria-expanded="false" aria-controls="menu-seguros">Seguros <svg class="ico chev" aria-hidden="true"><use href="#chev"/></svg></button>\n'
        '          <div class="t-dropdown" id="menu-seguros" inert>\n'
        f'            <div class="grupo-menu"><p class="tit-menu" id="dm-emp">Empresas</p><ul aria-labelledby="dm-emp">\n{emp}\n            </ul></div>\n'
        f'            <div class="grupo-menu"><p class="tit-menu" id="dm-per">Personas</p><ul aria-labelledby="dm-per">\n{per}\n            </ul></div>\n'
        '          </div>\n'
        '        </li>\n'
        '        <li><a href="/#mercurial">Quiénes somos</a></li>\n'
        '      </ul>\n'
        '    </nav>\n'
        f'    {acciones_cabecera(cotizar, texto_wa)}\n'
        f'    <button class="hamb" type="button" id="hamb" aria-label="Menú" aria-expanded="false" aria-controls="panel-movil">'
        '<svg class="ico ico-abrir" aria-hidden="true"><use href="#menu"/></svg><svg class="ico ico-cerrar" aria-hidden="true"><use href="#x"/></svg></button>\n'
        '  </div></header>')


def item_panel(item, ruta):
    href, icono, nombre, _desc, subs = item
    li = f'        <li><a href="{href}"{cur(href, ruta)}>{ico(icono)}{nombre}</a>'
    if subs:
        li += '<ul class="sub-menu">' + ''.join(f'<li><a href="{h}"{cur(h, ruta)}>{n}</a></li>' for h, n in subs) + '</ul>'
    return li + '</li>'


def panel(ruta, cotizar, texto_wa):
    grupos = [
        ('pm-emp', 'Seguros para empresas', [item_panel(i, ruta) for i in EMPRESAS]),
        ('pm-per', 'Seguros para personas', [item_panel(i, ruta) for i in PERSONAS]),
        ('pm-mer', 'Mercurial', [
            f'        <li><a href="/#mercurial">{ico("escudo")}Quiénes somos</a></li>',
            f'        <li><a href="/consultas-y-reclamos"{cur("/consultas-y-reclamos", ruta)}>{ico("mensaje")}Consultas y reclamos</a></li>',
        ]),
    ]
    html = '<div class="panel-movil mc-marco" id="panel-movil" hidden>\n    <nav aria-label="Menú móvil">\n'
    for gid, titulo, items in grupos:
        html += f'      <p class="sub" id="{gid}">{titulo}</p>\n      <ul aria-labelledby="{gid}">\n' + '\n'.join(items) + '\n      </ul>\n'
    # La cabecera fija ya muestra «Cotizar» (o WhatsApp si la página no tiene formulario): el panel solo suma WhatsApp.
    if cotizar:
        html += (f'      <div class="acc"><a class="btn btn-borde" href="{wa(texto_wa)}" target="_blank" rel="noopener">'
                 f'{ico("wa")}WhatsApp {WA_VISIBLE}</a></div>\n')
    return html + '    </nav>\n  </div>'


def lista_pie(items, ruta, extra=()):
    lis = []
    for href, _i, nombre, _d, subs in items:
        lis.append(f'<li><a href="{href}"{cur(href, ruta)}>{nombre}</a></li>')
        lis += [f'<li><a href="{h}"{cur(h, ruta)}>{PIE_NOMBRE.get(h, n)}</a></li>' for h, n in subs]
    lis += [f'<li><a href="{h}"{cur(h, ruta)}>{n}</a></li>' for h, n in extra]
    return '<ul>' + ''.join(lis) + '</ul>'


def pie(ruta, texto_wa, horario, creditos):
    txt = 'Corredores de seguros para empresas y personas. Santiago, Chile.' + (' Lunes a viernes, de 9:00 a 18:30 h.' if horario else '')
    return (
        '<footer class="oscuro mc-marco"><div class="wrap">\n'
        '    <div class="pie">\n'
        f'      <div><img class="logo-pie" src="/src/img/logo/mercurial-horizontal-blanco.svg" alt="Mercurial Corredores de Seguros" width="655" height="190" loading="lazy"><p class="pie-txt">{txt}</p></div>\n'
        f'      <div><h2 class="pie-tit">Empresas</h2>{lista_pie(EMPRESAS, ruta, [("/cotizar-pyme", "Enviar antecedentes pyme")])}'
        f'<h2 class="pie-tit">Personas</h2>{lista_pie(PERSONAS, ruta)}</div>\n'
        f'      <div><h2 class="pie-tit">Contacto</h2><ul><li><a href="{wa(texto_wa)}" target="_blank" rel="noopener">WhatsApp {WA_VISIBLE}</a></li>'
        f'<li><a href="mailto:contacto@mercurial.cl">contacto@mercurial.cl</a></li><li><a href="/consultas-y-reclamos"{cur("/consultas-y-reclamos", ruta)}>Consultas y reclamos</a></li>'
        f'<li><a href="/seguros/transporte/preguntas-frecuentes"{cur("/seguros/transporte/preguntas-frecuentes", ruta)}>Preguntas frecuentes: transporte</a></li>'
        f'<li><a href="/seguro-auto/preguntas-frecuentes"{cur("/seguro-auto/preguntas-frecuentes", ruta)}>Preguntas frecuentes: auto</a></li></ul></div>\n'
        '      <div><h2 class="pie-tit">Información regulatoria</h2><ul><li>Registro CMF N° 8929</li><li>RUT 76.826.322-1</li><li>Reclamos según la Circular CMF N° 2131</li>'
        '<li><a href="https://www.cmfchile.cl" target="_blank" rel="noopener">Portal CMF</a></li></ul></div>\n'
        '    </div>\n'
        '    <div class="legal">\n'
        f'      <div class="fila"><span>© 2026 Mercurial Corredores de Seguros Ltda. Corredora de seguros, no aseguradora: las pólizas las emiten las compañías de seguros.</span><span><a href="/terminos.html"{cur("/terminos.html", ruta)}>Términos de uso</a> · <a href="/politica-privacidad"{cur("/politica-privacidad", ruta)}>Privacidad</a></span></div>\n'
        + (f'      {creditos}\n' if creditos else '') +
        '    </div>\n'
        '  </div></footer>')


BLOQUES = {
    'util': re.compile(r'<div class="util mc-marco">.*?</div></div>', re.S),
    'cabecera': re.compile(r'<header class="nav mc-marco" id="nav">.*?</header>', re.S),
    'panel': re.compile(r'<div class="panel-movil mc-marco" id="panel-movil" hidden>.*?</nav>\s*</div>', re.S),
    'pie': re.compile(r'<footer class="oscuro mc-marco">.*?</footer>', re.S),
}
# Versión mínima de los archivos del marco (subirla al cambiarlos: Cloudflare y el navegador guardan 4 h)
VERSIONES = {'/src/css/marco.css': 7, '/src/css/sitio.css': 15, '/src/js/sitio.js': 16, '/src/js/consent.js': 2}


def generar(archivo, s):
    ruta, cotizar, texto_wa, horario = PAGINAS[archivo]
    m = re.search(r'<div class="legal">.*?</div>\s*(<p>.*?</p>)?\s*</div>\s*</div></footer>', s, re.S)
    creditos = m.group(1) if m and m.group(1) else ''
    nuevos = {'util': util(ruta, texto_wa), 'cabecera': cabecera(ruta, cotizar, texto_wa),
              'panel': panel(ruta, cotizar, texto_wa), 'pie': pie(ruta, texto_wa, horario, creditos)}
    for k, rx in BLOQUES.items():
        if not rx.search(s):
            raise SystemExit(f'{archivo}: no encuentro el bloque {k}')
        s = rx.sub(lambda _m, t=nuevos[k]: t, s, count=1)
    # Enlace de salto: primer elemento enfocable del <body>
    if 'class="saltar"' not in s:
        s = re.sub(r'(<body[^>]*>\n)', lambda m_: m_.group(1) + '  ' + saltar() + '\n', s, count=1)
    # Destino del salto: <main> (mascotas.html no tiene <main>: su <header class="hero">)
    s = s.replace('<main id="contenido">', '<main id="contenido" tabindex="-1">')  # el salto debe poder recibir el foco
    if 'id="contenido"' not in s:
        if re.search(r'<main\b', s):
            s = re.sub(r'<main\b', '<main id="contenido" tabindex="-1"', s, count=1)
        else:
            s = s.replace('<header class="hero">', '<header class="hero" id="contenido" tabindex="-1">', 1)
    # Solo sube versiones (si otro cambio ya las subió más, se respetan)
    for src, v in VERSIONES.items():
        s = re.sub(re.escape(src) + r'(?:\?v=(\d+))?"', lambda m_, v=v, src=src: f'{src}?v={max(v, int(m_.group(1) or 0))}"', s)
    return s


def main():
    revisar = '--check' in sys.argv
    malos = []
    for archivo in PAGINAS:
        p = RAIZ / archivo
        s = p.read_text(encoding='utf-8')
        n = generar(archivo, s)
        if n != s:
            malos.append(archivo)
            if not revisar:
                p.write_text(n, encoding='utf-8')
    if revisar and malos:
        print('Bloques globales distintos del generador en: ' + ', '.join(malos))
        sys.exit(1)
    print(('Revisados' if revisar else 'Actualizados') + f': {len(malos) if not revisar else len(PAGINAS)} archivos')


if __name__ == '__main__':
    main()

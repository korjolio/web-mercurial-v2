#!/usr/bin/env python3
"""Pruebas de contenido de mercurial.cl, siempre en local (nunca contra https://mercurial.cl).

Revisa las 15 páginas a 1440 y 390 px:
  - responde 200, sin errores de consola y sin desborde horizontal;
  - title, meta description y canonical presentes (y title/description únicos entre páginas);
  - Open Graph (og:title, og:description, og:image) presente;
  - JSON-LD parseable; si hay FAQPage, cada pregunta aparece en la página;
  - un solo <main>, un solo <h1>, encabezados sin saltos dentro de <main>, todas las <img> con alt;
  - a lo más un formulario por página (y el número esperado);
  - a lo más un botón relleno en la primera pantalla y al menos una acción visible;
  - noindex donde corresponde (certificado, promoción, cotizar-pyme).
Con --enviar, además envía cada formulario con datos ficticios y exige respuesta 200 y mensaje de éxito.

Uso (desde la raíz del repo):
  /ruta/.venv/bin/python tests/contenido.py                    # arranca server.js en modo prueba (puerto 3983)
  ... tests/contenido.py --enviar                              # + envía los formularios
  ... tests/contenido.py --capturas DIR --sufijo despues       # + guarda capturas (primera pantalla y completa)
  ... tests/contenido.py --base http://localhost:3983 --sin-arrancar   # usa un servidor ya levantado

Al arrancar el servidor usa MAIL_DRY_RUN=1, MOTOR_LEADS_DRY_RUN=1, CHATWOOT_DRY_RUN=1 y un CRM falso local para
/cotizar-pyme. Las solicitudes a terceros (Google, Meta, BCI…) se responden vacías: la prueba no manda nada afuera.
"""
import argparse
import http.server
import json
import os
import subprocess
import sys
import tempfile
import threading
import time
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent

# Datos ficticios (reglas del proyecto: nunca datos reales en pruebas).
NOMBRE, EMPRESA, TEL, CORREO = 'Cliente Prueba', 'Empresa Prueba SpA', '+56960000001', 'prueba@example.com'
RUT, PATENTE = '22.222.222-2', 'ZZZZ99'

# ruta, nombre corto, formularios esperados en <main>, tipo de envío, ¿noindex?
PAGINAS = [
    ('/', 'portada', 1, 'barra', False),
    ('/seguros/flotas', 'flotas', 1, 'barra', False),
    ('/seguros/transporte', 'transporte', 1, 'barra', False),
    ('/seguros/transporte/importaciones-exportaciones', 'comex', 1, 'carga', False),
    ('/seguros/transporte/certificado', 'certificado', 1, 'certificado', True),
    ('/seguros/transporte/poliza-anual', 'poliza-anual', 1, 'poliza', False),
    ('/seguros/incendio', 'incendio', 1, 'barra', False),
    ('/seguros/colectivos-de-salud', 'colectivos-salud', 1, 'barra', False),
    ('/seguro-auto', 'seguro-auto', 1, 'auto', False),
    ('/seguro-auto/promocion', 'promocion', 1, 'auto', True),
    ('/seguro-mascotas', 'mascotas', 0, None, False),
    ('/desgravamen-rechazado', 'desgravamen', 1, 'desgravamen', False),
    ('/cotizar-pyme', 'cotizar-pyme', 1, 'pyme', True),
    ('/consultas-y-reclamos', 'consultas', 1, 'consulta', False),
    ('/politica-privacidad', 'privacidad', 0, None, False),
]
# Páginas donde la primera pantalla puede no tener acción (texto legal) o es el formulario mismo.
SIN_ACCION_OBLIGATORIA = {'privacidad'}
ANCHOS = [(1440, 900, 'd'), (390, 844, 'm')]


class CrmFalso(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        largo = int(self.headers.get('content-length') or 0)
        self.rfile.read(largo)
        cuerpo = json.dumps({'prospectId': 'prueba-local'}).encode()
        self.send_response(201)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(cuerpo)))
        self.end_headers()
        self.wfile.write(cuerpo)

    def log_message(self, *a):
        pass


def arrancar_servidor(puerto, raiz=RAIZ):
    import socket
    with socket.socket() as sk:
        if sk.connect_ex(('127.0.0.1', puerto)) == 0:
            sys.exit(f'El puerto {puerto} ya está ocupado (¿otro server.js?). Usa --base http://localhost:<otro puerto>.')
    crm = http.server.ThreadingHTTPServer(('127.0.0.1', 0), CrmFalso)
    threading.Thread(target=crm.serve_forever, daemon=True).start()
    env = {k: v for k, v in os.environ.items() if not k.startswith(('SMTP_', 'META_', 'CHATWOOT_', 'MOTOR_', 'CRM_'))}
    env.update(PORT=str(puerto), MAIL_DRY_RUN='1', MOTOR_LEADS_DRY_RUN='1', CHATWOOT_DRY_RUN='1',
               CRM_URL=f'http://127.0.0.1:{crm.server_address[1]}', CRM_API_KEY='prueba-local')
    log = open(Path(tempfile.gettempdir()) / 'mercurial-contenido-servidor.log', 'w')
    proc = subprocess.Popen(['node', 'server.js'], cwd=raiz, env=env, stdout=log, stderr=subprocess.STDOUT)
    for _ in range(50):
        try:
            urllib.request.urlopen(f'http://localhost:{puerto}/', timeout=1)
            return proc, crm
        except Exception:
            time.sleep(0.2)
    proc.kill()
    sys.exit('No arrancó server.js (ver mercurial-contenido-servidor.log en la carpeta temporal)')


def elegir(page, selector, valor=None):
    """Fija un <select> (aunque sitio.js lo haya reemplazado por su desplegable propio)."""
    page.eval_on_selector(selector, """(s, v) => {
        if (v == null) v = [...s.options].find(o => o.value && !o.disabled).value;
        s.value = v; s.dispatchEvent(new Event('input', {bubbles: true})); s.dispatchEvent(new Event('change', {bubbles: true}));
    }""", valor)


def llenar(page, tipo):
    f = 'main form'
    if tipo == 'barra':
        page.fill(f'{f} [name=empresa]', EMPRESA)
        page.fill(f'{f} [name=telefono]', TEL)
    elif tipo in ('carga', 'poliza'):
        page.fill(f'{f} [name=empresa]', EMPRESA)
        page.fill(f'{f} [name=nombre]', NOMBRE)
        page.fill(f'{f} [name=correo]', CORREO)
        page.fill(f'{f} [name=telefono]', TEL)
        page.check(f'{f} input[name=operacion][value={"Nacional" if tipo == "poliza" else "Exporto"}]')
        elegir(page, f'{f} [name=asegura_hoy]', 'Forwarder')
    elif tipo == 'certificado':
        elegir(page, f'{f} [name=operacion]', 'Importación')
        page.fill(f'{f} [name=valor_mercaderia]', '40000')
        page.fill(f'{f} [name=mercaderia]', 'Repuestos de prueba')
        page.fill(f'{f} [name=nombre]', NOMBRE)
        page.fill(f'{f} [name=empresa]', EMPRESA)
        page.fill(f'{f} [name=telefono]', TEL)
        page.fill(f'{f} [name=correo]', CORREO)
    elif tipo == 'auto':
        page.fill(f'{f} [name=nombre]', NOMBRE)
        page.fill(f'{f} [name=rut]', RUT)
        page.fill(f'{f} [name=comuna]', 'Providencia')
        page.fill(f'{f} [name=telefono]', TEL)
        page.fill(f'{f} [name=patente]', PATENTE)
        page.fill(f'{f} [name=correo]', CORREO)
    elif tipo == 'desgravamen':
        elegir(page, f'{f} [name=situacion]', 'Compra con crédito hipotecario nuevo')
        elegir(page, f'{f} [name=rechazo]', 'Sí, me lo rechazaron')
        elegir(page, f'{f} [name=capital]', 'Desde UF 2.000')
        elegir(page, f'{f} [name=banco]', 'Santander')
        page.fill(f'{f} [name=nombre]', NOMBRE)
        page.fill(f'{f} [name=telefono]', TEL)
        page.fill(f'{f} [name=correo]', CORREO)
    elif tipo == 'consulta':
        page.fill(f'{f} [name=nombre]', NOMBRE)
        page.fill(f'{f} [name=correo]', CORREO)
        page.fill(f'{f} [name=mensaje]', 'Mensaje de prueba (local).')
    elif tipo == 'pyme':
        page.fill('#c_nombre', 'Cliente')
        page.fill('#c_apellido', 'Prueba')
        page.fill('#c_email', CORREO)
        page.fill('#c_telefono', TEL)
        page.fill('#rut', RUT)
        page.fill('#razon_social', EMPRESA)
        page.wait_for_function("document.querySelector('#tipo_ubicacion').options.length > 1")
        for s in ('#tipo_ubicacion', '#muro', '#techo', '#antiguedad'):
            elegir(page, s)
        page.fill('#direccion', 'Calle Prueba 123')
        page.fill('#pisos', '1')
        for campo, texto in (('#comuna', 'Providencia'), ('#actividad', 'oficina')):
            page.click(campo)
            page.keyboard.type(texto, delay=20)
            lista = page.locator(f'#{page.get_attribute(campo, "aria-controls")} [role=option]').first
            lista.wait_for(state='visible', timeout=5000)
            lista.click()
        page.fill('#m_contenido', '1000')


def enviar(page, tipo):
    api = '/api/cotizaciones/pyme' if tipo == 'pyme' else '/api/contacto'
    llenar(page, tipo)
    boton = page.locator('main form button[type=submit]').first
    with page.expect_response(lambda r: api in r.url and r.request.method == 'POST', timeout=30000) as info:
        boton.click()
    r = info.value
    cuerpo = r.text()
    if r.status != 200:
        return f'{api} respondió {r.status}: {cuerpo[:200]}'
    try:
        page.wait_for_selector('main .exito:not([hidden]), main .ok:not([hidden]), #responseModal.active .modal-icon.success', timeout=8000)
    except Exception:
        return f'{api} respondió 200 pero no apareció el mensaje de éxito'
    return None


REVISAR_JS = r"""() => {
  const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)];
  const meta = n => (q(`meta[name="${n}"]`) || q(`meta[property="${n}"]`) || {}).content || '';
  const main = qa('main');
  const enMain = main[0] || document.body;
  const vis = el => { const r = el.getBoundingClientRect(), st = getComputedStyle(el); return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none'; };
  const enPantalla = el => { const r = el.getBoundingClientRect(); return vis(el) && r.top < innerHeight && r.bottom > 0; };
  const heads = [...enMain.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => Number(h.tagName[1]));
  const saltos = []; heads.forEach((n, i) => { if (i && n > heads[i - 1] + 1) saltos.push(`h${heads[i - 1]}→h${n}`); });
  const rellenos = [...enMain.querySelectorAll('.btn-azul, .btn-blanco, .btn-hero, button[type=submit]')].filter(enPantalla);
  const accion = rellenos.length || [...enMain.querySelectorAll('a.btn, form, input:not([type=hidden]):not([tabindex="-1"]), select, textarea')].some(enPantalla);
  const ld = qa('script[type="application/ld+json"]').map(s => s.textContent);
  const preguntasVisibles = qa('summary, h3').map(s => s.textContent.replace(/\s+/g, ' ').trim());
  return {
    title: document.title.trim(), description: meta('description'), robots: meta('robots'),
    canonical: (q('link[rel=canonical]') || {}).href || '',
    og: { title: meta('og:title'), description: meta('og:description'), image: meta('og:image') },
    mains: main.length, h1: qa('h1').length, saltos,
    formularios: enMain.querySelectorAll('form').length,
    sinAlt: qa('img:not([alt])').map(i => i.getAttribute('src')),
    iframes: enMain.querySelectorAll('iframe').length,
    rellenos: rellenos.map(b => b.textContent.trim().replace(/\s+/g, ' ')), accion,
    desborde: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ld, preguntasVisibles,
  };
}"""


def revisar_ld(textos, preguntas_visibles):
    errores = []
    norm = lambda t: ' '.join(t.split())
    for t in textos:
        try:
            datos = json.loads(t)
        except json.JSONDecodeError as e:
            errores.append(f'JSON-LD no parsea: {e}')
            continue
        if datos.get('@context') not in ('https://schema.org', 'http://schema.org'):
            errores.append('JSON-LD sin @context schema.org')
        nodos = datos.get('@graph', [datos])
        for n in nodos:
            if '@type' not in n:
                errores.append('nodo JSON-LD sin @type')
            if n.get('@type') == 'FAQPage':
                for p in n.get('mainEntity', []):
                    if norm(p.get('name', '')) not in [norm(v) for v in preguntas_visibles]:
                        errores.append(f'FAQ del JSON-LD no visible: {p.get("name")}')
    return errores


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', default='http://localhost:3983')
    ap.add_argument('--sin-arrancar', action='store_true', help='no arrancar server.js (ya está corriendo)')
    ap.add_argument('--enviar', action='store_true', help='enviar cada formulario con datos ficticios')
    ap.add_argument('--capturas', help='carpeta donde guardar capturas')
    ap.add_argument('--sufijo', default='', help='sufijo de las capturas (p. ej. antes / despues)')
    ap.add_argument('--raiz', default=str(RAIZ), help='carpeta del sitio a servir (por defecto, este repo)')
    ap.add_argument('--solo', help='revisar solo estas páginas (nombres cortos separados por coma)')
    args = ap.parse_args()

    host = urlparse(args.base).hostname or ''
    if host not in ('localhost', '127.0.0.1'):
        sys.exit('Solo se prueba en local: --base debe ser localhost o 127.0.0.1.')
    proc = crm = None
    if not args.sin_arrancar:
        proc, crm = arrancar_servidor(urlparse(args.base).port or 3983, Path(args.raiz))
    capturas = Path(args.capturas) if args.capturas else None
    if capturas:
        capturas.mkdir(parents=True, exist_ok=True)
    paginas = [p for p in PAGINAS if not args.solo or p[1] in args.solo.split(',')]

    fallas, vistos_title, vistos_desc = [], {}, {}
    ip = [10]
    try:
        with sync_playwright() as pw:
            nav = pw.chromium.launch()
            for ancho, alto, letra in ANCHOS:
                for ruta, nombre, n_forms, tipo, noindex in paginas:
                    ip[0] += 1
                    ctx = nav.new_context(viewport={'width': ancho, 'height': alto}, reduced_motion='reduce', locale='es-CL',
                                          extra_http_headers={'X-Forwarded-For': f'198.51.100.{ip[0] % 250}'})
                    # Sin aviso de cookies (elección «rechazado» guardada) para medir la primera pantalla de la página.
                    ctx.add_init_script("try{localStorage.setItem('mercurial_cookie_consent',JSON.stringify({estado:'rechazado',fecha:new Date().toISOString()}))}catch(e){}")
                    ctx.route('**/*', lambda route: route.continue_() if urlparse(route.request.url).hostname in ('localhost', '127.0.0.1')
                              else route.fulfill(status=204, body=''))
                    page = ctx.new_page()
                    errores_consola = []
                    page.on('console', lambda m: errores_consola.append(m.text) if m.type == 'error' else None)
                    page.on('pageerror', lambda e: errores_consola.append(str(e)))
                    r = page.goto(args.base + ruta, wait_until='networkidle')
                    page.wait_for_timeout(300)
                    d = page.evaluate(REVISAR_JS)
                    pre = f'[{nombre} {ancho}]'
                    mal = []
                    if r.status != 200: mal.append(f'HTTP {r.status}')
                    if not d['title']: mal.append('sin title')
                    if not d['description']: mal.append('sin meta description')
                    if not d['canonical']: mal.append('sin canonical')
                    if not all(d['og'].values()): mal.append(f'Open Graph incompleto {d["og"]}')
                    if len(d['title']) > 65: mal.append(f'title de {len(d["title"])} caracteres')
                    if len(d['description']) > 160: mal.append(f'description de {len(d["description"])} caracteres')
                    if noindex != ('noindex' in d['robots']): mal.append(f'robots inesperado: «{d["robots"]}»')
                    if d['mains'] != 1: mal.append(f'{d["mains"]} <main>')
                    if d['h1'] != 1: mal.append(f'{d["h1"]} <h1>')
                    if d['saltos']: mal.append(f'saltos de encabezado {d["saltos"]}')
                    if d['sinAlt']: mal.append(f'img sin alt {d["sinAlt"]}')
                    if d['formularios'] != n_forms: mal.append(f'{d["formularios"]} formularios (se esperaba {n_forms})')
                    if d['iframes']: mal.append(f'{d["iframes"]} iframe en <main>')
                    if len(d['rellenos']) > 1: mal.append(f'{len(d["rellenos"])} botones rellenos en la primera pantalla {d["rellenos"]}')
                    if not d['accion'] and nombre not in SIN_ACCION_OBLIGATORIA: mal.append('sin acción en la primera pantalla')
                    if d['desborde'] > 0: mal.append(f'desborde horizontal de {d["desborde"]} px')
                    mal += revisar_ld(d['ld'], d['preguntasVisibles'])
                    if letra == 'd':
                        for clave, vistos, etiqueta in ((d['title'], vistos_title, 'title'), (d['description'], vistos_desc, 'description')):
                            if clave in vistos: mal.append(f'{etiqueta} repetido con {vistos[clave]}')
                            vistos[clave] = nombre
                    if capturas:
                        page.screenshot(path=str(capturas / f'{nombre}-{letra}-pantalla{"-" + args.sufijo if args.sufijo else ""}.png'))
                        page.screenshot(path=str(capturas / f'{nombre}-{letra}-completa{"-" + args.sufijo if args.sufijo else ""}.png'), full_page=True)
                    if args.enviar and tipo and letra == 'd':
                        e = enviar(page, tipo)
                        if e: mal.append(e)
                        elif capturas:
                            page.screenshot(path=str(capturas / f'{nombre}-{letra}-enviado{"-" + args.sufijo if args.sufijo else ""}.png'))
                    if errores_consola: mal.append(f'errores de consola: {errores_consola[:3]}')
                    estado = 'OK ' if not mal else 'MAL'
                    print(f'{estado} {pre} forms={d["formularios"]} botones={d["rellenos"]} ld={len(d["ld"])}' + (''.join(f'\n     - {m}' for m in mal)))
                    fallas += [f'{pre} {m}' for m in mal]
                    ctx.close()
            nav.close()
    finally:
        if proc:
            proc.terminate()
        if crm:
            crm.shutdown()
    print(f'\n{len(fallas)} problema(s).' if fallas else '\nTodo OK.')
    sys.exit(1 if fallas else 0)


if __name__ == '__main__':
    main()

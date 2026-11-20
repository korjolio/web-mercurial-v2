#!/usr/bin/env python3
"""Pruebas de navegación y elementos globales de mercurial.cl (menú, panel móvil, aviso de cookies, botón fijo del
celular, enlace de salto, aria-current, pie y puntos del carrusel) en las 15 páginas, a 1440, 1024 y 390 px.

Requiere el sitio local en modo prueba (nunca se envían formularios, ni aquí ni contra mercurial.cl):
    PORT=3982 MAIL_DRY_RUN=1 MOTOR_LEADS_DRY_RUN=1 node server.js
    python tests/nav.py [--base http://localhost:3982] [--capturas DIR] [--solo /seguro-auto]

Sale con 1 si algo falla e imprime cada falla con página y ancho. Con Python de un venv que tenga Playwright
(p. ej. /Users/pepa/orca/workspaces/Chatwoot/Autos-Web/.venv/bin/python).
"""
import argparse
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse, parse_qs

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
PAGINAS = ['/', '/seguros/flotas', '/seguros/transporte', '/seguros/transporte/importaciones-exportaciones',
           '/seguros/transporte/certificado', '/seguros/transporte/poliza-anual', '/seguros/incendio',
           '/seguros/colectivos-de-salud', '/seguro-auto', '/seguro-auto/promocion', '/seguro-mascotas',
           '/desgravamen-rechazado', '/cotizar-pyme', '/consultas-y-reclamos', '/politica-privacidad']
# Páginas que deben estar en el menú Seguros (escritorio y celular)
EN_MENU = ['/seguros/flotas', '/seguros/transporte', '/seguros/transporte/importaciones-exportaciones',
           '/seguros/transporte/certificado', '/seguros/transporte/poliza-anual', '/seguros/incendio',
           '/seguros/colectivos-de-salud', '/seguro-auto', '/seguro-mascotas', '/desgravamen-rechazado']
ANCHOS = {1440: 900, 1024: 768, 390: 844}
CONSENT = "localStorage.setItem('mercurial_cookie_consent', JSON.stringify({estado:'rechazado',fecha:'2026-11-19'}))"
# Ninguna petición sale a formularios: se cortan los POST de la API por si algo se enviara por error
API = ['**/api/**']

fallas = []


def falla(pagina, ancho, msg):
    fallas.append(f'{pagina} @{ancho}: {msg}')


def cubierto_js():
    # true si el centro del elemento no es el propio elemento (o un hijo): algo lo tapa o está fuera de pantalla
    return """el => { if (!el) return 'no existe'; const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return 'sin tamaño';
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return 'fuera de pantalla (y=' + Math.round(y) + ')';
      const t = document.elementFromPoint(x, y);
      return (t && (t === el || el.contains(t))) ? '' : ('tapado por ' + (t ? (t.className || t.tagName) : 'nada')); }"""


def revisar_comun(pg, ruta, ancho, errores):
    # Desborde horizontal
    sw = pg.evaluate('[document.documentElement.scrollWidth, document.documentElement.clientWidth]')
    if sw[0] > sw[1] + 1:
        falla(ruta, ancho, f'desborde horizontal {sw[0]} > {sw[1]}')
    # Enlace de salto: primer Tab y destino
    pg.evaluate('document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0)')
    pg.keyboard.press('Tab')
    info = pg.evaluate("""() => { const a = document.activeElement; const r = a.getBoundingClientRect();
        return { cls: a.className, href: a.getAttribute('href'), visible: r.top >= 0 && r.bottom <= innerHeight && r.width > 0 }; }""")
    if info['cls'] != 'saltar' or info['href'] != '#contenido' or not info['visible']:
        falla(ruta, ancho, f'el primer Tab no es «Saltar al contenido» visible: {info}')
    else:
        pg.keyboard.press('Enter')
        pg.wait_for_timeout(150)
        if pg.evaluate("document.activeElement.id") != 'contenido':
            falla(ruta, ancho, '«Saltar al contenido» no mueve el foco a #contenido')
    # aria-current: la página actual marcada en el menú, y nada más marcado con otra ruta
    marcados = pg.evaluate("""() => [...document.querySelectorAll('#menu-seguros a[aria-current], #panel-movil a[aria-current], footer a[aria-current], .util a[aria-current]')]
        .map(a => new URL(a.href).pathname)""")
    if any(m != ruta for m in marcados):
        falla(ruta, ancho, f'aria-current en otra página: {marcados}')
    if ruta in EN_MENU and pg.evaluate(f"!document.querySelector('#menu-seguros a[href=\"{ruta}\"][aria-current=page]')"):
        falla(ruta, ancho, 'el menú Seguros no marca la página actual con aria-current')
    # Menú completo
    faltan = pg.evaluate(f"""() => {EN_MENU}.filter(r => !document.querySelector('#menu-seguros a[href="' + r + '"]') || !document.querySelector('#panel-movil a[href="' + r + '"]'))""")
    if faltan:
        falla(ruta, ancho, f'faltan en el menú: {faltan}')
    # Cotizar lleva a un destino que existe en la página; WhatsApp con texto prellenado
    acc = pg.evaluate("""() => [...document.querySelectorAll('#nav .acc a, #panel-movil .acc a, .util a[href*="wa.me"], footer a[href*="wa.me"]')].map(a => a.getAttribute('href'))""")
    for h in acc:
        if h.startswith('#') and pg.evaluate(f"!document.querySelector({h!r})"):
            falla(ruta, ancho, f'«Cotizar» apunta a {h}, que no existe en la página')
        if 'wa.me' in h and not parse_qs(urlparse(h).query).get('text'):
            falla(ruta, ancho, f'WhatsApp sin texto prellenado: {h}')
    # Pie: sin h4 y títulos h2; «Registro» CMF solo en barra superior y pie; texto neutro
    pie = pg.evaluate("""() => ({ h4: document.querySelectorAll('footer h4').length,
        h: [...document.querySelectorAll('footer h1,footer h2,footer h3,footer h5,footer h6')].map(h => h.tagName),
        registro: [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && /8929/.test(e.textContent)).map(e => e.closest('footer') ? 'pie' : e.closest('.util') ? 'barra' : 'cuerpo'),
        txt: (document.querySelector('footer .pie p') || {}).textContent || '' })""")
    if pie['h4'] or any(h != 'H2' for h in pie['h']):
        falla(ruta, ancho, f'encabezados del pie: h4={pie["h4"]} {pie["h"]}')
    if pie['registro'].count('pie') != 1 or pie['registro'].count('barra') != 1:
        falla(ruta, ancho, f'«Registro N° 8929» en el marco: {pie["registro"]} (debe ser 1 en la barra y 1 en el pie)')
    if 'cuerpo' in pie['registro']:
        print(f'  aviso {ruta} @{ancho}: «8929» también en el cuerpo de la página (contenido, no marco)')
    if 'para empresas.' in pie['txt']:
        falla(ruta, ancho, 'el pie dice «para empresas» en todas las páginas')
    for e in errores:
        falla(ruta, ancho, f'error de consola: {e}')


def revisar_escritorio(pg, ruta, ancho):
    btn = pg.locator('#btn-seguros')
    abierto = lambda: pg.evaluate("document.querySelector('#btn-seguros').getAttribute('aria-expanded') === 'true' && document.querySelector('#menu-seguros').classList.contains('is-open') && !document.querySelector('#menu-seguros').inert")
    # Clic abre, clic fuera cierra
    btn.click(); pg.wait_for_timeout(300)
    if not abierto():
        falla(ruta, ancho, 'el clic no abre el menú Seguros')
    pg.mouse.click(ancho - 5, ANCHOS[ancho] - 5); pg.wait_for_timeout(300)
    if abierto():
        falla(ruta, ancho, 'el clic fuera no cierra el menú')
    # Teclado: Enter abre, Tab entra al primer enlace, Escape cierra y devuelve el foco
    btn.focus(); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    if not abierto():
        falla(ruta, ancho, 'Enter no abre el menú')
    pg.keyboard.press('Tab')
    if not pg.evaluate("document.activeElement.closest('#menu-seguros') !== null"):
        falla(ruta, ancho, 'Tab no entra al menú abierto')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(250)
    if abierto() or pg.evaluate("document.activeElement.id") != 'btn-seguros':
        falla(ruta, ancho, 'Escape no cierra el menú o no devuelve el foco al botón')
    # Tab fuera del menú lo cierra
    pg.keyboard.press('Enter'); pg.wait_for_timeout(250)
    n = pg.evaluate("document.querySelectorAll('#menu-seguros a').length")
    for _ in range(n + 1):
        pg.keyboard.press('Tab')
    pg.wait_for_timeout(250)
    if abierto():
        falla(ruta, ancho, 'salir con Tab no cierra el menú')
    # Con el menú abierto, el aviso de cookies no lo tapa (se esconde)
    if pg.evaluate("!!document.querySelector('.mc-consent:not([hidden])')"):
        btn.click(); pg.wait_for_timeout(300)
        tapa = pg.evaluate("getComputedStyle(document.querySelector('.mc-consent')).display !== 'none'")
        ult = pg.evaluate(f"({cubierto_js()})([...document.querySelectorAll('#menu-seguros a')].pop())")
        if tapa or (ult and 'fuera' not in ult):
            falla(ruta, ancho, f'el aviso de cookies queda sobre el menú abierto ({ult})')
        btn.click(); pg.wait_for_timeout(300)


def revisar_banner(pg, ruta, ancho, alto):
    b = pg.evaluate("(() => { const b = document.querySelector('.mc-consent'); if (!b || b.hidden) return null; const r = b.getBoundingClientRect(); "
                    "const btns = [...b.querySelectorAll('button')].map(x => { const s = x.getBoundingClientRect(); const c = getComputedStyle(x); return [Math.round(s.width), Math.round(s.height), c.fontSize, c.fontWeight]; }); "
                    "return { h: r.height, top: r.top, btns }; })()")
    if not b:
        falla(ruta, ancho, 'no aparece el aviso de cookies en la primera visita')
        return
    if b['h'] > alto * 0.15:
        falla(ruta, ancho, f'el aviso de cookies ocupa {b["h"] / alto:.1%} de la pantalla (máx. 15%)')
    if len(b['btns']) != 2 or b['btns'][0] != b['btns'][1]:
        falla(ruta, ancho, f'«Rechazar» y «Aceptar» no son igual de visibles: {b["btns"]}')
    # El botón fijo de la cabecera (celular) o los de escritorio no quedan bajo el aviso
    for sel in ['#nav .acc .btn-azul', '#hamb']:
        vis = pg.evaluate(f"(() => {{ const e = document.querySelector('{sel}'); return e && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && e.offsetParent !== null; }})()")
        if vis:
            r = pg.evaluate(f"({cubierto_js()})(document.querySelector('{sel}'))")
            if r:
                falla(ruta, ancho, f'{sel} {r} con el aviso de cookies abierto')


def revisar_movil(pg, ruta, ancho, con_banner):
    hamb = pg.locator('#hamb')
    hamb.click(); pg.wait_for_timeout(500)
    if pg.evaluate("document.querySelector('#hamb').getAttribute('aria-expanded')") != 'true':
        falla(ruta, ancho, 'la hamburguesa no abre el panel')
        return
    # Nada tapa el final del panel (últimos enlaces y WhatsApp), con o sin aviso de cookies
    pg.evaluate("document.querySelector('#panel-movil').scrollTop = 99999"); pg.wait_for_timeout(200)
    for sel in ['#panel-movil ul:last-of-type li:last-child a', '#panel-movil .acc a']:
        if pg.evaluate(f"!!document.querySelector('{sel}')"):
            r = pg.evaluate(f"({cubierto_js()})(document.querySelector('{sel}'))")
            if r:
                falla(ruta, ancho, f'panel móvil{" con aviso" if con_banner else ""}: {sel} {r}')
    # WhatsApp del panel visible sin desplazarse (fijo al pie del panel)
    pg.evaluate("document.querySelector('#panel-movil').scrollTop = 0"); pg.wait_for_timeout(100)
    if pg.evaluate("!!document.querySelector('#panel-movil .acc a')"):
        r = pg.evaluate(f"({cubierto_js()})(document.querySelector('#panel-movil .acc a'))")
        if r:
            falla(ruta, ancho, f'WhatsApp del panel no está a la vista al abrirlo: {r}')
    # Teclado: el foco no sale del panel ni de la cabecera (el resto queda inerte, también el aviso)
    fuera = []
    for _ in range(40):
        pg.keyboard.press('Tab')
        donde = pg.evaluate("(() => { const a = document.activeElement; return a === document.body ? 'body' : a.closest('#nav, #panel-movil') ? '' : (a.className || a.tagName); })()")
        if donde and donde != 'body':
            fuera.append(donde)
    if fuera:
        falla(ruta, ancho, f'con el panel abierto el Tab llega fuera del menú: {sorted(set(fuera))[:3]}')
    # Escape cierra y devuelve el foco
    pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
    estado = pg.evaluate("[document.querySelector('#hamb').getAttribute('aria-expanded'), document.activeElement.id, document.querySelector('#panel-movil').hidden, [...document.querySelectorAll('body > *')].filter(e => e.inert).length]")
    if estado[0] != 'false' or estado[1] != 'hamb' or not estado[2] or estado[3]:
        falla(ruta, ancho, f'Escape no cierra bien el panel (expanded, foco, hidden, inertes): {estado}')
    # Tocar la cabecera fuera de los enlaces cierra
    hamb.click(); pg.wait_for_timeout(450)
    box = pg.locator('#nav').bounding_box()
    pg.mouse.click(box['width'] * 0.62, box['y'] + 4); pg.wait_for_timeout(500)
    if pg.evaluate("document.querySelector('#hamb').getAttribute('aria-expanded')") == 'true':
        falla(ruta, ancho, 'tocar fuera de los enlaces no cierra el panel')
        pg.keyboard.press('Escape'); pg.wait_for_timeout(400)


def revisar_cta_fijo(pg, ruta, ancho):
    # Al bajar queda a la vista UN acceso fijo (cabecera compacta con Cotizar o WhatsApp) que no tapa contenido
    alto = ANCHOS[ancho]
    total = pg.evaluate('document.documentElement.scrollHeight')
    malos = []
    for frac in (0.3, 0.55, 0.8):
        pg.evaluate(f'window.scrollTo(0, {int(total * frac)})'); pg.wait_for_timeout(450)
        d = pg.evaluate("""(() => { const n = document.querySelector('#nav'); const r = n.getBoundingClientRect();
            const c = document.querySelector('#nav .acc .btn-azul'); const cs = c && getComputedStyle(c);
            return { top: r.top, h: r.height, enVista: n.classList.contains('cta-en-vista'),
                     cta: !!c && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.5,
                     ham: document.querySelector('#hamb').getBoundingClientRect().top >= 0,
                     sp: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) }; })()""")
        if abs(d['top']) > 1 or not d['ham']:
            malos.append(f'cabecera no fija al {frac:.0%} (top={d["top"]})')
        if d['h'] > alto * 0.12:
            malos.append(f'cabecera fija de {d["h"]}px (> 12% de la pantalla)')
        if d['sp'] < d['h']:
            malos.append(f'scroll-padding-top {d["sp"]} menor que la cabecera {d["h"]}')
        if not d['cta'] and not d['enVista']:
            malos.append(f'sin botón de contacto a la vista al {frac:.0%}')
        if d['cta']:
            r = pg.evaluate(f"({cubierto_js()})(document.querySelector('#nav .acc .btn-azul'))")
            if r:
                malos.append(f'botón fijo {r}')
    vistos = pg.evaluate("document.querySelector('#nav .acc .btn-azul') !== null")
    if not vistos:
        malos.append('la cabecera no tiene botón de contacto')
    for m in sorted(set(malos)):
        falla(ruta, ancho, m)
    pg.evaluate('window.scrollTo(0, 0)')


def revisar_puntos(pg, ruta, ancho, tactil):
    # Puntos del carrusel: área de toque ≥ 24 px (≥ 44 px de alto en pantallas táctiles), sin cambiar el punto
    datos = pg.evaluate("""(() => [...document.querySelectorAll('.bn-puntos button')].map(b => {
        b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const toca = dy => { const t = document.elementFromPoint(cx, cy + dy); return t === b; };
        let arriba = 0; while (arriba < 40 && toca(-(arriba + 1))) arriba++;
        let abajo = 0; while (abajo < 40 && toca(abajo + 1)) abajo++;
        return { h: Math.round(r.height), area: arriba + abajo + 1, w: Math.round(r.width) }; }))()""")
    minimo = 44 if tactil else 24
    for d in datos:
        if d['area'] < minimo:
            falla(ruta, ancho, f'punto del carrusel con área de toque de {d["area"]}px de alto (mín. {minimo})')
        if d['h'] > 8:
            falla(ruta, ancho, f'el punto del carrusel cambió de aspecto ({d["h"]}px de alto)')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', default='http://localhost:3982')
    ap.add_argument('--capturas', default='')
    ap.add_argument('--solo', default='')
    a = ap.parse_args()
    if 'mercurial.cl' in a.base:
        sys.exit('Estas pruebas son solo para el sitio local (no se prueba contra mercurial.cl).')
    paginas = [a.solo] if a.solo else PAGINAS
    cap = Path(a.capturas) if a.capturas else None
    if cap:
        cap.mkdir(parents=True, exist_ok=True)

    # Los bloques globales de los HTML coinciden con el generador (docs/marco.py)
    r = subprocess.run([sys.executable, str(RAIZ / 'docs' / 'marco.py'), '--check'], capture_output=True, text=True)
    if r.returncode:
        fallas.append('docs/marco.py --check: ' + r.stdout.strip())

    with sync_playwright() as p:
        br = p.chromium.launch()
        for ancho, alto in ANCHOS.items():
            movil = ancho < 861
            opciones = dict(viewport={'width': ancho, 'height': alto}, is_mobile=movil, has_touch=movil)
            for con_banner in (True, False):
                ctx = br.new_context(**opciones)
                ctx.route('**/*', lambda route: route.abort() if route.request.method == 'POST' else route.continue_())
                if not con_banner:
                    ctx.add_init_script(CONSENT)
                for ruta in paginas:
                    pg = ctx.new_page()
                    errores = []
                    base_host = urlparse(a.base).netloc
                    pg.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:160]))
                    pg.on('console', lambda m, errores=errores: m.type == 'error' and base_host in (m.location.get('url') or base_host) and errores.append(m.text[:160]))
                    if con_banner:
                        pg.add_init_script("try { localStorage.removeItem('mercurial_cookie_consent') } catch (e) {}")
                    pg.goto(a.base + ruta, wait_until='load')
                    pg.wait_for_timeout(600)
                    etiqueta = f'{ruta} {"con" if con_banner else "sin"} aviso'
                    try:
                        if con_banner:
                            revisar_banner(pg, ruta, ancho, alto)
                            if cap:
                                pg.screenshot(path=str(cap / f'{(ruta.strip("/") or "inicio").replace("/", "_")}-{ancho}-aviso.png'))
                            if movil:
                                revisar_movil(pg, ruta, ancho, True)
                            else:
                                revisar_escritorio(pg, ruta, ancho)
                        else:
                            revisar_comun(pg, ruta, ancho, errores)
                            if movil:
                                revisar_movil(pg, ruta, ancho, False)
                                revisar_cta_fijo(pg, ruta, ancho)
                                if cap:
                                    pg.evaluate('window.scrollTo(0, document.documentElement.scrollHeight * 0.55)'); pg.wait_for_timeout(400)
                                    pg.screenshot(path=str(cap / f'{(ruta.strip("/") or "inicio").replace("/", "_")}-{ancho}-scroll.png'))
                            else:
                                revisar_escritorio(pg, ruta, ancho)
                            revisar_puntos(pg, ruta, ancho, movil)
                    except Exception as e:  # una página que se cae no detiene las demás
                        falla(ruta, ancho, f'{etiqueta}: excepción {type(e).__name__}: {str(e)[:200]}')
                    pg.close()
                ctx.close()
        # Movimiento reducido: la cabecera y su botón no animan
        ctx = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce')
        ctx.add_init_script(CONSENT)
        pg = ctx.new_page(); pg.goto(a.base + '/seguro-auto', wait_until='load')
        dur = pg.evaluate("getComputedStyle(document.querySelector('#nav .acc .btn-azul')).transitionDuration")
        if any(float(x.strip().rstrip('s') or 0) > 0 for x in dur.split(',')):
            falla('/seguro-auto', 390, f'con movimiento reducido el botón fijo anima ({dur})')
        ctx.close()
        br.close()

    if fallas:
        print(f'\n{len(fallas)} falla(s):')
        for f in fallas:
            print(' -', f)
        sys.exit(1)
    print(f'OK: {len(paginas)} páginas × {len(ANCHOS)} anchos, con y sin aviso de cookies.')


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Prueba de rendimiento de mercurial.cl (local). Nunca envía formularios.

Uso (con Playwright instalado en el Python que lo corre):
    python tests/perf.py                       # levanta server.js en :3981 (modo prueba) si no está arriba
    python tests/perf.py --out antes.json --shots carpeta/   # guarda resultados y capturas 1440 y 390
    python tests/perf.py --pages / /seguros/flotas
    python tests/perf.py --comparar antes.json   # además falla si el h1 cambió de lugar (regresión de diseño)

Mide cada página como un celular Android (412x823, DPR 1,75) con 4G lenta (150 ms, 1,6 Mbps) y CPU 4x
más lenta, sin caché y sin aceptar cookies: bytes de imagen, LCP (tiempo y elemento), CLS y errores de consola.
Los terceros (GTM, Google Analytics, Meta, LinkedIn, Cloudflare) se responden vacíos para que la medición sea
estable y no mande visitas falsas a la analítica; con --terceros se dejan pasar.

Falla (código 1) si:
  - el LCP es una imagen sin width/height (o la imagen con fetchpriority="high" no los tiene),
  - el LCP es una imagen con loading="lazy",
  - una foto de portada (src/img/fotos/*, src/img/mascota*) descargada pesa más de 200 KB,
  - hay más de una imagen con fetchpriority="high",
  - una imagen llega sin Content-Type image/* (p. ej. AVIF como application/octet-stream),
  - hay errores de consola o imágenes rotas (naturalWidth 0) tras recorrer la página.
"""
import argparse
import asyncio
import json
import os
import socket
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

from playwright.async_api import async_playwright

PAGES = [
    '/', '/seguros/flotas', '/seguros/transporte', '/seguros/transporte/importaciones-exportaciones',
    '/seguros/transporte/certificado', '/seguros/transporte/poliza-anual', '/seguros/incendio',
    '/seguros/colectivos-de-salud', '/seguro-auto', '/seguro-auto/promocion', '/seguro-mascotas',
    '/desgravamen-rechazado', '/cotizar-pyme', '/consultas-y-reclamos', '/politica-privacidad',
]
MAX_FOTO = 200 * 1024
TERCEROS = ('googletagmanager.com', 'google-analytics.com', 'googleadservices.com', 'doubleclick.net',
            'facebook.net', 'facebook.com', 'licdn.com', 'linkedin.com', 'cloudflareinsights.com',
            'bciseguros.cl', 'clarity.ms')
ROOT = Path(__file__).resolve().parent.parent

OBSERVER = """
window.__perf = { lcp: null, cls: 0, shifts: [] };
new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.lcp = e; })
  .observe({ type: 'largest-contentful-paint', buffered: true });
new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) {
  window.__perf.cls += e.value;
  window.__perf.shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4),
    nodes: (e.sources || []).map(s => s.node ? (s.node.tagName || '#text') + (s.node.className && typeof s.node.className === 'string' ? '.' + s.node.className.split(' ')[0] : '') : '?') });
} }).observe({ type: 'layout-shift', buffered: true });
"""

LEER = """() => {
  const p = window.__perf, e = p.lcp, el = e && e.element;
  const img = el && el.tagName === 'IMG' ? el : null;
  const altas = [...document.querySelectorAll('img[fetchpriority="high"]')];
  return {
    lcp_ms: e ? Math.round(e.startTime) : null,
    lcp_tag: el ? el.tagName : null,
    lcp_url: e && e.url ? e.url.replace(location.origin, '') : '',
    lcp_img: img ? { w: img.getAttribute('width'), h: img.getAttribute('height'), loading: img.getAttribute('loading'),
                     prio: img.getAttribute('fetchpriority'), current: img.currentSrc.replace(location.origin, '') } : null,
    altas: altas.map(i => ({ src: i.currentSrc.replace(location.origin, '') || i.getAttribute('src'),
                             w: i.getAttribute('width'), h: i.getAttribute('height'), loading: i.getAttribute('loading') })),
    cls: +p.cls.toFixed(4), shifts: p.shifts.slice(0, 6),
  };
}"""


def puerto_abierto(host, port):
    with socket.socket() as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


def levantar_servidor(base):
    u = urlparse(base)
    if puerto_abierto(u.hostname, u.port or 80):
        return None
    env = dict(os.environ, PORT=str(u.port or 80), MAIL_DRY_RUN='1', MOTOR_LEADS_DRY_RUN='1', CHATWOOT_DRY_RUN='1')
    proc = subprocess.Popen(['node', 'server.js'], cwd=ROOT, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(50):
        if puerto_abierto(u.hostname, u.port or 80):
            return proc
        time.sleep(0.2)
    proc.kill()
    sys.exit(f'No se pudo levantar server.js en {base}')


def es_tercero(url, base):
    host = urlparse(url).hostname or ''
    return host != urlparse(base).hostname and any(host == t or host.endswith('.' + t) for t in TERCEROS)


async def preparar_contexto(browser, base, terceros, **kw):
    ctx = await browser.new_context(**kw)
    if not terceros:
        async def bloquear(route):
            if es_tercero(route.request.url, base):
                ct = 'application/javascript' if route.request.resource_type == 'script' else 'text/plain'
                return await route.fulfill(status=200, body='', content_type=ct)
            await route.continue_()
        await ctx.route('**/*', bloquear)
    return ctx


async def medir(browser, base, ruta, terceros, throttle):
    ctx = await preparar_contexto(
        browser, base, terceros, viewport={'width': 412, 'height': 823}, device_scale_factor=1.75, is_mobile=True,
        has_touch=True, user_agent='Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) '
                                   'Chrome/140.0.0.0 Mobile Safari/537.36')
    await ctx.add_init_script(OBSERVER)
    page = await ctx.new_page()
    cdp = await ctx.new_cdp_session(page)
    await cdp.send('Network.enable')
    await cdp.send('Network.setCacheDisabled', {'cacheDisabled': True})
    if throttle:
        await cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 150,
                                                             'downloadThroughput': 1638 * 1024 / 8,
                                                             'uploadThroughput': 750 * 1024 / 8})
        await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    reqs = {}
    cdp.on('Network.responseReceived', lambda e: reqs.setdefault(e['requestId'], {}).update(
        url=e['response']['url'], type=e['type'], status=e['response']['status'], mime=e['response']['mimeType']))
    cdp.on('Network.loadingFinished', lambda e: reqs.setdefault(e['requestId'], {}).update(bytes=e['encodedDataLength']))
    errores = []
    page.on('console', lambda m: m.type == 'error' and errores.append(m.text[:200]))
    page.on('pageerror', lambda e: errores.append(f'pageerror: {str(e)[:200]}'))
    t0 = time.time()
    await page.goto(base + ruta, wait_until='load', timeout=120000)
    await page.wait_for_timeout(2500)
    datos = await page.evaluate(LEER)
    await ctx.close()

    imgs = [r for r in reqs.values() if r.get('type') == 'Image' and 'bytes' in r]
    fotos = [{'url': urlparse(r['url']).path, 'kb': round(r['bytes'] / 1024, 1)} for r in imgs
             if '/src/img/fotos/' in r['url'] or '/src/img/mascota' in r['url']]
    datos.update(
        ruta=ruta,
        total_kb=round(sum(r.get('bytes', 0) for r in reqs.values()) / 1024, 1),
        img_kb=round(sum(r['bytes'] for r in imgs) / 1024, 1),
        fotos=fotos,
        mime_malo=sorted({urlparse(r['url']).path for r in imgs if not r.get('mime', '').startswith('image/')}),
        errores=errores,
        segundos=round(time.time() - t0, 1),
    )
    return datos


async def capturar(browser, base, ruta, carpeta, terceros):
    """Capturas 1440 y 390 (sin limitar red), recorriendo la página para que carguen las imágenes diferidas."""
    rotas, errores = [], []
    nombre = ruta.strip('/').replace('/', '_') or 'portada'
    for ancho, alto, dpr in ((1440, 900, 1), (390, 844, 2)):
        ctx = await preparar_contexto(browser, base, terceros, viewport={'width': ancho, 'height': alto},
                                      device_scale_factor=dpr, is_mobile=ancho < 500)
        page = await ctx.new_page()
        page.on('console', lambda m: m.type == 'error' and errores.append(m.text[:200]))
        page.on('pageerror', lambda e: errores.append(f'pageerror: {str(e)[:200]}'))
        await page.goto(base + ruta, wait_until='load')
        await page.wait_for_timeout(600)
        h1 = await page.evaluate("() => { const h = document.querySelector('h1'); if (!h) return null; const r = h.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top + scrollY), Math.round(r.height)]; }")
        if carpeta:
            await page.screenshot(path=str(Path(carpeta) / f'{nombre}-{ancho}-arriba.png'))
        alto_doc = await page.evaluate('document.documentElement.scrollHeight')
        for y in range(0, alto_doc, alto // 2):
            await page.evaluate(f'window.scrollTo(0, {y})')
            await page.wait_for_timeout(120)
        await page.wait_for_timeout(800)
        malas = await page.evaluate("""() => [...document.images].filter(i => i.complete && i.getAttribute('src') && !i.closest('[hidden]')
              && i.naturalWidth === 0).map(i => i.currentSrc || i.src)""")
        rotas += [f'{ancho}px: {u}' for u in malas]
        info = await page.evaluate("""() => [...document.images].filter(i => /fotos|mascota/.test(i.currentSrc || i.src))
              .map(i => ({src: (i.currentSrc || i.src).replace(location.origin, ''), css: i.clientWidth, nat: i.naturalWidth}))""")
        if carpeta:
            await page.evaluate('window.scrollTo(0, 0)')
            await page.wait_for_timeout(300)
            await page.screenshot(path=str(Path(carpeta) / f'{nombre}-{ancho}-completa.png'), full_page=True)
        await ctx.close()
        yield ancho, {'imgs': info, 'h1': h1}
    yield 'rotas', (rotas, errores)


def revisar(r, previo=None):
    fallas = []
    for ancho in (1440, 390):  # el titular no debe moverse respecto de la medición anterior (--comparar)
        a, b = (previo or {}).get(f'h1_{ancho}'), r.get(f'h1_{ancho}')
        if a and b and any(abs(x - y) > 4 for x, y in zip(a, b)):
            fallas.append(f'el h1 se movió a {ancho}px: antes {a} (izq, arriba, alto), ahora {b}')
    li = r.get('lcp_img')
    if li and not (li['w'] and li['h']):
        fallas.append(f"LCP {li['current']} sin width/height")
    if li and li['loading'] == 'lazy':
        fallas.append(f"LCP {li['current']} con loading=lazy")
    for a in r['altas']:
        if not (a['w'] and a['h']):
            fallas.append(f"fetchpriority=high {a['src']} sin width/height")
    if len(r['altas']) > 1:
        fallas.append(f"{len(r['altas'])} imágenes con fetchpriority=high")
    for f in r['fotos']:
        if f['kb'] * 1024 > MAX_FOTO:
            fallas.append(f"foto {f['url']} pesa {f['kb']} KB (> 200 KB)")
    for u in r.get('mime_malo', []):
        fallas.append(f'imagen servida sin Content-Type de imagen: {u}')
    for e in r['errores'] + r.get('errores_capturas', []):
        fallas.append(f'consola: {e}')
    for u in r.get('rotas', []):
        fallas.append(f'imagen rota: {u}')
    return fallas


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', default='http://127.0.0.1:3981')
    ap.add_argument('--pages', nargs='*', default=PAGES)
    ap.add_argument('--out')
    ap.add_argument('--shots', help='carpeta para capturas 1440 y 390')
    ap.add_argument('--terceros', action='store_true', help='no bloquear GTM/Meta/LinkedIn')
    ap.add_argument('--sin-limite', action='store_true', help='sin limitar red ni CPU')
    ap.add_argument('--sin-capturas', action='store_true')
    ap.add_argument('--comparar', help='JSON de una corrida anterior: falla si el h1 cambia de posición')
    a = ap.parse_args()
    if a.shots:
        Path(a.shots).mkdir(parents=True, exist_ok=True)
    previos = {x['ruta']: x for x in json.loads(Path(a.comparar).read_text())} if a.comparar else {}
    proc = levantar_servidor(a.base)
    resultados, total_fallas = [], 0
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            for ruta in a.pages:
                r = await medir(browser, a.base, ruta, a.terceros, not a.sin_limite)
                if not a.sin_capturas:
                    async for clave, val in capturar(browser, a.base, ruta, a.shots, a.terceros):
                        if clave == 'rotas':
                            r['rotas'], r['errores_capturas'] = val[0], sorted(set(val[1]))
                        else:
                            r[f'imgs_{clave}'], r[f'h1_{clave}'] = val['imgs'], val['h1']
                r['fallas'] = revisar(r, previos.get(ruta))
                total_fallas += len(r['fallas'])
                resultados.append(r)
                lcp = f"{r['lcp_ms'] / 1000:.2f} s" if r['lcp_ms'] is not None else '—'
                print(f"{ruta:50} img {r['img_kb']:7.1f} KB  total {r['total_kb']:7.1f} KB  LCP {lcp:>7} "
                      f"({r['lcp_tag']} {r['lcp_url'][-40:]})  CLS {r['cls']:.3f}  {'OK' if not r['fallas'] else 'FALLA'}",
                      flush=True)
                for f in r['fallas']:
                    print('    -', f)
            await browser.close()
    finally:
        if proc:
            proc.terminate()
    if a.out:
        Path(a.out).write_text(json.dumps(resultados, indent=1, ensure_ascii=False))
    print(f'\n{len(resultados)} páginas, {total_fallas} fallas')
    sys.exit(1 if total_fallas else 0)


if __name__ == '__main__':
    asyncio.run(main())

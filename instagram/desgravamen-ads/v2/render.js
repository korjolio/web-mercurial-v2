// Exporta los posts de plantilla.html a JPG 1080×1350 (la Content Publishing API de Instagram solo acepta JPEG).
//
//   npm i --no-save playwright && npx playwright install chromium
//   node instagram/render.js [carpeta-salida] [id ...]
//
// Sin ids exporta todos los de posts.js. Carpeta por defecto: instagram/2026-11.
// Un post simple sale como <id>.jpg; un carrusel como <id>-1.jpg, <id>-2.jpg, …

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

(async () => {
  const [salida = __dirname, ...ids] = process.argv.slice(2);
  fs.mkdirSync(salida, { recursive: true });

  const plantilla = pathToFileURL(path.join(__dirname, 'plantilla.html')).href;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 2050 } });

  await page.goto(plantilla);
  const todos = await page.evaluate(() => window.POSTS.map(p => p.id));
  const elegidos = ids.length ? ids : todos;

  for (const id of elegidos) {
    if (!todos.includes(id)) throw new Error(`No existe el post "${id}"`);
    await page.goto(`${plantilla}?id=${encodeURIComponent(id)}`);
    const nombres = await page.evaluate(async () => {
      await document.fonts.ready;
      if (!document.fonts.check('800 76px "Albert Sans"')) throw new Error('Albert Sans no cargó');
      await Promise.all([...document.images].map(img => img.decode()));
      // Las fotos van como background-image: precargarlas para no capturar el fondo vacío
      await Promise.all([...document.querySelectorAll('[style*="background-image"]')].map(el => {
        const img = new Image();
        img.src = getComputedStyle(el).backgroundImage.slice(5, -2);
        return img.decode();
      }));
      return [...document.querySelectorAll('.f')].map(f => f.dataset.nombre);
    });
    for (const nombre of nombres) {
      const frame = page.locator(`.f[data-nombre="${nombre}"]`);
      // Detecta texto que se sale del lienzo o queda pegado al borde inferior
      const desborde = await frame.evaluate(f => {
        const fin = f.getBoundingClientRect().bottom - 30;
        return [...f.querySelectorAll('h1, h2, p, .cta, .dots, .desliza, ul')].some(el => el.getBoundingClientRect().bottom > fin);
      });
      await frame.screenshot({ path: path.join(salida, `${nombre}.jpg`), type: 'jpeg', quality: 92 });
      console.log(`${desborde ? '⚠ DESBORDE ' : '✓ '}${nombre}`);
    }
  }

  await browser.close();
})();

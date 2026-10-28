// Exporta los posts de plantilla.html a PNG 1080×1350.
//
//   npm i --no-save playwright && npx playwright install chromium
//   node instagram/render.js [carpeta-salida] [id ...]
//
// Sin ids exporta todos los de posts.js. Carpeta por defecto: instagram/2026-11.

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

(async () => {
  const [salida = path.join(__dirname, '2026-11'), ...ids] = process.argv.slice(2);
  fs.mkdirSync(salida, { recursive: true });

  const plantilla = pathToFileURL(path.join(__dirname, 'plantilla.html')).href;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });

  await page.goto(plantilla);
  const todos = await page.evaluate(() => window.POSTS.map(p => p.id));
  const elegidos = ids.length ? ids : todos;

  for (const id of elegidos) {
    if (!todos.includes(id)) throw new Error(`No existe el post "${id}"`);
    await page.goto(`${plantilla}?id=${encodeURIComponent(id)}`);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(img => img.decode()));
      // Las fotos van como background-image: precargarlas para no capturar el fondo vacío
      await Promise.all([...document.querySelectorAll('.foto')].map(el => {
        const img = new Image();
        img.src = getComputedStyle(el).backgroundImage.slice(5, -2);
        return img.decode();
      }));
      window.ajustarFotos();
    });
    // Detecta texto que se sale del lienzo antes de exportar
    const desborde = await page.evaluate(() => {
      const post = document.querySelector('.post');
      const pie = post.querySelector('.pie').getBoundingClientRect();
      const previo = post.querySelector('.pie').previousElementSibling.getBoundingClientRect();
      return pie.top < previo.bottom + 40 || pie.bottom > 1350 - 40;
    });
    await page.locator('.post').screenshot({ path: path.join(salida, `${id}.png`) });
    console.log(`${desborde ? '⚠ DESBORDE ' : '✓ '}${id}`);
  }

  await browser.close();
})();

# Reporte QA de mercurial.cl

Fecha: 2026-11-04. Revisado en producción, escritorio y móvil (390 px). Sin leads reales: los envíos se simularon.

**Estado (2026-11-04):** errores 3, 4, 5 y 7 corregidos y publicados, junto con el bloque 1 de `docs/plan-revision-codex.md`. Sigue pendiente el error 6 (`www` sin redirección) y la medición en GTM.

**Resultado:** no hay enlaces rotos ni páginas caídas. Hay 2 problemas de medición y 5 errores menores del sitio.

## 🔴 Afectan al negocio

1. **GA4 no recibe conversiones.** Detalle en `docs/estado-marcaje-gtm.md`.
2. **Solo el formulario Pyme manda `Lead` a Meta.** Portada, páginas de seguro, condominio, transporte y desgravamen no lo envían: `src/js/sitio.js` no lo dispara y `/api/contacto` no llama a `enviarEventoMeta`. CLAUDE.md dice que `Lead` cubre los formularios. Falta decidir si desgravamen debe enviarlo, porque el sitio evita medir ahí datos que sugieran salud.

## 🟡 Errores del sitio

3. **Con `/` final se rompen 2 páginas.** En `/cotizar-pyme/` no cargan `cotizar-pyme.js` ni `pyme-catalogos.js` (404), así que el formulario queda sin su script. En `/seguro-mascotas/` falla una imagen. Causa: rutas relativas.
4. ~~**El botón «Cotizar» no lleva a la cotización.**~~ Corregido y verificado en producción el 2026-11-04 (commit `11b4a91`).
5. **El sitemap usa `/privacidad.html`** en vez de `/politica-privacidad`.
6. **`www.mercurial.cl` no redirige.** Responde 200, como una copia del sitio. El canonical lo mitiga.
7. **La página 404 no tiene diseño.** Muestra «Cannot GET …» en inglés y sin enlaces para volver.

## ⚪ Detalles

- `privacidad` y `terminos` no tienen descripción ni canonical.
- `mascotas`, `cotizar-pyme`, `privacidad` y `terminos` no tienen `og:image`.
- `src/js/meta.js` y CLAUDE.md mencionan `/api/leads` o `lead-form.js`, que ya no existen.

## ✅ Funciona

- 12 páginas responden 200, sin errores de JavaScript, desborde horizontal ni imágenes rotas.
- Los 26 enlaces revisados responden bien, incluidos WhatsApp, CMF y los de `llms.txt`, `ai.txt` y `sitemap.xml`.
- Formularios de 8 páginas: validan, envían, confirman y muestran error si el servidor falla.
- Formulario Pyme: flujo completo en móvil.
- Menú, panel móvil, anclas de portada y banner de cookies.
- Cotizador BCI en Chrome real: carga el paso 1. En navegador automatizado muestra error 406, pero es un bloqueo a bots.
- Archivos internos protegidos: `.env`, `server.js`, `CLAUDE.md`, `docs/` e `instagram/` dan 404.

## ❓ No probado

- Envío real de correo (SMTP) y paso real del lead al CRM: generaría un lead verdadero.
- Cotizador BCI después del paso 1.
- Safari.

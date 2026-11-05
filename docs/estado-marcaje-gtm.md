# Estado del marcaje GTM

Revisado el 2026-11-04 contra producción (mercurial.cl) y el contenedor publicado `GTM-K4SL5KSF`, versión 9.
No se revisó la interfaz de GTM (borradores), GA4 ni Google Ads: solo lo publicado y lo que sale del navegador.

## Funciona

- GTM carga en las 10 páginas con snippet, sin errores de consola. `privacidad.html` y `terminos.html` no tienen snippet.
- GA4 `G-T6JK5X36XB`: `page_view` en todas ellas, más `scroll`, `click` saliente y `form_start` (medición mejorada).
- Consentimiento: sin elegir o rechazado, `gcs=G100` y sin LinkedIn ni Meta. Aceptado, `gcs=G111` y se activan.
- GTM pasa por Google Tag Gateway de Cloudflare (`/8wkd/`, inyectado en el borde, no está en el repo). También corre en privacidad y términos, pero ahí no dispara nada (0 hits).

## No funciona: GA4 no recibe ninguna conversión

Lo que el sitio emite y el contenedor no escucha:

| Evento del `dataLayer` | Dónde | Parámetros |
|---|---|---|
| `formulario_enviado` | `src/js/sitio.js:177` | `form_tipo`, `form_seguro` |
| `cotizacion_pyme_submit` | `src/js/cotizar-pyme.js:396` | `form_cluster` |
| `mascotas_cta_click` | `mascotas.html:432` | `cta` |
| `cotizador_visto` | `mascotas.html:467` | — |
| `cotizador_interaccion` | `mascotas.html:505` | — |

Probado con `/api/contacto` simulado: `formulario_enviado` entra al `dataLayer` y no sale ningún hit a GA4.

Lo que el contenedor escucha y nadie emite (6 etiquetas muertas del sitio anterior, tags 1 a 6 del JSON publicado):
`whatsapp_contact`, `schedule_meeting`, `hero_cta_click`, `reservas_page_view`, `form_submission`, `form_submission_error`.

WhatsApp: no hay evento propio. Solo se ve como `click` saliente a `wa.me`.

Google Ads: el contenedor no tiene ninguna etiqueta `AW-`, aunque `/condominio` y `/transporte` son landings de Ads.

## Pendiente

1. Crear en GTM las etiquetas GA4 de `formulario_enviado` y `cotizacion_pyme_submit`, y marcarlas como evento clave.
2. Agregar evento de clic en WhatsApp.
3. Confirmar si Google Ads está activo y cómo mide conversiones.
4. Borrar las etiquetas muertas.

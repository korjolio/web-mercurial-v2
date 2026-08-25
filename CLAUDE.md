# CLAUDE.md — web-mercurial-v2

Sitio de **Mercurial Corredores de Seguros** (mercurial.cl), corredora chilena regulada por la CMF (Registro N° 8929). Sitio estático servido por un Express mínimo que además expone los endpoints de captura de leads hacia HubSpot.

## Cómo correr

```bash
npm install
npm start          # http://localhost:3001
```

No requiere `HUBSPOT_API_KEY` para levantar: sin ella el sitio funciona igual y solo los endpoints `/api/hubspot/*` responden 503. Con HubSpot: copiar la clave a `.env` como `HUBSPOT_API_KEY`.

`npm run frontend` (puerto 3000) sirve archivos estáticos con `npx serve`, **pero ahí no existen las rutas limpias** (`/seguro-mascotas`, `/condominio`, …). Para probar el sitio real, usar siempre `npm start`.

## Deploy

**Push a `main` → Railway despliega automático a producción (~1 min).** No hay paso manual. Verificar siempre contra la URL real (`https://mercurial.cl/...`) después de desplegar, no solo en local.

`main` suele estar tomado por otro worktree (`/Users/pepo/Documents/web-mercurial-v2`), así que `git checkout main` falla desde los worktrees de trabajo. Para llevar cambios a producción:

```bash
git push origin HEAD:main
```

Después conviene `git pull` en esa otra carpeta para que no quede atrás.

## Estructura

| Ruta | Archivo | Notas |
|---|---|---|
| `/` | `index.html` | Home corporativo. Indexable. |
| `/condominio` | `condominio.html` | Landing Google Ads (Ley 21.442). `noindex`. Formulario propio → HubSpot. |
| `/transporte` | `transporte.html` | Landing Google Ads. `noindex`. Formulario propio → HubSpot. |
| `/seguro-mascotas` | `mascotas.html` | Landing de producto. **Indexable** (está en `sitemap.xml`). Sin formulario propio. |
| `/politica-privacidad` | `privacidad.html` | Requerida por Meta/WhatsApp Business API. |
| — | `terminos.html` | |

`server.js` sirve **todo el directorio** con `express.static(__dirname)`. Cualquier archivo interno que no deba quedar público debe listarse en `BLOCKED_STATIC_FILES` (hoy: `server.js`, `package.json`, `package-lock.json`, `CLAUDE.md`, `.env*`). Los dotfiles y `node_modules/` ya están bloqueados por el middleware.

Estilos: `styles.css` es el sistema compartido (variables en `:root`, azul corporativo `--c-primary: #2399C6`, Inter). **Excepción**: `mascotas.html` es autocontenida y lleva su propio CSS inline (paleta cálida distinta).

## Captura de leads

Dos caminos, según la página:

1. **Condominio y transporte**: formulario propio → `src/js/lead-form.js` → `POST /api/leads` → HubSpot CRM API (crea Contact + Company + Deal). El cluster se declara en cada HTML con `window.MERCURIAL_LEAD_CLUSTER` y el backend solo acepta `'condominio'` o `'transporte'`. `lead-form.js` también arrastra `gclid` y las UTM de la URL, y aporta el scroll suave y las animaciones `fade-in`.
2. **Mascotas**: **no pasa por HubSpot**. El lead queda registrado en BCI Seguros al completar el paso 1 del cotizador embebido; se consulta en la bandeja de trabajo de `sau.bciseguros.cl` (convenio "Mascotas S20", corredor Mercurial).

## Analítica

Todas las páginas cargan Google Tag Manager `GTM-K4SL5KSF` (snippet en `<head>` + `<noscript>`). Pageviews, fuente y UTMs se registran solos.

Eventos propios que emite `mascotas.html` al `dataLayer`:

- `cotizador_visto` — el visitante llegó a la sección del cotizador.
- `cotizador_interaccion` — empezó a usarlo (mejor esfuerzo; solo desktop).
- `mascotas_cta_click` (con atributo `cta`) — clic en un CTA.

**Pendiente**: crear los triggers en GTM y marcarlos como conversión en GA4 (los eventos se emiten, pero no hay tags configurados).

Convención de campañas: cada persona identifica sus links con `utm_campaign`. Alejandro usa sus iniciales, p. ej. `mercurial.cl/seguro-mascotas?utm_campaign=as`.

## Landing de mascotas: el cotizador embebido (leer antes de tocarlo)

`mascotas.html` embebe el cotizador de BCI (`cotizadormascotas.bciseguros.cl`) en un iframe **cross-origin**: no se puede leer su altura, ni sus clics, ni su estado. El código de esa sección parece rebuscado, pero **cada pieza corrige un fallo real verificado en navegador. No simplificar sin leer esto**:

1. **Carga diferida** (`data-src` + IntersectionObserver): sin ella, la app de BCI roba el foco al terminar de cargar y arrastra el scroll de toda la página hasta el iframe (medido: saltaba solo de 0 a 2.303px).
2. **Marco de altura fija que se expande** (950px desktop / 1280px móvil → 1780/2200 con la clase `.expandido`): cada paso del cotizador mide distinto (paso 1 = 774px desktop y 1204px móvil; paso 2, la tabla de planes, ≈ 1725px) y la altura real es ilegible cross-origin.
3. **Detección del cambio de paso vía `history.length`**: la navegación interna de BCI es SPA y crece el historial compartido, el único rastro observable. La base se recalibra en cada evento `load` del iframe (carga inicial, recarga del banner de cookies) **más 3s de gracia**, que absorben el redirect de arranque `/wallet/…` → `/contratar/datos-contratante/…`. Sin esa gracia, el marco se expande apenas carga.
4. **Nunca agregar un temporizador de respaldo.** Existió uno que expandía a los 60s "por si acaso": como llenar el paso 1 toma más de un minuto, dejaba un hueco blanco enorme bajo el formulario. Se eliminó en `cbec147`.

**Defecto asumido, no corregible desde este código**: el banner de cookies de BCI (OneTrust) recarga su propia página al aceptar y su consentimiento no persiste en contexto de terceros, así que puede reaparecer. Cerrarlo con la "X" no recarga. Se decidió asumirlo antes que sacar al visitante del sitio.

**Un cotizador propio con precios no es viable** sin integración oficial de BCI: su API (`apicotizadormascotas.bciseguros.cl`) exige token Bearer, está protegida por reCAPTCHA con sitekey ligada a su dominio, y no expone tarifas sin crear el lead. Los PDFs del convenio traen coberturas, no tarifas. Camino correcto si se retoma: pedir la integración oficial a BCI.

Los datos de planes y coberturas de la landing provienen de los PDFs oficiales del convenio (Esencial / Pro / Infinite; perros y gatos de 6 meses a 10 años; una mascota por póliza). **No inventar cifras**: si falta un dato, contrastarlo contra esos documentos.

## Cómo trabajar en este repo

- **QA en navegador obligatorio** para cambios de UI, antes de dar algo por terminado. Debe cubrir: desktop y móvil (390px), errores de consola, desborde horizontal, **el flujo completo** (no solo la primera pantalla) y **el paso del tiempo** (muestrear a 10s, 30s, 60s, 80s cuando haya lógica diferida o temporizadores). Confirmar en producción tras desplegar.
- **Definir lo visual antes de codear** landings o rediseños: mockups aprobados primero, implementación después.
- Contenido en **español de Chile**. Nada de cifras, coberturas ni beneficios inventados: son un producto financiero regulado.
- Landings de Ads (`condominio`, `transporte`) van `noindex`; las de producto son indexables y deben sumarse a `sitemap.xml`.

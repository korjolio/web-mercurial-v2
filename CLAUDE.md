# CLAUDE.md — web-mercurial-v2

Sitio de **Mercurial Corredores de Seguros** (mercurial.cl), corredora chilena regulada por la CMF (Registro N° 8929). Sitio estático servido por un Express mínimo que además reenvía las cotizaciones pyme al CRM propio (`app.mercurial.cl`). **HubSpot ya no se usa** (retirado en octubre de 2026).

## Cómo correr

```bash
npm install
npm start          # http://localhost:3001
```

El formulario `/cotizar-pyme` necesita `CRM_URL` (p. ej. `https://app.mercurial.cl`) y `CRM_API_KEY` (misma clave que `PUBLIC_PROSPECTS_API_KEY` en el CRM). Sin ellas, `/api/cotizaciones/pyme` responde 503 y la página muestra el error con alternativa WhatsApp. Para probar en local sin CRM, levantar un servidor falso que acepte `POST /api/public/prospects`.

`npm run frontend` (puerto 3000) sirve archivos estáticos con `npx serve`, **pero ahí no existen las rutas limpias** (`/seguro-mascotas`, `/cotizar-pyme`, …). Para probar el sitio real, usar siempre `npm start`.

## Deploy

**Push a `main` → Railway despliega automático a producción (~1 min).** No hay paso manual. Verificar siempre contra la URL real (`https://mercurial.cl/...`) después de desplegar, no solo en local.

**Dónde se trabaja: en el Mac** (servidor de Orca "Macbook Pro M1 Pro"), checkout principal en `/Users/pepa/Proyectos/web-mercurial-v2`. Ahí están `node_modules`, Playwright (para `instagram/render.js`) y el `.env` con los tokens de Instagram y Meta; el PC con Windows ya no es el entorno de trabajo.

`main` suele estar tomado por el checkout principal, así que `git checkout main` falla desde los worktrees de trabajo. Para llevar cambios a producción:

```bash
git push origin HEAD:main
```

Después conviene `git pull` en el checkout principal del Mac para que no quede atrás.

## Estructura

| Ruta | Archivo | Notas |
|---|---|---|
| `/` | `index.html` | Portada (sitio nuevo, oct. 2026). Indexable. Barra de cotización y formulario de cotización → correo. |
| `/seguros/flotas`, `/seguros/transporte`, `/seguros/incendio`, `/seguros/colectivos-de-salud` | `seguro-*.html` | Páginas de cada línea. Indexables (en `sitemap.xml`). Flotas y Salud sin coberturas hasta que se confirmen. |
| `/seguros/transporte/importaciones-exportaciones` | `seguro-carga-comex.html` | Seguro de carga internacional (certificado por embarque, póliza flotante Zurich). Indexable (en `sitemap.xml`). Formulario `data-envio="carga"` → `/api/contacto` → correo. **No publicar la tasa** (decisión de socios, 09-11-2026). Coberturas según cotización Zurich 06-11-2026. |
| `/condominio`, `/transporte` | — | Antiguas landings de Google Ads, **eliminadas el 09-11-2026** (no tenían contenido). Redirigen 301 a `/` y `/seguros/transporte`. |
| `/desgravamen-rechazado` | `desgravamen.html` | Página de producto: seguro de desgravamen rechazado (personas). **Indexable** (en `sitemap.xml`, desde el 09-11-2026). También recibe el tráfico de la campaña de Meta. |
| `/seguro-mascotas` | `mascotas.html` | Landing de producto. **Indexable** (está en `sitemap.xml`). Sin formulario propio. |
| `/cotizar-pyme` | `cotizar-pyme.html` | Formulario de antecedentes para Seguro Pyme (multiriesgo). `noindex`. El lead va al **CRM propio**. Estilos propios en `src/css/cotizar-pyme.css`. |
| `/consultas-y-reclamos` | `consultas.html` | Formulario de consultas y reclamos → correo. Indexable (en `sitemap.xml`). `/#consultas` redirige aquí. |
| `/politica-privacidad` | `privacidad.html` | Requerida por Meta/WhatsApp Business API. |
| — | `terminos.html` | |
| Cualquier ruta inexistente | `404.html` | `noindex`, responde 404. |

`server.js` sirve **todo el directorio** con `express.static(__dirname)`. Cualquier archivo interno que no deba quedar público debe listarse en `BLOCKED_STATIC_FILES` (hoy: `server.js`, `chatwoot.js`, `package.json`, `package-lock.json`, `CLAUDE.md`, `.env*`). Los dotfiles, `node_modules/`, `docs/` e `instagram/` ya están bloqueados por el middleware (sin distinguir mayúsculas).

`instagram/` guarda el contenido de redes, no forma parte del sitio: posts generados desde `plantilla.html` + `posts.js` con `render.js`, captions y calendario en `captions.md`. Mismas reglas de contenido que el sitio. **Excepción al bloqueo**: los JPG de `instagram/<año-mes>/` son públicos, porque la Content Publishing API los descarga por URL. `src/data/` es público a propósito (catálogos que carga el navegador).

### Publicar en Instagram (Content Publishing API)

`node instagram/publicar.js verificar | calendario | preparar <id> | publicar <id> --si | pendientes --si`. Publica en **@mercurial.corredores** (IG id `17841415815501470`) a través de la página de Facebook "Mercurial Corredores de Seguros" (`128713307782112`) y la app de Meta **Mercurial** (`1573048407609004`, producto Instagram agregado). `preparar` crea el contenedor sin publicar (caduca en 24 h): úsalo para probar. Publicar es público e irreversible: exige `--si`, y el script se niega si `IG_USER_ID` no corresponde a `@mercurial.corredores`.

- `.env` (no versionado): `IG_ACCESS_TOKEN` (token de **página**, no caduca) e `IG_USER_ID`.
- **El acceso a datos del token vence el 2027-01-26.** Para renovarlo: Explorador de la API Graph con la app Mercurial → permisos `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement` → Generate Access Token → Depurador de tokens → "Ampliar token de acceso" → ese token en `IG_ACCESS_TOKEN` → `node instagram/publicar.js token`.
- La página de Mercurial se administra desde el portfolio comercial y **no aparece en `/me/accounts`**: el script la pide por ID. Ese mismo usuario administra otras páginas con Instagram (p. ej. Monkey Car Wash); nunca tomar "la primera".
- La API no programa: hay que correr `pendientes --si` cada día (cron) para seguir el calendario de `captions.md`.

Logos (versión 2026): `src/img/logo/`; cabecera con `mercurial-horizontal-color.svg` y pie con `mercurial-horizontal-blanco.svg`. Logos de aseguradoras de la portada: `src/img/companias/`.

Estilos del sitio nuevo: `src/css/marco.css` (tokens, cabecera de dos niveles, panel móvil, pie; lo cargan todas las páginas) + `src/css/sitio.css` (componentes de página). Albert Sans, azul marino `#0d2340` y azul Mercurial `#1a7ca4`. `src/js/sitio.js` maneja menú, panel móvil, formularios y movimiento (GSAP en `src/vendor/`, respeta `prefers-reduced-motion`). `styles.css` queda solo para el cuerpo de `/cotizar-pyme`; `mascotas.html` lleva su CSS inline con la paleta nueva. Fotos de Wikimedia Commons en `src/img/fotos/` (CC BY / CC BY-SA): **los créditos del pie son obligatorios**.

## Captura de leads

**WhatsApp de atención: +56 9 3931 9546** (`wa.me/56939319546`), atendido en Chatwoot. Todos los botones de WhatsApp del sitio, `llms.txt`, `ai.txt` y el perfil de Instagram usan ese número.

Tres caminos, según la página:

1. **Portada, páginas de seguro, consultas y reclamos y desgravamen**: `<form data-envio="cotizacion|consulta">` → `src/js/sitio.js` → `POST /api/contacto` → correo a `contacto@mercurial.cl` por el SMTP de Google Workspace (`SMTP_USER`, `SMTP_PASS` con contraseña de aplicación; `MAIL_TO` opcional). **Excepción:** los contactos de seguro de auto (`tipo: "auto"`) van a `MAIL_TO_AUTO` (por defecto `ppbugueno@mercurial.cl`, desde el 12-11-2026). Sin SMTP responde 503 y la página ofrece WhatsApp.
   - **Auto → Chatwoot** (`chatwoot.js`): después de que sale el correo de auto, `server.js` crea o actualiza el contacto en Chatwoot (busca por teléfono E.164 y luego por correo) con los atributos `patente`, `rut`, `comuna`, `origen` (utm_source/utm_content o «directo»), `campana` (utm_campaign) y `procedencia`, y abre una conversación en el inbox API **«Formulario web»** (no en el de WhatsApp: escribir primero exige plantilla de Meta) con un mensaje entrante de resumen y las etiquetas `auto`, `nuevo` y la del utm_source (o `directo`). Chatwoot es donde se siguen los leads de auto; el correo a `MAIL_TO_AUTO` queda como respaldo. Variables: `CHATWOOT_URL`, `CHATWOOT_ACCOUNT_ID`, `CHATWOOT_API_TOKEN` (token de un agente, solo en `.env`/Railway) y `CHATWOOT_INBOX_ID`; si falta alguna, se salta Chatwoot. Se llama sin `await`, con un plazo total de 5 s: si Chatwoot falla o tarda, queda `[Chatwoot] No se pudo registrar…` en el log y el formulario igual responde OK. `CHATWOOT_DRY_RUN=1` imprime lo que mandaría sin llamar a Chatwoot (solo local). Los atributos personalizados de contacto y las etiquetas deben existir en Chatwoot. `MAIL_DRY_RUN=1` arma el correo sin enviarlo (solo local). Campo trampa `sitio_web` y límite de 5 envíos por IP cada 10 min. HubSpot se retiró; el paso siguiente es mandar estas consultas al CRM (`product: "consulta"`). WhatsApp de leads: Chatwoot "Mercurial WABA", +56 9 3931 9546.
2. **Mascotas**: el lead queda registrado en BCI Seguros al completar el paso 1 del cotizador embebido; se consulta en la bandeja de trabajo de `sau.bciseguros.cl` (convenio "Mascotas S20", corredor Mercurial).
3. **Pyme (`/cotizar-pyme`)**: `src/js/cotizar-pyme.js` → `POST /api/cotizaciones/pyme` (server.js valida contra `src/data/pyme-catalogos.js`, `comunas.json` y `ans-pyme-actividades.json`) → `POST {CRM_URL}/api/public/prospects` con header `x-api-key` e `Idempotency-Key` → prospecto en etapa "Nuevo" del CRM (`app.mercurial.cl`, repo `korjolio/studio`) con ramo "Multiriesgo Pyme", el resumen del riesgo en Notas y el JSON completo en `rawData`. Las listas del formulario son las exactas del cotizador "Seguro de Pymes" de ANS; la referencia está en `docs/referencia/ans-pyme-campos.md`. **No inventar opciones**: si el portal cambia, actualizar catálogo en la web y en el CRM a la vez.

## Analítica

Todas las páginas cargan Google Tag Manager `GTM-K4SL5KSF` (snippet en `<head>` + `<noscript>`). Pageviews, fuente y UTMs se registran solos.

Eventos propios que emite `mascotas.html` al `dataLayer`:

- `cotizador_visto` — el visitante llegó a la sección del cotizador.
- `cotizador_interaccion` — empezó a usarlo (mejor esfuerzo; solo desktop).
- `mascotas_cta_click` (con atributo `cta`) — clic en un CTA.

**Pendiente**: crear los triggers en GTM y marcarlos como conversión en GA4 (los eventos se emiten, pero no hay tags configurados).

`cotizar-pyme.html` emite `cotizacion_pyme_submit` (con `form_cluster: 'pyme'`) al enviar con éxito.

**Caché**: los `.js` y `.css` se sirven con `max-age=14400` (Cloudflare + navegador), el HTML con `max-age=0`. Al cambiar un script, subir su `?v=N` en los HTML que lo cargan; si no, hasta 4 horas de visitantes corren la versión vieja.

### Consentimiento de cookies

`src/js/consent.js` va en el `<head>` **antes de GTM y de `meta.js`** (orden obligatorio). Muestra el banner hasta que el visitante elige, guarda la elección en `localStorage` (`mercurial_cookie_consent`) y fija Google Consent Mode v2 en denegado por defecto; al aceptar, emite `cookie_consent_update`. `privacidad.html` lo carga solo para el enlace "Configurar cookies" (`mercurialConsent.open()`).

- GA4 respeta Consent Mode solo. **Las demás etiquetas de GTM no**: toda etiqueta de terceros debe tener en GTM "La etiqueta requiere consentimiento adicional" (`ad_storage`), o se dispara aunque el visitante rechace. LinkedIn Insight ya lo tiene (GTM versión 8) y además se activa con el evento `cookie_consent_update` (activador "CE - Cookie Consent Update", versión 9), así también mide la página donde el visitante acepta. Verificado en producción: con rechazo, 0 solicitudes a LinkedIn; al aceptar en la misma página, se activa. Ojo al probar: el navegador guarda `gtm.js` 15 min (`max-age=900`), así que justo después de publicar puede correr la versión anterior.
- Sin consentimiento, `meta.js` no carga el píxel y `mercurialMeta.newEventId()` devuelve `undefined`, así que `/api/leads` no manda el Lead a Meta; el formulario pyme marca `tracking.metaConsent` y el servidor lo exige.

### Meta (píxel + API de conversiones)

`src/js/meta.js` (navegador) + `enviarEventoMeta` en `server.js` (servidor) mandan cada evento dos veces con el mismo `event_id` para que Meta deduplique. Conjunto de datos `1129934969998097` ("API de Eventos mercurial.cl"). Variables: `META_CAPI_TOKEN` (sin ella solo queda el navegador), `META_TEST_EVENT_CODE` (solo para pruebas, nunca en Railway). Eventos: `ViewContent` (landings), `Contact` (WhatsApp/correo), `CustomizeProduct` (cotizador de mascotas), `Lead` (formularios).

**Categoría del conjunto de datos: solo "Servicio financiero".** Al crearlo (28-10-2026) quedó marcado con las 12 categorías sensibles de Meta (salud, raza, religión, política, vulnerabilidad económica, etc.), según el Historial del conjunto de datos, y Meta activó restricciones automáticas: aceptaba `Lead`, `Contact` y `CustomizeProduct` (`events_received` correcto) pero solo mostraba y contaba `ViewContent`/`PageView`. Al dejar solo "Servicio financiero" (Configuración → Categorías de conjuntos de datos → Editar), `Lead` y `Contact` pasaron a aparecer como *Procesado* en "Probar eventos". **No volver a marcar otras categorías**; si algún día se venden seguros de salud, revisar si corresponde "Salud y bienestar: otros" sabiendo que restringe eventos. La Configuración de Core sigue activada (recorta URLs y parámetros personalizados). Un evento personalizado de diagnóstico, `SolicitudCotizacion`, quedó "Bloqueado por Meta" en "Administrar bloqueo de eventos": no se usa.

Los logs de Railway registran cada envío exitoso (`[Meta] <evento> recibido por Meta`) y cada fallo (`[Meta] No se pudo enviar`). Además, un Signals Gateway (`signals.birch.click`) ya reenvía los eventos del píxel por servidor.

Convención de campañas: cada persona identifica sus links con `utm_campaign`. Alejandro usa sus iniciales, p. ej. `mercurial.cl/seguro-mascotas?utm_campaign=as`.

**Enlace marcado en el correo**: los formularios que van a `/api/contacto` agregan la línea «Enlace marcado: fuente … · medio … · campaña … · contenido …» con los `utm_source`, `utm_medium`, `utm_campaign` y `utm_content` del link por el que llegó el visitante. `sitio.js` los recuerda durante la visita (`sessionStorage`, clave `mercurial_enlace`) y `server.js` (`enlaceMarcado`) solo acepta letras, números, guion y guion bajo. Un contacto por los botones de WhatsApp de la página no queda marcado. **Excepción:** el botón «Recibir mi cotización por WhatsApp» de la pantalla de gracias del formulario de auto (`a.wa-cotizacion`) abre WhatsApp con nombre, patente y `(ref: utm_source/utm_content)`, para que la conversación llegue identificada a Chatwoot y el cliente abra la ventana de 24 horas de WhatsApp Cloud API.

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
- Contenido en **español de Chile**. En textos visibles se escribe «compañía de seguros», no «aseguradora» (salvo «no aseguradora» en el pie). Nada de cifras, coberturas ni beneficios inventados: son un producto financiero regulado.
- Las páginas de producto son indexables y deben sumarse a `sitemap.xml`; solo las landings exclusivas de anuncios irían `noindex` (hoy no hay ninguna). **Pendiente**: páginas indexables de seguro de condominio y seguro pyme (hoy no aparecen en Google).

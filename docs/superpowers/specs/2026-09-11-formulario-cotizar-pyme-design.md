# Formulario de cotización Seguro Pyme → CRM (app.mercurial.cl)

Fecha: 2026-09-11. Estado: borrador para revisión.

## Objetivo

Que un cliente de Mercurial pueda entregar por la web todos los antecedentes que el ejecutivo necesita para cotizar un **Seguro Pyme (multiriesgo)** en el portal ANS, y que esos antecedentes lleguen como **prospecto al CRM propio** (`app.mercurial.cl`, repo `korjolio/studio`) sin pasar por HubSpot.

Hoy la cotización la hace un humano en el portal ANS (paso 1 "Cotización", ~30 campos). El formulario replica exactamente esos campos y sus listas, extraídas del DOM del portal el 11-09-2026 (`docs/referencia/ans-pyme-campos.md`, `docs/referencia/ans-pyme-actividades.json`).

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Destino de los datos | CRM propio (studio). No HubSpot. |
| Integración | Endpoint nuevo en studio con clave secreta compartida; la web lo llama desde `server.js`. Ambos repos se modifican. |
| Página | `cotizar-pyme.html` servida en `/cotizar-pyme`, `noindex`. El ejecutivo comparte el link por WhatsApp o correo. Sin campaña Ads por ahora. |
| Listas | Exactas del portal ANS (ver referencia). |
| Actividad / giro | Buscador (autocompletado) sobre los 470 giros de ANS + opción "Otra / no la encuentro" con texto libre. |
| Secciones condicionales | Se incluyen las preguntas de mar y río y las medidas de seguridad. Se omite "contacto para inspección" (se usa el contacto principal). |
| Textos de ayuda | Propios, en lenguaje simple para el cliente. Los límites por compañía del portal quedan solo en la referencia interna. |
| Ramo nuevo en el CRM | "Multiriesgo Pyme" (pendiente de confirmación de nombre). |
| Mockups | Se aprueban antes de implementar (regla del proyecto). |

## Flujo

```
Cliente → /cotizar-pyme (mercurial.cl)
       → POST /api/cotizaciones/pyme (server.js, misma web)
       → POST https://app.mercurial.cl/api/public/prospects  (header x-api-key)
       → Prospect en etapa "Nuevo" + actividad "Formulario web recibido"
       → Ejecutivo lo ve en el kanban del CRM, con el detalle del riesgo en Notas
```

La clave secreta vive solo en variables de entorno de Railway (web y CRM). El navegador nunca habla con el CRM.

## Parte A — CRM (`korjolio/studio`)

Rama nueva desde `master`. Se despliega a producción solo con OK explícito.

### A1. Endpoint `POST /api/public/prospects`

- **Autenticación**: header `x-api-key` comparado en tiempo constante (`crypto.timingSafeEqual`) contra `PUBLIC_PROSPECTS_API_KEY`. Sin la variable configurada → 503. Clave ausente o incorrecta → 401. Requiere además `CRM_ENABLED=true` (404 si no, como el resto del módulo).
- **Middleware**: `src/middleware.ts` deja pasar `pathname === '/api/public/prospects'` sin sesión (la ruta valida la clave por sí misma). Se mantiene el límite de 1 MB de cuerpo.
- **Idempotencia**: header `Idempotency-Key` obligatorio (la web manda un UUID por envío). Reutiliza `createIdempotently`.
- **Cuerpo** (zod, `.strict()`):
  ```
  {
    source: "web-mercurial",              // literal
    product: "pyme",                       // literal por ahora; extensible
    contact: { firstName, lastName, email, phone },
    holder:  { personType: "natural"|"juridica", rut, businessName?, firstName?, lastName?, secondLastName? },
    location:{ locationType: "urbano"|"rural", address, unit?, comuna, region? },
    building:{ wallMaterial, roofMaterial, buildingAge, floors, activity, activityOther?, nearSea: bool, nearRiver: bool },
    amounts: { building?, contents?, goods?, electronics?, machinery?, liability, glass, workers?, accidentalDeath },   // UF enteros
    extras:  { cashInSafe?, politicalRisks?, valuesTransit?, indemnityPeriod?, businessInterruptionAnnual?, foodLiability?, machineryBreakdown?, terrorism?, tenantImprovements? },
    security:{ fire: string[], theft: string[] },
    comments?: string,
    tracking?: { utm_source?, utm_medium?, utm_campaign?, utm_content?, utm_term?, gclid?, pageUrl? }
  }
  ```
  Todos los strings con máximos; montos enteros ≥ 0; los valores de listas se validan contra los catálogos copiados del portal (`src/lib/constants/pyme-quote.ts`), salvo `activity`, que se valida contra `ans-pyme-actividades.json` o admite `activityOther` cuando `activity === "Otra"`.
- **Mapeo a `Prospect`**:
  - `name`: razón social (jurídica) o nombre completo (natural).
  - `rut`: RUT del contratante normalizado (`normalizeRut`, valida con `isValidRut`).
  - `email`, `phone`: del contacto. `contactName`, `contactPhone`, `contactEmail`: también del contacto.
  - `address`: dirección + unidad. `comuna`: resuelta con `resolveLocation` (rellena provincia y región).
  - `businessActivity`: giro elegido (o el texto libre).
  - `interestBranch`: `"Multiriesgo Pyme"` (nuevo en `INSURANCE_BRANCHES`).
  - `source`: `"Web mercurial.cl"`.
  - `notes`: resumen legible por secciones, ≤ 4.000 caracteres, generado por `formatPymeQuoteNotes()` (es lo que el ejecutivo lee en la ficha).
  - `rawData`: el cuerpo completo validado (JSON).
  - `stage: "Nuevo"`, `stageEnteredAt`, `sortOrder` e historial de etapa igual que `createManualProspect`.
  - `ProspectActivity`: `type: "Formulario web"`, `note: "Cotización Pyme recibida desde mercurial.cl"`.
- **Respuesta**: `201 { prospectId }` o `200 { prospectId, alreadyCreated: true }`. Errores: `400` validación (con lista de campos), `401`, `404`, `413`, `500`.
- **Servicio**: `createWebsiteProspect()` en `src/server/services/crm/prospect-service.ts`, junto a `createManualProspect` (misma transacción serializable).

### A2. Constante de ramo

`INSURANCE_BRANCHES` suma `"Multiriesgo Pyme"`. Revisar que el selector de ramo del modal de prospecto y de la ficha lo muestren sin cambios adicionales.

### A3. Tests (vitest, unitarios)

- Autenticación: sin header → 401; clave incorrecta → 401; variable ausente → 503.
- Sin `Idempotency-Key` → 400.
- Cuerpo inválido (RUT malo, monto negativo, material fuera de lista) → 400 con detalle.
- Caso feliz → crea prospecto con `interestBranch`, `source`, `notes` y `rawData` esperados (servicio mockeado o Prisma en memoria según el patrón que ya use el repo).
- Repetición con la misma clave de idempotencia → 200 `alreadyCreated`.
- `formatPymeQuoteNotes()` → nunca supera 4.000 caracteres y omite secciones vacías.

### A4. Configuración

Variable `PUBLIC_PROSPECTS_API_KEY` en Railway (producción y staging) y en `.env.example` + `docs/ENV_VARIABLES.md`. Valor generado con `openssl rand -hex 32`; el mismo valor se carga en la web como `CRM_API_KEY`.

## Parte B — Web (`web-mercurial-v2`)

### B1. Página `cotizar-pyme.html` (ruta `/cotizar-pyme`)

- `noindex, follow`. GTM `GTM-K4SL5KSF`. Navbar mínima (logo + botón al formulario), footer con registro CMF, botón flotante de WhatsApp con mensaje de contexto pyme, modal de respuesta (mismo patrón que condominio/transporte).
- Estilos compartidos `styles.css` + un bloque propio para los componentes nuevos (grupos de campos con etiqueta visible, prefijo "UF", interruptores Sí/No, tarjetas de coberturas, casillas de medidas de seguridad, buscador de giro).
- Copy en español de Chile. Sin cifras ni coberturas inventadas: solo se recogen datos.
- Estructura (un solo formulario largo con secciones numeradas y barra de progreso ligera; en móvil una columna):
  1. **Tus datos de contacto**: nombre, apellido, correo, celular.
  2. **Contratante**: tipo de persona (Natural / Jurídica); si jurídica → RUT + razón social; si natural → RUT + nombres + apellidos.
  3. **Ubicación del riesgo**: tipo de ubicación (Urbano / Rural), dirección, comuna (selector con buscador, 346 comunas desde `src/data/comunas.json` copiado de studio), depto/oficina/otros.
  4. **Construcción**: material de muros, material de techo, antigüedad, N° de pisos, actividad (buscador sobre 470 giros + "Otra"), pregunta mar, pregunta río.
  5. **Montos a asegurar (UF)**: edificio, instalaciones y contenido, mercaderías, equipos electrónicos, maquinaria, RC (lista), cristales (lista), N° trabajadores, muerte e invalidez accidental (lista).
  6. **Coberturas adicionales** (colapsable, opcional): dinero en caja, riesgos políticos, remesa de valores, periodo indemnizable, PxP monto anual, RC de alimentos, avería de maquinaria, terrorismo, mejora del inmueble.
  7. **Medidas de seguridad** (casillas): 9 contra incendio, 6 contra robo.
  8. **Comentarios** (opcional) y botón "Enviar antecedentes".
- Ayudas propias por campo, cortas, orientadas al cliente (ej. "Instalaciones y contenido: mobiliario, equipamiento e instalaciones fijas que no son mercadería ni maquinaria").
- Obligatorios: secciones 1 a 4 completas; en 5, al menos un monto > 0 (RC, cristales y muerte e invalidez traen valor por defecto como en el portal: 500, 50 y 250). 6 a 8 opcionales.

### B2. Script `src/js/cotizar-pyme.js`

- Independiente de `lead-form.js` (que queda para condominio/transporte). Reutiliza el mismo modal y la misma captura de UTM/gclid.
- Formatea y valida RUT (módulo 11), fuerza enteros en montos UF, muestra/oculta campos según tipo de persona, alimenta los buscadores de comuna y giro desde JSON estáticos (`src/data/comunas.json`, `src/data/ans-pyme-actividades.json`), y arma el payload del contrato de A1.
- Genera `Idempotency-Key` (`crypto.randomUUID()`) por envío; lo reutiliza si el usuario reintenta tras un error de red.
- Envía `POST /api/cotizaciones/pyme`. Éxito → modal "Antecedentes recibidos" + `dataLayer.push({ event: 'cotizacion_pyme_submit' })`. Error → modal con mensaje y alternativa WhatsApp.

### B3. `server.js`

- Ruta `GET /cotizar-pyme` → `cotizar-pyme.html`.
- `POST /api/cotizaciones/pyme`: valida los obligatorios y tipos (mismas listas que el CRM, en `src/data/`), rechaza cuerpos > 100 KB, agrega `source`, `product`, `pageUrl`, y reenvía a `${CRM_URL}/api/public/prospects` con `x-api-key: CRM_API_KEY` y el `Idempotency-Key` del cliente (timeout 10 s). Sin `CRM_URL`/`CRM_API_KEY` → 503 con mensaje claro, igual que HubSpot.
- Mapea errores del CRM a mensajes amigables; nunca expone la clave ni la URL interna al navegador.
- `docs/` y `src/data/` siguen siendo públicos (no contienen secretos). `BLOCKED_STATIC_FILES` no cambia.

### B4. Documentación

- `CLAUDE.md`: nueva fila en la tabla de rutas, tercer camino en "Captura de leads" (Pyme → CRM propio), variables `CRM_URL` y `CRM_API_KEY`, evento `cotizacion_pyme_submit`.
- `sitemap.xml` no cambia (noindex).

## Manejo de errores

| Situación | Comportamiento |
|---|---|
| CRM caído o timeout | La web responde 502 con mensaje "no pudimos registrar tus antecedentes, escríbenos por WhatsApp"; se registra en consola del servidor. No se pierde silenciosamente. |
| Clave inválida entre web y CRM | 401 del CRM → la web responde 500 genérico y loguea el detalle (error de configuración, no del cliente). |
| Envío duplicado (doble clic, reintento) | Misma `Idempotency-Key` → el CRM devuelve el prospecto existente; el cliente ve éxito una sola vez. |
| Validación | La web valida en el navegador y en `server.js`; el CRM vuelve a validar. Los mensajes al cliente son en español y por campo. |

## Verificación

1. Tests unitarios del CRM (vitest) en verde.
2. CRM en **staging** (`studio-staging-90ee.up.railway.app`) con la variable configurada; web local (`npm start`) apuntando a staging. Enviar un formulario completo y comprobar el prospecto en el kanban de staging: nombre, RUT, comuna resuelta, ramo, notas legibles, actividad registrada.
3. QA en navegador de la página: desktop y 390 px, sin errores de consola, sin desborde horizontal, flujo completo (persona natural y jurídica, con y sin coberturas adicionales), estados de error (CRM apagado → mensaje correcto), doble envío.
4. Deploy del CRM a producción y de la web a `main` **solo con OK del usuario**. Luego prueba real en `https://mercurial.cl/cotizar-pyme` creando un prospecto de prueba, que se elimina después desde el CRM.

## Fuera de alcance

- Cotización automática o precios en la web (la cotización la sigue haciendo el ejecutivo en ANS).
- Envío de correos o WhatsApp automáticos al recibir el prospecto.
- Campaña de Google Ads o indexación de la página.
- Migrar condominio/transporte desde HubSpot al CRM propio.

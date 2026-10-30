# Campaña Meta — Desgravamen Hipotecario Plus (rechazados)

Estado al 2026-10-30: formulario **publicado y funcionando** ("MERC | Hipotecario | Prospectos Nuevos | V1 | Oct 2026"). Lógica condicional verificada en Instagram real: los descartados van a E2 ("Cerrar el formulario", no generan lead). E1 lleva a `https://mercurial.cl/wa/desgravamen` (redirige a WhatsApp con "ref: DH-META").

**Estado al 2026-10-30 ~17:45 — campaña v3 ACTIVA con el formulario V3 (URL final marcada); anuncios en revisión de Meta.**

- Campaña `120250128842900016` "MERC | Desgravamen rechazado | Compra y refinanciamiento | Leads | Chile | v3": categoría especial Productos y servicios financieros (CL), CBO **$11.400 CLP/día** (sin cambios), sin fecha de término. ACTIVE.
- Conjunto `120250128845140016`: Chile, 18–65, sin intereses, Advantage+, solo Facebook e Instagram. ACTIVE.
- **Formulario vigente `1379946230630779`** "… | V3": duplicado del V2 (`1125698943209590`) con la **misma lógica**, sin verificación por SMS (evidencia `instagram/desgravamen-ads/v3/qa/formulario-v3-sin-sms.jpg`), entrega flexible apagada. Rutas verificadas antes de publicar, iguales al V2 (P1 compra/refinanciamiento → P2; cambio de seguro/cobros → cierre; P2 6 bancos → P3, Otro → cierre; P3 menos de UF 2.000 → cierre, desde UF 2.000 / No lo sé → P4; P4 Sí → P5, otras → cierre; P5 → E1). Lo único que cambió es la URL final de E1:
  `https://mercurial.cl/desgravamen-rechazado?utm_source=meta&utm_medium=paid_social&utm_campaign=desgravamen_compra_refinanciamiento_v3&utm_content=formulario_v2&ref=DH-META` (botón "Ver más información").
- Anuncios activos (creativos v3 + formulario V3), effective_status **IN_PROCESS** (en revisión, todavía sin aprobar ni entregar): `120250129022220016` (01), `120250129023740016` (02), `120250129024950016` (03), `120250129026040016` (04).
- Anuncios con el formulario V2, pausados para no duplicar gasto: `120250128849310016`, `120250128851250016`, `120250128853160016`, `120250128854700016`.
- Campañas antiguas pausadas: "7 días | Oct 2026", "v2 | Continua" (nombra a la aseguradora: no reactivar) y "6 Bancos".
- **Por qué no se usa `/wa/desgravamen` en el formulario:** al publicar, Meta rechaza esa URL ("Los formularios instantáneos no admiten enlaces de WhatsApp…") porque la ruta redirige con un 302 a `wa.me`. El V1 la tiene porque se publicó a la 1:57 pm, el mismo minuto del commit 644b209 (13:57:40). Lo más probable, sin poder confirmarlo, es que en ese momento la redirección todavía no estuviera desplegada.
- **Referencia DH-META en la landing** (commit 6732d7e): con `?ref=DH-META`, y solo con ese valor exacto (lista blanca), todos los botones de WhatsApp abren "Hola Mercurial, me rechazaron el seguro de desgravamen y quiero consultar por una alternativa (ref: DH-META)", y el formulario de la landing agrega al correo "Procedencia: anuncio de Meta, formulario V2 (ref: DH-META)". Sin `ref`, o con otro valor, todo queda normal. No es una prueba autenticada del origen. No se tocaron CRM, GTM, píxel, CAPI ni consentimiento. QA en producción en escritorio y móvil, sin envíos (las llamadas a `/api/contacto` se interceptaron); el contenido del correo se probó en local con MAIL_DRY_RUN.
- **Nombre visible** (commit bce546e, 30-10-2026): el producto se llama "Desgravamen hipotecario" en el menú de escritorio, el panel móvil y el pie de las 10 páginas, en el title/og:title de la landing y en el tipo del correo de contacto. Se mantienen la ruta `/desgravamen-rechazado`, la URL marcada del formulario y los textos que explican el requisito de rechazo previo. La referencia DH-META solo marca los botones de WhatsApp de la landing cuando la visita llega con `ref=DH-META`; el resto del sitio y las visitas orgánicas no cambian. Evidencia: `instagram/desgravamen-ads/v3/qa/nombre-*.png`.
- **Error #1870194 en el conjunto** (30-10-2026 18:10): el objeto publicado tenía `location_types: ["home"]`, una opción que Meta eliminó. Se cambió por API a `["home","recent"]` (personas que viven o estuvieron recientemente en Chile), sin tocar país, edad, ubicaciones de los anuncios, Advantage+, objetivo, formulario, anuncios ni presupuesto. Después del cambio el conjunto quedó en IN_PROCESS y `ads_get_errors` no devuelve errores. Evidencia: `instagram/desgravamen-ads/v3/qa/targeting-conjunto-{antes,despues}.json`. La API no deja leer el borrador "Cambios sin publicar" de Ads Manager: hay que revisarlo o descartarlo en la interfaz.
- **Chatwoot:** no hay acceso desde aquí. Por ahora los mensajes con "(ref: DH-META)" se identifican a mano; no hay etiquetado automático.

**Pendiente**: regla de Chatwoot que etiquete `desgravamen-meta` los mensajes entrantes que contienen `DH-META`.

Notas de Meta: el formulario no se edita una vez creado (hay que duplicarlo y cambiarlo en el anuncio); los formularios no aceptan enlaces `wa.me`; cada cuenta de Facebook solo puede enviarlo una vez, así que las pruebas repetidas requieren otra cuenta.

## El producto (fuente: ficha "RRSS Seguro Desgravamen Hipotecario Plus", AuguStar Seguros)

- Desgravamen hipotecario para personas con **condiciones especiales de salud o mayores de 50 años**.
- Cubre **fallecimiento**. Capital asegurado **desde UF 2.000**.
- Cumple el requisito de desgravamen que exige la institución financiera.
- Solo **créditos hipotecarios nuevos**.
- Instituciones donde se acepta (nota manuscrita): Santander, Banco de Chile, Consorcio, Itaú, BancoEstado, Internacional.
- Nota manuscrita sin confirmar: "65% / 40% prima neta". No usar en anuncios.

## Problema actual

Llegan leads que quieren cobrar el seguro o que tienen problemas con un desgravamen vigente. El anuncio y el formulario tienen que dejarlos fuera.

## Formulario instantáneo (tipo "Mayor intención")

1. **¿En qué etapa está tu crédito hipotecario?**
   - Es un crédito nuevo y la aseguradora del banco me rechazó el desgravamen → 2
   - Ya tengo un crédito hipotecario vigente → FIN (no califica)
   - Quiero cobrar o reclamar mi seguro → FIN (no califica)
2. **¿Con qué institución estás tramitando el crédito?**
   - Santander / Banco de Chile / Itaú / BancoEstado / Banco Internacional / Consorcio → 3
   - Otra → FIN (por ahora no trabajamos con esa institución)
3. **¿De cuánto es el crédito?**
   - Menos de UF 2.000 → FIN (no califica)
   - UF 2.000 a 4.000 / UF 4.000 a 8.000 / Más de UF 8.000 → 4
4. **¿Para cuándo necesitas el seguro?** Esta semana / Este mes / Más adelante
5. Nombre, teléfono, correo (autocompletados).

Final de los que califican: "Te escribimos por WhatsApp desde el +56 9 3931 9546".
Final de los que no califican: explicar en una línea que el seguro es solo para créditos nuevos.

**No preguntar por salud** (enfermedad, motivo del rechazo, tratamientos): las políticas de anuncios de clientes potenciales de Meta lo prohíben sin autorización previa. Eso se conversa por WhatsApp.

## Anuncio

- El primer texto filtra: "¿La aseguradora del banco te rechazó el desgravamen y tu crédito hipotecario nuevo quedó en pausa?"
- Aclarar "Solo para créditos hipotecarios nuevos".
- No usar "problemas con tu seguro" ni frases parecidas: atraen siniestros y reclamos.
- La campaña debe ir en categoría especial de anuncios de **productos financieros**: limita la segmentación por edad, así que el filtro tiene que hacerlo el texto.

## Revisión de la campaña activa (2026-10-30)

Campaña "MERC | Desgravamen hipotecario | Leads | Chile | 7 días | Oct 2026": $80.000 totales, 27 oct → 3 nov, categoría Productos y servicios financieros, conjunto "Chile - 18+ - Broad - Instant Form" (Chile, público Advantage+). Al 30 oct: $8.670 gastados, 2 leads (ambos del anuncio "Llave v3", $2.863 c/u).

- **"Story Reels v3" usa el formulario viejo "Untitled form 10/10/2017"** (seguros generales, sin filtro). Cambiarlo a "MERC | Hipotecario | Prospectos Nuevos | V1".
- Llave v3, Carrusel y Estática ya usan el formulario nuevo.
- El texto principal de los 4 anuncios es ambiguo ("¿Te rechazaron el seguro de desgravamen hipotecario?"), no dice "crédito nuevo" y menciona "motivos de salud" (riesgo con la política de atributos personales de Meta).
- 7 días y $80.000 es poco para que Meta aprenda; con los creativos v2, pasar a campaña continua.

### Segmentación real del conjunto (leída por la API de Meta, 2026-10-30)

El nombre dice "18+ Broad" pero no lo es:
- Edad 25–65, con **sugerencia 25–50** (al revés del público del producto, que son mayores de 50).
- Intereses: (hipotecarios / préstamos / bancos) **Y** (iPhone / Mercedes / BMW / Louis Vuitton). Con Advantage+ son solo sugerencias.
- Ubicaciones automáticas, **incluida Audience Network** (apps de terceros, típica fuente de leads basura en formularios).

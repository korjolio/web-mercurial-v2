# Campaña Meta — Desgravamen Hipotecario Plus (rechazados)

Estado al 2026-10-30: formulario **publicado y funcionando** ("MERC | Hipotecario | Prospectos Nuevos | V1 | Oct 2026"). Lógica condicional verificada en Instagram real: los descartados van a E2 ("Cerrar el formulario", no generan lead). E1 lleva a `https://mercurial.cl/wa/desgravamen` (redirige a WhatsApp con "ref: DH-META").

**Estado al 2026-10-30 ~17:30 — campaña nueva v3 ACTIVA, anuncios en revisión de Meta.**

- Campaña `120250128842900016` "MERC | Desgravamen rechazado | Compra y refinanciamiento | Leads | Chile | v3": objetivo clientes potenciales, categoría especial **Productos y servicios financieros** (CL), CBO **$11.400 CLP/día**, puja de menor costo, sin fecha de término. effective_status: ACTIVE.
- Conjunto `120250128845140016` "Chile - Amplio - FB+IG (sin Audience Network) - Formulario V2 sin SMS": Chile, 18–65, sin intereses, Advantage+, **solo Facebook e Instagram**, optimización por clientes potenciales, página 128713307782112. effective_status: ACTIVE.
- Anuncios (todos con el formulario 1125698943209590 y los JPG v3 de feed y story servidos desde `mercurial.cl/src/img/anuncios/desgravamen-v3/`), effective_status **IN_PROCESS** (en revisión de Meta; todavía no aprobados ni entregando):
  - `120250128849310016` 01 Crédito aprobado, desgravamen rechazado (creativo 1689125012759223)
  - `120250128851250016` 02 Sin desgravamen no hay crédito (creativo 985831834599172)
  - `120250128853160016` 03 Desgravamen rechazado al refinanciar (creativo 2034413187945226)
  - `120250128854700016` 04 El banco dijo sí, el seguro dijo no (creativo 1190624523288470)
- **Formulario `1125698943209590`** "MERC | Desgravamen rechazado | Compra y refinanciamiento | V2": Mayor grado de intención, **sin verificación por SMS**, entrega flexible apagada, teléfono obligatorio y correo opcional (evidencia: `instagram/desgravamen-ads/v3/qa/formulario-v2-sin-sms.jpg`). Rutas verificadas en el editor antes de publicar:
  - P1 ¿Para qué necesitas el seguro de desgravamen?: Compra / Refinanciamiento o portabilidad → P2; Cambiar solo el seguro sin refinanciar / Cobrar o reclamar → E2.
  - P2 ¿En qué banco quedará tu crédito? (puede ser tu mismo banco): 6 bancos → P3; Otro → E2.
  - P3 ¿Por cuánto es el crédito que debe cubrir el seguro?: Menos de UF 2.000 → E2; Desde UF 2.000 / No lo sé → P4.
  - P4 ¿La aseguradora del banco rechazó tu seguro de desgravamen?: Sí → P5; Todavía no lo solicito / No, me lo aprobaron → E2.
  - P5 ¿Para cuándo necesitas el seguro?: todas → enviar (E1).
  - E1: "Te contactaremos lo antes posible por WhatsApp desde el +56 9 3931 9546" + aviso de evaluación; botón "Ver más información" → `https://mercurial.cl/desgravamen-rechazado` (Meta rechaza `/wa/desgravamen` porque detecta la redirección a WhatsApp).
- Campañas antiguas en pausa: "7 días | Oct 2026" (120249961807260016), "v2 | Continua" (120250127628210016, con creativos que nombran a la aseguradora, no reactivar) y "6 Bancos" (120249963085870016).
- Landing y `/wa/desgravamen` desplegadas (commit 7ca3544). QA en producción, sin envíos ni trackers: escritorio y móvil sin desborde; cambio de seguro, cobros y "sin rechazo" bloquean el botón; el servidor responde 422 a casos fuera de alcance y 400 si faltan datos. El caso válido se probó solo en local (MAIL_DRY_RUN), para no generar leads ni correos falsos.
- **Atribución por Chatwoot pendiente:** el botón de E1 ya no abre WhatsApp con "ref: DH-META"; lleva a la landing, cuyo botón de WhatsApp no trae la referencia. La regla de Chatwoot no está creada ni probada.

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

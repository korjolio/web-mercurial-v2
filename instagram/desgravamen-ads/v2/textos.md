# Desgravamen Hipotecario Plus · Meta · v2

Cuatro conceptos, cada uno con JPG feed (1080×1350) y story (1080×1920, historias/reels). El texto de cada concepto se usa en ambas adaptaciones.

## 01 · Nuevo crédito

Archivos: `01-nuevo-credito-feed.jpg` y `01-nuevo-credito-story.jpg`.

**Texto principal:** ¿Estás pidiendo un crédito hipotecario nuevo y la aseguradora del banco te rechazó la solicitud de desgravamen? Conoce el Seguro Desgravamen Hipotecario Plus de AuguStar con Mercurial. Solo para créditos hipotecarios nuevos, aprobados o en trámite. Completa el formulario para consultar. No aplica a hipotecarios vigentes ni a cobros o reclamos de seguros.

**Título:** Desgravamen para tu nuevo hipotecario

**Descripción:** Solo créditos nuevos, aprobados o en trámite.

## 02 · Requisito de desgravamen

Archivos: `02-requisito-feed.jpg` y `02-requisito-story.jpg`.

**Texto principal:** Para un crédito hipotecario NUEVO: si la aseguradora del banco rechazó tu solicitud de desgravamen, conoce Desgravamen Hipotecario Plus de AuguStar. Cumple el requisito de desgravamen que exige la institución financiera. Consulta a Mercurial a través del formulario. Solo créditos nuevos, aprobados o en trámite; no hipotecarios vigentes ni cobros o reclamos de seguros.

**Título:** El desgravamen de tu nuevo crédito

**Descripción:** Consulta si esta alternativa aplica a tu caso.

## 03 · Diseño del producto

Archivos: `03-producto-feed.jpg` y `03-producto-story.jpg`.

**Texto principal:** ¿Crédito hipotecario NUEVO, aprobado o en trámite, y solicitud de desgravamen rechazada por la aseguradora del banco? Conoce Desgravamen Hipotecario Plus de AuguStar, un producto pensado para personas con condiciones especiales de salud o mayores de 50 años. Completa el formulario para solicitar orientación de Mercurial. No aplica a hipotecarios vigentes ni a cobros o reclamos de seguros.

**Título:** Conoce Desgravamen Hipotecario Plus

**Descripción:** Para créditos hipotecarios nuevos.

## 04 · Cobertura y capital

Archivos: `04-capital-feed.jpg` y `04-capital-story.jpg`.

**Texto principal:** Solo para créditos hipotecarios NUEVOS, aprobados o en trámite, cuya solicitud de desgravamen fue rechazada por la aseguradora del banco. Seguro Desgravamen Hipotecario Plus de AuguStar: cubre fallecimiento y tiene un capital asegurado desde UF 2.000. Completa el formulario para consultar con Mercurial. No aplica a hipotecarios vigentes ni a cobros o reclamos de seguros.

**Título:** Nuevo hipotecario: conoce esta opción

**Descripción:** Capital asegurado desde UF 2.000.

## Uso y trazabilidad

- Usar con el formulario publicado: “MERC | Hipotecario | Prospectos Nuevos | V1 | Oct 2026”, con lógica condicional. CTA sugerido en Meta: “Más información”.
- Categoría especial de la campaña: productos financieros, según `docs/campanas/desgravamen-meta.md`.
- Las referencias a salud y edad describen el producto; no afirman atributos personales del lector. El formulario no solicita datos de salud.
- Fuente de las afirmaciones: ficha oficial AuguStar transcrita en `docs/campanas/desgravamen-meta.md`. No se promete aprobación, aceptación universal ni un plazo de respuesta.
- Pie regulatorio: texto íntegro reutilizado de `instagram/plantilla.html`.
- Tipografía Albert Sans; colores #0d2340 y #1a7ca4. Piezas tipográficas sin fotografías.
- Verticales: contenido entre y=260 e y=1655; márgenes reservados para la interfaz de historias/reels. Usar la adaptación correspondiente a cada ubicación, sin recortar automáticamente la pieza feed.
- Fuentes editables: `posts.js` + `plantilla.html`. Render con Playwright, adaptado de `instagram/render.js`: desde la raíz del repo, `node instagram/desgravamen-ads/v2/render.js`.
- QA: los ocho JPG fueron abiertos y revisados visualmente; sin texto cortado. Dimensiones y títulos de hasta 40 caracteres verificados.

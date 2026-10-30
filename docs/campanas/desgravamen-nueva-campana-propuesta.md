# Nueva campaña desgravamen rechazado (compra y refinanciamiento) — propuesta para revisión

Estado: **borrador local, nada creado ni cargado en Meta**. Basado en `desgravamen-nueva-campana-brief.md` (30-10-2026). Lo marcado **PENDIENTE** no puede ir a material público hasta que Pepa lo confirme.

## 1. Diagnóstico (revisado el 30-10-2026, ~16:15)

Meta (lectura por API y Business Suite):
- Las campañas "7 días | Oct 2026" y "v2 | Continua" están **pausadas**. La v2 no tiene gasto. Total histórico: $8.787 y 2 leads.
- Formulario vigente "MERC | Hipotecario | Prospectos Nuevos | V1 | Oct 2026" (ID 2227208931193805). Los formularios publicados no se editan, así que hay que hacer uno nuevo. Choca con la nueva oferta en:
  - Presentación y E2 dicen "Solo para créditos hipotecarios nuevos".
  - P1 descarta "Ya tengo un crédito hipotecario vigente" → **descartaría a quien refinancia o hace portabilidad**.
  - P2 pregunta el banco "con el que estás tramitando" → no deja claro que es el **banco de destino**.
  - P3 aplica UF 2.000 sin aclarar sobre qué monto. La ficha dice "capitales asegurados mínimos UF 2.000".
  - No pregunta si el desgravamen ya fue rechazado (el brief lo exige).
- Los 4 anuncios de la v2 llevan los creativos viejos con "AuguStar": **no se reutilizan**.

Repo:
- `instagram/desgravamen-ads/v2/` (8 JPG y `textos.md`): todo dice "Solo créditos hipotecarios nuevos" → **no sirve para esta campaña**. No se modificó, por instrucción.
- Landing `/desgravamen-rechazado` (`desgravamen.html`): habla de "casos rechazados por motivos de salud" (dirigido al lector) y no menciona refinanciamiento. El selector de etapa tiene las opciones "Estoy solicitando el crédito / Crédito aprobado, falta el seguro / Ya tengo el crédito / Otra", sin opción de refinanciamiento y sin forma de distinguirlo de un cambio de seguro.
- WhatsApp: `/wa/desgravamen` (server.js) abre +56 9 3931 9546 con el texto "Hola, completé el formulario de desgravamen hipotecario (ref: DH-META)". Sirve igual; ver la propuesta en la sección 5.
- `ai.txt` / `llms.txt`: "rechazado por motivos de salud". Ajuste menor opcional.

## 1b. Lo que dice la ficha "Desgravamen Hipotecario Plus horizontal.pdf" (revisada 30-10-2026)

- Producto: seguro de vida de desgravamen **individual**, evaluado por el equipo de suscripción de la aseguradora ("sujeto a evaluación").
- Para personas **con condiciones especiales de salud** que necesitan cumplir el requisito de desgravamen que exige la institución financiera para el crédito hipotecario.
- Cubre fallecimiento.
- **Capitales asegurados mínimos: UF 2.000** (texto de la ficha). Pepa confirmó que el capital asegurado es el monto del crédito.
- **Sin requisitos de edad ni lista de bancos en la ficha.** La primera ficha (RRSS) hablaba de "mayores de 50 años" como público, no como requisito. No se usa la edad como filtro.
- La ficha habla de "nueva propiedad" (compra). **La confirmación de Pepa/Tamarita prevalece: también se aceptan refinanciamiento y portabilidad.**
- La ficha nombra a la aseguradora y sus datos (respaldo, clasificación, teléfono). Nada de eso va en la campaña, por instrucción.

## 2. Formulario nuevo (propuesta)

Nombre: `MERC | Desgravamen rechazado | Compra y refinanciamiento | V2`. Tipo "Mayor grado de intención", **sin verificación por SMS** (decisión de Pepa), teléfono normal, entrega flexible apagada.

**Presentación**
- Título: ¿Te rechazaron el seguro de desgravamen?
- Texto: Si estás comprando una propiedad o refinanciando tu crédito hipotecario y la aseguradora del banco rechazó tu desgravamen, podemos ofrecerte una alternativa. No gestionamos cobros, siniestros ni reclamos, ni el cambio de seguro de un crédito vigente sin refinanciar. Cobertura sujeta a evaluación y aceptación de la aseguradora. El banco debe aceptar la póliza.

**Preguntas y rutas** (→ = lógica condicional)

| # | Pregunta | Respuesta → destino |
|---|---|---|
| P1 | ¿Para qué necesitas el seguro de desgravamen? | Compra con crédito hipotecario nuevo → P2 · Refinanciamiento o portabilidad de mi crédito → P2 · Cambiar solo el seguro de mi crédito actual, sin refinanciar → **Cerrar** · Cobrar o reclamar un seguro → **Cerrar** |
| P2 | ¿La aseguradora del banco rechazó tu seguro de desgravamen? | Sí, me lo rechazaron → P3 · Todavía no lo solicito → **Cerrar** · No, me lo aprobaron → **Cerrar** |
| P3 | ¿En qué banco quedará tu crédito? (si refinancias, puede ser tu mismo banco u otro) | Santander · Banco de Chile · Itaú · BancoEstado · Banco Internacional · Consorcio → P4 · Otro → **Cerrar** |
| P4 | ¿Por cuánto es el crédito que debe cubrir el seguro? (si refinancias, el monto del crédito nuevo; no el valor de la vivienda) | Menos de UF 2.000 → **Cerrar** · Desde UF 2.000 → P5 · No lo sé / necesito orientación → P5 (**sin descarte**, revisión humana) |
| P5 | ¿Para cuándo necesitas el seguro? | Esta semana / Este mes / Más adelante → Enviar (E1) |

P4: **confirmado por Pepa (30-10-2026): capital asegurado = monto del crédito.** En un refinanciamiento se pregunta el monto del crédito a asegurar, no el valor de la vivienda.
Contacto: nombre, teléfono (obligatorio) y correo (opcional). Descripción: "Usaremos tus datos solo para contactarte por WhatsApp o teléfono por tu caso de desgravamen."
Sin preguntas de salud ni de edad (la ficha no fija requisitos de edad).

**E1 (califica)**: "¡Listo! Te contactaremos lo antes posible por WhatsApp desde el +56 9 3931 9546. Cobertura sujeta a evaluación y aceptación de la aseguradora. El banco debe aceptar la póliza." Botón: "¡Escríbenos por WhatsApp!" → `https://mercurial.cl/wa/desgravamen`.
**E2 (no califica)**: "Gracias por tu interés. Esta alternativa es para compras o refinanciamientos hipotecarios con el desgravamen rechazado, con un crédito desde UF 2.000, en Santander, Banco de Chile, Itaú, BancoEstado, Banco Internacional o Consorcio. No gestionamos cobros, reclamos ni cambios de seguro sin refinanciar."

## 3. Copys e imágenes

**Versión vigente: `instagram/desgravamen-ads/v3/`.** Contiene 8 JPG (feed y story) y `textos.md` con el texto principal, el título y la descripción de cada anuncio.
- Etiqueta en las imágenes: "Compra o refinanciamiento hipotecario". En el pie: el aviso de evaluación y aceptación más la línea CMF.
- Los bancos indicados se nombran solo en el texto del anuncio, no en la imagen.
- `v2/` queda como antecedente y no se usa en esta campaña.

## 4. Landing `/desgravamen-rechazado` (cambios propuestos, sin aplicar)

- Hero: "¿Te rechazaron el seguro de desgravamen? Si compras o refinancias tu crédito hipotecario, podemos ofrecerte una alternativa."
- Quitar "Buscamos alternativas para casos rechazados por motivos de salud" (atribuye salud al lector).
- Agregar el bloque "Para quién es": compra con crédito nuevo o refinanciamiento/portabilidad, con desgravamen rechazado, banco de destino entre los 6. "No aplica a": cobros, siniestros, reclamos y cambio de seguro sin refinanciar.
- Selector "¿Para qué necesitas el seguro?": Compra con crédito nuevo / Refinanciamiento o portabilidad / Cambiar solo el seguro (sin refinanciar) / Otra.
- Campo "Banco del crédito" → "Banco de destino del crédito".
- Mantener "No podemos garantizar que una aseguradora acepte tu caso" y el horario de WhatsApp. No agregar plazos de respuesta.
- Cambiar el JS y la validación del servidor si cambian los valores del selector (revisar `server.js` y `/api/contacto`).

## 5. WhatsApp

- Texto pre-escrito propuesto: "Hola, me rechazaron el seguro de desgravamen y quiero consultar por una alternativa (ref: DH-META)". Mantiene `DH-META` para la regla de Chatwoot.
- Regla de Chatwoot (etiqueta `desgravamen-meta`): sigue pendiente.

## 6. Aprobación

Pepa aprobó el paquete v3 el 30-10-2026 ("dale con todo"), con dos condiciones: sin verificación por SMS, y capital asegurado = monto del crédito. El estado de la ejecución está en `desgravamen-meta.md`.

## 7. Estado del paquete (30-10-2026, ~16:35) — para revisión, no terminado

- Piezas: `instagram/desgravamen-ads/v3/`. Contiene 8 JPG, `textos.md`, `revision.html` (vista previa local) y `qa/` (capturas de la landing). Copia privada: https://claude.ai/artifact/MsemHeooWpGgQm3w5waSSr
- La landing (`desgravamen.html`) y `server.js` tienen los cambios **solo en local**, sin commit ni despliegue. Incluye el filtro del formulario en la UI y en el servidor, solo para la rama de desgravamen. El texto de `/wa/desgravamen` se cambió.
- Meta: no se creó nada.

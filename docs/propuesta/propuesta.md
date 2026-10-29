# Rediseño mercurial.cl: propuesta para aprobación

> **Actualización:** la dirección "Señalética" (§4, `mockup-portada.html`) fue descartada. La propuesta vigente es **`portada-v2.html`**: fotografía de las campañas a sangre, titular Source Serif 4, azul marino y acento azul. Vista móvil en `vista-movil.html`; capturas de QA en `capturas/`. El contenido, el mapa de páginas, los formularios y los datos pendientes de este documento siguen vigentes.

28 de octubre de 2026. Nada de esto toca las páginas del sitio todavía. Mockup: `docs/propuesta/mockup-portada.html` (desktop) y `docs/propuesta/vista-movil.html` (tres vistas a 390 px). `docs/` no se publica.

---

## 1. Diagnóstico breve

**Portada (`index.html`)**
- Habla en abstracto: "Gestión y Transferencia de Riesgos", "Consultoría Técnica", "Portfolio de Soluciones", "Senior Risk Advisor", "blindaje patrimonial", "EBITDA de riesgo". Nadie sale sabiendo qué seguros se pueden contratar ni para quién son.
- Las mismas cosas aparecen dos veces: "Rubros especializados" (logística, minería, inmobiliario) y "Nuestros seguros" (property, transporte, RC, salud). Además destaca líneas que no son prioridad (minería, energía, Cyber, D&O) y deja fuera Flotas.
- Afirmaciones sin respaldo: "sin letras chicas", "puede reducir hasta un 15% su costo total", "la mayoría de las empresas pagan sobre el spread". También están en el JSON-LD (FAQPage), en `llms.txt` y en `ai.txt`.
- El formulario pide RUT y un "vencimiento" en texto libre, y ofrece ramos que no son prioridad. El éxito se muestra en un modal con texto inventado ("Un Senior Risk Advisor le contactará…"). El botón de WhatsApp usa el ícono de teléfono.
- Técnica: no respeta `prefers-reduced-motion`; el fade-in deja el contenido invisible hasta que el IntersectionObserver lo dispara; el contraste en el pie es bajo; los enlaces del menú llevan a anclas genéricas (`#rubros`, `#seguros`).

**Landings de campaña**
- `/transporte`: copy concreto que se puede rescatar (camión y flota, carga nacional e internacional, robo con fractura/asalto, equipos de frío). Pero promete "un ejecutivo te contacta en 1-2 horas"; el plazo confirmado es **3 a 5 horas hábiles**. Mezcla flota (vehículos) con carga (mercadería), y el backend ya los separa por `utm_content` ("Camión/Flota" vs. "Carga y Comercio Exterior").
- `/cotizar-pyme` (incendio → CRM propio): **queda fuera del rediseño, intocable**.
- `/condominio` y `/seguro-mascotas`: fuera de alcance; no se modifican.

**Identidad**
- Logo: M facetada en dos azules + "MERCURIAL" en gris. Azul `#2399C6`.
- Las piezas de Instagram y Ads de noviembre ya usan una línea más actual: azul marino `#0f2a4a`, titular serif, acento azul y fotografía real. La web de hoy (Inter, celeste sobre blanco, tarjetas con sombra) no conversa con esas campañas.

---

## 2. Mapa de páginas

| Ruta | Estado | Qué es | Formulario |
|---|---|---|---|
| `/` | Rediseño | Portada: qué hace Mercurial, las 4 líneas, renovaciones, quiénes somos, proceso y contacto | Consulta breve (nuevo contrato, ver §6) |
| `/seguros/flotas` | Nueva, indexable | Vehículos de empresa (camiones, camionetas, autos) | Consulta, con la línea preseleccionada |
| `/seguros/transporte` | Nueva, indexable | Carga y mercadería en tránsito. Reutiliza el contenido de `/transporte` | Consulta, con la línea preseleccionada |
| `/seguros/incendio` | Nueva, indexable | Explica la línea y deriva a **`/cotizar-pyme` sin modificarla**. Las empresas grandes usan la consulta general | Botón a `/cotizar-pyme` + consulta |
| `/seguros/colectivos-de-salud` | Nueva, indexable | Seguro complementario para equipos | Consulta, con la línea preseleccionada |
| `/desgravamen-rechazado` | Nueva, `noindex` (campañas) | Ver §7 | Propio, sin datos médicos |
| `/transporte` | Se mantiene | Landing de Google Ads. Misma ruta, formulario y contrato. Solo cambian el plazo prometido (1-2 h → 3-5 h hábiles) y, si se aprueba, la piel visual | `/api/leads` sin cambios |
| `/condominio`, `/seguro-mascotas`, `/cotizar-pyme`, `/politica-privacidad`, `terminos.html` | Sin cambios | | |

**Navegación.** Seguros (menú con las 4 líneas, cada una con su descripción de una línea) · Mercurial (ancla en la portada) · Contacto. A la derecha, WhatsApp y "Hacer una consulta".

**Preguntas frecuentes.** Salen de la portada y van a cada página de línea. Borrador de preguntas (las respuestas se escriben con lo que me entreguen; nada inventado):
- *Flotas:* ¿Desde cuántos vehículos se puede hacer una póliza de flota? · ¿Qué pasa si compro o vendo un vehículo a mitad de la vigencia? · ¿Qué datos necesitan para cotizar?
- *Transporte:* ¿Qué diferencia hay entre asegurar el camión y asegurar la carga? · ¿Cubre carga de terceros? · ¿Qué es la cláusula de medidas de seguridad?
- *Incendio:* ¿Qué montos debo declarar (edificio, contenidos, mercaderías)? · ¿Qué pasa si declaro menos de lo que vale? · ¿Por qué me preguntan por las medidas contra incendio?
- *Colectivos de salud:* ¿Cuántos trabajadores se necesitan? · ¿Se pueden incluir cargas familiares? · ¿Cómo funciona el reembolso?

---

## 3. Contenido de la portada (en el mockup)

1. **Primera pantalla.** Titular: *"Cotizamos el seguro de tu empresa y te explicamos qué estás firmando."* Bajada: corredores inscritos en la CMF, cuatro líneas para empresas, respuesta en 3 a 5 horas hábiles. Acciones: "Hacer una consulta" (principal) y "Escribir por WhatsApp". Al pie del letrero, las cuatro líneas como carriles que llevan a su página.
   - El titular no promete ahorro ni rapidez: describe lo que hace un corredor. Si prefieren otro tono, alternativas: *"Seguros para empresas, explicados antes de firmar."* / *"Tu corredor para flotas, carga, incendio y salud del equipo."*
2. **Cuatro seguros.** Tablero reglado (no tarjetas): Línea · Para quién · Qué se asegura · enlace. Incendio dice "Cotizar Incendio · formulario pyme en línea" y lleva a `/cotizar-pyme`.
3. **Renovaciones.** "¿Tu póliza vence en los próximos meses?" Envían la póliza o la propuesta de renovación y les decimos si conviene renovar igual o cotizar de nuevo. El botón abre el formulario con "Renovación" ya marcado.
4. **Somos corredores, no aseguradora.** Solo hechos comprobables: Registro CMF N° 8929 con enlace para verificar, 3 a 5 horas hábiles, procedimiento de reclamos (Circular 2131) y RUT. **Equipo: pendiente**, sin nombres hasta tener material.
5. **Qué pasa después de consultar.** 1 Nos dejas tus datos · 2 Te llamamos en 3 a 5 h hábiles · 3 Cotizamos con lo que pide la aseguradora y te presentamos alternativas · 4 Si contratas, te acompañamos en la emisión, los cambios y la renovación.
6. **Contacto.** Formulario breve + WhatsApp + horario.
7. **Pie.** Logo, líneas, contacto, información regulatoria (CMF, RUT, reclamos, portal CMF), Términos, Privacidad y un enlace discreto a "Desgravamen rechazado".

Por validar con ustedes antes de publicar: los ítems de "qué se asegura" de **Flotas** y **Colectivos de salud** (son coberturas típicas, pero no están documentadas en el repo) y los pasos 3-4 del proceso.

---

## 4. Dirección visual: "Señalética"

Hecha con Impeccable. La tirada asignó la tercera dirección de mi lista; la desarrollé completa y la contrasté con las alternativas del catálogo.

**Tesis.** La portada funciona como un letrero vial: dice dónde estás y hacia dónde ir, sin adornos. Es el lenguaje más claro que conoce cualquiera que maneje una flota o mueva carga, y responde directo al problema del tono grandilocuente.

**Mundo propio.**
- Paneles azul marino `#0f2a4a` (el mismo de las campañas) con el filete blanco interior y las esquinas concéntricas de un letrero real.
- Escudos blancos con pictogramas propios, uno por línea.
- Flechas que indican hacia dónde lleva cada cosa.
- Fondo blanco; el azul Mercurial solo marca lo que se puede accionar.
- Tipografía: **Barlow Semi Condensed**, nacida de la señalética vial, para títulos y letreros, y **Source Sans 3** (la de las campañas) para el texto.

**Primera pantalla.** Un letrero de pórtico ocupa el ancho:
- arriba, el titular y las dos acciones;
- abajo, cuatro "carriles" separados por filetes, uno por línea, cada uno con escudo, nombre, una línea de descripción y flecha.

En móvil los carriles pasan a filas con flecha a la derecha.

**Recorrido.** Letrero → tablero reglado de líneas → panel claro de renovación → placa de datos verificables → ruta de 4 hitos → letrero de contacto con el formulario dentro → pie azul marino.

**Lo que tomó de las alternativas descartadas** (cada una aportó una disciplina, no su estética):
- *Tablero de estación (split-flap):* las líneas se presentan en filas y columnas fijas, no como tarjetas.
- *Mar bioluminiscente:* en reposo todo es azul marino y blanco; el color vivo aparece solo donde hay una acción.
- *Tinta suminagashi:* el texto que se lee nunca se mueve; el movimiento queda en flechas y estados.
- *Cantera de nubes:* bloques claros con separaciones generosas entre secciones.

**Alternativas reales, si esta no convence:**
- **Carátula de póliza** (mi primera opción propia). La página se arma con la gramática del documento de seguro: casillas rotuladas (Materia asegurada, Vigencia, Deducible) y números tabulares. Riesgo: es lo más esperable en la categoría y puede verse administrativo.
- **Identidad modular** (estilo Studio Dumbar, fusionado): bloques de color derivados de las facetas de la M sobre fotografía real de flota, carga, bodega y oficina. Más llamativa y más "marca". Riesgo: es más ruidosa y exige fotografía de calidad para cada línea.
- **El estándar de la categoría, bien hecho:** héroe con foto, cuatro tarjetas, prueba social. Lo dejo disponible, pero no lo recomiendo.

**Riesgo honesto de Señalética.** Los títulos de la web se apartan del serif de las piezas de Instagram; comparten el azul marino, el acento y el tono. Si quieren calce total, más adelante se puede pasar el titular de las piezas a Barlow, o usar serif solo en la landing de desgravamen.

### Movimiento (cómo usaré cada skill)

- **GSAP + ScrollTrigger** (vendorizado en `src/vendor/`, sin CDN), dentro de `gsap.matchMedia()`:
  - al cargar, entrada única del letrero: el titular sube por líneas y los carriles aparecen en secuencia (~40 ms entre uno y otro);
  - al hacer scroll, `ScrollTrigger.batch` revela una sola vez cada fila del tablero y los hitos de la ruta;
  - solo `transform` y `opacity`, sin pin, sin scrub y sin scroll secuestrado;
  - el contenido es visible por defecto: el estado oculto solo se aplica si GSAP cargó y no hay `prefers-reduced-motion`.
- **Transitions.dev:**
  - menú Seguros con *menu dropdown* (05);
  - panel móvil con *panel reveal* (07);
  - acordeón de FAQ (21);
  - botón de envío con *text states swap* (04, "Enviar consulta" → "Enviando…");
  - error de campo con *error state shake* (12), siempre acompañado de mensaje en texto;
  - éxito con *success check* (10);
  - flechas con *learn more hover* (24);
  - todo con sus tokens de duración y curva, y su bloque de movimiento reducido.
- **Make Interfaces Feel Better:**
  - radios concéntricos (letrero 28 → filete 16);
  - `scale(0.96)` al presionar;
  - transiciones con propiedades explícitas (nunca `all`);
  - áreas táctiles de 44 px;
  - un solo trazo de íconos (2 px junto a semibold);
  - `text-wrap: balance/pretty`;
  - cifras tabulares;
  - foco visible propio.
- **Impeccable:** dirección, jerarquía, contrato de dirección y revisión final con su revisor y su detector.

---

## 5. Alcance de implementación (si se aprueba)

**Sí**
- `index.html` reescrita; nuevo `src/css/sitio.css` con tokens; `src/js/sitio.js` (menú, formulario, movimiento); GSAP vendorizado; fuentes autoalojadas.
- Cuatro páginas de línea + landing de desgravamen.
- Rutas limpias en `server.js` (solo `app.get(...)`) y `PRODUCT.md` agregado a `BLOCKED_STATIC_FILES`.
- `sitemap.xml` con las páginas indexables.
- JSON-LD, `llms.txt` y `ai.txt` sin las afirmaciones sin respaldo (15 %, "sin letras chicas", "spread"), con las 4 líneas.
- `/transporte`: corregir el plazo prometido a 3-5 h hábiles. Cambio de piel visual solo si lo aprueban (formulario y contrato intactos).

**No (salvo aprobación expresa)**
- `/cotizar-pyme` y su backend, `/condominio`, `/seguro-mascotas`.
- GTM, `src/js/meta.js`, la API de conversiones y la deduplicación.
- Ningún framework nuevo.

`styles.css` se mantiene mientras `/condominio` y `/transporte` lo usen.

**Verificación**
- Navegador en desktop y 390 px; menú y teclado; formularios con backend simulado (envío, éxito, error de validación y error de red, sin CRM ni Meta reales); consola; desborde horizontal; `prefers-reduced-motion`; animaciones muestreadas a 10, 30, 60 y 80 s.
- Recorrido de `/cotizar-pyme` contra un CRM falso, para confirmar que sigue igual.
- Vista previa local. **Sin desplegar.**

---

## 6. Formularios: cambio de contrato que necesito aprobar

Hoy la portada envía a `/api/hubspot/auditoria`: exige nombre, email y empresa, crea un contacto y un deal en el pipeline `default`/`appointmentscheduled` y **no** emite el Lead de Meta. `/api/leads` exige RUT y solo acepta `condominio` o `transporte`.

**Propuesta: extender `/api/leads`** (mismo flujo HubSpot Contact + Company + Deal, mismas UTM/gclid y misma deduplicación de Meta por `meta_event_id`):

- `cluster_source` acepta además `flotas`, `incendio`, `salud`, `renovacion` y `general`. Para estos el RUT es opcional; `condominio` y `transporte` siguen exigiéndolo, sin cambios.
- Campos de la consulta: `firstName`/`lastName` (derivados de "Nombre y apellido"), `company`, `email`, `phone`, `cluster_source` (de la línea elegida), `message` opcional (va a la nota del deal), `page_url` y `meta_event_id`.
- Pendiente de ustedes: los valores de la propiedad `cluster` del deal en HubSpot para las nuevas líneas, y si `/api/hubspot/auditoria` se retira una vez migrada la portada.

**Estados:**
- validación en vivo al salir de cada campo, con mensaje en texto bajo el campo;
- "Enviando…" con el botón deshabilitado;
- éxito en el mismo lugar del formulario (sin modal): "Recibimos tu consulta. Te contactamos en 3 a 5 horas hábiles", más el WhatsApp;
- error con la causa y la salida: "No pudimos enviar tu consulta. Intenta de nuevo o escríbenos por WhatsApp", sin perder lo escrito.

---

## 7. Landing de desgravamen rechazado (estructura; contenido pendiente)

Con la misma identidad, pero en registro de persona: tuteo cálido, sin jerga, y **sin enlace desde la navegación principal** (solo el pie y las campañas). En línea con las piezas de Alejandro.

1. **Tu situación.** "¿Te rechazaron el seguro de desgravamen de tu crédito hipotecario?" Un rechazo de la aseguradora no siempre cierra el camino.
2. **Qué hacemos.** Revisamos tu caso y buscamos alternativas con aseguradoras. *(Pendiente: confirmar la capacidad real.)*
3. **Alcance y límites** (a la vista, no en letra chica):
   - la cobertura está sujeta a evaluación y aceptación de la aseguradora;
   - el banco debe aceptar la póliza;
   - no garantizamos aceptación, plazos ni precio;
   - si no vemos alternativa, te lo decimos.
4. **Qué te pediremos después, no ahora.** Datos del crédito (banco, monto aproximado, plazo) y la comunicación del rechazo. Los antecedentes de salud se piden recién cuando una aseguradora los requiera, por un canal seguro. *(Pendiente: definir ese canal.)*
5. **Proceso.** Déjanos tus datos → te llamamos en 3 a 5 h hábiles → si hay alternativa, te pedimos antecedentes → presentamos la alternativa y la gestión con el banco.
6. **Preguntas frecuentes** (a responder con información confirmada):
   - ¿Puedo contratar un desgravamen distinto al que ofrece el banco? *(base legal a validar)*
   - ¿La evaluación tiene costo?
   - ¿Qué pasa si mi crédito ya está firmado?
   - ¿Por qué me rechazaron?
7. **Formulario inicial, sin datos de salud:** nombre, celular, correo, banco (opcional) y situación del crédito ("lo estoy solicitando", "aprobado, falta el seguro", "ya lo tengo"), más el consentimiento. Nada de diagnósticos ni documentos.
8. **Disclaimer de las campañas** al pie de la sección de consulta.

**Analítica sensible.** A Meta y GTM se manda solo un evento genérico (p. ej. `Lead` con `content_name: 'Consulta personas'`), nunca "rechazado", "salud" ni el motivo. La URL no lleva datos personales. Meta restringe los datos que sugieren condiciones de salud, así que conviene confirmar si esta página carga el píxel o solo GTM.

---

## 8. Datos que faltan

| Tema | Qué necesito | Bloquea |
|---|---|---|
| Equipo | Nombres, cargos, foto y una línea de experiencia | Solo la sección "Pendiente: equipo" |
| Coberturas Flotas y Salud | Confirmar o corregir los 3 ítems de cada línea; condiciones (mínimo de vehículos o trabajadores) | Páginas de línea y sus FAQ |
| Aseguradoras | Con qué compañías trabajan y si se pueden nombrar o mostrar sus logos (requiere permiso) | Nada, por ahora no se nombran |
| Trayectoria | ¿"Más de 8 años" es correcto y desde qué año? | Nada, por ahora no se publica |
| Correo comercial | Hoy figura auditoria@mercurial.cl; ¿se mantiene o hay contacto@? | Pie y JSON-LD |
| Dirección | ¿Se publica una dirección o solo "Santiago"? | Pie |
| HubSpot | Valores de `cluster` para flotas, incendio, salud y renovación | Backend de la consulta |
| Desgravamen | Capacidad real, aseguradoras, costo de la evaluación, quién atiende, canal seguro para antecedentes de salud, destino del lead (HubSpot o CRM propio), texto legal sobre la libre elección del seguro | Publicar la landing |
| Otros seguros | ¿Condominio y Mascotas aparecen en el pie como "Otros seguros" o quedan solo en sus campañas? | Pie |
| Fotografía | Para las páginas de línea: fotos reales propias o de stock (como en Instagram) | Páginas de línea |

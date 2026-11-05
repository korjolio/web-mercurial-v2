msg_7ed49f5a05e9 status from term_9d647fcb-8488-4460-aed7-5d24b078bcdb
  Informe adversarial mercurial.cl — parte 1 de 2
  Veredicto brutal — 5 líneas
  El sitio pide confianza antes de ganársela: se presenta como corredora, pero explica poco por qué conviene escribirle.
  La portada todavía vende la estructura del sitio y las páginas de flotas y salud parecen esqueletos publicados.
  Transporte confunde vehículo y carga; mascotas promete una experiencia más simple de lo que sus propias condiciones permiten.
  Desgravamen incumple varias reglas expresas del encargo, incluso en metadatos, mensajes de error y filtros.
  No publicaría esta versión sin corregir esos textos y cerrar la revisión visual pendiente en móvil.
  
  Alcance y límites: revisé los 14 HTML y los scripts/CSS/backend de /tmp/fix-qa, y abrí por HTTP las 14 rutas de localhost:3020; sus respuestas coinciden byte por byte con esos archivos. Leí CLAUDE.md y el informe previo del checkout principal: /tmp/fix-qa/docs/reporte-qa-sitio-2026-11-04.md no existe. Comprobé 996 referencias internas, sobre 50 destinos distintos, y ambos endpoints locales con un cuerpo vacío: responden 503; no hubo leads ni envíos externos. El 404 ya responde 404 con diseño y el sitemap ya usa /politica-privacidad: no los presento como rotos.
  ⚠️ DEGRADED: single-context (el encargo prohíbe subagentes); revisión visual incompleta: el host del navegador integrado no está disponible y cua.getApp de Chrome venció dos veces, a 30 y 60 segundos. No afirmo haber probado interacción, consola, rendimiento real ni layout a 390 px; sí revisé sus reglas CSS. Usé Impeccable context y una sola ejecución del detector sobre los 14 HTML; descarté alertas de CSS compartido que atribuían un carrusel a páginas que no lo contienen, y no convierto sugerencias estéticas automáticas en hechos. No escribí snapshots, archivos ni cambios; preguntas omitidas por ser un encargo de solo lectura con alcance explícito.
  
  Hallazgos de mayor a menor gravedad; todas las ubicaciones siguientes son relativas a /tmp/fix-qa.
  
  1. CRÍTICO — /desgravamen-rechazado — desgravamen.html:148, :159, :169, :177 y metadatos :13/:16.
  Problema: se repite una afirmación expresamente prohibida por Pepa y ambigua para el lector: puede leerse como garantía de que el banco está obligado a aceptar.
  Evidencia: “El banco debe aceptar la póliza”; “si te acepta, el banco debe aprobar la póliza”.
  Arreglo listo: “La cobertura está sujeta a evaluación y aceptación de la aseguradora. La contratación también requiere la revisión de la póliza por parte del banco.” Repetir solo donde sea necesario, con coherencia en description y Open Graph. No sostengo aquí una infracción legal ya determinada: sí un incumplimiento literal del encargo y un riesgo de interpretación comercial.
  
  2. ALTO — /transporte — transporte.html:91/:92/:113; contradicción con seguro-transporte.html:168.
  Problema: la landing de carga vende vehículo, carga y ocupantes como si fueran una misma oferta; además atribuye fallas del equipo de frío a protección “para tu vehículo”, mientras la página de producto las agrupa en carga.
  Evidencia: “Camión propio, carga de terceros o mercadería en tránsito”; “Camión y flota — Cobertura de robo con fractura o asalto y fallas en equipos de frío para tu vehículo”; “Asiento del conductor y acompañante”. La otra página dice correctamente: “Son seguros distintos”.
  Arreglo listo para el hero: “Seguro de transporte para la mercadería que mueves.” / “Cotizamos seguros para carga propia o de terceros. Cuéntanos qué transportas, por dónde y cómo, y revisamos las condiciones que necesitas comparar.” Sustituir el bloque mixto por “El camión y la carga se aseguran por separado. Te ayudamos a identificar qué seguro corresponde a tu operación.” Retirar ocupantes y equipos de frío de esa promesa hasta documentar exactamente qué póliza y condiciones se ofrecen.
  
  3. ALTO — /seguro-mascotas — mascotas.html:295/:337/:338/:380.
  Problema: el absoluto comercial contradice las condiciones de la propia página.
  Evidencia: “sin trámites”; “Sin trámites ni reembolsos”; después: “vía libre elección aplica reembolso del 50% con topes según plan”. Además hay copagos, carencia y eventos limitados.
  Arreglo listo: “Cotiza el seguro de tu perro o gato en línea con BCI Seguros y la orientación de Mercurial.” / bloque: “Atención en red con Bono Pet” / “En la red veterinaria puedes usar Bono Pet y pagar el copago que corresponda a tu plan. Fuera de la red, revisa las condiciones de reembolso.” Mantener límites existentes, sin agregar beneficios.
  
  4. ALTO — /seguro-mascotas — mascotas.html:295/:329.
  Problema: liderazgo, número de clínicas y plazo de cotización aparecen como hechos publicitarios sin respaldo trazable en la versión revisada.
  Evidencia: “líder en protección de mascotas en Chile con una red de más de 70 clínicas veterinarias”; “cotiza en línea en 2 minutos”.
  Duda explícita: no probé que sean falsos; no encontré los PDFs oficiales mencionados por CLAUDE.md en docs de este worktree ni una fuente citada para liderazgo/red/plazo.
  Arreglo listo: “La póliza la emite BCI Seguros. Mercurial te orienta antes de contratar.” Sustituir “en 2 minutos” por “en línea” hasta medir el flujo completo. Los montos y porcentajes de los planes requieren contraste con los documentos del convenio antes de validarlos: no los doy por inventados ni por comprobados.
  
  5. ALTO — /condominio — condominio.html:91/:92/:113.
  Problema: se promete cumplimiento y protección “real” sin explicar el seguro concreto; se reduce la obligación legal a áreas comunes y se omite el alcance habitacional y las opciones para unidades.
  Evidencia: “Cumple la Ley 21.442 con una póliza que realmente protege tu comunidad”; “La Ley 21.442 exige un seguro vigente para las áreas comunes”; “Cobertura real”.
  Arreglo listo: “Seguro de incendio para tu condominio.” / “Revisamos qué bienes e instalaciones comunes necesita asegurar tu comunidad y las opciones para las unidades. Te explicamos las condiciones antes de contratar.” Añadir una explicación normativa revisada y enlazada, no una garantía genérica de cumplimiento. La referencia oficial de Ley Chile describe seguro colectivo contra incendio y opciones para unidades: https://www.bcn.cl/leychile/navegar?idNorma=1174663&idParte=10546336&idVersion=2025-05-30 ; la búsqueda de la versión 2026-09-23 mantiene estos elementos, pero el visor actual no cargó: revisar texto consolidado y NCG 556 antes de cerrar copy jurídico.
  
  6. ALTO — / — index.html:202.
  Problema: texto de maqueta que expone la arquitectura de información en vez de dar una razón de compra; el ejemplo de Pepa sigue intacto.
  Evidencia exacta: “Cada uno con su página: a quién le sirve, qué cubre y cómo cotizarlo.”
  Reemplazo listo: “Cotizamos el seguro que necesita tu empresa y te explicamos las diferencias entre las propuestas.”
  
  7. ALTO — / — index.html:173/:174/:175.
  Problema: la primera pantalla usa su espacio más valioso para una promesa genérica de buen trato; “cotizados y explicados por personas que te responden” es una expectativa mínima y resulta largo. “Varias compañías, una conversación” no explica qué recibe el dueño de empresa.
  Reemplazo de H1: “Seguros para los vehículos, la carga, el local y el equipo de tu empresa.”
  Bajada lista: “Cotizamos con distintas aseguradoras y te explicamos las coberturas y condiciones de cada propuesta antes de que decidas.”
  Microcopy listo: “Déjanos tu teléfono y te llamamos en 3 a 5 horas hábiles.” El plazo sí figura confirmado en PRODUCT.md; no lo considero inventado. No prometer ahorro, independencia ni mejores precios sin prueba.
  
  8. ALTO — /seguros/flotas — seguro-flotas.html:138/:160/:161.
  Problema: después de llegar a su seguro, el cliente solo encuentra quién lo usa y que lo llamarán; no hay una orientación que le permita comparar ni saber qué preparar. El resto es formulario y proceso repetido.
  Evidencia: “Empresas que usan vehículos para trabajar”; “Te llamamos para entender qué vehículos tienes y cómo los usas”.
  Reemplazo listo del bloque: “Para cotizar tu flota, partimos por los vehículos que tienes y el uso que les das. Con esos antecedentes revisamos qué alternativas podemos presentar y qué condiciones debes comparar.” CTA: “Consultar por mi flota”. Agregar FAQ: “¿Qué antecedentes necesitan para empezar?” → “Cuéntanos qué tipos de vehículos usa tu empresa y para qué los utiliza. Te indicaremos qué información adicional pide la aseguradora.” Coberturas, mínimo de vehículos y asistencia deben confirmarse con negocio antes de escribirlas; hoy la página no los responde.
  
  9. ALTO — /seguros/colectivos-de-salud — seguro-colectivos-salud.html:139/:160/:161.
  Problema: define la categoría y repite que cotizan; no ayuda a un responsable de RR.HH. a dar el primer paso sin inventar condiciones de producto.
  Evidencia: “Empresas que quieren sumar un beneficio de salud para sus trabajadores”; “te mostramos las diferencias entre las propuestas”.
  Reemplazo listo: “¿Quieres sumar un seguro complementario para tu equipo? Cuéntanos cuántas personas trabajan en tu empresa y qué necesitas revisar. Te explicamos qué condiciones ofrece cada propuesta antes de contratar.” CTA: “Consultar por el seguro de mi equipo”. Añadir aviso listo: “Para esta primera consulta no necesitamos antecedentes médicos.” Antes de añadir tamaño mínimo, cargas, preexistencias o reembolsos, conseguir confirmación documental; no convertir el silencio actual en coberturas inventadas.
  
  10. ALTO — /, enlace “Quiénes somos” — index.html:139/:160/:211/:212/:215.
  Problema: el enlace promete conocer la empresa y entrega solo “Somos Mercurial, corredores de seguros” y un carrusel de logos. No hay una explicación del rol, ni personas, ni prueba de servicio; los logos no responden quién se hará cargo.
  Reemplazo listo: “Cotizamos y gestionamos seguros para empresas. Te explicamos las propuestas y, si decides contratar, te acompañamos en la emisión y los cambios de tu póliza. Somos Mercurial Corredores de Seguros Ltda., inscritos en la CMF, Registro N° 8929.” Mantener la comprobación CMF accesible. Agregar equipo o casos solo cuando existan datos reales autorizados.
  
  11. ALTO — /desgravamen-rechazado — desgravamen.html:148/:168/:192/:244; server.js:281; navegación, por ejemplo index.html:135/:158.
  Problema: las restricciones prohibidas aparecen tanto en la página como en el estado dinámico y el servidor; además se abrevia “seguro de desgravamen” pese a la regla expresa.
  Evidencia: “No aplica a cobros, siniestros, reclamos…”; “No gestionamos cobros, reclamos ni cambios de seguro…”; “¿La aseguradora del banco rechazó tu desgravamen?”; “Desgravamen hipotecario”.
  Arreglo listo: etiqueta “Seguro de desgravamen hipotecario”; pregunta “¿La aseguradora del banco rechazó tu seguro de desgravamen?”; texto de alcance positivo “Evaluamos solicitudes para compras o refinanciamientos de créditos hipotecarios con el seguro de desgravamen rechazado, en los bancos indicados y por montos desde UF 2.000.” Para estado no elegible: “Revisa los requisitos de esta alternativa. Si necesitas orientación sobre tu solicitud, escríbenos por WhatsApp.” Aplicar en HTML, FAQ, JS, respuesta 422 y navegación compartida. No ocultar los criterios de elegibilidad, pero presentarlos afirmativamente.
  
  12. ALTO — /desgravamen-rechazado — desgravamen.html:140/:147/:177/:185/:192/:247.
  Problema: se vende “podemos ofrecerte una alternativa” antes de verificar elegibilidad y se revela el mínimo UF 2.000 recién dentro del formulario; nombre/teléfono aparecen antes de varias condiciones que pueden descalificar al visitante.
  Evidencia: hero sin mínimo; seis bancos en bloque posterior; selector “Menos de UF 2.000” activa “Esta alternativa es para créditos desde UF 2.000” y deshabilita enviar.
  Arreglo listo hero: “Si te rechazaron el seguro de desgravamen al comprar o refinanciar, podemos revisar tu caso.” Antes de pedir contacto: “Para compras o refinanciamientos, en los bancos indicados y con un crédito desde UF 2.000. La cobertura está sujeta a evaluación y aceptación de la aseguradora.” Mover primero preguntas de elegibilidad y después contacto. El mínimo tiene un comentario de confirmación en server.js:196; no lo marco como inventado.
  
  13. ALTO — /cotizar-pyme y enlaces de acceso — index.html:206; seguro-incendio.html:163/:171; cotizar-pyme.html:141/:143/:449/:464.
  Problema: se anuncia “Cotiza en línea en 5 pasos” y se entrega un formulario largo de antecedentes, con siete secciones numeradas, unos 10 minutos y sin precio en línea; el visitante puede llegar esperando una cotización inmediata.
  Evidencia: “Cotiza en línea en 5 pasos”; “Te toma unos 10 minutos”; secciones 6 “Medidas de seguridad”, 7 “Comentarios”; resultado real: un ejecutivo cotiza después.
  Reemplazos listos en enlaces: “Enviar antecedentes para cotizar tu seguro pyme”. Intro: “Completa los antecedentes de tu local y un ejecutivo preparará las alternativas de seguro. Ten a mano los datos del inmueble y los valores que necesitas asegurar.” Mantener la estimación de tiempo solo si está medida. Incorporar alternativa visible antes del formulario: “¿Necesitas ayuda para completar los antecedentes? Escríbenos por WhatsApp.” No cambiar catálogos ni integración para resolver el copy.
  
  14. ALTO — servidor local — server.js:28/:31/:44.
  Problema: el bloqueo de nombres internos distingue mayúsculas y el sistema de archivos del Mac no; la protección que el informe previo daba por correcta se evade localmente.
  Prueba HTTP verificada: /server.js → 404; /SERVER.JS → 200 (27.403 bytes); /CLAUDE.MD → 200 (15.431 bytes); /product.md → 200 (3.857 bytes), aunque /PRODUCT.md → 404.
  Arreglo concreto: comparar el nombre solicitado contra una lista completamente normalizada a minúsculas y, preferiblemente, servir solo directorios y archivos públicos permitidos en vez de express.static(__dirname). Esto demuestra fuga del código e instrucciones en localhost; no probé el mismo bypass en Railway/Linux y no afirmo fuga de secretos ni credenciales.
  
  15. ALTO — APIs — server.js:145 y :399 frente a :273.
  Problema: contacto tiene límite por IP, pero /api/cotizaciones/pyme y /api/meta/evento no lo usan; tampoco hay un límite equivalente antes del reenvío al CRM o a Meta. Es una superficie verificable para spam de prospectos o contaminación de medición cuando se configuren las integraciones.
  Evidencia: contactoPermitido se invoca solo en contacto; pyme pasa de validar a axios.post; evento pasa a enviarEventoMeta. CORS global permite cualquier origen.
  Arreglo concreto: límite por IP y ruta antes de validar/retransmitir, controles de automatización y de origen para el sitio, allowlist de eventSourceUrl/productos y límites de payload consistentes. CORS por sí solo no autentica ni detiene clientes externos. No hice ataques de carga ni envié prospectos a producción.
  
  payload: taskId=task_f58781c6b93d dispatchId=ctx_092833dd00a8

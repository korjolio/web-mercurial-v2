msg_89e8497467d4 status from term_9d647fcb-8488-4460-aed7-5d24b078bcdb
  Informe adversarial mercurial.cl — parte 2 de 2 y top 10
  Informe adversarial mercurial.cl — parte 2 de 2 (continúa la numeración; rutas relativas a /tmp/fix-qa)
  
  16. ALTO — / y páginas de seguros — index.html:215; PRODUCT.md, “Evidence on Hand”.
  Problema: los once logos se usan como prueba de confianza sin explicar qué relación tienen las compañías con Mercurial ni con el seguro que se cotizará.
  Evidencia: carrusel con BCI, Chubb, Consorcio, Contempora, Continental, HDI, MetLife, Reale, SURA, Southbridge y Zurich bajo “Somos Mercurial, corredores de seguros”; PRODUCT.md reconoce como evidencia ausente “aseguradoras con convenio”.
  Duda: no comprobé que las relaciones sean inexistentes; sí comprobé que el sitio las insinúa y la documentación local no las respalda.
  Arreglo concreto: validar y documentar cada relación antes de usar el logo como prueba comercial; rotular únicamente la relación que se pueda acreditar. Mientras tanto, reemplazar esa función de confianza por el rol de la corredora, el registro y el proceso comprobados, sin inventar convenios.
  
  17. MEDIO — /seguros/transporte, /seguros/incendio y portada — seguro-transporte.html:161; seguro-incendio.html:161; index.html:205/:206.
  Problema: listas con checks presentan categorías de bienes, riesgos y adicionales al mismo nivel; pueden leerse como un paquete incluido, sin aclarar que son materias a cotizar.
  Evidencia: “Carga nacional e internacional / Robo con fractura o asalto / Fallas en equipos de frío”; “Adicionales como pérdida de utilidades”.
  Arreglo listo: encabezado “Qué podemos revisar al cotizar” y cierre “Las coberturas, límites y condiciones dependen de la propuesta y de la póliza de la aseguradora.” Confirmar documentalmente cada adicional antes de conservarlo. En incendio, sustituir la bajada por “Cotizamos seguros para tu local, bodega o planta y los bienes que necesitas asegurar. Te ayudamos a revisar qué declarar y las condiciones de cada propuesta.” “Con montos en UF” es un dato de contratación, no la razón central para escribir.
  
  18. MEDIO — /condominio — condominio.html:101/:120/:140.
  Problema: se copió el formulario corporativo sin adaptar la pregunta al administrador o comité; pide una empresa y luego vuelve a preguntar por el seguro, aunque la landing trata de un condominio.
  Evidencia: “Empresa”, placeholder “Nombre de la empresa”, proceso “Empresa, teléfono y el seguro que te interesa”, error “¿Para qué empresa es el seguro?”
  Reemplazos listos: etiqueta “Condominio o comunidad”; placeholder “Nombre del condominio”; error “Escribe el nombre del condominio”; proceso “Nombre del condominio y teléfono de contacto.” Conservar el nombre técnico del campo si se necesita para no alterar el backend.
  
  19. MEDIO — portada, cuatro páginas de seguro y ambas landings — index.html:186/:266; seguro-flotas.html:151/:209; seguro-transporte.html:151/:218; seguro-incendio.html:151/:219; seguro-colectivos-salud.html:151/:209; condominio.html:104/:150; transporte.html:104/:150.
  Problema: “Cotizar” sugiere obtener una cotización; la barra solo solicita una llamada. “Enviar consulta” tampoco identifica la acción ni el producto. La llamada no está mal, el contrato verbal está mal explicado.
  Reemplazos listos para barras: “Solicitar una llamada”. Para formularios de producto: “Consultar por mi flota”, “Consultar por mi carga”, “Consultar por mi local”, “Consultar por el seguro de mi equipo”, “Consultar por mi condominio”. Debajo: “Te llamamos en 3 a 5 horas hábiles para revisar lo que necesitas asegurar.”
  
  20. MEDIO — páginas con barra y formulario completo — index.html:182 frente a :245; seguro-flotas.html:147 frente a :188; equivalentes de los otros seguros.
  Problema: para la misma intención hay una barra con empresa/teléfono y un formulario posterior que exige además nombre y correo; el cliente no entiende por qué el segundo camino necesita más datos.
  Evidencia: barra de 3 controles; formulario completo con nombre, empresa, correo y teléfono obligatorios más ramo. “Cotizar con más detalle” en index.html:195 no explica para qué conviene hacerlo.
  Arreglo concreto: mantener una entrada breve como CTA principal y hacer nombre/correo opcionales donde el proceso lo permita; si se conserva el formulario largo, explicar listo “¿Prefieres dejarnos más antecedentes? Cuéntanos qué necesitas asegurar y cómo contactarte.” No exigir dos vías de contacto sin una razón operativa.
  
  21. MEDIO — barras rápidas — index.html:181/:189; seguro-flotas.html:146/:154; condominio.html:99/:107 y equivalentes.
  Problema: las barras solicitan datos personales sin el aviso de uso y enlace de privacidad que sí se muestran en los formularios de abajo.
  Evidencia: junto al botón solo aparece el plazo de llamada; el aviso de privacidad se encuentra mucho después en index.html:267.
  Arreglo listo junto a cada barra: “Usamos estos datos para contactarte por tu solicitud. Política de privacidad.” Enlazar el texto. No lo califico como infracción legal comprobada; es una inconsistencia de información al recoger datos.
  
  22. MEDIO — / y páginas de producto — index.html:175/:188/:189/:226/:236/:272; seguro-flotas.html:140/:153/:154/:170/:180/:215 y equivalentes.
  Problema: la misma promesa de 3 a 5 horas se repite en exceso, mientras siguen faltando respuestas sobre qué preparar o comparar. La repetición ocupa el lugar de argumentos de venta.
  Evidencia: seis apariciones del rango en portada y seis en flotas, incluidas confirmaciones ocultas.
  Arreglo concreto: conservar plazo junto al primer CTA y en la confirmación; el proceso puede decir “Conversamos sobre tu empresa y lo que necesitas asegurar”. Dedicar el espacio restante a preguntas específicas de cada ramo. No borrar el horario de atención.
  
  23. MEDIO — /consultas-y-reclamos — consultas.html:109/:128.
  Problema: dos botones de venta no llevan a ninguna parte.
  Evidencia: ambos “Cotizar” usan href="#cotizar"; el documento no tiene ese id. Comprobado en HTML y recorrido de referencias HTTP.
  Arreglo listo: href="/#cotizar" en cabecera de escritorio y panel móvil. Este es un caso nuevo, distinto de la corrección del botón antiguo que daba por cerrada el reporte previo.
  
  24. MEDIO — /consultas-y-reclamos — consultas.html:137/:140/:162/:163; server.js:309/:317.
  Problema: el cliente que reclama no recibe plazo explícito en esa página, copia de su presentación ni referencia de seguimiento; la confirmación desaparece al recargar y el backend solo responde success:true. No basta con citar una circular.
  Evidencia: “Los reclamos se atienden según el procedimiento de la Circular CMF N° 2131”; éxito “Te respondemos al correo que nos dejaste”; el correo del servidor va a MAIL_TO y no hay envío de acuse al solicitante en ese flujo.
  Reemplazo listo: “Te responderemos por correo en el menor plazo posible, con un máximo de 20 días hábiles desde la recepción.” Añadir acuse al correo del usuario y un identificador de recepción, sin prometerlo antes de implementarlo. Incluir acceso visible a la CMF si el cliente necesita escalar. Fuente oficial para plazo y conveniencia de conservar copia: https://www.cmfchile.cl/educa/621/w3-article-1311.html . No afirmo que no exista un registro interno manual: solo que este flujo web no lo acredita.
  
  25. MEDIO — privacidad y avisos de formularios — privacidad.html:133/:138/:139; index.html:267; consultas.html:158.
  Problema: la promesa de uso limitado al lado del formulario entra en tensión con finalidades más amplias de seguimiento comercial y comunicaciones de riesgos.
  Evidencia: “Usamos tus datos solo para responder esta consulta”; política “Generar oportunidades de negocio asociadas a su solicitud” y “Envío de información relevante sobre riesgos de mercado o cumplimiento normativo”.
  Arreglo concreto: decidir el tratamiento real. Para solicitudes de contacto, alinear la política con el fin de responder, cotizar y gestionar esa solicitud. Si se enviarán comunicaciones posteriores ajenas a ella, explicarlas y resolver su base/elección correspondiente antes de usar esos datos. Copy listo para la finalidad básica: “Usamos tus datos para responder, preparar la cotización solicitada y gestionar su seguimiento.” No declarar un consentimiento de marketing que el formulario no recoge.
  
  26. MEDIO — /politica-privacidad — privacidad.html:118; desgravamen.html:192; server.js:302/:303.
  Problema: la descripción del formulario de seguro de desgravamen omite dos antecedentes que efectivamente se solicitan y envían.
  Evidencia: política enumera nombre/teléfono/correo/banco/situación; formulario y correo incluyen rechazo previo y rango de monto del crédito.
  Reemplazo listo: “Formulario de seguro de desgravamen: nombre, teléfono, correo opcional, banco, situación del crédito hipotecario, si hubo rechazo previo del seguro de desgravamen y rango del monto del crédito a asegurar. Este formulario no pide diagnósticos ni antecedentes médicos.” Pasar a tuteo al revisar la política completa.
  
  27. MEDIO — /cotizar-pyme — cotizar-pyme.html:452/:479.
  Problema: garantía comercial de mejores condiciones por mayor seguridad y sello regulatorio colocado donde parece certificar el formulario/producto.
  Evidencia: “Mientras más protecciones, mejores condiciones”; “Atención bajo cumplimiento normativo según Circular CMF N° 2131”.
  Reemplazos listos: “Marca las medidas de seguridad que existen hoy. La aseguradora las considera al evaluar el riesgo y las condiciones de la propuesta.” Pie: “Un ejecutivo revisará los antecedentes y te contactará para preparar la cotización. Enviar este formulario no contrata un seguro.” Mantener la información sobre atención de reclamos en su lugar; no usar la circular como argumento de calidad del seguro.
  
  28. MEDIO — servidor — server.js:30.
  Problema: decodeURIComponent sin manejo del error convierte una URL mal codificada en un error de servidor.
  Evidencia HTTP local: GET /%ZZ responde 500 y HTML de error Express, en vez de un 400 controlado.
  Arreglo concreto: capturar URIError y responder 400 con mensaje genérico; añadir manejador final de errores que no exponga stack. La exposición de stack observada corresponde al entorno local; no aseguro que Railway use NODE_ENV de desarrollo.
  
  29. MEDIO — /cotizar-pyme — cotizar-pyme.html:499; src/js/cotizar-pyme.js:233.
  Problema: el modal de resultado es un div sin semántica de diálogo ni gestión del foco.
  Evidencia: no role="dialog", aria-modal, etiqueta asociada ni foco al abrir/restaurar; showModal solo cambia textos/icono y añade active; tampoco hay tratamiento de Escape en ese bloque.
  Arreglo concreto: usar dialog nativo con showModal/close o implementar semántica, foco inicial, retorno y contención de teclado. Asociar título y cuerpo. Es evidencia de implementación; no afirmo haber ejecutado un lector de pantalla.
  
  30. MEDIO — /cotizar-pyme, error de envío — src/js/cotizar-pyme.js:377/:399; cotizar-pyme.html:499.
  Problema: después de completar unos 10 minutos de antecedentes, el error ofrece WhatsApp en una frase que no es un enlace; el modal solo ofrece “Cerrar”. Además fetch carece de AbortController/timeout, a diferencia del formulario común.
  Evidencia: “Intenta de nuevo o escríbenos por WhatsApp”; modalBody.textContent=message; único botón “Cerrar”.
  Arreglo concreto: botón real de WhatsApp dentro del estado de error y acción “Volver al formulario”, preservando campos; agregar timeout con reintento y mantener el mismo Idempotency-Key. Texto listo: “No pudimos confirmar el envío. Tus antecedentes siguen en el formulario. Puedes intentar otra vez o pedir ayuda por WhatsApp.”
  
  31. MEDIO — navegación/medición de productos — src/js/meta.js:53.
  Problema: las cuatro páginas principales de seguro quedan fuera del mapa de productos que dispara ViewContent.
  Evidencia: PRODUCTOS solo enumera condominio, transporte Ads, mascotas y pyme; faltan /seguros/flotas, /seguros/transporte, /seguros/incendio, /seguros/colectivos-de-salud.
  Arreglo concreto: incluir los productos que corresponda medir y verificar consentimiento, deduplicación y uso en campañas. Es una omisión distinta del Lead faltante descrito en el QA previo. Ese Lead también sigue sin implementarse en sitio.js y /api/contacto: el éxito solo emite formulario_enviado; no doy por comprobada la configuración actual de GA4 sin acceso a GTM/GA4.
  
  32. MEDIO — portada/SEO — index.html:62.
  Problema: el teléfono estructurado contradice todos los CTA de atención.
  Evidencia: JSON-LD telephone="+56971097657"; contacto visible y WhatsApp usan +56939319546.
  Arreglo listo: "telephone": "+56939319546". Si ambos números tienen funciones distintas y vigentes, documentarlas con ContactPoint; hoy el propio CLAUDE.md dice que el anterior quedó solo en ese JSON-LD.
  
  33. MEDIO — contenidos públicos para buscadores y asistentes — llms.txt:3/:20/:25/:40/:41; ai.txt:9/:12/:18/:24.
  Problema: el sitio conserva en sus archivos públicos la identidad grandilocuente y beneficios sin confirmar que las páginas visibles intentaron retirar.
  Evidencia: “corredora de seguros senior”; “Más de 8 años en el mercado”; “Programas con Continuidad de Cobertura y gestión de Extensión Catastrófica”; “Análisis de spread de comisión para optimización de costos”; en llms.txt:25 vuelve “el banco debe aceptar la póliza”.
  Arreglo listo para el núcleo de ambos archivos: “Mercurial Corredores de Seguros Ltda. es una corredora inscrita en la CMF, Registro N° 8929. Cotiza seguros de flotas, transporte de carga, incendio y colectivos de salud para empresas. También recibe consultas por seguro de mascotas, condominio, seguro pyme y seguro de desgravamen hipotecario, según las condiciones de cada producto.” Eliminar antigüedad y capacidades no respaldadas hasta confirmarlas. Son afirmaciones no sustentadas por los documentos disponibles, no falsedades demostradas.
  
  34. MEDIO — portada, carrusel — src/css/sitio.css:301; index.html:213.
  Problema: animación automática infinita de 42 segundos sin control visible para detenerla; respetar reduced-motion no ofrece control a todos los usuarios.
  Evidencia de código: animation: cias-paso 42s linear infinite; no hay botón de pausa en el bloque. No es un hallazgo sobre el gusto estético del slider: es falta de control de movimiento.
  Arreglo concreto: logos estáticos o botón accesible “Pausar movimiento”/“Reanudar movimiento”. No agregaría más animación de scroll a un sitio que ya necesita mejorar claridad. Pendiente comprobar su comportamiento renderizado y foco.
  
  35. BAJO — /seguro-mascotas — mascotas.html:388/:389.
  Problema: otra frase que vende el soporte técnico del sitio en vez del beneficio del cliente.
  Evidencia: “Cotiza aquí, sin salir del sitio”; “Completa los 3 pasos y recibe tu cotización al instante.”
  Reemplazo listo de título: “Compara los planes para tu perro o gato.” Bajada: “Ingresa al cotizador de BCI Seguros para revisar las alternativas disponibles para tu mascota.” El instante y los tres pasos deben verificarse en el flujo real de BCI antes de presentarlos como promesa; no completé ese flujo ni generé un lead.
  
  36. BAJO — páginas de producto, jerarquía semántica — seguro-flotas.html:138/:160; seguro-transporte.html:138/:160; seguro-incendio.html:138/:160; seguro-colectivos-salud.html:138/:160; desgravamen.html:139/:147.
  Problema: de h1 se pasa directamente a h3 en los bloques que son el contenido principal.
  Evidencia: “Seguro para los vehículos de tu empresa” → h3 “Para quién es”, sin h2 intermedio.
  Arreglo concreto: elevar esos títulos a h2 conservando la apariencia con una clase. No presento esto como un fallo visual ni como prueba automática de incumplimiento WCAG por sí solo.
  
  37. BAJO — páginas legales y referencias al seguro de desgravamen — privacidad.html:113/:118/:169/:189; terminos.html:111/:150.
  Problema: cambia el tratamiento de tú a usted y vuelve la abreviación prohibida del producto en textos secundarios; la voz se siente escrita por proveedores distintos.
  Evidencia: “su empresa”, “el mensaje que usted escriba”, “enviamos a Meta su email”, “sometiéndose el usuario”, “Formulario de desgravamen”.
  Reemplazos listos: “tu empresa”, “el mensaje que escribas”, “enviamos a Meta tu correo”, “Formulario de seguro de desgravamen”. Revisar las cláusulas legales con quien las valida antes de cambiarlas; el tuteo es una corrección de voz, no una interpretación nueva de derechos.
  
  38. BAJO — /terminos.html — terminos.html:135/:137.
  Problema: se reconoce que las fotos usan Creative Commons y enseguida se prohíbe toda reproducción sin autorización, sin distinguir contenidos propios y licenciados.
  Evidencia: “Las fotografías provienen de Wikimedia Commons bajo licencias Creative Commons” y “Queda prohibida su reproducción total o parcial sin autorización expresa.”
  Reemplazo listo: “Los contenidos propios de Mercurial están protegidos por sus derechos correspondientes. Las fotografías y demás recursos de terceros se rigen por las licencias indicadas en sus créditos.” No retirar créditos; no convertir esta inconsistencia de texto en una acusación de infracción ya comprobada.
  
  39. BAJO — servidor — server.js:455.
  Problema: se instala un handler de uncaughtException vacío; los fallos no controlados quedan silenciados y el proceso sigue sin una recuperación definida.
  Evidencia exacta: process.on('uncaughtException', (err) => { /* Silencio en producción o log a archivo si fuera necesario */ }).
  Arreglo concreto: registrar un error saneado sin datos personales y terminar ordenadamente para que el supervisor reinicie, o eliminar el handler y dejar actuar el mecanismo de supervisión. No atribuyo una caída concreta a este patrón: es un defecto de observabilidad y recuperación visible en el archivo.
  
  Diez cambios que más mejorarían la venta, en orden:
  1. Reemplazar el hero de portada por oferta concreta, explicación de comparación y una sola acción principal: pedir una llamada.
  2. Borrar “Cada uno con su página…” y toda frase que describa la web, incluida “sin salir del sitio”.
  3. Convertir flotas y salud en páginas que respondan preguntas reales: qué necesitan para empezar, qué se comparará y qué falta confirmar; sin inventar coberturas.
  4. Corregir de raíz la landing de transporte: separar camión, carga y ocupantes, y hablar del caso que llegó desde el anuncio.
  5. Reescribir mascotas sin “sin trámites ni reembolsos”, liderazgo ni tiempos no comprobados; mostrar copago, red y límites junto a la promesa.
  6. Reescribir seguro de desgravamen con alcance positivo, requisitos antes de contacto y ninguna garantía sobre aseguradora o banco.
  7. Hacer que “Quiénes somos” explique quién cotiza y quién emite, cómo acompañan y cómo comprobar su registro; documentar cada prueba antes de mostrarla.
  8. Adaptar los formularios a la intención: condominio/comunidad, CTA por producto, datos mínimos y aviso de privacidad junto al envío.
  9. Renombrar el acceso pyme como envío de antecedentes y ofrecer ayuda visible antes del formulario largo; explicar que un ejecutivo prepara la cotización.
  10. Reemplazar repetición de plazos y pasos genéricos por objeciones específicas de cada ramo, y cerrar con una confirmación útil y un canal de seguimiento.
  
  Pendientes que impiden llamar “completa” a esta QA: navegador real en desktop y 390 px; navegación/teclado, contraste medido, capturas y desbordes, consola, flujo BCI sin crear lead y paso del tiempo 10/30/60/80 s donde corresponda; rendimiento real; respaldo documental de convenios, red BCI, liderazgo y condiciones de productos; configuración actual de GA4/GTM y verificación de producción tras una eventual publicación. Los 503 locales fueron esperados y no se reportan como caída de producción; tampoco se probó correo/CRM real, como exige el encargo. No hay evidencia de edición de archivos, commits, push ni publicaciones.
  
  payload: taskId=task_f58781c6b93d dispatchId=ctx_092833dd00a8

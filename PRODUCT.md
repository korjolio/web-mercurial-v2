# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- Empresas chilenas que contratan seguros comerciales: dueños, gerentes de administración y finanzas, jefes de flota o logística, encargados de RR.HH. Llegan a cotizar una línea concreta o a revisar una renovación.
- Clientes actuales de Mercurial que vuelven por una renovación o una consulta.
- Personas cuyo seguro de desgravamen hipotecario fue rechazado: solo por la landing de campaña, nunca desde la identidad principal. Mercurial atiende personas naturales, pero no las promueve.

## Product Purpose
mercurial.cl tiene que generar consultas comerciales para cuatro líneas prioritarias (Flotas, Transporte, Incendio y Colectivos de salud) y transmitir seriedad a quien ya es cliente. El éxito es una consulta bien calificada: se sabe quién es, qué seguro le interesa y cómo contactarlo.

## Positioning
Corredora de seguros, no aseguradora, inscrita en la CMF (Registro N° 8929, RUT 76.826.322-1). Cotiza con aseguradoras y gestiona la póliza en nombre del cliente. Todavía no hay un diferenciador comprobado más allá de esto: no inventarlo.

## Operating Context
- Leads: HubSpot retirado (oct. 2026); condominio, transporte y portada → WhatsApp hasta que el CRM reciba consultas; pyme/incendio → CRM propio (`/cotizar-pyme` → `/api/cotizaciones/pyme`, **intocable**); mascotas → BCI.
- Medición: GTM `GTM-K4SL5KSF`, píxel de Meta + API de conversiones con deduplicación (`src/js/meta.js`).
- Contacto: WhatsApp +56 9 3931 9546 (Chatwoot, "Mercurial WABA"); horario L-V 09:00-18:30; correo de reclamos reclamos@mercurial.cl (Circular CMF N° 2131).
- Compromiso de respuesta confirmado: 3 a 5 horas hábiles.
- Campañas de noviembre 2026 en Instagram/Ads (`instagram/`) con disclaimer de desgravamen: "Cobertura sujeta a evaluación y aceptación de la aseguradora. El banco debe aceptar la póliza."

## Capabilities and Constraints
- Stack: HTML estático + Express (`server.js`), CSS propio, sin framework. No migrar.
- No alterar GTM, píxel, CAPI, deduplicación ni conexiones al CRM sin presentar antes el cambio.
- `/cotizar-pyme` y su backend no se tocan; la línea Incendio enlaza a esa página.
- Desgravamen: la capacidad real para resolver los casos está por confirmar. Sin aseguradoras, aceptación garantizada, plazos, tarifas ni resultados.

## Brand Commitments
- Logo: M facetada en dos azules + "MERCURIAL" en gris + "Corredores de Seguros" en azul (`src/img/`).
- Azul corporativo `#2399C6`.
- Línea de campañas 2026: azul marino, titular serif, acento azul, fotografía real (`instagram/plantilla.html`).
- Voz: español de Chile, profesional, directo y específico. Prohibido el tono anterior ("transferencia de riesgos", "blindaje patrimonial", "Senior Risk Advisor", "continuidad operacional", "resiliencia", "soluciones integrales").

## Evidence on Hand
- Registro CMF N° 8929, RUT, procedimiento de reclamos (Circular 2131), horario y WhatsApp.
- Coberturas de transporte descritas en `/transporte`; antecedentes pyme según el cotizador ANS (`docs/referencia/ans-pyme-campos.md`).
- **Ausentes, no fabricar:** equipo (sin nombres por ahora), testimonios, clientes, cifras de ahorro (el "hasta 15%" no tiene respaldo), aseguradoras con convenio, años de trayectoria ("más de 8 años" en llms.txt sin confirmar).

## Product Principles
1. Claridad antes que sofisticación: cada línea dice para quién es y qué cubre en palabras del cliente.
2. Solo afirmaciones comprobables; lo que falta se marca pendiente, no se rellena.
3. Una consulta debe tomar menos de un minuto y no pedir datos sensibles.
4. La seriedad regulatoria (CMF, reclamos) está a la vista, no escondida.

## Accessibility & Inclusion
WCAG 2.2 AA: contraste, teclado, foco visible, `prefers-reduced-motion`, formularios con errores en texto.

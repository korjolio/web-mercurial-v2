# Encargo a Codex: revisión adversarial completa de mercurial.cl

Pepa perdió la confianza en la calidad del sitio. Ejemplo de lo que le molesta, en la portada: «Cada uno con su página: a quién le sirve, qué cubre y cómo cotizarlo.» Ese texto describe la estructura del sitio en vez de vender. Busca todo lo que sea así de malo. Tu trabajo es destruir el sitio con argumentos: no seas amable y no des nada por bueno sin revisarlo.

## Qué revisar

Versión a revisar, con cambios aún no publicados:
- Sitio corriendo: http://localhost:3020
- Código: `/tmp/fix-qa` (rama `fix/qa-sitio`; incluye cambios sin commit). No revises el checkout principal, que está atrasado.

Páginas: `/`, `/seguros/flotas`, `/seguros/transporte`, `/seguros/incendio`, `/seguros/colectivos-de-salud`, `/condominio`, `/transporte`, `/seguro-mascotas`, `/cotizar-pyme`, `/desgravamen-rechazado`, `/consultas-y-reclamos`, `/politica-privacidad`, `/terminos.html`, `/no-existe`.

Lee `CLAUDE.md` y `docs/reporte-qa-sitio-2026-11-04.md` en `/tmp/fix-qa` y en `/Users/pepa/Proyectos/web-mercurial-v2/docs/`: ahí está lo que ya se sabe. No repitas esos hallazgos salvo que sigan rotos.

## Dimensiones, en orden de prioridad

1. **Copy y venta**: cada texto de cada página. Frases que describen el sitio, texto de relleno, burocrático, frío o genérico, repeticiones, titulares que no venden, llamados a la acción débiles. Cita siempre el texto exacto y propón el reemplazo.
2. **Conversión**: ¿un dueño de empresa entiende en 5 segundos qué ofrecen y por qué escribir? Fricción, objeciones sin responder, falta de prueba.
3. **Regulación y veracidad**: promesas, cifras o coberturas sin respaldo; conflictos con ser corredora regulada por la CMF.
4. **Diseño y experiencia**: jerarquía, consistencia entre páginas, móvil (390 px), elementos que se ven de sistema o sin terminar.
5. **Bugs y técnica**: enlaces, formularios, accesibilidad, SEO, rendimiento, seguridad de `server.js`.

## Reglas

- No edites ningún archivo. No hagas commit ni push.
- No envíes formularios reales a producción ni generes leads. Local está sin correo ni CRM, así que ahí responde 503.
- Reglas de contenido: español de Chile, tuteo, sin cifras ni coberturas inventadas. En desgravamen: siempre «seguro de desgravamen», sin nombrar aseguradora, sin prometer aprobación, sin «el banco debe aceptar», y sin texto de exclusiones tipo «No gestionamos…».
- Solo hallazgos verificados: abre la página o el archivo antes de afirmar algo. Marca como duda lo que no puedas comprobar.

## Entrega

Veredicto brutal en 5 líneas, y después los hallazgos ordenados de más grave a menos. Cada uno con: gravedad (crítico, alto, medio, bajo), página y ubicación (`archivo:línea`), problema, evidencia o texto exacto, y arreglo concreto o reemplazo listo para pegar. Termina con los 10 cambios que más mejorarían la venta.

# Plan tras la revisión adversarial de Codex

Fecha: 2026-11-04. Informe completo: `docs/revision-codex-adversarial-parte1.md` y `parte2.md`. Son 39 hallazgos: 1 crítico, 15 altos, 18 medios y 5 bajos. Bloque 1 aplicado y publicado el 2026-11-04.

## Bloque 1: se puede aplicar sin datos nuevos

Quita promesas o corrige errores, sin agregar afirmaciones.

- Desgravamen: sacar «el banco debe aceptar», exclusiones y lenguaje prohibido; requisitos antes de pedir contacto (hallazgos 1, 11, 12, 26).
- Portada: inicio y frase «Cada uno con su página» (6, 7).
- Transporte, condominio, mascotas y pyme: textos y promesas (2, 3, 5, 13, 18, 27, 35).
- Botones y privacidad: llamados a la acción y aviso en las barras (19, 21, 25).
- Técnica: mayúsculas, límites de envíos, URL mal codificada, modal pyme, teléfono JSON-LD, títulos, `llms.txt` y `ai.txt` (14, 15, 28, 29, 30, 32, 33, 36, 39).
- Corregido: botones Cotizar de `/consultas-y-reclamos` (23).

## Bloque 2: necesita datos de Mercurial

- Relación real con las 11 aseguradoras (16).
- Fuentes de mascotas: liderazgo, 70 clínicas, 2 minutos, montos (4).
- Contenido de flotas y salud: coberturas confirmadas (8, 9).
- «Quiénes somos»: equipo o casos reales (10).
- Reclamos: plazo de respuesta y acuse al cliente (24).

## No aplicar sin decisión de Pepa

- Hallazgo 11: Codex pide cambiar «Desgravamen hipotecario» en el menú, pero ese nombre fue definido antes.
- Hallazgo 34: Codex pide un botón de pausa en el slider; Pepa pidió que no se detenga.

## Decisión de vocabulario (2026-11-04)

En los textos visibles nuevos se usa «compañías de seguros» y «compañía de seguros», no «aseguradoras» ni «aseguradora». Se mantiene «corredora de seguros, no aseguradora» en el pie.

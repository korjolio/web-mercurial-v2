# Cotizador ANS "Seguro de Pymes" — campos extraídos (11-09-2026)

Fuente: `https://www.ant.cl/MantenedorCore/Cotizador/Cotizar/Pymes/9` (portal Mi Portal - ANS, paso 1 "Cotización"),
leído directamente del DOM con sesión de Mercurial. Es la referencia para el formulario `/cotizar-pyme` de mercurial.cl.
Los textos de ayuda son los tooltips (ícono "!") del portal; mencionan límites por compañía (BCI, Chubb, CNS, Renta, SBINS/Southbridge, Zurich, Consorcio).

## Datos del contratante
| Campo | Tipo | Opciones / formato | Oblig. |
|---|---|---|---|
| Tipo de persona | lista | Natural · Jurídica | sí |
| RUT | texto | `ej: 17767364-8` | sí |
| Razón social (jurídica) | texto | | sí |
| Nombres / Primer apellido / Segundo apellido (natural) | texto | se muestran en vez de razón social | sí |

## Datos de la empresa
| Campo | Tipo | Opciones | Oblig. | Ayuda |
|---|---|---|---|---|
| Tipo de ubicación | lista | Rural · Urbano | sí | |
| Dirección | texto (autocompletado Google) | `ej: Los flamencos 1300, Maipú, Chile` | sí | |
| Comuna | lista | 349 comunas de Chile (respaldo manual) | sí | |
| Depto/oficina/otros | texto | `Oficina, Bodega, Parcela, etc.` | no | |
| Construcción Muro | lista | Concreto · Albañilería Simple · Albañil. Reforzada · Asbesto Cemento · Bloques de Cemento · Plancha Metálicas · Madera · Adobe · Panel Sandwich | sí | |
| Construcción Techo | lista | Concreto · Asbesto Cemento · Planchas Metálicas · Tejas o Similares · Sólidos en General · Panel Sandwich | sí | |
| Antigüedad construcción | lista | Hasta 15 años · Entre 15 y 25 años · Entre 25 y 50 años · Entre 50 y 75 años · Más de 75 años | sí | Chubb hasta 50 años; BCI, CNS, Zurich, Renta y SBINS hasta 75 años. |
| N° de pisos | número | | sí | |
| Actividad | lista | 470 giros (ver `ans-pyme-actividades.json`); ANS clasifica cada uno como Excluido / Evaluación / Emisión Automática | sí | |
| ¿El riesgo está ubicado a menos de 3 cuadras o 15 metros de altura sobre el nivel del mar? | Sí/No | | | |
| ¿El riesgo está ubicado a menos de 3 cuadras o 15 metros de altura sobre el nivel del Río? | Sí/No | | | |

Campos internos que el portal deriva solo (no van al formulario web): agrupación de actividad (Oficina · Comercio · Industria · Centros Educacionales · Restaurant), facturación anual (solo Pyme Cyber Risk), región, lat/long, RUT corredor.

## Montos (UF)
| Campo | Tipo | Opciones | Ayuda |
|---|---|---|---|
| Edificio | número UF | | |
| Instal y Conten Gral | número UF | | |
| Mercaderías | número UF | | No aplica para Zurich, monto se incluye en contenido. |
| E. electrónicos | número UF | | Chubb: Oficina, comercio e Industria hasta UF 3.000 - Servicios Educacionales hasta UF 2.000; CNS y Renta: hasta UF 5.000; BCI y SBINS: hasta UF 15.000 |
| Maquinaria | número UF | | |
| R. Civil | lista UF | 0 · 100 · 300 · 500 · 1000 · 2000 · 3000 (defecto 500) | BCI, Chubb, CNS: hasta UF 2.000; Renta: hasta UF 3.000; SBINS: hasta UF 5.000 |
| Cristales | lista UF | 50 · 100 · 300 · 500 · 1000 (defecto 50) | Renta hasta UF 300; SBINS hasta UF 1.000 |
| N° trabajadores | número | | BCI: sin máximos; CNS: hasta 6; Chubb: hasta 6; Renta: hasta 10; SBINS: hasta 100 |
| Muerte e inval. Acc. | lista UF | 250 · 300 · 500 (defecto 250) | BCI, CNS, Renta, SBINS: hasta UF 500; Chubb hasta UF 250 |

## Cobertura adicional para tu producto (colapsable)
| Campo | Tipo | Opciones | Ayuda |
|---|---|---|---|
| Dinero en caja S. | lista UF | 0 · 30 · 50 · 100 · 200 · 300 · 500 | Chubb, SBINS: hasta UF 100; Renta: hasta UF 200; BCI, CNS: hasta UF 300 |
| Riesgos Políticos | Sí/No | | Aplica solo para Southbridge |
| Remesa de valores | lista UF | 0 · 50 · 100 · 200 · 300 · 500 | BCI, Chubb, SBINS: hasta UF 100; Renta: hasta UF 200; CNS: hasta UF 500 |
| Periodo indemnizable (PxP) | lista | 3 Meses · 6 Meses · 9 Meses · 12 Meses | BCI: hasta 6 meses; Chubb, CNS: hasta 9 meses; Renta, SBINS: hasta 12 meses |
| P X P (monto anual) | número UF | | BCI: hasta UF 300.000; Consorcio: hasta 30% del monto edificio y contenido; Chubb: hasta 50% del monto de Edificio y Contenido; Southbridge: hasta UF 20.000; Renta: hasta UF 5.000 |
| RC de alimentos | Sí/No | | |
| Avería de maquinaria | Sí/No | | CNS: daños por descomposición de prod. y contaminación por sust. peligrosas / avería de maquinarias. Chubb: restaurantes y Zurich |
| Terrorismo | Sí/No | | Cobertura adicional de Terrorismo, solo para Consorcio. |
| Mejora del inmueble | número UF | | Monto de mejoras realizadas por arrendatarios. Renta no contempla mejora de inmuebles. |
| Rep. a nuevo 1a pérdida | lista | NO (única opción visible) | Opcional sólo para Chubb: monto máximo asegurado UF 125.000 |

## Medidas de seguridad (sección condicional del portal, casillas múltiples)
**Contra incendio:** Extinguidores de marca certificados y bien mantenidos · Detectores de humo · Detectores de calor · Alarma contra incendio local · Alarma contra incendio conectada a central · Red húmeda y mangueras · Rociadores automáticos · Red seca y mangueras · Ubicada a menos de 10 km de Bomberos.

**Contra robo:** Protecciones en todas las ventanas, vitrinas, claraboyas, tragaluces o similares · Chapas de seguridad efectivas en todas las puertas · Vigilancia de la ubicación 24/7 con personal calificado y contratado para esta actividad · Cortinas a la calle de malla o emballestadas con candados protegidos · Alarma conectada a central de monitoreo, con sensores en todas las puertas, ventanas y accesos · Para oficinas ubicadas en edificios, contar con mampara de vidrio con llave.

## Datos de contacto de inspección (sección condicional)
Nombre del contacto · Número de teléfono · Mail de contacto · Observación (máx. 100 caracteres).

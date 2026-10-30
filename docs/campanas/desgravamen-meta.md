# Campaña Meta — Desgravamen Hipotecario Plus (rechazados)

Estado al 2026-10-30: formulario **publicado y funcionando** ("MERC | Hipotecario | Prospectos Nuevos | V1 | Oct 2026"). Lógica condicional verificada en Instagram real: los descartados van a E2 ("Cerrar el formulario", no generan lead). E1 lleva a `https://mercurial.cl/wa/desgravamen` (redirige a WhatsApp con "ref: DH-META").

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

# Desgravamen rechazado · compra o refinanciamiento · v3 (para revisión)

Campaña nueva. **Nada cargado en Meta.** La propuesta completa está en `docs/campanas/desgravamen-nueva-campana-propuesta.md`.
Reglas: sin nombre de aseguradora, sin prometer aceptación, sin fijar edad. El refinanciamiento puede ser en el mismo banco o en otro.
Formulario: "MERC | Desgravamen rechazado | Compra y refinanciamiento | V2" (por crear después del OK).

| # | Archivos | Texto principal (Meta) | Título (≤40) | Descripción (≤30) |
|---|---|---|---|---|
| 01 | `01-aprobado-rechazado-feed.jpg` / `-story.jpg` | ¿El banco aprobó tu hipotecario, pero te rechazaron el desgravamen? Si compras o refinancias, podemos ofrecerte una alternativa. Bancos indicados: Santander, Banco de Chile, Itaú, BancoEstado, Banco Internacional y Consorcio. Cobertura sujeta a evaluación y aceptación de la aseguradora. El banco debe aceptar la póliza. No aplica a cobros, reclamos ni cambio de seguro sin refinanciar. | Te rechazaron el desgravamen | Compra o refinanciamiento |
| 02 | `02-sin-desgravamen-feed.jpg` / `-story.jpg` | Sin desgravamen, el banco no cursa tu crédito. Si te lo rechazaron al comprar o refinanciar, completa el formulario: podemos ofrecerte una alternativa. Bancos indicados: Santander, Banco de Chile, Itaú, BancoEstado, Banco Internacional y Consorcio. Cobertura sujeta a evaluación y aceptación de la aseguradora. El banco debe aceptar la póliza. | Sin desgravamen no hay crédito | Hay una alternativa |
| 03 | `03-refinanciar-feed.jpg` / `-story.jpg` | ¿Refinancias tu hipotecario y te rechazaron el desgravamen? Podemos ofrecerte una alternativa. Bancos indicados: Santander, Banco de Chile, Itaú, BancoEstado, Banco Internacional y Consorcio. Cobertura sujeta a evaluación y aceptación de la aseguradora. El banco debe aceptar la póliza. No aplica a cambio de seguro sin refinanciar. | Desgravamen rechazado al refinanciar | Refinanciamiento hipotecario |
| 04 | `04-banco-si-seguro-no-feed.jpg` / `-story.jpg` | Te aprobaron el crédito, pero te rechazaron el desgravamen. Para compra o refinanciamiento, podemos ofrecerte una alternativa. Bancos indicados: Santander, Banco de Chile, Itaú, BancoEstado, Banco Internacional y Consorcio. Cobertura sujeta a evaluación y aceptación de la aseguradora. El banco debe aceptar la póliza. No aplica a cobros ni reclamos. | El banco dijo sí. El seguro, no. | Consulta hoy |

Botón: "Más información", que abre el formulario.

## Imágenes

- Etiqueta superior: "Compra o refinanciamiento hipotecario". Pie: "Mercurial Corredores de Seguros · Corredora inscrita en la CMF, Registro N° 8929". Logo oficial blanco (`logos/mercurial-blanco.png`, derivado del PNG oficial sin deformar).
- Pie de cada imagen, en zona segura en las historias: "Cobertura sujeta a evaluación y aceptación de la aseguradora. El banco debe aceptar la póliza." y debajo la línea CMF. El mismo aviso va en el texto del anuncio, el formulario y la landing.
- Los bancos no van en la imagen; se nombran en el texto del anuncio, para no afirmar que sirve cualquier banco.
- Render: desde `instagram/desgravamen-ads`, `node v3/render.js v3`. QA: 8/8 sin desborde; 1080×1350 y 1080×1920.

## Fotos (Pexels, licencia comercial gratuita sin atribución obligatoria, sin IA)

| Pieza | Archivo | Fuente |
|---|---|---|
| 01 | `fotos/pexels-7477698.jpg` | https://www.pexels.com/photo/7477698/ (pareja revisando documentos) |
| 02 | `fotos/pexels-6248495.jpg` | https://www.pexels.com/photo/6248495/ |
| 03 | `fotos/pexels-5816285.jpg` | https://www.pexels.com/photo/5816285/ (asesoría financiera) |
| 04 | `fotos/pexels-8439766.jpg` | https://www.pexels.com/photo/bearded-man-showing-papers-to-a-couple-sitting-at-the-table-8439766/ (asesor revisando documentos con una pareja adulta en la mesa de su casa; reemplaza la pareja del beso a pedido de Pepa, 30-10-2026). Encuadre propio en la historia (`encuadreStory`) para que la pareja salga completa. |

Limitación: solo se usaron fotos que ya estaban en el repo. En la 02 y la 03 las personas no se ven criollas. Si se quiere mejorar, hay que buscar fotos nuevas.

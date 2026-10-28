// Contenido de los posts de Instagram (1080×1350).
// Cada afirmación sale de lo publicado en mercurial.cl (condominio.html, transporte.html,
// mascotas.html, cotizar-pyme.html, index.html). No agregar cifras ni coberturas sin fuente.
//
// layout: 'foto' (titular + bajada) | 'lista' (ítems numerados) | 'planes'. Todos llevan foto de fondo.
// Fotos de Pexels (licencia libre para uso comercial); ID en el nombre del archivo.
// encuadre (opcional): background-position de la foto.
// En los textos, *palabra* se pinta con el color de acento.

window.POSTS = [
  {
    id: '01-marca',
    foto: 'fotos/pexels-5816285.jpg',
    layout: 'foto',
    eyebrow: 'Mercurial Corredores de Seguros',
    titulo: 'No vendemos una póliza. Te ayudamos a elegir *la correcta.*',
    bajada: 'Somos corredores de seguros regulados por la CMF: cotizamos en las principales compañías y te asesoramos en todo el proceso.',
    cta: 'mercurial.cl',
  },

  // Condominio (condominio.html)
  {
    id: '02-condominio-ley',
    foto: 'fotos/pexels-16816523.jpg',
    layout: 'foto',
    eyebrow: 'Seguro de condominio · Ley 21.442',
    titulo: 'Las áreas comunes de tu condominio necesitan un *seguro vigente.*',
    bajada: 'Lo exige la Ley 21.442. Te asesoramos para que la póliza realmente proteja a tu comunidad.',
    cta: 'Solicita asesoría en mercurial.cl/condominio',
  },
  {
    id: '03-condominio-cobertura',
    foto: 'fotos/pexels-11631278.jpg',
    layout: 'foto',
    eyebrow: 'Seguro de condominio · Ley 21.442',
    titulo: 'Tener seguro no es lo mismo que estar *bien cubierto.*',
    bajada: 'Analizamos tu comunidad para evitar brechas de cobertura en las áreas comunes.',
    cta: 'Solicita asesoría en mercurial.cl/condominio',
  },
  {
    id: '04-condominio-como',
    foto: 'fotos/pexels-32206234.jpg',
    layout: 'lista',
    eyebrow: 'Seguro de condominio · Ley 21.442',
    titulo: 'Así te *acompañamos.*',
    items: [
      ['Cumplimiento normativo', 'Estructuramos tu póliza conforme al Art. 43 de la Ley 21.442.'],
      ['Cobertura real', 'Analizamos tu comunidad para evitar brechas de cobertura en las áreas comunes.'],
      ['Asesoría senior', 'Un ejecutivo especializado te contacta en 1 a 2 horas para analizar tu caso.'],
    ],
    cta: 'Solicita asesoría en mercurial.cl/condominio',
  },
  {
    id: '05-condominio-administrador',
    foto: 'fotos/pexels-16110999.jpg',
    layout: 'foto',
    eyebrow: 'Seguro de condominio · Ley 21.442',
    titulo: '¿Administras un condominio? *Revisemos tu póliza.*',
    bajada: 'Completa tus datos y un ejecutivo especializado te contacta en 1 a 2 horas.',
    cta: 'mercurial.cl/condominio',
  },

  // Mascotas (mascotas.html; cifras de los PDFs del convenio BCI)
  {
    id: '06-mascotas-familia',
    layout: 'foto',
    foto: '../src/img/mascota.jpeg',
    eyebrow: 'Seguro de mascotas · BCI Seguros',
    titulo: 'Protege a quien te espera *todos los días* en casa.',
    bajada: 'Seguro para perros y gatos con el respaldo de BCI Seguros y la asesoría de Mercurial.',
    cta: 'Cotiza en línea en mercurial.cl/seguro-mascotas',
    legal: 'Perros y gatos de 6 meses a 9 años y 364 días al contratar. Una mascota por póliza. No cubre preexistencias. Imagen referencial.',
  },
  {
    id: '07-mascotas-planes',
    foto: 'fotos/pexels-7788601.jpg',
    layout: 'planes',
    eyebrow: 'Seguro de mascotas · BCI Seguros',
    titulo: 'Tres planes, según *cuánta protección* quieras.',
    planes: [
      { nombre: 'Esencial', pct: '60%', tope: 'hasta UF 10', rc: 'RC hasta UF 50', med: '60% dcto. en medicamentos', extra: 'Cobertura equilibrada' },
      { nombre: 'Pro', pct: '70%', tope: 'hasta UF 20', rc: 'RC hasta UF 100', med: '70% dcto. en medicamentos', extra: 'Suma hotel, baño y etólogo' },
      { nombre: 'Infinite', pct: '80%', tope: 'hasta UF 40', rc: 'RC hasta UF 150', med: '80% dcto. en medicamentos', extra: 'Suma exámenes preventivos y pet sitter' },
    ],
    nota: 'Todos incluyen telemedicina veterinaria ilimitada, vacunación, microchip, cremación, apoyo psicológico al tutor y orientación legal.',
    cta: 'mercurial.cl/seguro-mascotas',
    legal: 'Urgencias por enfermedad o accidente en red veterinaria BCI. RC: responsabilidad civil. Descuento en medicamentos en Salcobrand.',
  },
  {
    id: '08-mascotas-bono-pet',
    foto: 'fotos/pexels-11633162.jpg',
    layout: 'foto',
    eyebrow: 'Seguro de mascotas · BCI Seguros',
    titulo: 'Sin reembolsos *ni papeleo.*',
    bajada: 'En la red veterinaria de BCI, con más de 70 clínicas, pagas solo tu copago con Bono Pet, directo en la clínica.',
    cta: 'mercurial.cl/seguro-mascotas',
  },
  {
    id: '09-mascotas-requisitos',
    foto: 'fotos/pexels-28485975.jpg',
    layout: 'lista',
    eyebrow: 'Seguro de mascotas · BCI Seguros',
    titulo: 'Antes de cotizar, *lo que tienes que saber.*',
    items: [
      ['Perros y gatos', 'Al contratar, tu mascota debe tener entre 6 meses y 9 años y 364 días. Puede seguir asegurada hasta los 12 años.'],
      ['Una mascota por póliza', 'Si tienes más de una, cada una lleva su propio seguro.'],
      ['Sin preexistencias', 'No cubre enfermedades preexistentes ni mascotas destinadas a actividad laboral o reproducción.'],
      ['Cotizas en 3 pasos', 'En línea, desde nuestro sitio, y recibes tu cotización al instante.'],
    ],
    cta: 'mercurial.cl/seguro-mascotas',
  },

  // Pyme (cotizar-pyme.html)
  {
    id: '10-pyme-cotizamos',
    foto: 'fotos/pexels-36729740.jpg',
    layout: 'foto',
    eyebrow: 'Seguro Pyme · Multiriesgo',
    titulo: 'Cuéntanos de tu empresa. *Nosotros cotizamos por ti.*',
    bajada: 'Un ejecutivo de Mercurial cotiza tu seguro en las principales compañías y te envía las alternativas. Te toma unos 10 minutos.',
    cta: 'mercurial.cl/cotizar-pyme',
  },
  {
    id: '11-pyme-montos',
    foto: 'fotos/pexels-8475171.jpg',
    layout: 'lista',
    eyebrow: 'Seguro Pyme · Multiriesgo',
    titulo: '¿Qué puedes asegurar *en tu pyme?*',
    items: [
      ['Edificio', 'Solo si el inmueble es tuyo. Valor de construcción, sin el terreno.'],
      ['Instalaciones y contenido', 'Mobiliario, equipamiento e instalaciones fijas.'],
      ['Mercaderías', 'Stock de productos para la venta, materias primas e insumos.'],
      ['Equipos electrónicos y maquinaria', 'Computadores, cajas, pantallas y equipos de producción.'],
    ],
    cta: 'mercurial.cl/cotizar-pyme',
  },
  {
    id: '12-pyme-adicionales',
    foto: 'fotos/pexels-6205471.jpg',
    layout: 'lista',
    eyebrow: 'Seguro Pyme · Multiriesgo',
    titulo: 'Coberturas adicionales que *vale la pena revisar.*',
    items: [
      ['Pérdida de utilidades', 'Los meses que cubre el seguro si debes cerrar tras un siniestro.'],
      ['Cristales', 'Vitrinas, ventanales y puertas de vidrio.'],
      ['RC de alimentos', 'Si vendes o elaboras alimentos: daños a clientes por su consumo.'],
      ['Avería de maquinaria', 'Fallas internas de las máquinas, más allá de incendio o robo.'],
    ],
    cta: 'mercurial.cl/cotizar-pyme',
    legal: 'Coberturas opcionales, sujetas a evaluación y aceptación de la aseguradora.',
  },
  {
    id: '13-pyme-seguridad',
    foto: 'fotos/pexels-36729739.jpg',
    layout: 'foto',
    eyebrow: 'Seguro Pyme · Multiriesgo',
    titulo: 'Mientras más protecciones, *mejores condiciones.*',
    bajada: 'Al cotizar, cuéntanos qué medidas contra incendio y contra robo tiene hoy tu local.',
    cta: 'mercurial.cl/cotizar-pyme',
  },

  // Transporte (transporte.html, index.html)
  {
    id: '14-transporte-kilometro',
    foto: 'fotos/pexels-6563903.jpg',
    layout: 'foto',
    eyebrow: 'Seguro de transporte de carga',
    titulo: 'Cobertura para *cada kilómetro* de tu operación.',
    bajada: 'Camión propio, carga de terceros o mercadería en tránsito: diseñamos la cobertura para lo que realmente está en riesgo.',
    cta: 'Solicita asesoría en mercurial.cl/transporte',
  },
  {
    id: '15-transporte-coberturas',
    foto: 'fotos/pexels-40226285.jpg',
    layout: 'lista',
    eyebrow: 'Seguro de transporte de carga',
    titulo: 'Lo que protegemos *en tu operación.*',
    items: [
      ['Camión y flota', 'Robo con fractura o asalto, y fallas en equipos de frío.'],
      ['Carga nacional e internacional', 'Tu mercadería en tránsito terrestre y en comercio exterior.'],
      ['Conductor y acompañante', 'Cobertura para los ocupantes del vehículo durante el trayecto.'],
    ],
    cta: 'Solicita asesoría en mercurial.cl/transporte',
  },
  {
    id: '16-transporte-clausulas',
    foto: 'fotos/pexels-12261472.jpg',
    encuadre: 'center 80%',
    layout: 'foto',
    eyebrow: 'Seguro de transporte de carga',
    titulo: '¿Sabes qué medidas de seguridad *exige tu póliza?*',
    bajada: 'Es la condición que define si la cobertura opera. Auditamos esas cláusulas para que no te lleves sorpresas en un siniestro.',
    cta: 'Solicita asesoría en mercurial.cl/transporte',
  },
];

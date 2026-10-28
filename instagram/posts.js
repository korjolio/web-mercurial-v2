// Contenido de los posts de Instagram (1080×1350).
// Cada afirmación sale de lo publicado en mercurial.cl (condominio.html, transporte.html,
// mascotas.html, cotizar-pyme.html, index.html). No agregar cifras ni coberturas sin fuente.
//
// formato:
//   'portada'  foto a sangre, titular abajo
//   'dato'     fondo azul de marca, cifra gigante
//   'pregunta' fondo claro, titular arriba, foto enmarcada
//   'split'    foto arriba, bloque blanco con texto abajo
//   'carrusel' portada con foto + una lámina por ítem (o plan) + lámina de cierre
// En los textos, *palabra* se pinta con el color de acento.
// Fotos: pexels-* (licencia Pexels) y cm-* (Wikimedia Commons; el crédito va en la imagen y en el caption).

window.CREDITOS = {
  'cm-vina-edificios.jpg': 'Carlos Teixidor Cadenas · CC BY 4.0',
  'cm-santiago-aereo.jpg': 'Deensel · CC BY 2.0',
  'cm-puerto-valparaiso.jpg': 'Py4nf · CC BY 4.0',
  'cm-autopista.jpg': 'cristiantacchi · CC BY 3.0',
  'cm-feria-libre.jpg': 'Jorge Valdés R. · Dominio público',
};

const MASCOTAS = 'Seguro de mascotas · BCI';
const CONDOMINIO = 'Condominio · Ley 21.442';
const PYME = 'Seguro Pyme · Multiriesgo';
const TRANSPORTE = 'Transporte de carga';

window.POSTS = [
  {
    id: '01-marca', formato: 'portada', foto: 'fotos/pexels-17347192.jpg', encuadre: 'center 40%',
    chip: 'Corredores de seguros',
    titulo: 'No vendemos una póliza. Te ayudamos a elegir *la correcta.*',
    bajada: 'Regulados por la CMF. Cotizamos en las principales compañías.',
    cta: 'mercurial.cl',
  },

  // Condominio (condominio.html)
  {
    id: '02-condominio-ley', formato: 'portada', foto: 'fotos/pexels-37136626.jpg',
    chip: CONDOMINIO,
    titulo: 'Tu comunidad necesita un *seguro vigente.*',
    bajada: 'La Ley 21.442 lo exige para las áreas comunes.',
    cta: 'mercurial.cl/condominio',
  },
  {
    id: '03-condominio-cobertura', formato: 'pregunta', foto: 'fotos/cm-vina-edificios.jpg', encuadre: 'center 40%',
    chip: CONDOMINIO,
    titulo: '¿Tu póliza *cubre de verdad* las áreas comunes?',
    bajada: 'Tener seguro no es lo mismo que estar bien cubierto.',
    cta: 'Analizamos tu comunidad · mercurial.cl/condominio',
  },
  {
    id: '04-condominio-como', formato: 'carrusel',
    portada: { foto: 'fotos/cm-santiago-aereo.jpg', chip: CONDOMINIO, titulo: 'Así te acompañamos con el seguro de *tu condominio.*' },
    laminas: [
      { titulo: 'Cumplimiento normativo', texto: 'Estructuramos tu póliza conforme al Art. 43 de la Ley 21.442.' },
      { titulo: 'Cobertura real', texto: 'Analizamos tu comunidad para evitar brechas de cobertura en las áreas comunes.' },
      { titulo: 'Asesoría senior', texto: 'Un ejecutivo especializado te contacta en 1 a 2 horas para analizar tu caso.' },
    ],
    cierre: { titulo: '¿Revisamos el seguro de *tu comunidad?*', cta: 'mercurial.cl/condominio' },
  },
  {
    id: '05-condominio-contacto', formato: 'dato',
    chip: CONDOMINIO,
    num: '1–2', unidad: 'horas',
    texto: 'Es lo que tarda un ejecutivo especializado en contactarte para revisar el seguro de tu condominio.',
    cta: 'mercurial.cl/condominio',
  },

  // Mascotas (mascotas.html; cifras de los PDFs del convenio BCI)
  {
    id: '06-mascotas-familia', formato: 'portada', foto: '../src/img/mascota.jpeg', encuadre: 'center 35%',
    chip: MASCOTAS,
    titulo: 'Protege a quien te espera *todos los días* en casa.',
    bajada: 'Seguro para perros y gatos con el respaldo de BCI Seguros.',
    cta: 'mercurial.cl/seguro-mascotas',
    legal: 'Perros y gatos de 6 meses a 9 años y 364 días al contratar. Una mascota por póliza. No cubre preexistencias. Imagen referencial.',
  },
  {
    id: '07-mascotas-planes', formato: 'carrusel',
    portada: { foto: 'fotos/pexels-7788601.jpg', chip: MASCOTAS, titulo: 'Tres planes. *¿Cuál es el tuyo?*', desliza: 'Desliza para comparar' },
    laminas: [
      { plan: 'Esencial', pct: '60%', tope: 'hasta UF 10', items: ['Responsabilidad civil hasta UF 50', '60% dcto. en medicamentos', 'Cobertura equilibrada'] },
      { plan: 'Pro', pct: '70%', tope: 'hasta UF 20', items: ['Responsabilidad civil hasta UF 100', '70% dcto. en medicamentos', 'Suma hotel, baño y etólogo'] },
      { plan: 'Infinite', pct: '80%', tope: 'hasta UF 40', items: ['Responsabilidad civil hasta UF 150', '80% dcto. en medicamentos', 'Suma exámenes preventivos y pet sitter'] },
    ],
    cierre: {
      titulo: 'Todos incluyen *lo esencial.*',
      texto: 'Telemedicina veterinaria ilimitada, vacunación, microchip, cremación, apoyo psicológico al tutor y orientación legal.',
      cta: 'mercurial.cl/seguro-mascotas',
      legal: 'Urgencias por enfermedad o accidente en red veterinaria BCI. Descuento en medicamentos en Salcobrand.',
    },
  },
  {
    id: '08-mascotas-red', formato: 'dato',
    chip: MASCOTAS,
    num: '+70', unidad: 'clínicas',
    texto: 'en la red veterinaria de BCI. Pagas solo tu copago con Bono Pet: sin reembolsos ni papeleo.',
    cta: 'mercurial.cl/seguro-mascotas',
  },
  {
    id: '09-mascotas-requisitos', formato: 'carrusel',
    portada: { foto: 'fotos/pexels-11633162.jpg', encuadre: 'center 30%', chip: MASCOTAS, titulo: 'Antes de cotizar, *lo que tienes que saber.*' },
    laminas: [
      { titulo: 'Perros y gatos', texto: 'Al contratar, tu mascota debe tener entre 6 meses y 9 años y 364 días. Puede seguir asegurada hasta los 12 años.' },
      { titulo: 'Una mascota por póliza', texto: 'Si tienes más de una, cada una lleva su propio seguro.' },
      { titulo: 'Sin preexistencias', texto: 'No cubre enfermedades preexistentes ni mascotas destinadas a actividad laboral o reproducción.' },
      { titulo: 'Cotizas en 3 pasos', texto: 'En línea, desde nuestro sitio, y recibes tu cotización al instante.' },
    ],
    cierre: { titulo: 'Cotiza en *3 pasos.*', cta: 'mercurial.cl/seguro-mascotas' },
  },

  // Pyme (cotizar-pyme.html)
  {
    id: '10-pyme-cotizamos', formato: 'dato',
    chip: PYME,
    num: '10', unidad: 'min',
    texto: 'te toma, aprox., enviarnos los antecedentes de tu negocio. Nosotros cotizamos en las principales compañías.',
    cta: 'mercurial.cl/cotizar-pyme',
  },
  {
    id: '11-pyme-montos', formato: 'carrusel',
    portada: { foto: 'fotos/cm-feria-libre.jpg', chip: PYME, titulo: '¿Qué puedes asegurar *en tu negocio?*' },
    laminas: [
      { titulo: 'Edificio', texto: 'Solo si el inmueble es tuyo. Valor de construcción, sin el terreno.' },
      { titulo: 'Instalaciones y contenido', texto: 'Mobiliario, equipamiento e instalaciones fijas.' },
      { titulo: 'Mercaderías', texto: 'Stock de productos para la venta, materias primas e insumos.' },
      { titulo: 'Equipos y maquinaria', texto: 'Computadores, cajas, pantallas y equipos de producción.' },
    ],
    cierre: {
      titulo: '¿No sabes *cuánto declarar?*',
      texto: 'Indica un aproximado y el ejecutivo lo revisa contigo.',
      cta: 'mercurial.cl/cotizar-pyme',
    },
  },
  {
    id: '12-pyme-adicionales', formato: 'carrusel',
    portada: { foto: 'fotos/pexels-6205471.jpg', chip: PYME, titulo: 'Coberturas adicionales que *vale la pena revisar.*' },
    laminas: [
      { titulo: 'Pérdida de utilidades', texto: 'Los meses que cubre el seguro si debes cerrar tras un siniestro.' },
      { titulo: 'Cristales', texto: 'Vitrinas, ventanales y puertas de vidrio.' },
      { titulo: 'RC de alimentos', texto: 'Si vendes o elaboras alimentos: daños a clientes por su consumo.' },
      { titulo: 'Avería de maquinaria', texto: 'Fallas internas de las máquinas, más allá de incendio o robo.' },
    ],
    cierre: {
      titulo: 'Elige las que *tu negocio necesita.*',
      cta: 'mercurial.cl/cotizar-pyme',
      legal: 'Coberturas opcionales, sujetas a evaluación y aceptación de la aseguradora.',
    },
  },
  {
    id: '13-pyme-seguridad', formato: 'split', foto: 'fotos/pexels-36729740.jpg', encuadre: 'center 30%',
    chip: PYME,
    titulo: 'Mientras más protecciones, *mejores condiciones.*',
    bajada: 'Al cotizar, cuéntanos qué medidas contra incendio y contra robo tiene hoy tu local.',
    cta: 'mercurial.cl/cotizar-pyme',
  },

  // Transporte (transporte.html, index.html)
  {
    id: '14-transporte-kilometro', formato: 'portada', foto: 'fotos/pexels-6563903.jpg', encuadre: '60% center',
    chip: TRANSPORTE,
    titulo: 'Cobertura para *cada kilómetro* de tu operación.',
    bajada: 'Camión propio, carga de terceros o mercadería en tránsito.',
    cta: 'mercurial.cl/transporte',
  },
  {
    id: '15-transporte-coberturas', formato: 'carrusel',
    portada: { foto: 'fotos/cm-puerto-valparaiso.jpg', encuadre: '60% center', chip: TRANSPORTE, titulo: 'Lo que protegemos *en tu operación.*' },
    laminas: [
      { titulo: 'Camión y flota', texto: 'Robo con fractura o asalto, y fallas en equipos de frío.' },
      { titulo: 'Carga nacional e internacional', texto: 'Tu mercadería en tránsito terrestre y en comercio exterior.' },
      { titulo: 'Conductor y acompañante', texto: 'Cobertura para los ocupantes del vehículo durante el trayecto.' },
    ],
    cierre: { titulo: 'Diseñamos la cobertura para *lo que está en riesgo.*', cta: 'Solicita asesoría en mercurial.cl/transporte' },
  },
  {
    id: '16-transporte-clausulas', formato: 'pregunta', foto: 'fotos/cm-autopista.jpg', encuadre: 'center 70%',
    chip: TRANSPORTE,
    titulo: '¿Sabes qué medidas de seguridad *exige tu póliza?*',
    bajada: 'Es la condición que define si la cobertura opera.',
    cta: 'Auditamos esas cláusulas · mercurial.cl/transporte',
  },
];

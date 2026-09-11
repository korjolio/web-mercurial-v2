/**
 * Catálogos del formulario /cotizar-pyme. Son las listas exactas del cotizador
 * "Seguro de Pymes" de ANS (ver docs/referencia/ans-pyme-campos.md). Se usan en el
 * navegador (window.PYME_CATALOGOS) y en server.js (require) para validar lo mismo
 * en ambos lados. No inventar opciones: si el portal cambia, actualizar acá.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.PYME_CATALOGOS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    return {
        tipoPersona: ['natural', 'juridica'],
        tipoUbicacion: ['Urbano', 'Rural'],
        muro: ['Concreto', 'Albañilería Simple', 'Albañil. Reforzada', 'Asbesto Cemento', 'Bloques de Cemento', 'Plancha Metálicas', 'Madera', 'Adobe', 'Panel Sandwich'],
        techo: ['Concreto', 'Asbesto Cemento', 'Planchas Metálicas', 'Tejas o Similares', 'Sólidos en General', 'Panel Sandwich'],
        antiguedad: ['Hasta 15 años', 'Entre 15 y 25 años', 'Entre 25 y 50 años', 'Entre 50 y 75 años', 'Más de 75 años'],
        rcUF: [0, 100, 300, 500, 1000, 2000, 3000],
        cristalesUF: [50, 100, 300, 500, 1000],
        muerteInvalidezUF: [250, 300, 500],
        dineroEnCajaUF: [0, 30, 50, 100, 200, 300, 500],
        remesaValoresUF: [0, 50, 100, 200, 300, 500],
        periodoIndemnizable: ['3 Meses', '6 Meses', '9 Meses', '12 Meses'],
        siNo: ['SI', 'NO'],
        seguridadIncendio: [
            'Extinguidores de marca certificados y bien mantenidos',
            'Detectores de humo',
            'Detectores de calor',
            'Alarma contra incendio local',
            'Alarma contra incendio conectada a central',
            'Red húmeda y mangueras',
            'Rociadores automáticos',
            'Red seca y mangueras',
            'Ubicada a menos de 10 km de Bomberos'
        ],
        seguridadRobo: [
            'Protecciones en todas las ventanas, vitrinas, claraboyas, tragaluces o similares',
            'Chapas de seguridad efectivas en todas las puertas',
            'Vigilancia de la ubicación las 24 horas, los 365 días, con personal calificado y contratado para esta actividad',
            'Cortinas a la calle de malla o emballestadas con candados protegidos',
            'Alarma conectada a central de monitoreo, con sensores en todas las puertas, ventanas y accesos',
            'Para oficinas ubicadas en edificios, mampara de vidrio con llave'
        ],
        actividadOtra: 'Otra / no la encuentro',
        defaults: { rcUF: 500, cristalesUF: 50, muerteInvalidezUF: 250 }
    };
});

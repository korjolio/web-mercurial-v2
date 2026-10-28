/**
 * Consentimiento de cookies. Se carga en <head> ANTES de GTM y de meta.js:
 * - Google Consent Mode v2: todo denegado por defecto; GTM y GA4 lo respetan. Las etiquetas de
 *   terceros dentro de GTM (LinkedIn, Signals Gateway) deben exigir consentimiento en su
 *   configuración de GTM, porque no lo leen solas.
 * - El píxel de Meta (meta.js) no se carga hasta que el visitante acepta.
 * - La elección queda en localStorage. window.mercurialConsent.open() vuelve a mostrar el banner
 *   (enlace "Configurar cookies" de la política de privacidad).
 * El banner trae su propio CSS para verse igual en las páginas con styles.css y en mascotas.html.
 * No toma el foco al aparecer: no debe mover el scroll de quien está leyendo.
 */
(function () {
  var KEY = 'mercurial_cookie_consent';
  var DENEGADO = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
  var CONCEDIDO = { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' };

  function leer() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      return v && (v.estado === 'aceptado' || v.estado === 'rechazado') ? v.estado : null;
    } catch (e) { return null; }
  }
  function guardar(estado) {
    try { localStorage.setItem(KEY, JSON.stringify({ estado: estado, fecha: new Date().toISOString() })); } catch (e) { /* sin almacenamiento: se vuelve a preguntar */ }
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  var porDefecto = { wait_for_update: 500 };
  for (var k in DENEGADO) porDefecto[k] = DENEGADO[k];
  gtag('consent', 'default', porDefecto);

  var estado = leer();
  if (estado === 'aceptado') gtag('consent', 'update', CONCEDIDO);

  var alAceptar = [];
  var banner = null;

  function decidir(nuevo) {
    var antes = estado;
    estado = nuevo;
    guardar(nuevo);
    gtag('consent', 'update', nuevo === 'aceptado' ? CONCEDIDO : DENEGADO);
    window.dataLayer.push({ event: 'cookie_consent_update', cookie_consent: nuevo });
    ocultar();
    if (nuevo === 'aceptado' && antes !== 'aceptado') {
      var pendientes = alAceptar;
      alAceptar = [];
      pendientes.forEach(function (fn) { try { fn(); } catch (e) { /* la medición nunca rompe la página */ } });
    }
    // Retirar el consentimiento no descarga scripts ya cargados: recargar deja la página limpia.
    if (nuevo === 'rechazado' && antes === 'aceptado') window.location.reload();
  }

  var CSS =
    '.mc-consent{position:fixed;left:1rem;bottom:calc(1rem + env(safe-area-inset-bottom,0px));z-index:1000;' +
    'max-width:26rem;box-sizing:border-box;padding:1.1rem 1.2rem;background:#fff;color:#1f2933;' +
    'border:1px solid #e1e6eb;border-radius:12px;box-shadow:0 12px 32px -8px rgba(15,23,42,.22);' +
    'font:inherit;font-size:.875rem;line-height:1.55}' +
    '.mc-consent p{margin:0 0 .9rem;color:#1f2933}' +
    '.mc-consent a{color:#1f2933;text-decoration:underline;text-underline-offset:2px}' +
    '.mc-consent-acciones{display:flex;gap:.6rem}' +
    '.mc-consent button{flex:1;min-height:44px;padding:.55rem 1rem;border-radius:8px;font:inherit;font-weight:600;' +
    'font-size:.875rem;cursor:pointer;border:1px solid #1f2933;transition:background-color .15s ease,color .15s ease}' +
    '.mc-consent button[data-consent=rechazado]{background:#fff;color:#1f2933}' +
    '.mc-consent button[data-consent=rechazado]:hover{background:#f1f4f6}' +
    '.mc-consent button[data-consent=aceptado]{background:#1f2933;color:#fff}' +
    '.mc-consent button[data-consent=aceptado]:hover{background:#334250}' +
    '.mc-consent button:focus-visible{outline:2px solid #2399c6;outline-offset:2px}' +
    '@media (max-width:640px){.mc-consent{left:.75rem;right:.75rem;max-width:none}' +
    '.mc-consent-abierto .ws-floating-btn{bottom:calc(var(--mc-consent-h,0px) + 1.75rem)!important}}';

  function crear() {
    var estilo = document.createElement('style');
    estilo.textContent = CSS;
    document.head.appendChild(estilo);

    banner = document.createElement('div');
    banner.className = 'mc-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Uso de cookies');
    banner.innerHTML =
      '<p>Usamos cookies propias y de terceros (Google, Meta y LinkedIn) para medir las visitas y el resultado de ' +
      'nuestros anuncios. El sitio funciona igual si las rechazas. ' +
      '<a href="/politica-privacidad#cookies">Más información</a></p>' +
      '<div class="mc-consent-acciones">' +
      '<button type="button" data-consent="rechazado">Rechazar</button>' +
      '<button type="button" data-consent="aceptado">Aceptar</button></div>';
    banner.addEventListener('click', function (e) {
      var boton = e.target.closest('button[data-consent]');
      if (boton) decidir(boton.getAttribute('data-consent'));
    });
    document.body.appendChild(banner);

    // En móvil el banner ocupa el ancho: el botón flotante de WhatsApp sube por encima de él.
    var medir = function () { document.documentElement.style.setProperty('--mc-consent-h', banner.offsetHeight + 'px'); };
    if (window.ResizeObserver) new ResizeObserver(medir).observe(banner);
    medir();
  }

  function mostrar() {
    var abrir = function () {
      if (!banner) crear();
      banner.hidden = false;
      document.body.classList.add('mc-consent-abierto');
    };
    if (document.body) abrir(); else document.addEventListener('DOMContentLoaded', abrir);
  }

  function ocultar() {
    if (banner) banner.hidden = true;
    if (document.body) document.body.classList.remove('mc-consent-abierto');
  }

  window.mercurialConsent = {
    aceptado: function () { return estado === 'aceptado'; },
    alAceptar: function (fn) { if (estado === 'aceptado') fn(); else alAceptar.push(fn); },
    open: mostrar
  };

  if (!estado) mostrar();
})();

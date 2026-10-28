/**
 * Píxel de Meta + API de conversiones (conjunto de datos "Datos del mercado asegurador en Chile").
 * Cada evento se envía dos veces con el mismo event_id: desde el navegador (fbq) y desde el
 * servidor (server.js → graph.facebook.com). Meta los deduplica por nombre + event_id.
 *
 * - ViewContent: al cargar una landing de producto.
 * - Contact: clic en WhatsApp o correo.
 * - CustomizeProduct / Lead: los disparan mascotas.html, lead-form.js y cotizar-pyme.js.
 *   El Lead del servidor sale de /api/leads y /api/cotizaciones/pyme (con datos del formulario),
 *   no de /api/meta/evento.
 */
(function () {
  var PIXEL_ID = '1129934969998097';

  /* Código base del píxel de Meta */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ?
        n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s)
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');

  function newEventId() {
    return window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function pageUrl() {
    return window.location.href.split('#')[0];
  }

  // Solo navegador; el servidor manda su copia por su cuenta (Lead).
  function trackBrowser(eventName, customData, eventId) {
    fbq('track', eventName, customData || {}, { eventID: eventId });
  }

  // Navegador + copia del servidor vía /api/meta/evento. sendBeacon sobrevive a la navegación
  // (clic en WhatsApp abre otra pestaña o app).
  function track(eventName, customData) {
    var eventId = newEventId();
    trackBrowser(eventName, customData, eventId);
    var body = JSON.stringify({ eventName: eventName, eventId: eventId, eventSourceUrl: pageUrl(), customData: customData || {} });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/meta/evento', new Blob([body], { type: 'application/json' }));
      } else {
        fetch('/api/meta/evento', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true });
      }
    } catch (e) { /* la medición nunca debe romper la página */ }
  }

  window.mercurialMeta = { track: track, trackBrowser: trackBrowser, newEventId: newEventId, pageUrl: pageUrl };

  var PRODUCTOS = {
    '/condominio': 'Seguro Condominio',
    '/transporte': 'Seguro Transporte',
    '/seguro-mascotas': 'Seguro Mascotas',
    '/mascotas': 'Seguro Mascotas',
    '/cotizar-pyme': 'Seguro Pyme'
  };
  var producto = PRODUCTOS[window.location.pathname.replace(/\.html$/, '').replace(/\/+$/, '')];
  if (producto) track('ViewContent', { content_name: producto });

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var canal = /wa\.me|api\.whatsapp\.com/.test(href) ? 'whatsapp' : href.indexOf('mailto:') === 0 ? 'email' : href.indexOf('tel:') === 0 ? 'telefono' : null;
    if (canal) track('Contact', { content_name: producto || 'Sitio corporativo', contact_channel: canal });
  }, true);
})();

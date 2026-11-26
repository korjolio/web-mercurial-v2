/**
 * Píxel de OpenAI (anuncios en ChatGPT). Mismo patrón que meta.js: nada se carga sin
 * consentimiento (src/js/consent.js, que va antes en el <head>).
 *
 * Es el snippet oficial de OpenAI, solo que se ejecuta al aceptar las cookies.
 * Modo depuración (debug: true, mensajes en la consola): solo en localhost o al abrir
 * cualquier página con ?oaiq_debug=1. En producción va en false.
 *
 * Conversión: window.mercurialOpenAI.lead() manda el evento estándar `lead_created`
 * (https://developers.openai.com/ads/measurement-pixel). Lo llaman sitio.js y cotizar-pyme.js
 * cuando un formulario de cotización se envía con éxito. Sin consentimiento no hace nada.
 */
(function () {
  var PIXEL_ID = 'CZHRJYHEQCciDYpmcFB2K4';

  function modoDebug() {
    var h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || /[?&]oaiq_debug=1(&|$)/.test(window.location.search);
  }

  function iniciar() {
    /* Código base del píxel de OpenAI */
    !function (w, d, s, u) {
      if (w.oaiq) return; var q = function () { q.q.push(arguments) }; q.q = []; w.oaiq = q;
      var j = d.createElement(s); j.async = 1; j.src = u;
      var f = d.getElementsByTagName(s)[0]; f.parentNode.insertBefore(j, f);
    }(window, document, 'script', 'https://bzrcdn.openai.com/sdk/oaiq.min.js');

    oaiq('init', { pixelId: PIXEL_ID, debug: modoDebug() });
  }

  window.mercurialOpenAI = {
    lead: function () {
      if (typeof window.oaiq !== 'function') return; // el píxel no se inició (sin consentimiento)
      window.oaiq('measure', 'lead_created', { type: 'customer_action' });
    }
  };

  // Sin consent.js (no cargó) no se mide: el valor por defecto es no medir.
  if (window.mercurialConsent) window.mercurialConsent.alAceptar(iniciar);
})();

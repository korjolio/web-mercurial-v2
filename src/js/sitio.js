/**
 * Comportamiento común de mercurial.cl: menú de seguros, panel móvil, formularios y movimiento.
 *
 * Formularios: todo <form data-envio="cotizacion|consulta"> se valida en el navegador y se envía a
 * POST /api/contacto (server.js), que lo reenvía por correo a contacto@mercurial.cl. En el form de
 * consultas el tipo (consulta o reclamo) sale del radio name="tipo".
 * Transiciones: tokens de transitions.dev (marco.css). GSAP solo anima si cargó y no hay
 * prefers-reduced-motion; sin él la página se ve completa.
 */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ms = n => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n)) || 0;

  /* Menú de seguros (transitions.dev · menu dropdown) */
  const btn = $('#btn-seguros'), menu = $('#menu-seguros'), li = $('#li-seguros');
  if (btn && menu && li) {
    let cierre;
    const abierto = () => menu.classList.contains('is-open');
    const abrir = () => { clearTimeout(cierre); menu.classList.remove('is-closing'); menu.classList.add('is-open'); menu.inert = false; btn.setAttribute('aria-expanded', 'true'); };
    const cerrar = () => {
      if (!abierto()) return;
      menu.classList.remove('is-open'); menu.classList.add('is-closing'); menu.inert = true; btn.setAttribute('aria-expanded', 'false');
      cierre = setTimeout(() => menu.classList.remove('is-closing'), ms('--dropdown-close-dur'));
    };
    btn.addEventListener('click', () => (abierto() ? cerrar() : abrir()));
    li.addEventListener('focusout', e => { if (!li.contains(e.relatedTarget)) cerrar(); });
    li.addEventListener('keydown', e => { if (e.key === 'Escape' && abierto()) { cerrar(); btn.focus(); } });
    menu.addEventListener('click', e => { if (e.target.closest('a')) cerrar(); });
    document.addEventListener('click', e => { if (!li.contains(e.target)) cerrar(); });
  }

  /* Panel móvil (transitions.dev · panel reveal) */
  const hamb = $('#hamb'), panel = $('#panel-movil'), nav = $('#nav');
  if (hamb && panel && nav) {
    let ocultar;
    // Mientras el panel está abierto, el resto de la página no recibe foco (Tab queda dentro del panel y la cabecera).
    const exterior = $$('body > :not(#nav):not(#panel-movil):not(script):not(svg):not(noscript)');
    const fijarInerte = v => exterior.forEach(el => { el.inert = v; });
    const abrirPanel = () => {
      clearTimeout(ocultar);
      panel.style.setProperty('--cab-movil', Math.round(nav.getBoundingClientRect().bottom) + 'px');
      panel.hidden = false; void panel.offsetWidth; panel.classList.add('is-open');
      hamb.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden';
      fijarInerte(true);
      panel.querySelector('a').focus();
    };
    const cerrarPanel = (foco = true) => {
      if (hamb.getAttribute('aria-expanded') !== 'true') return;
      panel.classList.remove('is-open'); hamb.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
      fijarInerte(false);
      ocultar = setTimeout(() => { panel.hidden = true; }, ms('--duration-slow'));
      if (foco) hamb.focus();
    };
    hamb.addEventListener('click', () => (hamb.getAttribute('aria-expanded') === 'true' ? cerrarPanel() : abrirPanel()));
    panel.addEventListener('click', e => {
      const a = e.target.closest('a'); if (!a) return;
      cerrarPanel(false);
      // Ancla en la misma página: el foco pasa al destino para que no quede en un enlace oculto.
      const destino = a.hash && a.pathname === location.pathname && document.querySelector(a.hash);
      if (destino) { if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1'); setTimeout(() => destino.focus({ preventScroll: true }), 0); }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarPanel(); });
    window.matchMedia('(min-width: 861px)').addEventListener('change', m => m.matches && cerrarPanel(false));
  }

  /* Enlaces que dejan marcado el seguro en el formulario de cotización de la página */
  const marcarSeguro = valor => {
    const form = $('form[data-envio="cotizacion"][data-principal]') || $('form[data-envio="cotizacion"]');
    if (!form) return;
    const radio = $(`input[name="seguro"][value="${valor}"]`, form);
    const select = $('select[name="seguro"]', form);
    if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
    else if (select && [...select.options].some(o => o.value === valor)) select.value = valor;
  };
  $$('[data-interes]').forEach(a => a.addEventListener('click', () => marcarSeguro(a.dataset.interes)));

  /* Formularios → /api/contacto */
  const telValido = v => v.replace(/\D/g, '').replace(/^56/, '').length === 9;
  const correoValido = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const sacudir = el => { el.classList.remove('is-shaking'); void el.offsetWidth; el.classList.add('is-shaking'); };
  document.addEventListener('animationend', e => e.target.classList && e.target.classList.remove('is-shaking'));
  const textoSuave = (el, t) => {
    if (!el) return;
    el.classList.add('sale');
    setTimeout(() => { el.textContent = t; el.classList.remove('sale'); el.classList.add('entra'); void el.offsetWidth; el.classList.remove('entra'); }, ms('--duration-quick'));
  };
  const valido = inp => {
    const v = inp.value.trim();
    if (!v) return !inp.required;
    if (inp.type === 'email') return correoValido(v);
    if (inp.dataset.tipo === 'tel' || inp.type === 'tel') return telValido(v);
    return true;
  };
  // Cada campo vive en .t-input-wrap (formularios completos) o en .celda (barra de cotización).
  const contenedor = inp => inp.closest('.t-input-wrap, .celda');
  const marcar = (inp, msg) => {
    const c = contenedor(inp); if (!c) return;
    c.classList.add('is-error'); inp.setAttribute('aria-invalid', 'true');
    const m = $('.t-error-msg', c); if (m) m.textContent = msg || inp.dataset.msg || 'Revisa este campo.';
    sacudir(inp.closest('.celda') || inp);
  };
  const limpiar = inp => {
    const c = contenedor(inp); if (!c) return;
    c.classList.remove('is-error'); inp.removeAttribute('aria-invalid');
    const m = $('.t-error-msg', c); if (m) m.textContent = '';
  };

  $$('form[data-envio]').forEach(form => {
    const caja = form.parentElement;
    const enviar = $('button[type="submit"]', form);
    const etiqueta = $('.letra', enviar);
    const textoBoton = etiqueta ? etiqueta.textContent : '';
    const aviso = $('.aviso', form);
    const errBarra = $('#' + (form.dataset.errores || '_'));
    const estado = $('.estado', caja);
    const exito = $('.exito', caja);
    const grupo = $('.grupo', form);
    const campos = $$('input:not([type="radio"]):not([name="sitio_web"]), textarea', form);

    campos.forEach(i => {
      i.addEventListener('input', () => valido(i) && limpiar(i));
      i.addEventListener('blur', () => i.value.trim() && !valido(i) && marcar(i));
    });
    if (grupo) grupo.addEventListener('change', () => { grupo.classList.remove('is-error'); $('.t-error-msg', grupo).textContent = ''; });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (aviso) aviso.hidden = true;
      const malos = campos.filter(i => !valido(i));
      malos.forEach(i => marcar(i));
      const sinSeguro = grupo && !$('input[name="seguro"]:checked', form);
      if (sinSeguro) { grupo.classList.add('is-error'); $('.t-error-msg', grupo).textContent = 'Elige el seguro que te interesa.'; sacudir($('.opciones', grupo)); }
      if (errBarra) errBarra.textContent = malos.length ? 'Revisa los campos marcados: ' + malos.map(i => $(`label[for="${i.id}"]`).textContent.toLowerCase()).join(' y ') + '.' : '';
      if (malos.length || sinSeguro) {
        (malos[0] || $('input[name="seguro"]', form)).focus();
        if (estado) estado.textContent = 'Revisa los campos marcados.';
        return;
      }

      const datos = Object.fromEntries(new FormData(form).entries());
      datos.tipo = datos.tipo || form.dataset.envio;
      datos.pagina = location.origin + location.pathname;
      enviar.disabled = true; textoSuave(etiqueta, 'Enviando…');
      if (estado) estado.textContent = 'Enviando.';

      let ok = false, mensaje = '', camposServidor = [];
      // Tope de 15 s: si la red se queda colgada, el botón vuelve y se ofrece WhatsApp.
      const corte = new AbortController();
      const reloj = setTimeout(() => corte.abort(), 15000);
      try {
        const r = await fetch('/api/contacto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos), signal: corte.signal });
        const j = await r.json().catch(() => ({}));
        ok = r.ok && j.success; mensaje = j.message || ''; camposServidor = Array.isArray(j.fields) ? j.fields : [];
      } catch (err) {
        mensaje = err.name === 'AbortError' ? 'No pudimos confirmar el envío. Intenta de nuevo o escríbenos por WhatsApp.' : '';
      } finally { clearTimeout(reloj); }
      // Errores por campo que devuelve el servidor: se marcan en el control correspondiente.
      enviar.disabled = false;
      // Solo controles individuales: los grupos de radios (RadioNodeList) y los ocultos no se marcan.
      const conError = camposServidor.map(c => form.elements[c]).filter(el => el instanceof HTMLElement && el.type !== 'hidden' && el.type !== 'radio');
      conError.forEach(el => marcar(el));
      if (conError.length) conError[0].focus();

      enviar.disabled = false;
      if (!ok) {
        textoSuave(etiqueta, textoBoton);
        const txt = mensaje || 'No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp.';
        if (aviso) { $('.aviso-txt', aviso).textContent = txt; aviso.hidden = false; }
        if (errBarra) errBarra.textContent = txt;
        if (estado) estado.textContent = '';
        return;
      }
      window.dataLayer = window.dataLayer || [];
      // Desgravamen se mide solo como "personas": el tipo de caso sugiere datos de salud y no va a la analítica.
      const tipoMedido = datos.tipo === 'desgravamen' ? 'personas' : datos.tipo;
      window.dataLayer.push({ event: 'formulario_enviado', form_tipo: tipoMedido, form_seguro: datos.seguro || '' });
      if (estado) estado.textContent = '';
      if (form.dataset.envio === 'cotizacion' && caja.classList.contains('caja')) {
        caja.classList.add('enviado'); const okMsg = $('.ok', caja); okMsg.hidden = false; okMsg.focus();
        return;
      }
      form.hidden = true;
      if (exito) {
        exito.hidden = false;
        const check = $('.t-success-check', exito); if (check) check.dataset.state = 'in';
        $('h3', exito).focus();
      }
    });
  });

  /* GSAP: entrada sobria y revelados una sola vez */
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add({ mover: '(prefers-reduced-motion: no-preference)', angosto: '(max-width: 560px)' }, ctx => {
    const { mover, angosto } = ctx.conditions;
    if (!mover) return;
    if ($('.panel')) {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.panel > img', { scale: 1.08, duration: 1.4, ease: 'power2.out' }, 0)
        .from('.panel .txt > *', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.07 }, 0.1)
        .from('.barra .caja', { y: 24, duration: 0.7 }, 0.3);
    }
    const revelar = $$('.rapido, .tarjeta, .dato, .paso, .cabeza > *, .contacto .lado > *, .bloque, .pregunta');
    if (revelar.length) ScrollTrigger.batch(revelar, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.from(els, { autoAlpha: 0, y: 24, duration: 0.7, ease: 'power3.out', stagger: 0.06, overwrite: true })
    });
    if ($('.trazo')) gsap.from('.trazo', { [angosto ? 'scaleY' : 'scaleX']: 0, duration: 1.1, ease: 'power2.inOut', scrollTrigger: { trigger: '.pasos-caja', start: 'top 80%', once: true } });
  });
})();

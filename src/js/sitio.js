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
    else if (select && [...select.options].some(o => o.value === valor)) { select.value = valor; select.dispatchEvent(new Event('change', { bubbles: true })); }
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
      // Seguro de auto: el Lead va a Meta con el mismo id desde el navegador y desde el servidor.
      // Sin consentimiento de cookies newEventId() no devuelve nada y no se mide.
      const idMeta = datos.tipo === 'auto' && window.mercurialMeta ? window.mercurialMeta.newEventId() : undefined;
      if (idMeta) datos.meta_event_id = idMeta;
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
      if (idMeta) window.mercurialMeta.trackBrowser('Lead', { content_name: 'Seguro de Auto' }, idMeta);
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

  /* Desplegables con el diseño del sitio. Con mouse, el <select> queda oculto y sigue siendo la fuente del valor
     (formularios y validaciones no cambian). En pantallas táctiles se deja el selector nativo del teléfono. */
  if (matchMedia('(pointer: fine)').matches) {
    let abierto = null;
    const nuevoId = (() => { let n = 0; return () => 'sel-op-' + (++n); })();
    $$('select').forEach(sel => {
      const btn = document.createElement('button');
      const lista = document.createElement('ul');
      const clases = [...sel.classList].filter(c => c !== 'is-placeholder').join(' ');
      btn.type = 'button';
      btn.className = ('sel-btn ' + clases).trim();
      btn.setAttribute('role', 'combobox');
      btn.setAttribute('aria-haspopup', 'listbox');
      btn.setAttribute('aria-expanded', 'false');
      lista.className = 'sel-lista';
      lista.setAttribute('role', 'listbox');
      lista.id = nuevoId();
      lista.hidden = true;
      btn.setAttribute('aria-controls', lista.id);
      const etiqueta = sel.id && $(`label[for="${sel.id}"]`);
      sel.classList.add('sel-oculto');
      sel.tabIndex = -1;
      sel.setAttribute('aria-hidden', 'true');
      sel.after(btn);
      document.body.appendChild(lista);

      const opciones = () => [...sel.options].filter(o => !o.disabled && !o.hidden && o.value !== '');
      const pintar = () => {
        const o = sel.options[sel.selectedIndex];
        btn.textContent = o ? o.textContent : '';
        btn.classList.toggle('is-ph', !sel.value);
        btn.disabled = sel.disabled;
        btn.setAttribute('aria-label', (etiqueta ? etiqueta.textContent.trim() + ': ' : '') + btn.textContent);
      };
      let activa = -1;
      const items = () => [...lista.children];
      const marcar = i => {
        activa = i;
        items().forEach((li, n) => li.classList.toggle('is-activa', n === i));
        const li = items()[i];
        if (li) { btn.setAttribute('aria-activedescendant', li.id); li.scrollIntoView({ block: 'nearest' }); }
      };
      const ubicar = () => {
        const r = btn.getBoundingClientRect();
        const caja = (btn.closest('.celda, .cp-uf') || btn).getBoundingClientRect();
        const abajo = innerHeight - r.bottom - 12, arriba = r.top - 12;
        const alto = Math.min(lista.scrollHeight, 300);
        lista.style.left = caja.left + 'px';
        lista.style.width = Math.max(caja.width, 220) + 'px';
        lista.style.maxHeight = Math.max(abajo >= alto || abajo >= arriba ? abajo : arriba, 140) + 'px';
        if (abajo >= alto || abajo >= arriba) { lista.style.top = (r.bottom + 8) + 'px'; lista.style.bottom = 'auto'; }
        else { lista.style.top = 'auto'; lista.style.bottom = (innerHeight - r.top + 8) + 'px'; }
      };
      const cerrar = () => {
        if (abierto !== cerrar) return;
        abierto = null;
        lista.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        btn.removeAttribute('aria-activedescendant');
      };
      const elegir = o => {
        if (sel.value !== o.value) {
          sel.value = o.value;
          sel.dispatchEvent(new Event('input', { bubbles: true }));
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
        pintar();
        cerrar();
        btn.focus();
      };
      const abrir = () => {
        if (btn.disabled) return;
        if (abierto) abierto();
        lista.textContent = '';
        const ops = opciones();
        ops.forEach(o => {
          const li = document.createElement('li');
          li.id = nuevoId();
          li.setAttribute('role', 'option');
          li.setAttribute('aria-selected', String(o.value === sel.value));
          li.textContent = o.textContent;
          li.addEventListener('mousedown', e => e.preventDefault());
          li.addEventListener('click', () => elegir(o));
          li.addEventListener('mousemove', () => { const i = items().indexOf(li); if (i !== activa) marcar(i); });
          lista.appendChild(li);
        });
        lista.hidden = false;
        abierto = cerrar;
        btn.setAttribute('aria-expanded', 'true');
        ubicar();
        marcar(Math.max(ops.findIndex(o => o.value === sel.value), 0));
      };
      btn.addEventListener('click', () => (abierto === cerrar ? cerrar() : abrir()));
      btn.addEventListener('keydown', e => {
        const estaAbierto = abierto === cerrar;
        if (!estaAbierto) {
          if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); abrir(); }
          return;
        }
        const n = items().length;
        if (e.key === 'ArrowDown') { e.preventDefault(); marcar((activa + 1) % n); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); marcar((activa - 1 + n) % n); }
        else if (e.key === 'Home') { e.preventDefault(); marcar(0); }
        else if (e.key === 'End') { e.preventDefault(); marcar(n - 1); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(opciones()[activa]); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrar(); }
        else if (e.key === 'Tab') cerrar();
        else if (e.key.length === 1) {
          const i = opciones().findIndex(o => o.textContent.trim().toLowerCase().startsWith(e.key.toLowerCase()));
          if (i >= 0) marcar(i);
        }
      });
      sel.addEventListener('focus', () => btn.focus());
      sel.addEventListener('change', pintar);
      if (sel.form) sel.form.addEventListener('reset', () => setTimeout(pintar));
      new MutationObserver(pintar).observe(sel, { childList: true, attributes: true, attributeFilter: ['disabled'] });
      document.addEventListener('mousedown', e => { if (!lista.contains(e.target) && !btn.contains(e.target)) cerrar(); });
      addEventListener('scroll', () => { if (abierto === cerrar) ubicar(); }, { passive: true, capture: true });
      addEventListener('resize', cerrar);
      pintar();
    });
  }

  /* GSAP: entrada sobria y revelados al bajar y al subir */
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add({ mover: '(prefers-reduced-motion: no-preference)', angosto: '(max-width: 560px)' }, ctx => {
    const { mover, angosto } = ctx.conditions;
    if (!mover) return;
    if ($('.panel')) {
      const entrada = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.panel > img', { scale: 1.08, duration: 1.4, ease: 'power2.out' }, 0)
        .from('.panel .txt > *', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.07 }, 0.1)
        .from('.barra .caja', { y: 24, duration: 0.7 }, 0.3);
      ScrollTrigger.create({ trigger: '.panel', start: 'top bottom', end: 'bottom top', onEnterBack: () => entrada.restart() });
    }
    const revelar = $$('.rapido, .tarjeta, .dato, .paso, .cabeza > *, .contacto .lado > *, .bloque, .pregunta');
    // Al bajar entran desde abajo y al subir desde arriba. Se ocultan solo cuando salen por abajo: así el
    // revelado siguiente no muestra el elemento completo un instante antes de animarlo.
    const entrar = (els, desde) => gsap.fromTo(els, { autoAlpha: 0, y: desde }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, overwrite: true });
    if (revelar.length) ScrollTrigger.batch(revelar, {
      start: 'top 90%', end: 'bottom top',
      onEnter: els => entrar(els, 24),
      onEnterBack: els => entrar([...els].reverse(), -24),
      onLeaveBack: els => { gsap.killTweensOf(els); gsap.set(els, { autoAlpha: 0 }); }
    });
    if ($('.trazo')) gsap.from('.trazo', { [angosto ? 'scaleY' : 'scaleX']: 0, duration: 1.1, ease: 'power2.inOut', scrollTrigger: { trigger: '.pasos-caja', start: 'top 80%', end: 'bottom top', toggleActions: 'play none restart reverse' } });
  });
})();

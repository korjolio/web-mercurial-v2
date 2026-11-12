/* Banners rotativos de la portada (sección .banners de index.html).
   Cada <article class="bn"> es un banner; este script solo los hace rotar. Sin JavaScript quedan en una
   fila que se puede deslizar. Rota cada 7 s; se detiene con el mouse encima, con el foco dentro, con el
   botón de pausa, fuera de pantalla y cuando el visitante pidió menos movimiento. */
(() => {
  const sec = document.querySelector('.banners');
  if (!sec) return;
  const pista = sec.querySelector('.bn-pista');
  const slides = [...pista.querySelectorAll('.bn')];
  if (slides.length < 2) return;
  const puntos = sec.querySelector('.bn-puntos');
  const pausa = sec.querySelector('.bn-pausa');
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INTERVALO = 7000;
  let actual = 0, pausado = quieto, encima = false, visible = false, reloj = null;

  const botones = slides.map((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Banner ${i + 1} de ${slides.length}: ${s.dataset.nombre || ''}`.trim());
    b.addEventListener('click', () => ir(i));
    puntos.appendChild(b);
    s.setAttribute('aria-roledescription', 'diapositiva');
    s.setAttribute('aria-label', `${i + 1} de ${slides.length}: ${s.dataset.nombre || ''}`);
    return b;
  });
  const marcar = () => botones.forEach((b, i) => { if (i === actual) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
  function ir(i) {
    actual = (i + slides.length) % slides.length;
    pista.scrollTo({ left: slides[actual].offsetLeft, behavior: quieto ? 'auto' : 'smooth' });
    marcar(); programar();
  }
  function programar() {
    clearInterval(reloj);
    if (pausado || encima || !visible || document.hidden) return;
    reloj = setInterval(() => ir(actual + 1), INTERVALO);
  }
  const pintarPausa = () => {
    pausa.setAttribute('aria-label', pausado ? 'Reanudar la rotación de banners' : 'Pausar la rotación de banners');
    pausa.classList.toggle('en-pausa', pausado);
  };

  // Si el visitante desliza con el dedo o el trackpad, el punto activo sigue al banner visible.
  let cuadro = 0;
  pista.addEventListener('scroll', () => {
    cancelAnimationFrame(cuadro);
    cuadro = requestAnimationFrame(() => {
      const i = slides.reduce((m, s, k) => Math.abs(s.offsetLeft - pista.scrollLeft) < Math.abs(slides[m].offsetLeft - pista.scrollLeft) ? k : m, 0);
      if (i !== actual) { actual = i; marcar(); }
    });
  }, { passive: true });
  sec.addEventListener('mouseenter', () => { encima = true; programar(); });
  sec.addEventListener('mouseleave', () => { encima = false; programar(); });
  sec.addEventListener('focusin', () => { encima = true; programar(); });
  sec.addEventListener('focusout', e => { if (!sec.contains(e.relatedTarget)) { encima = false; programar(); } });
  sec.querySelector('.bn-ant').addEventListener('click', () => ir(actual - 1));
  sec.querySelector('.bn-sig').addEventListener('click', () => ir(actual + 1));
  pausa.addEventListener('click', () => { pausado = !pausado; pintarPausa(); programar(); });
  document.addEventListener('visibilitychange', programar);
  new IntersectionObserver(es => { visible = es[0].isIntersecting; programar(); }, { threshold: 0.5 }).observe(sec);

  sec.classList.add('listo');
  marcar(); pintarPausa();
})();

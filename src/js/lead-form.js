document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect (mismo comportamiento que index.html)
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 20px -5px rgba(0,0,0,0.1)';
                navbar.style.backgroundColor = 'rgba(255,255,255, 0.98)';
                navbar.style.height = '75px';
            } else {
                navbar.style.boxShadow = 'none';
                navbar.style.backgroundColor = 'rgba(255,255,255, 0.95)';
                navbar.style.height = '85px';
            }
        });
    }

    // 2. Smooth Scroll con offset de navbar fijo
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 85;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 3. Intersection Observer Animaciones (Fade In Elements)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-up');

    fadeElements.forEach(el => {
        el.style.animation = 'none';
        el.style.opacity = '0';
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;

                if (el.classList.contains('fade-in')) {
                    el.style.animation = `fadeIn 0.8s ease-out forwards`;
                } else if (el.classList.contains('fade-in-up')) {
                    const delay = el.style.animationDelay || '0s';
                    el.style.animation = `fadeInUp 0.8s ease-out ${delay} forwards`;
                }
                obs.unobserve(el);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // 4. Lead Form: captura de tracking + submit + modal
    const cluster = window.MERCURIAL_LEAD_CLUSTER;

    const params = new URLSearchParams(window.location.search);
    const gclid = params.get('gclid') || '';
    const utm_source = params.get('utm_source') || '';
    const utm_medium = params.get('utm_medium') || '';
    const utm_campaign = params.get('utm_campaign') || '';
    const utm_content = params.get('utm_content') || '';
    const utm_term = params.get('utm_term') || '';

    const leadForm = document.getElementById('leadForm');
    const submitBtn = document.getElementById('lead_submit_btn');

    // Modal (mismo patrón que script.js)
    const responseModal = document.getElementById('responseModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');

    function showResponseModal(isSuccess, title, message) {
        modalTitle.textContent = title;
        modalBody.textContent = message;

        modalIcon.innerHTML = '';
        modalIcon.className = 'modal-icon ' + (isSuccess ? 'success' : 'error');

        const svg = isSuccess
            ? `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
            : `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

        modalIcon.innerHTML = svg;
        responseModal.classList.add('active');
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            responseModal.classList.remove('active');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === responseModal) {
            responseModal.classList.remove('active');
        }
    });

    if (leadForm) {
        const originalBtnText = submitBtn.textContent;

        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const firstName = document.getElementById('lead_firstname').value;
            const lastName = document.getElementById('lead_lastname').value;
            const email = document.getElementById('lead_email').value;
            const phone = document.getElementById('lead_phone').value;
            const company = document.getElementById('lead_company').value;
            const rut = document.getElementById('lead_rut').value;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            const payload = {
                firstName, lastName, email, phone, company, rut,
                cluster_source: cluster,
                gclid, utm_source, utm_medium, utm_campaign, utm_content, utm_term
            };

            try {
                const response = await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Error al procesar la solicitud');
                }

                leadForm.reset();
                showResponseModal(
                    true,
                    'Solicitud Recibida',
                    'Un ejecutivo te contactará en 1-2 horas para iniciar el análisis técnico de tu caso.'
                );

                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({ event: 'lead_form_submit', form_cluster: cluster });

            } catch (error) {
                const displayMsg = (error.message || '').includes('fetch')
                    ? 'Hubo un error de conexión. Por favor, intenta vía WhatsApp.'
                    : (error.message || 'Hubo un error al procesar tu solicitud. Intenta vía WhatsApp.');

                showResponseModal(false, 'Error en el Envío', displayMsg);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
});

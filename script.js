document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    
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

    // 2. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const closeBtn = document.querySelector('.close-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');

    function toggleMenu() {
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    if (mobileBtn && closeBtn && overlay) {
        mobileBtn.addEventListener('click', toggleMenu);
        closeBtn.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
    }

    // Cerrar menú al hacer clic en un enlace de navegación
    document.querySelectorAll('.mobile-nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Cerrar menú si la pantalla crece
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 900 && mobileMenu.classList.contains('active')) {
            toggleMenu();
        }
    });

    // 3. Smooth Scrolling for Anchor Links (Ajuste para navbar height)
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

    // 4. Dynamic Footer Year
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 5. Intersection Observer Animaciones (Fade In Elements)
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

    // 6. HubSpot Form Integration with Modal
    const hubspotForm = document.getElementById('hubspotForm');
    const submitBtn = document.getElementById('hs_submit_btn');
    
    // Modal Elements
    const responseModal = document.getElementById('responseModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');

    function showResponseModal(isSuccess, title, message) {
        modalTitle.textContent = title;
        modalBody.textContent = message;
        
        // Reset and set icon
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

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === responseModal) {
            responseModal.classList.remove('active');
        }
    });

    if (hubspotForm) {
        hubspotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Recoger datos
            const name = document.getElementById('hs_name').value;
            const company = document.getElementById('hs_company').value;
            const rut = document.getElementById('hs_rut').value;
            const phone = document.getElementById('hs_phone').value;
            const email = document.getElementById('hs_email').value;
            const interest = document.getElementById('hs_interest').value;
            const expiry = document.getElementById('hs_expiry').value;
            
            // Separar nombre y apellido (muy básico)
            const nameParts = name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Procesando Análisis...';

            const payload = {
                firstName, lastName, company, rut, phone, email, interest, expiry,
                source: "Landing Page Mercurial 2.0 B2B"
            };

            try {
                const response = await fetch('http://localhost:3001/api/hubspot/auditoria', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Error al procesar la solicitud');
                }
                
                hubspotForm.reset();
                showResponseModal(
                    true, 
                    'Solicitud Recibida', 
                    'Su requerimiento técnico ha sido capturado. Un Senior Risk Advisor le contactará para iniciar el análisis bajo reserva de confidencialidad.'
                );

            } catch (error) {
                
                const displayMsg = error.message.includes('fetch') 
                    ? 'Hubo un error de conexión segura. Por favor, intente vía WhatsApp empresarial.' 
                    : error.message;

                showResponseModal(false, 'Error en el Envio', displayMsg);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Solicitar Análisis de Riesgo';
            }
        });
    }
});

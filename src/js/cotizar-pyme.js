/**
 * Formulario /cotizar-pyme: antecedentes para cotizar un Seguro Pyme (multiriesgo).
 * No pasa por HubSpot: envía a POST /api/cotizaciones/pyme (server.js), que reenvía al CRM
 * propio (app.mercurial.cl). Los catálogos vienen de src/data/pyme-catalogos.js (mismas
 * listas que el cotizador de ANS) y las comunas/actividades de src/data/*.json.
 */
document.addEventListener('DOMContentLoaded', () => {
    const CAT = window.PYME_CATALOGOS;
    const form = document.getElementById('pymeForm');
    const submitBtn = document.getElementById('pyme_submit_btn');
    const formError = document.getElementById('formError');
    if (!form || !CAT) return;

    // --- Navbar: mismo efecto de scroll que las otras landings ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 50;
            navbar.style.boxShadow = scrolled ? '0 4px 20px -5px rgba(0,0,0,0.1)' : 'none';
            navbar.style.backgroundColor = scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)';
            navbar.style.height = scrolled ? '75px' : '85px';
        });
    }

    // --- Tracking (UTM / gclid) ---
    const params = new URLSearchParams(window.location.search);
    const tracking = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'].forEach((k) => {
        const v = params.get(k);
        if (v) tracking[k] = v;
    });
    tracking.pageUrl = window.location.href.split('#')[0];

    // --- Utilidades ---
    const norm = (s) => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const fieldOf = (el) => el.closest('.cp-field');
    const setError = (el, msg) => {
        const f = fieldOf(el);
        if (!f) return;
        f.classList.add('has-error');
        if (msg) { const e = f.querySelector('.cp-error'); if (e) e.textContent = msg; }
    };
    const clearError = (el) => { const f = fieldOf(el); if (f) f.classList.remove('has-error'); };
    const isVisible = (el) => !!(el && el.offsetParent !== null && !el.closest('.hidden'));

    // --- Catálogos → selects ---
    document.querySelectorAll('select[data-catalogo]').forEach((sel) => {
        const list = CAT[sel.dataset.catalogo] || [];
        const def = sel.dataset.default;
        sel.innerHTML = '';
        if (def === undefined) {
            const ph = document.createElement('option');
            ph.value = ''; ph.textContent = 'Selecciona…'; ph.disabled = true; ph.selected = true;
            sel.appendChild(ph);
            sel.classList.add('is-placeholder');
            sel.addEventListener('change', () => sel.classList.toggle('is-placeholder', !sel.value));
        }
        list.forEach((v) => {
            const o = document.createElement('option');
            o.value = String(v);
            o.textContent = String(v);
            if (def !== undefined && String(v) === String(def)) o.selected = true;
            sel.appendChild(o);
        });
    });

    // --- Catálogos → casillas de seguridad ---
    document.querySelectorAll('.cp-checks[data-catalogo]').forEach((box) => {
        const list = CAT[box.dataset.catalogo] || [];
        const name = box.dataset.name;
        box.innerHTML = '';
        list.forEach((txt, i) => {
            const id = `${name}_${i}`;
            const label = document.createElement('label');
            label.setAttribute('for', id);
            const input = document.createElement('input');
            input.type = 'checkbox'; input.name = name; input.value = txt; input.id = id;
            label.appendChild(input);
            label.appendChild(document.createTextNode(txt));
            box.appendChild(label);
        });
    });

    // --- Tipo de persona ---
    const personaInputs = form.querySelectorAll('input[name="tipo_persona"]');
    const applyPersona = () => {
        const value = form.querySelector('input[name="tipo_persona"]:checked').value;
        document.querySelectorAll('[data-persona]').forEach((el) => {
            const show = el.dataset.persona === value;
            el.classList.toggle('hidden', !show);
            el.querySelectorAll('input').forEach((i) => { i.required = show && el.querySelector('.req') !== null; if (!show) clearError(i); });
        });
    };
    personaInputs.forEach((i) => i.addEventListener('change', applyPersona));
    applyPersona();

    // --- RUT ---
    const rutInput = document.getElementById('rut');
    const cleanRut = (v) => (v || '').replace(/[^0-9kK]/g, '').toUpperCase();
    const formatRut = (v) => {
        const c = cleanRut(v);
        if (c.length < 2) return c;
        const body = c.slice(0, -1), dv = c.slice(-1);
        return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
    };
    const validRut = (v) => {
        const c = cleanRut(v);
        if (c.length < 8 || c.length > 9) return false;
        const body = c.slice(0, -1), dv = c.slice(-1);
        if (!/^\d+$/.test(body)) return false;
        let sum = 0, mul = 2;
        for (let i = body.length - 1; i >= 0; i--) { sum += parseInt(body[i], 10) * mul; mul = mul === 7 ? 2 : mul + 1; }
        const res = 11 - (sum % 11);
        const expected = res === 11 ? '0' : res === 10 ? 'K' : String(res);
        return expected === dv;
    };
    rutInput.addEventListener('blur', () => { if (rutInput.value) rutInput.value = formatRut(rutInput.value); });

    // --- Combobox genérico (comuna, actividad) ---
    function makeCombo({ inputId, listId, getItems, renderItem, otherLabel, onSelect }) {
        const input = document.getElementById(inputId);
        const list = document.getElementById(listId);
        const wrap = input.closest('.cp-combo');
        let items = [];
        let active = -1;
        let selected = null;

        const close = () => { wrap.classList.remove('open'); input.setAttribute('aria-expanded', 'false'); active = -1; };
        const open = () => { wrap.classList.add('open'); input.setAttribute('aria-expanded', 'true'); };
        const choose = (item) => {
            selected = item;
            input.value = item.label;
            input.dataset.selected = item.value;
            clearError(input);
            close();
            if (onSelect) onSelect(item);
        };
        const render = () => {
            const q = norm(input.value);
            const all = getItems();
            let matches = q ? all.filter((it) => it.search.includes(q)) : all.slice(0, 12);
            matches = matches.slice(0, 12);
            items = matches.slice();
            list.innerHTML = '';
            if (!matches.length) {
                const li = document.createElement('li');
                li.className = 'cp-combo-empty'; li.textContent = 'Sin coincidencias';
                list.appendChild(li);
            }
            matches.forEach((it, idx) => {
                const li = document.createElement('li');
                li.setAttribute('role', 'option');
                li.innerHTML = renderItem(it);
                li.addEventListener('mousedown', (e) => { e.preventDefault(); choose(it); });
                li.dataset.idx = idx;
                list.appendChild(li);
            });
            if (otherLabel) {
                const other = { label: otherLabel, value: otherLabel, search: '', other: true };
                items.push(other);
                const li = document.createElement('li');
                li.className = 'cp-combo-other'; li.setAttribute('role', 'option'); li.textContent = otherLabel;
                li.addEventListener('mousedown', (e) => { e.preventDefault(); choose(other); });
                list.appendChild(li);
            }
            open();
        };
        const highlight = () => {
            list.querySelectorAll('[role="option"]').forEach((li, i) => li.setAttribute('aria-selected', i === active ? 'true' : 'false'));
            const el = list.querySelectorAll('[role="option"]')[active];
            if (el) el.scrollIntoView({ block: 'nearest' });
        };
        input.addEventListener('input', () => { selected = null; delete input.dataset.selected; render(); });
        input.addEventListener('focus', render);
        input.addEventListener('keydown', (e) => {
            if (!wrap.classList.contains('open')) { if (e.key === 'ArrowDown') render(); return; }
            if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, items.length - 1); highlight(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); highlight(); }
            else if (e.key === 'Enter') { if (active >= 0 && items[active]) { e.preventDefault(); choose(items[active]); } }
            else if (e.key === 'Escape') close();
        });
        input.addEventListener('blur', () => {
            setTimeout(() => {
                close();
                if (!selected && input.value) {
                    // Si escribió exactamente el nombre de un ítem, aceptarlo.
                    const exact = getItems().find((it) => norm(it.label) === norm(input.value));
                    if (exact) choose(exact);
                }
            }, 120);
        });
        return { input, getSelected: () => selected };
    }

    let comunas = [];
    let actividades = [];
    const comboComuna = makeCombo({
        inputId: 'comuna', listId: 'comuna_list',
        getItems: () => comunas,
        renderItem: (it) => `${it.label}<small>${it.provincia}, ${it.region}</small>`
    });
    const actividadOtraField = document.getElementById('field_actividad_otra');
    const actividadOtraInput = document.getElementById('actividad_otra');
    const comboActividad = makeCombo({
        inputId: 'actividad', listId: 'actividad_list',
        getItems: () => actividades,
        renderItem: (it) => it.label,
        otherLabel: CAT.actividadOtra,
        onSelect: (it) => {
            actividadOtraField.classList.toggle('hidden', !it.other);
            actividadOtraInput.required = !!it.other;
            if (!it.other) { actividadOtraInput.value = ''; clearError(actividadOtraInput); }
        }
    });

    Promise.all([
        fetch('src/data/comunas.json').then((r) => r.json()),
        fetch('src/data/ans-pyme-actividades.json').then((r) => r.json())
    ]).then(([c, a]) => {
        comunas = c.map((x) => ({ label: x.comuna, value: x.comuna, provincia: x.provincia, region: x.region, search: norm(`${x.comuna} ${x.region}`) }));
        actividades = a.map((x) => ({ label: x, value: x, search: norm(x) }));
    }).catch(() => {
        // Sin catálogos remotos el cliente aún puede escribir; el servidor valida.
        console.error('[cotizar-pyme] No se pudieron cargar comunas/actividades.');
    });

    // --- Modal ---
    const responseModal = document.getElementById('responseModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');
    function showModal(ok, title, message) {
        modalTitle.textContent = title;
        modalBody.textContent = message;
        modalIcon.className = 'modal-icon ' + (ok ? 'success' : 'error');
        modalIcon.innerHTML = ok
            ? '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        responseModal.classList.add('active');
    }
    closeModalBtn.addEventListener('click', () => responseModal.classList.remove('active'));
    window.addEventListener('click', (e) => { if (e.target === responseModal) responseModal.classList.remove('active'); });

    // --- Lectura de valores ---
    const val = (id) => (document.getElementById(id).value || '').trim();
    const intOrNull = (id) => {
        const raw = val(id);
        if (raw === '') return null;
        const n = Number(raw);
        return Number.isInteger(n) && n >= 0 ? n : NaN;
    };
    const radio = (name) => form.querySelector(`input[name="${name}"]:checked`).value;
    const checks = (name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((i) => i.value);

    // --- Validación ---
    function validate() {
        let first = null;
        const fail = (el, msg) => { setError(el, msg); if (!first) first = el; };
        form.querySelectorAll('.has-error').forEach((f) => f.classList.remove('has-error'));

        form.querySelectorAll('input[required], select[required], textarea[required]').forEach((el) => {
            if (!isVisible(el)) return;
            if (el.type === 'radio') return;
            const v = (el.value || '').trim();
            if (!v) { fail(el); return; }
            if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) fail(el);
            if (el.type === 'number') {
                const n = Number(v);
                const min = el.min !== '' ? Number(el.min) : -Infinity;
                const max = el.max !== '' ? Number(el.max) : Infinity;
                if (!Number.isInteger(n) || n < min || n > max) fail(el);
            }
        });
        if (val('rut') && !validRut(val('rut'))) fail(rutInput);
        const tel = val('c_telefono').replace(/[^\d]/g, '');
        if (val('c_telefono') && tel.length < 8) fail(document.getElementById('c_telefono'), 'Ingresa un celular válido (al menos 8 dígitos).');
        if (!comboComuna.getSelected()) fail(comboComuna.input);
        if (!comboActividad.getSelected()) fail(comboActividad.input);

        ['m_edificio', 'm_contenido', 'm_mercaderias', 'm_electronicos', 'm_maquinaria', 'trabajadores', 'x_pxp', 'x_mejoras'].forEach((id) => {
            const el = document.getElementById(id);
            if (Number.isNaN(intOrNull(id))) fail(el);
        });
        const montos = ['m_edificio', 'm_contenido', 'm_mercaderias', 'm_electronicos', 'm_maquinaria'].map(intOrNull);
        const hayMonto = montos.some((n) => typeof n === 'number' && n > 0);
        if (!hayMonto) {
            const el = document.getElementById('m_contenido');
            fail(el, 'Indica al menos un monto: edificio, instalaciones y contenido, mercaderías, equipos o maquinaria.');
        }
        return first;
    }

    // --- Payload (contrato con server.js y el CRM) ---
    function buildPayload() {
        const personType = radio('tipo_persona');
        const actividadSel = comboActividad.getSelected();
        const payload = {
            product: 'pyme',
            contact: { firstName: val('c_nombre'), lastName: val('c_apellido'), email: val('c_email'), phone: val('c_telefono') },
            holder: { personType, rut: formatRut(val('rut')) },
            location: {
                locationType: val('tipo_ubicacion'),
                address: val('direccion'),
                unit: val('unidad') || undefined,
                comuna: comboComuna.getSelected().value,
                region: comboComuna.getSelected().region
            },
            building: {
                wallMaterial: val('muro'),
                roofMaterial: val('techo'),
                buildingAge: val('antiguedad'),
                floors: Number(val('pisos')),
                activity: actividadSel.other ? CAT.actividadOtra : actividadSel.value,
                activityOther: actividadSel.other ? val('actividad_otra') : undefined,
                nearSea: radio('cerca_mar') === 'si',
                nearRiver: radio('cerca_rio') === 'si'
            },
            amounts: {
                building: intOrNull('m_edificio') ?? undefined,
                contents: intOrNull('m_contenido') ?? undefined,
                goods: intOrNull('m_mercaderias') ?? undefined,
                electronics: intOrNull('m_electronicos') ?? undefined,
                machinery: intOrNull('m_maquinaria') ?? undefined,
                liability: Number(val('m_rc')),
                glass: Number(val('m_cristales')),
                workers: intOrNull('trabajadores') ?? undefined,
                accidentalDeath: Number(val('m_accidentes'))
            },
            extras: {
                cashInSafe: Number(val('x_dinero')),
                valuesTransit: Number(val('x_remesa')),
                politicalRisks: val('x_politicos'),
                indemnityPeriod: val('x_periodo'),
                businessInterruptionAnnual: intOrNull('x_pxp') ?? undefined,
                foodLiability: val('x_alimentos'),
                machineryBreakdown: val('x_averia'),
                terrorism: val('x_terrorismo'),
                tenantImprovements: intOrNull('x_mejoras') ?? undefined
            },
            security: { fire: checks('seg_incendio'), theft: checks('seg_robo') },
            comments: val('comentarios') || undefined,
            tracking
        };
        if (personType === 'juridica') payload.holder.businessName = val('razon_social');
        else {
            payload.holder.firstName = val('p_nombres');
            payload.holder.lastName = val('p_apellido1');
            payload.holder.secondLastName = val('p_apellido2') || undefined;
        }
        return payload;
    }

    // --- Envío ---
    const newKey = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    let idempotencyKey = newKey();
    const originalBtnText = submitBtn.textContent;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.classList.remove('show');
        const firstInvalid = validate();
        if (firstInvalid) {
            formError.textContent = 'Revisa los campos marcados en rojo.';
            formError.classList.add('show');
            const det = firstInvalid.closest('details');
            if (det) det.open = true;
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => firstInvalid.focus({ preventScroll: true }), 400);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';
        try {
            const response = await fetch('/api/cotizaciones/pyme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
                body: JSON.stringify(buildPayload())
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || 'Error al procesar la solicitud');

            idempotencyKey = newKey();
            form.reset();
            applyPersona();
            document.querySelectorAll('select[data-catalogo]').forEach((s) => s.dispatchEvent(new Event('change')));
            delete comboComuna.input.dataset.selected;
            delete comboActividad.input.dataset.selected;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showModal(true, 'Antecedentes recibidos', 'Gracias. Un ejecutivo de Mercurial revisará la información y te contactará con la cotización.');
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'cotizacion_pyme_submit', form_cluster: 'pyme' });
        } catch (error) {
            const msg = (error.message || '').includes('fetch')
                ? 'Hubo un error de conexión. Intenta de nuevo o escríbenos por WhatsApp.'
                : (error.message || 'Hubo un error al procesar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.');
            showModal(false, 'No pudimos enviar tus antecedentes', msg);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
});

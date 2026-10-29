require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Railway entrega la IP real del visitante en X-Forwarded-For (la usa la API de conversiones).
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json());

// Bloquear acceso público a archivos internos del servidor antes de servir estáticos.
// express.static(__dirname) sirve TODO el directorio por defecto (incluído él mismo), así
// que cualquier archivo que no sea un asset público debe listarse acá explícitamente.
const BLOCKED_STATIC_FILES = new Set(['server.js', 'package.json', 'package-lock.json', 'CLAUDE.md', 'PRODUCT.md', 'skills-lock.json']);
app.use((req, res, next) => {
    const requestedPath = decodeURIComponent(req.path).replace(/^\/+/, '');
    const isBlockedFile = BLOCKED_STATIC_FILES.has(requestedPath);
    const lowerPath = requestedPath.toLowerCase();
    // De instagram/ solo se exponen los JPG exportados por mes: la Content Publishing API los descarga por URL
    const isInstagramMedia = /^instagram\/\d{4}-\d{2}\/[a-z0-9-]+\.jpg$/.test(requestedPath);
    const isNodeModules = lowerPath.startsWith('node_modules/') || lowerPath.startsWith('docs/')
        || (lowerPath.startsWith('instagram/') && !isInstagramMedia);
    const isDotfile = requestedPath.split('/').some(segment => segment.startsWith('.'));
    if (isBlockedFile || isNodeModules || isDotfile) {
        return res.status(404).end();
    }
    next();
});

app.use(express.static(__dirname)); // Servir archivos estáticos (index.html, etc.)

// --- Rutas limpias para Landing Pages de Google Ads ---
app.get('/condominio', (req, res) => res.sendFile('condominio.html', { root: __dirname }));
app.get('/transporte', (req, res) => res.sendFile('transporte.html', { root: __dirname }));

// --- Páginas de cada seguro (sitio nuevo, octubre 2026) ---
app.get('/seguros/flotas', (req, res) => res.sendFile('seguro-flotas.html', { root: __dirname }));
app.get('/seguros/transporte', (req, res) => res.sendFile('seguro-transporte.html', { root: __dirname }));
app.get('/seguros/incendio', (req, res) => res.sendFile('seguro-incendio.html', { root: __dirname }));
app.get('/seguros/colectivos-de-salud', (req, res) => res.sendFile('seguro-colectivos-salud.html', { root: __dirname }));

// --- Landing de campaña: desgravamen hipotecario rechazado (personas; noindex) ---
app.get('/desgravamen-rechazado', (req, res) => res.sendFile('desgravamen.html', { root: __dirname }));

// --- Ruta limpia para Política de Privacidad (requerida por Meta for Developers / WhatsApp Business API) ---
app.get('/politica-privacidad', (req, res) => res.sendFile('privacidad.html', { root: __dirname }));

// --- Landing Seguro de Mascotas (convenio BCI Seguros "Mascotas S20", cotizador embebido) ---
app.get('/seguro-mascotas', (req, res) => res.sendFile('mascotas.html', { root: __dirname }));

// --- Formulario Seguro Pyme (antecedentes para cotizar; el lead va al CRM propio app.mercurial.cl) ---
app.get('/cotizar-pyme', (req, res) => res.sendFile('cotizar-pyme.html', { root: __dirname }));

// --- API de conversiones de Meta (copia de servidor de los eventos del píxel, src/js/meta.js) ---
// Sin META_CAPI_TOKEN el sitio funciona igual y solo queda el píxel del navegador.
// META_TEST_EVENT_CODE (opcional) manda los eventos a "Probar eventos" del Administrador de eventos.
const META_PIXEL_ID = process.env.META_PIXEL_ID || '1129934969998097';
const META_CAPI_TOKEN = process.env.META_CAPI_TOKEN;
const META_API_VERSION = process.env.META_API_VERSION || 'v24.0';
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;

if (!META_CAPI_TOKEN) {
    console.warn('[AVISO] META_CAPI_TOKEN no definida: los eventos de Meta solo saldrán del píxel del navegador.');
}

const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');
const metaNorm = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

function metaPhone(v) {
    let digits = String(v || '').replace(/\D/g, '');
    if (digits.length === 9) digits = `56${digits}`; // celular chileno sin código de país
    return digits.length >= 10 ? digits : '';
}

function metaCookie(req, name) {
    const match = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
    return match ? decodeURIComponent(match[1]) : undefined;
}

// Datos del cliente: los de contacto van con hash SHA-256; IP, UA y cookies del píxel, en claro.
function metaUserData(req, { email, phone, firstName, lastName, city } = {}) {
    const hashed = { em: metaNorm(email), ph: metaPhone(phone), fn: metaNorm(firstName), ln: metaNorm(lastName), ct: metaNorm(city).replace(/[^\p{L}]/gu, '') };
    const userData = {
        client_ip_address: req.ip,
        client_user_agent: req.get('user-agent'),
        fbp: metaCookie(req, '_fbp'),
        fbc: metaCookie(req, '_fbc')
    };
    Object.entries(hashed).forEach(([k, v]) => { if (v) userData[k] = [sha256(v)]; });
    if (userData.em || userData.ph) userData.country = [sha256('cl')];
    Object.keys(userData).forEach(k => userData[k] === undefined && delete userData[k]);
    return userData;
}

// Nunca bloquea ni rompe la respuesta al visitante: se llama sin await y solo deja log si falla.
async function enviarEventoMeta(req, { eventName, eventId, eventSourceUrl, userData, customData }) {
    if (!META_CAPI_TOKEN) return;
    const body = {
        data: [{
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            event_source_url: eventSourceUrl || req.get('referer'),
            action_source: 'website',
            user_data: metaUserData(req, userData),
            custom_data: customData || {}
        }]
    };
    if (META_TEST_EVENT_CODE) body.test_event_code = META_TEST_EVENT_CODE;
    try {
        const { data } = await axios.post(`https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events`, body, {
            params: { access_token: META_CAPI_TOKEN },
            timeout: 5000
        });
        // Una línea por evento: es la única forma de confirmar en los logs de Railway que Meta lo recibió.
        console.log(`[Meta] ${eventName} recibido por Meta (events_received=${data?.events_received}, event_id=${eventId})`);
    } catch (error) {
        console.error(`[Meta] No se pudo enviar ${eventName}:`, JSON.stringify(error.response?.data || error.message).slice(0, 500));
    }
}

const META_EVENTOS_NAVEGADOR = new Set(['ViewContent', 'Contact', 'CustomizeProduct']);
const metaEventIdValido = (v) => typeof v === 'string' && /^[A-Za-z0-9-]{8,80}$/.test(v);

// Copia de servidor de los eventos sin formulario (los Lead salen de sus propios endpoints).
// sendBeacon manda el cuerpo como text/plain en algunos navegadores; express.json lo ignora.
app.post('/api/meta/evento', express.text({ type: 'text/plain', limit: '4kb' }), (req, res) => {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    const { eventName, eventId, eventSourceUrl, customData } = body || {};
    if (!META_EVENTOS_NAVEGADOR.has(eventName) || !metaEventIdValido(eventId)) return res.status(400).end();
    const custom = {};
    if (customData && typeof customData.content_name === 'string') custom.content_name = customData.content_name.slice(0, 100);
    if (customData && typeof customData.contact_channel === 'string') custom.contact_channel = customData.contact_channel.slice(0, 20);
    enviarEventoMeta(req, {
        eventName, eventId,
        eventSourceUrl: typeof eventSourceUrl === 'string' ? eventSourceUrl.slice(0, 500) : undefined,
        customData: custom
    });
    res.status(204).end();
});

// --- Endpoint: formularios de la portada (cotización, consulta, reclamo) -> correo ---
// Se envían por el SMTP de Google Workspace (mercurial.cl) con una contraseña de aplicación.
// Sin SMTP_USER/SMTP_PASS el endpoint responde 503 y la página ofrece WhatsApp.
// MAIL_DRY_RUN=1 arma el correo sin enviarlo (pruebas locales): nunca usarlo en producción.
const nodemailer = require('nodemailer');
const MAIL_TO = process.env.MAIL_TO || 'contacto@mercurial.cl';
const MAIL_DRY_RUN = process.env.MAIL_DRY_RUN === '1';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const mailer = MAIL_DRY_RUN
    ? nodemailer.createTransport({ jsonTransport: true })
    : (SMTP_USER && SMTP_PASS)
        ? nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT || 465),
            secure: Number(process.env.SMTP_PORT || 465) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS }
        })
        : null;

if (!mailer) {
    console.warn('[AVISO] SMTP_USER/SMTP_PASS no definidas: /api/contacto responderá 503.');
}

const SEGUROS_CONTACTO = ['Flotas', 'Transporte', 'Incendio', 'Colectivo de salud', 'Condominio', 'Otro'];
const TIPOS_CONTACTO = { cotizacion: 'Cotización', consulta: 'Consulta', reclamo: 'Reclamo', desgravamen: 'Desgravamen rechazado' };
// Situación del crédito en el formulario de desgravamen (sin datos de salud).
const SITUACIONES_CREDITO = ['Estoy solicitando el crédito', 'Crédito aprobado, falta el seguro', 'Ya tengo el crédito', 'Otra'];

// Límite simple por IP para frenar envíos automáticos (5 por 10 minutos).
const contactoPorIp = new Map();
function contactoPermitido(ip) {
    const ahora = Date.now();
    const recientes = (contactoPorIp.get(ip) || []).filter(t => ahora - t < 10 * 60 * 1000);
    recientes.push(ahora);
    contactoPorIp.set(ip, recientes);
    if (contactoPorIp.size > 5000) contactoPorIp.clear();
    return recientes.length <= 5;
}

function validarContacto(b) {
    const errors = [];
    const txt = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;
    const optTxt = (v, max) => v === undefined || v === '' || (typeof v === 'string' && v.length <= max);
    const telOk = v => typeof v === 'string' && v.replace(/\D/g, '').replace(/^56/, '').length === 9;
    const correoOk = v => typeof v === 'string' && v.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

    if (!b || typeof b !== 'object' || !TIPOS_CONTACTO[b.tipo]) return ['tipo'];
    if (b.tipo === 'cotizacion') {
        if (!SEGUROS_CONTACTO.includes(b.seguro)) errors.push('seguro');
        if (!txt(b.empresa, 160)) errors.push('empresa');
        if (!telOk(b.telefono)) errors.push('telefono');
        // La barra de la portada pide solo seguro, empresa y teléfono; el formulario completo suma nombre y correo.
        if (!optTxt(b.nombre, 120)) errors.push('nombre');
        if (b.correo && !correoOk(b.correo)) errors.push('correo');
    } else if (b.tipo === 'desgravamen') {
        if (!txt(b.nombre, 120)) errors.push('nombre');
        if (!telOk(b.telefono)) errors.push('telefono');
        if (b.correo && !correoOk(b.correo)) errors.push('correo');
        if (!optTxt(b.banco, 80)) errors.push('banco');
        if (!SITUACIONES_CREDITO.includes(b.situacion)) errors.push('situacion');
    } else {
        if (!txt(b.nombre, 120)) errors.push('nombre');
        if (!correoOk(b.correo)) errors.push('correo');
        if (b.telefono && !telOk(b.telefono)) errors.push('telefono');
        if (!txt(b.mensaje, 3000)) errors.push('mensaje');
    }
    if (!optTxt(b.mensaje, 3000)) errors.push('mensaje');
    if (!optTxt(b.pagina, 500)) errors.push('pagina');
    return errors;
}

app.post('/api/contacto', async (req, res) => {
    const b = req.body || {};
    // Campo trampa: los humanos no lo ven; si viene con algo, se responde éxito sin enviar.
    if (typeof b.sitio_web === 'string' && b.sitio_web.trim()) return res.status(200).json({ success: true });
    if (!mailer) {
        return res.status(503).json({ success: false, message: 'El formulario no está disponible en este momento. Escríbenos por WhatsApp.' });
    }
    if (!contactoPermitido(req.ip)) {
        return res.status(429).json({ success: false, message: 'Recibimos varios envíos seguidos. Espera unos minutos o escríbenos por WhatsApp.' });
    }
    const errors = validarContacto(b);
    if (errors.length) {
        return res.status(400).json({ success: false, message: 'Hay datos incompletos o inválidos. Revisa el formulario.', fields: errors });
    }

    const tipo = TIPOS_CONTACTO[b.tipo];
    const limpio = v => (typeof v === 'string' ? v.trim() : '');
    const asunto = b.tipo === 'cotizacion'
        ? `[Web] Cotización ${b.seguro} · ${limpio(b.empresa)}`
        : `[Web] ${tipo} · ${limpio(b.nombre)}`;
    const lineas = [
        `Tipo: ${tipo}`,
        b.seguro && `Seguro: ${b.seguro}`,
        b.empresa && `Empresa: ${limpio(b.empresa)}`,
        b.nombre && `Nombre: ${limpio(b.nombre)}`,
        b.correo && `Correo: ${limpio(b.correo)}`,
        b.telefono && `Teléfono: ${limpio(b.telefono)}`,
        b.banco && `Banco: ${limpio(b.banco)}`,
        b.situacion && `Situación del crédito: ${b.situacion}`,
        b.mensaje && `\nMensaje:\n${limpio(b.mensaje)}`,
        `\nEnviado desde: ${limpio(b.pagina) || req.get('referer') || 'mercurial.cl'}`,
        `Fecha: ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`
    ].filter(Boolean);

    try {
        await mailer.sendMail({
            from: `"Sitio Mercurial" <${SMTP_USER || MAIL_TO}>`,
            to: MAIL_TO,
            replyTo: b.correo ? limpio(b.correo) : undefined,
            subject: asunto,
            text: lineas.join('\n')
        });
        return res.status(200).json({ success: true });
    } catch (error) {
        // Sin datos personales en el log: solo el tipo y el código del error.
        console.error(`[Contacto] No se pudo enviar (${b.tipo}):`, error.code || error.message);
        return res.status(502).json({ success: false, message: 'No pudimos enviar tu mensaje en este momento. Intenta de nuevo o escríbenos por WhatsApp.' });
    }
});

// --- Endpoint: Formulario Seguro Pyme -> CRM propio (app.mercurial.cl, repo korjolio/studio) ---
// La web valida y reenvía al endpoint público del CRM con una clave compartida que nunca llega al
// navegador. Los catálogos son los mismos que usa el formulario (src/data/pyme-catalogos.js), así
// cliente, proxy y CRM validan contra las mismas listas del cotizador de ANS.
const CRM_URL = (process.env.CRM_URL || '').replace(/\/+$/, '');
const CRM_API_KEY = process.env.CRM_API_KEY;
const PYME_CATALOGOS = require('./src/data/pyme-catalogos.js');
const PYME_COMUNAS = new Set(require('./src/data/comunas.json').map(c => c.comuna));
const PYME_ACTIVIDADES = new Set(require('./src/data/ans-pyme-actividades.json'));

if (!CRM_URL || !CRM_API_KEY) {
    console.warn('[AVISO] CRM_URL/CRM_API_KEY no definidas: /api/cotizaciones/pyme responderá 503.');
}

function validarCotizacionPyme(body) {
    const errors = [];
    const str = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;
    const optStr = (v, max) => v === undefined || v === null || v === '' || (typeof v === 'string' && v.length <= max);
    const uint = (v, max = 100000000) => Number.isInteger(v) && v >= 0 && v <= max;
    const optUint = (v, max) => v === undefined || v === null || uint(v, max);
    const inList = (v, list) => list.map(String).includes(String(v));

    if (!body || typeof body !== 'object') return ['Cuerpo inválido'];
    const { contact = {}, holder = {}, location = {}, building = {}, amounts = {}, extras = {}, security = {} } = body;

    if (body.product !== 'pyme') errors.push('product');
    if (!str(contact.firstName, 80)) errors.push('contact.firstName');
    if (!str(contact.lastName, 80)) errors.push('contact.lastName');
    if (!str(contact.email, 120) || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email)) errors.push('contact.email');
    if (!str(contact.phone, 20) || contact.phone.replace(/\D/g, '').length < 8) errors.push('contact.phone');

    if (!inList(holder.personType, PYME_CATALOGOS.tipoPersona)) errors.push('holder.personType');
    if (!str(holder.rut, 12) || !/^[0-9.]{7,11}-[0-9kK]$/.test(holder.rut.trim())) errors.push('holder.rut');
    if (holder.personType === 'juridica' && !str(holder.businessName, 160)) errors.push('holder.businessName');
    if (holder.personType === 'natural' && (!str(holder.firstName, 80) || !str(holder.lastName, 80))) errors.push('holder.name');
    if (!optStr(holder.secondLastName, 80)) errors.push('holder.secondLastName');

    if (!inList(location.locationType, PYME_CATALOGOS.tipoUbicacion)) errors.push('location.locationType');
    if (!str(location.address, 200)) errors.push('location.address');
    if (!optStr(location.unit, 80)) errors.push('location.unit');
    if (!str(location.comuna, 80) || !PYME_COMUNAS.has(location.comuna)) errors.push('location.comuna');
    if (!optStr(location.region, 80)) errors.push('location.region');

    if (!inList(building.wallMaterial, PYME_CATALOGOS.muro)) errors.push('building.wallMaterial');
    if (!inList(building.roofMaterial, PYME_CATALOGOS.techo)) errors.push('building.roofMaterial');
    if (!inList(building.buildingAge, PYME_CATALOGOS.antiguedad)) errors.push('building.buildingAge');
    if (!uint(building.floors, 99) || building.floors < 1) errors.push('building.floors');
    const esOtra = building.activity === PYME_CATALOGOS.actividadOtra;
    if (!str(building.activity, 160) || (!esOtra && !PYME_ACTIVIDADES.has(building.activity))) errors.push('building.activity');
    if (esOtra && !str(building.activityOther, 160)) errors.push('building.activityOther');
    if (typeof building.nearSea !== 'boolean') errors.push('building.nearSea');
    if (typeof building.nearRiver !== 'boolean') errors.push('building.nearRiver');

    ['building', 'contents', 'goods', 'electronics', 'machinery'].forEach(k => { if (!optUint(amounts[k])) errors.push(`amounts.${k}`); });
    if (!['building', 'contents', 'goods', 'electronics', 'machinery'].some(k => Number.isInteger(amounts[k]) && amounts[k] > 0)) errors.push('amounts.alguno');
    if (!inList(amounts.liability, PYME_CATALOGOS.rcUF)) errors.push('amounts.liability');
    if (!inList(amounts.glass, PYME_CATALOGOS.cristalesUF)) errors.push('amounts.glass');
    if (!optUint(amounts.workers, 9999)) errors.push('amounts.workers');
    if (!inList(amounts.accidentalDeath, PYME_CATALOGOS.muerteInvalidezUF)) errors.push('amounts.accidentalDeath');

    if (extras.cashInSafe !== undefined && !inList(extras.cashInSafe, PYME_CATALOGOS.dineroEnCajaUF)) errors.push('extras.cashInSafe');
    if (extras.valuesTransit !== undefined && !inList(extras.valuesTransit, PYME_CATALOGOS.remesaValoresUF)) errors.push('extras.valuesTransit');
    if (extras.indemnityPeriod !== undefined && !inList(extras.indemnityPeriod, PYME_CATALOGOS.periodoIndemnizable)) errors.push('extras.indemnityPeriod');
    ['politicalRisks', 'foodLiability', 'machineryBreakdown', 'terrorism'].forEach(k => { if (extras[k] !== undefined && !inList(extras[k], PYME_CATALOGOS.siNo)) errors.push(`extras.${k}`); });
    if (!optUint(extras.businessInterruptionAnnual)) errors.push('extras.businessInterruptionAnnual');
    if (!optUint(extras.tenantImprovements)) errors.push('extras.tenantImprovements');

    const listOk = (arr, cat) => arr === undefined || (Array.isArray(arr) && arr.every(v => cat.includes(v)));
    if (!listOk(security.fire, PYME_CATALOGOS.seguridadIncendio)) errors.push('security.fire');
    if (!listOk(security.theft, PYME_CATALOGOS.seguridadRobo)) errors.push('security.theft');
    if (!optStr(body.comments, 1500)) errors.push('comments');
    return errors;
}

app.post('/api/cotizaciones/pyme', async (req, res) => {
    if (!CRM_URL || !CRM_API_KEY) {
        return res.status(503).json({ success: false, message: 'El formulario no está disponible en este momento. Escríbenos por WhatsApp.' });
    }
    const idempotencyKey = (req.get('Idempotency-Key') || '').trim();
    if (!/^[A-Za-z0-9-]{8,80}$/.test(idempotencyKey)) {
        return res.status(400).json({ success: false, message: 'Solicitud inválida (falta identificador de envío).' });
    }
    const errors = validarCotizacionPyme(req.body);
    if (errors.length) {
        return res.status(400).json({ success: false, message: 'Hay datos incompletos o inválidos. Revisa el formulario.', fields: errors });
    }

    const payload = {
        ...req.body,
        source: 'web-mercurial',
        tracking: { ...(req.body.tracking || {}), receivedAt: new Date().toISOString() }
    };

    try {
        const crmResponse = await axios.post(`${CRM_URL}/api/public/prospects`, payload, {
            headers: { 'Content-Type': 'application/json', 'x-api-key': CRM_API_KEY, 'Idempotency-Key': idempotencyKey },
            timeout: 10000
        });
        // El Idempotency-Key es también el event_id: un reintento del mismo envío no cuenta doble en Meta.
        // Solo con consentimiento de cookies (tracking.metaConsent lo marca cotizar-pyme.js).
        const { contact, location, tracking } = req.body;
        if (tracking?.metaConsent === true) enviarEventoMeta(req, {
            eventName: 'Lead',
            eventId: idempotencyKey,
            eventSourceUrl: typeof tracking?.pageUrl === 'string' ? tracking.pageUrl.slice(0, 500) : undefined,
            userData: { email: contact.email, phone: contact.phone, firstName: contact.firstName, lastName: contact.lastName, city: location.comuna },
            customData: { content_name: 'Seguro Pyme' }
        });
        return res.status(200).json({ success: true, message: 'Antecedentes recibidos', prospectId: crmResponse.data?.prospectId || null });
    } catch (error) {
        const status = error.response?.status;
        const detail = error.response?.data || error.message;
        console.error('[Pyme] El CRM rechazó o no respondió:', status, JSON.stringify(detail).slice(0, 500));
        if (status === 400) {
            return res.status(400).json({ success: false, message: 'Hay datos que el sistema no pudo validar. Revisa el formulario o escríbenos por WhatsApp.' });
        }
        // 401/403/404/5xx del CRM o timeout: es un problema nuestro, no del cliente.
        return res.status(502).json({ success: false, message: 'No pudimos registrar tus antecedentes en este momento. Intenta de nuevo o escríbenos por WhatsApp.' });
    }
});

// Capturar errores no controlados para no crashear silenciosamente
process.on('uncaughtException', (err) => {
    // Silencio en producción o log a archivo si fuera necesario
});

app.listen(PORT, () => {
    console.log(`\n[OK] Backend Mercurial corriendo en http://localhost:${PORT}`);
});

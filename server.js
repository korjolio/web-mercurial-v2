require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Bloquear acceso público a archivos internos del servidor antes de servir estáticos.
// express.static(__dirname) sirve TODO el directorio por defecto (incluído él mismo), así
// que cualquier archivo que no sea un asset público debe listarse acá explícitamente.
const BLOCKED_STATIC_FILES = new Set(['server.js', 'package.json', 'package-lock.json', 'CLAUDE.md']);
app.use((req, res, next) => {
    const requestedPath = decodeURIComponent(req.path).replace(/^\/+/, '');
    const isBlockedFile = BLOCKED_STATIC_FILES.has(requestedPath);
    const isNodeModules = requestedPath.startsWith('node_modules/') || requestedPath.startsWith('docs/');
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

// --- Ruta limpia para Política de Privacidad (requerida por Meta for Developers / WhatsApp Business API) ---
app.get('/politica-privacidad', (req, res) => res.sendFile('privacidad.html', { root: __dirname }));

// --- Landing Seguro de Mascotas (convenio BCI Seguros "Mascotas S20", cotizador embebido) ---
app.get('/seguro-mascotas', (req, res) => res.sendFile('mascotas.html', { root: __dirname }));

// --- Formulario Seguro Pyme (antecedentes para cotizar; el lead va al CRM propio app.mercurial.cl) ---
app.get('/cotizar-pyme', (req, res) => res.sendFile('cotizar-pyme.html', { root: __dirname }));

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;

// Sin la clave el sitio funciona igual (landings, cotizador de mascotas); solo se
// deshabilitan los endpoints de leads hacia HubSpot (condominio/transporte).
if (!HUBSPOT_API_KEY) {
    console.warn('[AVISO] HUBSPOT_API_KEY no definida: el sitio funciona, pero los endpoints /api/hubspot/* responderán 503.');
}

app.use('/api/hubspot', (req, res, next) => {
    if (!HUBSPOT_API_KEY) {
        return res.status(503).json({ success: false, error: 'HubSpot no configurado (falta HUBSPOT_API_KEY).' });
    }
    next();
});

// --- Endpoint de Diagnóstico ---
app.get('/api/hubspot/test', async (req, res) => {
    try {
        const response = await axios.get(
            'https://api.hubapi.com/crm/v3/objects/contacts?limit=1',
            { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}` } }
        );
        res.json({ success: true, message: 'Conexión con HubSpot exitosa', status: response.status });
    } catch (error) {
        const hsError = error.response ? error.response.data : error.message;
        res.status(500).json({ success: false, error: hsError });
    }
});

// --- Endpoint Principal: Crear Contacto + Deal ---
app.post('/api/hubspot/auditoria', async (req, res) => {
    try {
        const { firstName, lastName, company, phone, email, interest, source } = req.body;

        if (!email || !firstName || !company) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan campos obligatorios (nombre, email o empresa).' 
            });
        }

        // 1. Crear Contacto
        const contactPayload = {
            properties: {
                email, firstname: firstName, lastname: lastName,
                phone, company, lifecyclestage: 'lead', hs_lead_status: 'NEW'
            }
        };

        let contactId;

        try {
            const contactResponse = await axios.post(
                'https://api.hubapi.com/crm/v3/objects/contacts',
                contactPayload,
                { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
            );
            contactId = contactResponse.data.id;
        } catch (contactError) {
            const hsErrorData = contactError.response?.data;
            
            // Caso: Contacto ya existe (409 Conflict)
            if (contactError.response && (contactError.response.status === 409 || hsErrorData?.category === 'CONFLICT')) {
                const msg = hsErrorData?.message || '';
                // Intentar extraer ID de diferentes formatos de mensaje de HubSpot
                const match = msg.match(/Existing ID: (\d+)/) || msg.match(/Contact (\d+) already exists/);
                
                if (match) {
                    contactId = match[1];
                } else {
                    // Fallback: Buscar el contacto por email si la regex falla
                    try {
                        const searchResponse = await axios.post(
                            'https://api.hubapi.com/crm/v3/objects/contacts/search',
                            {
                                filterGroups: [{
                                    filters: [{ propertyName: 'email', operator: 'EQ', value: email }]
                                }]
                            },
                            { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
                        );
                        
                        if (searchResponse.data.total > 0) {
                            contactId = searchResponse.data.results[0].id;
                        } else {
                            throw new Error('Conflicto reportado pero no se encontró el contacto por email.');
                        }
                    } catch (searchError) {
                        throw contactError;
                    }
                }

                // --- ACTUALIZACIÓN DE CONTACTO EXISTENTE ---
                // Si el contacto ya existe, actualizamos sus datos con la información más reciente
                try {
                    await axios.patch(
                        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
                        contactPayload,
                        { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
                    );
                } catch (updateError) {
                    // No lanzamos error aquí para permitir que la creación del Deal continúe
                }
            } else {
                throw contactError;
            }
        }

        // 2. Crear Deal y asociarlo
        const dealPayload = {
            properties: {
                dealname: `Auditoría B2B: ${company} (${interest})`,
                pipeline: 'default',
                dealstage: 'appointmentscheduled',
                amount: '0',
                hs_campaign: source || 'Mercurial 2.0 Landing'
            },
            associations: [{
                to: { id: contactId },
                types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]
            }]
        };

        const dealResponse = await axios.post(
            'https://api.hubapi.com/crm/v3/objects/deals',
            dealPayload,
            { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
        );

        res.status(200).json({
            success: true,
            message: 'Contacto y Negocio creados exitosamente en HubSpot',
            contactId,
            dealId: dealResponse.data.id
        });

    } catch (error) {
        const hsErrorData = error.response ? error.response.data : null;
        const errorMessage = hsErrorData?.message || error.message;
        const category = hsErrorData?.category || 'UNKNOWN_ERROR';

        // Determinar un mensaje amigable para el frontend
        let friendlyMessage = 'Hubo un error al procesar su solicitud. Por favor, inténtelo de nuevo más tarde.';
        
        if (hsErrorData?.subCategory === 'ValidationException') {
            friendlyMessage = 'Los datos proporcionados no tienen un formato válido.';
        } else if (error.response?.status === 401) {
            friendlyMessage = 'Error de autenticación con el servicio de CRM.';
        } else if (error.response?.status === 429) {
            friendlyMessage = 'Estamos recibiendo muchas solicitudes. Por favor, espere un momento.';
        }

        res.status(error.response?.status || 500).json({
            success: false,
            error: errorMessage,
            category: category,
            message: friendlyMessage
        });
    }
});

// --- Endpoint: Landing Pages Condominio/Transporte (Google Ads) -> HubSpot ---
const HUBSPOT_PIPELINE_ID = 'default'; // Pipeline "Canal digital"
const HUBSPOT_DEALSTAGE_ID = '1406523802'; // Stage "Lead nuevo"

app.post('/api/leads', async (req, res) => {
    try {
        const {
            firstName, lastName, email, phone, company, rut,
            cluster_source,
            gclid, utm_content
        } = req.body;

        if (!email || !firstName || !company || !rut || !['condominio', 'transporte'].includes(cluster_source)) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios (nombre, email, empresa, RUT o landing de origen inválida).'
            });
        }

        // 1. Crear/actualizar el Contact directo por CRM API — mismo patrón que /api/hubspot/auditoria
        // (create -> 409 -> buscar por email -> patch), escrito aparte para no tocar ese endpoint.
        // El gclid se guarda acá mismo en hs_google_click_id (propiedad nativa), sin depender de
        // ningún tracking automático de HubSpot.
        const contactProperties = {
            email, firstname: firstName, lastname: lastName || '',
            company, phone: phone || '', hs_whatsapp_phone_number: phone || '',
            lifecyclestage: 'lead', hs_lead_status: 'NEW'
        };
        if (gclid) contactProperties.hs_google_click_id = gclid;

        let contactId = null;
        try {
            const contactResponse = await axios.post(
                'https://api.hubapi.com/crm/v3/objects/contacts',
                { properties: contactProperties },
                { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
            );
            contactId = contactResponse.data.id;
        } catch (contactError) {
            const isConflict = contactError.response && (contactError.response.status === 409 || contactError.response.data?.category === 'CONFLICT');
            if (isConflict) {
                try {
                    const searchResponse = await axios.post(
                        'https://api.hubapi.com/crm/v3/objects/contacts/search',
                        { filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }] },
                        { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
                    );
                    if (searchResponse.data.total > 0) {
                        contactId = searchResponse.data.results[0].id;
                        await axios.patch(
                            `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
                            { properties: contactProperties },
                            { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
                        );
                    }
                } catch (searchError) {
                    console.error('[Leads] No se pudo ubicar/actualizar el Contact existente:', searchError.response?.data || searchError.message);
                }
            } else {
                console.error('[Leads] No se pudo crear el Contact:', contactError.response?.data || contactError.message);
            }
        }

        if (!contactId) {
            return res.status(500).json({
                success: false,
                message: 'Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo o contáctanos por WhatsApp.'
            });
        }

        // 2. Company: buscar por RUT, crear si no existe, asociar al Contact como principal.
        let companyId = null;
        try {
            const companySearch = await axios.post(
                'https://api.hubapi.com/crm/v3/objects/companies/search',
                { filterGroups: [{ filters: [{ propertyName: 'rut', operator: 'EQ', value: rut }] }] },
                { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
            );
            if (companySearch.data.total > 0) {
                companyId = companySearch.data.results[0].id;
                await axios.patch(
                    `https://api.hubapi.com/crm/v3/objects/companies/${companyId}`,
                    { properties: { name: company, rut } },
                    { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
                );
            }
        } catch (companySearchError) {
            console.error('[Leads] Búsqueda de Company por RUT falló:', companySearchError.response?.data || companySearchError.message);
        }

        if (!companyId) {
            try {
                const companyCreateResponse = await axios.post(
                    'https://api.hubapi.com/crm/v3/objects/companies',
                    {
                        properties: { name: company, rut },
                        associations: [{
                            to: { id: contactId },
                            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 2 }]
                        }]
                    },
                    { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
                );
                companyId = companyCreateResponse.data.id;
            } catch (companyCreateError) {
                console.error('[Leads] No se pudo crear la Company:', companyCreateError.response?.data || companyCreateError.message);
            }
        } else if (companyId) {
            try {
                await axios.put(
                    `https://api.hubapi.com/crm/v4/objects/companies/${companyId}/associations/contacts/${contactId}`,
                    [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 2 }],
                    { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
                );
            } catch (associateError) {
                console.error('[Leads] No se pudo asociar la Company existente al Contact:', associateError.response?.data || associateError.message);
            }
        }

        // 3. Crear el Deal con la segmentación de cluster/canal/producto, asociado a Contact y Company.
        try {
            const clusterLabel = cluster_source === 'condominio' ? 'Condominio' : 'Transporte';
            const dealProperties = {
                dealname: `Lead ${clusterLabel}: ${company}`,
                pipeline: HUBSPOT_PIPELINE_ID,
                dealstage: HUBSPOT_DEALSTAGE_ID,
                canal_de_origen: cluster_source === 'condominio' ? 'Google Ads Condominio' : 'Google Ads Transporte'
            };

            if (cluster_source === 'condominio') {
                dealProperties.cluster = 'Condominio';
                dealProperties.producto_de_interes = 'Seguro Condominio';
            } else if (cluster_source === 'transporte') {
                if (utm_content === 'camion_flota') {
                    dealProperties.cluster = 'Transporte - Camión/Flota';
                    dealProperties.producto_de_interes = 'Seguro Camión/Flota';
                } else if (utm_content === 'carga') {
                    dealProperties.cluster = 'Transporte - Carga y Comercio Exterior';
                    dealProperties.producto_de_interes = 'Seguro de Carga';
                }
                // utm_content desconocido o ausente: no se asume nada, se omiten cluster/producto_de_interes.
            }

            const dealAssociations = [{
                to: { id: contactId },
                types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]
            }];
            if (companyId) {
                dealAssociations.push({
                    to: { id: companyId },
                    types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }] // Deal to primary company
                });
            }

            await axios.post(
                'https://api.hubapi.com/crm/v3/objects/deals',
                {
                    properties: dealProperties,
                    associations: dealAssociations
                },
                { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
            );
        } catch (dealError) {
            console.error('[Leads] No se pudo crear el Deal:', dealError.response?.data || dealError.message);
        }

        // TODO: disparo de mensaje de WhatsApp Business al recibir el lead.
        // Pendiente: número de WhatsApp Business aún sin verificar en Meta.

        res.status(200).json({ success: true, message: 'Solicitud recibida correctamente' });

    } catch (error) {
        console.error('[Leads] Error inesperado:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.'
        });
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
    console.log(`[OK] Prueba de conectividad: http://localhost:${PORT}/api/hubspot/test\n`);
});

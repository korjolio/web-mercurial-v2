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
const BLOCKED_STATIC_FILES = new Set(['server.js', 'package.json', 'package-lock.json']);
app.use((req, res, next) => {
    const requestedPath = decodeURIComponent(req.path).replace(/^\/+/, '');
    const isBlockedFile = BLOCKED_STATIC_FILES.has(requestedPath);
    const isNodeModules = requestedPath.startsWith('node_modules/');
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

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;

if (!HUBSPOT_API_KEY) {
    process.exit(1);
}

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
const HUBSPOT_PORTAL_ID = '51216907';
const HUBSPOT_FORM_GUID = '65f687bf-8fa5-4222-9724-38252bb4bf7b';
const HUBSPOT_PIPELINE_ID = 'default'; // Pipeline "Canal digital"
const HUBSPOT_DEALSTAGE_ID = '1406523802'; // Stage "Lead nuevo"

app.post('/api/leads', async (req, res) => {
    try {
        const {
            firstName, lastName, email, phone, company, rut,
            cluster_source,
            gclid, utm_content,
            hutk, pageUri, pageName
        } = req.body;

        if (!email || !firstName || !company || !rut || !['condominio', 'transporte'].includes(cluster_source)) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios (nombre, email, empresa, RUT o landing de origen inválida).'
            });
        }

        // 1. Submit a HubSpot Forms API — trackea "Original Traffic Source" nativo vía hutk.
        // Internal names confirmados en vivo contra el form (no son los estándar del Contact):
        // teléfono -> hs_whatsapp_phone_number | razón social -> name (objeto Empresa) | rut -> rut (objeto Empresa)
        const formFields = [
            { name: 'email', value: email },
            { name: 'firstname', value: firstName }
        ];
        if (lastName) formFields.push({ name: 'lastname', value: lastName });
        if (company) formFields.push({ name: 'name', value: company });
        if (phone) formFields.push({ name: 'hs_whatsapp_phone_number', value: phone });
        if (rut) formFields.push({ name: 'rut', value: rut });

        const context = {};
        if (pageUri) context.pageUri = pageUri;
        if (pageName) context.pageName = pageName;
        if (hutk) context.hutk = hutk;

        const formsPayload = { fields: formFields };
        if (Object.keys(context).length > 0) formsPayload.context = context;

        let contactSubmitted = false;

        try {
            await axios.post(
                `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`,
                formsPayload,
                { headers: { 'Content-Type': 'application/json' } }
            );
            contactSubmitted = true;
        } catch (formsError) {
            console.error('[Leads] Forms API submit falló, se intenta fallback por CRM API:', formsError.response?.data || formsError.message);
        }

        // 2. Fallback: si la Forms API falla, crear/actualizar el Contact directo por CRM API
        // (mismo patrón de manejo de 409 que /api/hubspot/auditoria, escrito aparte para no tocar ese endpoint).
        if (!contactSubmitted) {
            const contactPayload = {
                properties: {
                    email, firstname: firstName, lastname: lastName || '',
                    company, phone: phone || '', hs_whatsapp_phone_number: phone || '',
                    lifecyclestage: 'lead', hs_lead_status: 'NEW'
                }
            };
            try {
                await axios.post(
                    'https://api.hubapi.com/crm/v3/objects/contacts',
                    contactPayload,
                    { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
                );
                contactSubmitted = true;
            } catch (createError) {
                const isConflict = createError.response && (createError.response.status === 409 || createError.response.data?.category === 'CONFLICT');
                if (isConflict) {
                    try {
                        const searchResponse = await axios.post(
                            'https://api.hubapi.com/crm/v3/objects/contacts/search',
                            { filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }] },
                            { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
                        );
                        if (searchResponse.data.total > 0) {
                            await axios.patch(
                                `https://api.hubapi.com/crm/v3/objects/contacts/${searchResponse.data.results[0].id}`,
                                contactPayload,
                                { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
                            );
                            contactSubmitted = true;
                        }
                    } catch (fallbackSearchError) {
                        console.error('[Leads] Fallback CRM API también falló:', fallbackSearchError.response?.data || fallbackSearchError.message);
                    }
                } else {
                    console.error('[Leads] Fallback CRM API también falló:', createError.response?.data || createError.message);
                }
            }
        }

        if (!contactSubmitted) {
            return res.status(500).json({
                success: false,
                message: 'Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo o contáctanos por WhatsApp.'
            });
        }

        // 3. Ubicar el contactId (la Forms API no siempre lo devuelve en la respuesta).
        let contactId = null;
        for (let attempt = 0; attempt < 2 && !contactId; attempt++) {
            if (attempt === 1) await new Promise(r => setTimeout(r, 800));
            try {
                const searchResponse = await axios.post(
                    'https://api.hubapi.com/crm/v3/objects/contacts/search',
                    { filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }] },
                    { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
                );
                if (searchResponse.data.total > 0) {
                    contactId = searchResponse.data.results[0].id;
                }
            } catch (searchError) {
                console.error('[Leads] Búsqueda de contacto falló:', searchError.response?.data || searchError.message);
            }
        }

        if (!contactId) {
            console.error(`[Leads] No se pudo ubicar el contactId para ${email} (cluster: ${cluster_source}) tras el submit. Requiere revisión manual en HubSpot.`);
            return res.status(200).json({ success: true, message: 'Solicitud recibida correctamente' });
        }

        // 4. gclid + teléfono de respaldo en el Contact (best-effort, nunca bloquea la creación del Deal).
        const contactPatchProps = {};
        if (gclid) contactPatchProps.hs_google_click_id = gclid;
        if (phone) contactPatchProps.phone = phone;
        if (Object.keys(contactPatchProps).length > 0) {
            try {
                await axios.patch(
                    `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
                    { properties: contactPatchProps },
                    { headers: { 'Authorization': `Bearer ${HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' } }
                );
            } catch (patchError) {
                console.error('[Leads] No se pudo actualizar gclid/phone en el Contact:', patchError.response?.data || patchError.message);
            }
        }

        // 5. Company: la Forms API crea la Company por matching de dominio pero NO escribe
        // de forma confiable las propiedades conectadas (name/rut) en ella — se maneja acá
        // por CRM API, igual que el Contact: buscar por RUT, crear si no existe, asociar.
        let companyId = null;
        if (rut) {
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
        }

        if (!companyId && (company || rut)) {
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

        // 6. Crear el Deal con la segmentación de cluster/canal/producto.
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

// Capturar errores no controlados para no crashear silenciosamente
process.on('uncaughtException', (err) => {
    // Silencio en producción o log a archivo si fuera necesario
});

app.listen(PORT, () => {
    console.log(`\n[OK] Backend Mercurial corriendo en http://localhost:${PORT}`);
    console.log(`[OK] Prueba de conectividad: http://localhost:${PORT}/api/hubspot/test\n`);
});

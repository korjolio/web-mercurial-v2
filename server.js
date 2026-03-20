require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Servir archivos estáticos (index.html, etc.)

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

// Capturar errores no controlados para no crashear silenciosamente
process.on('uncaughtException', (err) => {
    // Silencio en producción o log a archivo si fuera necesario
});

app.listen(PORT, () => {
    console.log(`\n[OK] Backend Mercurial corriendo en http://localhost:${PORT}`);
    console.log(`[OK] Prueba de conectividad: http://localhost:${PORT}/api/hubspot/test\n`);
});

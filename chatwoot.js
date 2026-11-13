// Leads del formulario de seguro de auto → Chatwoot (Application API, con el token de un agente).
// Crea o actualiza el contacto y abre una conversación en el inbox API «Formulario web»
// (no en el de WhatsApp: escribirle primero a alguien por WhatsApp exige una plantilla aprobada por Meta).
//
// Variables: CHATWOOT_URL, CHATWOOT_ACCOUNT_ID, CHATWOOT_API_TOKEN, CHATWOOT_INBOX_ID.
// Si falta alguna, no hace nada. CHATWOOT_DRY_RUN=1 imprime lo que mandaría, sin llamar a Chatwoot.
// Nunca lanza: si Chatwoot falla o tarda más de PLAZO_MS, deja una línea en el log y sigue.
const axios = require('axios');

const PLAZO_MS = 5000;

// Etiqueta de Chatwoot: minúsculas, números y guion.
const etiqueta = v => String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

function crearChatwoot(env = process.env) {
    const url = (env.CHATWOOT_URL || '').replace(/\/+$/, '');
    const cuenta = env.CHATWOOT_ACCOUNT_ID;
    const token = env.CHATWOOT_API_TOKEN;
    const inbox = Number(env.CHATWOOT_INBOX_ID);
    const dryRun = env.CHATWOOT_DRY_RUN === '1';
    const configurado = Boolean(url && cuenta && token && inbox);

    // lead: { nombre, telefono (E.164), correo, rut, comuna, patente, origen, campana, procedencia, etiquetaOrigen, enlace }
    function armar(lead) {
        const contacto = {
            name: lead.nombre,
            phone_number: lead.telefono,
            email: lead.correo,
            custom_attributes: {
                patente: lead.patente,
                rut: lead.rut,
                comuna: lead.comuna,
                origen: lead.origen,
                campana: lead.campana || '',
                procedencia: lead.procedencia
            }
        };
        const mensaje = [
            'Formulario de seguro de auto (mercurial.cl)',
            `Nombre: ${lead.nombre}`,
            `Patente: ${lead.patente}`,
            `RUT: ${lead.rut}`,
            `Comuna: ${lead.comuna}`,
            `Teléfono: ${lead.telefono}`,
            `Correo: ${lead.correo}`,
            `Procedencia: ${lead.procedencia}`,
            `Enlace marcado: ${lead.enlace || 'sin marcar (directo)'}`
        ].join('\n');
        const etiquetas = [...new Set(['auto', 'nuevo', etiqueta(lead.etiquetaOrigen)].filter(Boolean))];
        return { contacto, mensaje, etiquetas };
    }

    async function enviar(lead) {
        const { contacto, mensaje, etiquetas } = armar(lead);
        if (dryRun) {
            console.log('[Chatwoot] DRY RUN, no se llama a Chatwoot. Se mandaría:\n' +
                JSON.stringify({ inbox_id: inbox || '(CHATWOOT_INBOX_ID)', contacto, mensaje, etiquetas }, null, 2));
            return { dryRun: true };
        }
        if (!configurado) return { omitido: true };

        // Un solo plazo para todas las llamadas: pasado PLAZO_MS se cancela lo que esté en curso.
        const control = new AbortController();
        const reloj = setTimeout(() => control.abort(), PLAZO_MS);
        const api = axios.create({
            baseURL: `${url}/api/v1/accounts/${cuenta}`,
            headers: { api_access_token: token, 'Content-Type': 'application/json' },
            timeout: PLAZO_MS,
            signal: control.signal
        });
        try {
            const buscar = async (q, coincide) => {
                const { data } = await api.get('/contacts/search', { params: { q } });
                return (data.payload || []).find(coincide);
            };
            const existente = await buscar(contacto.phone_number, c => c.phone_number === contacto.phone_number)
                || await buscar(contacto.email, c => (c.email || '').toLowerCase() === contacto.email.toLowerCase());

            let contactoId;
            if (existente) {
                contactoId = existente.id;
                try {
                    await api.put(`/contacts/${contactoId}`, contacto);
                } catch (e) {
                    // El correo puede pertenecer a otro contacto (422): se actualiza el resto.
                    if (e.response?.status !== 422) throw e;
                    const { email, ...sinCorreo } = contacto;
                    await api.put(`/contacts/${contactoId}`, sinCorreo);
                }
            } else {
                const { data } = await api.post('/contacts', { ...contacto, inbox_id: inbox });
                contactoId = (data.payload?.contact || data.payload || data).id;
            }

            const { data: ci } = await api.post(`/contacts/${contactoId}/contact_inboxes`, { inbox_id: inbox });
            const { data: conv } = await api.post('/conversations', { source_id: ci.source_id, inbox_id: inbox, contact_id: contactoId });
            await api.post(`/conversations/${conv.id}/messages`, { content: mensaje, message_type: 'incoming' });
            await api.post(`/conversations/${conv.id}/labels`, { labels: etiquetas });
            console.log(`[Chatwoot] Lead de auto registrado (contacto ${contactoId}, conversación ${conv.id}, ${existente ? 'contacto existente' : 'contacto nuevo'})`);
            return { contactoId, conversacionId: conv.id };
        } catch (error) {
            // Sin datos personales: solo el estado y la respuesta de Chatwoot, recortada.
            const motivo = control.signal.aborted ? `sin respuesta en ${PLAZO_MS / 1000} s`
                : `${error.response?.status || error.code || 'ERROR'} ${JSON.stringify(error.response?.data || error.message).slice(0, 300)}`;
            console.error(`[Chatwoot] No se pudo registrar el lead de auto: ${motivo}`);
            return { error: motivo };
        } finally {
            clearTimeout(reloj);
        }
    }

    return { configurado, dryRun, armar, enviar };
}

module.exports = { crearChatwoot, etiqueta };

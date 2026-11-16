// Leads → motor de leads de Mercurial (servicio aparte: guarda el lead en su base y deja UNA
// conversación en el inbox de WhatsApp de Chatwoot, con los datos como nota privada).
//
// Variables: MOTOR_LEADS_URL, MOTOR_LEADS_TOKEN. Si falta alguna, `configurado` es false y el sitio
// sigue con el flujo anterior (correo + chatwoot.js). MOTOR_LEADS_DRY_RUN=1 imprime lo que mandaría.
// Nunca lanza: si el motor falla o tarda más de PLAZO_MS, deja una línea en el log y devuelve
// { entregado: false }, y el sitio manda el correo de respaldo.
const axios = require('axios');

const PLAZO_MS = 10000;

function crearMotor(env = process.env) {
    const url = (env.MOTOR_LEADS_URL || '').replace(/\/+$/, '');
    const token = env.MOTOR_LEADS_TOKEN;
    const dryRun = env.MOTOR_LEADS_DRY_RUN === '1';
    const configurado = Boolean(url && token);

    // lead: { producto, nombre, telefono, correo, rut, datos: {…}, fuente, medio, campana, contenido, procedencia, pagina }
    // `entregado` es true solo si el lead quedó guardado Y en Chatwoot: recién ahí el correo sobra.
    async function enviar(lead) {
        const cuerpo = Object.fromEntries(Object.entries(lead).filter(([, v]) => v !== '' && v != null));
        if (dryRun) {
            console.log('[Motor] DRY RUN, no se llama al motor. Se mandaría:\n' + JSON.stringify(cuerpo, null, 2));
            return { entregado: true, dryRun: true };
        }
        if (!configurado) return { entregado: false, omitido: true };
        try {
            const { data } = await axios.post(`${url}/leads`, cuerpo, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                timeout: PLAZO_MS
            });
            const entregado = Boolean(data.ok && data.chatwoot);
            console.log(`[Motor] Lead ${data.codigo} (${lead.producto})${data.repetido ? ', repetido' : ''}: `
                + (entregado ? `conversación ${data.conversacion_id}` : 'guardado, pero Chatwoot falló'));
            return { entregado, codigo: data.codigo, repetido: Boolean(data.repetido) };
        } catch (error) {
            // Sin datos personales: solo el estado y la respuesta del motor, recortada.
            const motivo = `${error.response?.status || error.code || 'ERROR'} ${JSON.stringify(error.response?.data || error.message).slice(0, 300)}`;
            console.error(`[Motor] No se pudo registrar el lead (${lead.producto}): ${motivo}`);
            return { entregado: false, error: motivo };
        }
    }

    return { configurado, dryRun, enviar };
}

module.exports = { crearMotor };

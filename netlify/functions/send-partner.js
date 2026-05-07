/**
 * Netlify Function: send-partner
 * Maneja el formulario de Brand Partnership (/partners)
 * Destinatarios: daniel@segreta.cl, admin@segreta.cl
 * También registra el lead en Google Sheets vía Make webhook
 */

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Bad Request' };
  }

  const { nombre, empresa, telefono, email, email_confirm, mensaje } = body;

  if (!nombre || !email || !mensaje) {
    return { statusCode: 400, body: 'Campos requeridos faltantes' };
  }
  if (email !== email_confirm) {
    return { statusCode: 400, body: 'Los emails no coinciden' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: 'Email inválido' };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY no configurada');
    return { statusCode: 500, body: 'Error de configuración' };
  }

  const emailBody = `
Nuevo mensaje desde segreta.cl — Brand Partnership

Nombre:             ${nombre}
Empresa / Proyecto: ${empresa || 'No indicado'}
Email:              ${email}
Teléfono:           ${telefono || 'No indicado'}

Mensaje:
${mensaje}
  `.trim();

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Segreta Web <no-reply@segreta.cl>',
        to: ['daniel@segreta.cl', 'admin@segreta.cl'],
        reply_to: email,
        subject: `Brand Partnership: ${empresa || nombre}`,
        text: emailBody,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return { statusCode: 502, body: 'Error al enviar el email' };
    }

    const resendData = await res.json();

    // Registrar en Google Sheets vía Make webhook
    const SHEETS_WEBHOOK = process.env.SHEETS_PARTNER_WEBHOOK_URL;
    if (SHEETS_WEBHOOK) {
      try {
        await fetch(SHEETS_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resend_id: resendData.id || '',
            nombre,
            empresa:  empresa  || '',
            email,
            telefono: telefono || '',
            mensaje,
          }),
        });
      } catch (sheetErr) {
        console.error('Sheets webhook error:', sheetErr);
      }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, body: 'Error interno' };
  }
};

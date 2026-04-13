/**
 * Netlify Function: send-contact
 * Maneja el formulario de cotización de eventos (/experiencias)
 * Destinatarios: reservas@segreta.cl, daniel@segreta.cl, ignacio@segreta.cl
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

  const { nombre, email, email_confirm, telefono, mensaje } = body;

  // Validaciones básicas
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
Nuevo contacto desde segreta.cl — Formulario de Eventos

Nombre: ${nombre}
Email: ${email}
Teléfono: ${telefono || 'No indicado'}

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
        to: ['reservas@segreta.cl', 'daniel@segreta.cl', 'ignacio@segreta.cl'],
        reply_to: email,
        subject: `Contacto Web: ${nombre}`,
        text: emailBody,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return { statusCode: 502, body: 'Error al enviar el email' };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, body: 'Error interno' };
  }
};

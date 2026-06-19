/**
 * Netlify Function: salon-feedback
 * Recibe el feedback del Portal de Salón (same-origin, sin CORS) y lo reenvía
 * server-side al Apps Script del Sheet, que lo agrega a la pestaña "Feedback".
 * La URL del Apps Script vive en la variable de entorno SALON_FEEDBACK_URL
 * (Netlify → Site settings → Environment variables), nunca en el cliente.
 */

const APPS_URL = process.env.SALON_FEEDBACK_URL ||
  'https://script.google.com/macros/s/AKfycbypv1XOhwVSdhnALxeT_AT0lPU6OMPHs52gac7K3KOwD5zGDPs7pD3N7Ti7g-2oqNLn/exec';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'method' }) };
  }
  if (!APPS_URL) {
    console.error('SALON_FEEDBACK_URL no configurada');
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'config' }) };
  }
  try {
    const data = JSON.parse(event.body || '{}');
    const mensaje = (data.mensaje || '').toString().trim();
    if (!mensaje) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'vacio' }) };
    }
    const payload = {
      garzon: data.anon ? '' : (data.garzon || '').toString().slice(0, 60),
      mensaje: mensaje.slice(0, 4000),
      anon: !!data.anon,
    };
    const r = await fetch(APPS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });
    return {
      statusCode: r.ok ? 200 : 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: r.ok }),
    };
  } catch (err) {
    console.error('salon-feedback exception:', err);
    return { statusCode: 502, body: JSON.stringify({ ok: false, error: 'upstream' }) };
  }
};

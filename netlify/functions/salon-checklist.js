/**
 * Netlify Function: salon-checklist
 * Recibe el registro del checklist de salón (apertura/intermedios/cierre) desde
 * el Portal de Salón y lo reenvía server-side al Apps Script del Sheet, que lo
 * agrega a la pestaña "Checklist". Reusa la misma URL del Apps Script del feedback
 * (variable de entorno SALON_FEEDBACK_URL); el Apps Script rutea por data.tipo.
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
    const payload = {
      tipo: 'checklist',
      lista: (data.lista || '').toString().slice(0, 40),
      responsable: (data.responsable || '').toString().slice(0, 60),
      completados: Number(data.completados) || 0,
      total: Number(data.total) || 0,
      pendientes: (data.pendientes || '').toString().slice(0, 4000),
    };
    if (!payload.lista || !payload.responsable) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'incompleto' }) };
    }
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
    console.error('salon-checklist exception:', err);
    return { statusCode: 502, body: JSON.stringify({ ok: false, error: 'upstream' }) };
  }
};

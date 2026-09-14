/**
 * Netlify Function: cocina-feedback
 * Recibe los mensajes del Portal de Cocina (same-origin, sin CORS) y los reenvía
 * server-side al Apps Script del Sheet, que los agrega a la pestaña "Mensajes".
 *
 * La URL va aquí abajo. Se puede sobrescribir sin tocar el código con la variable de
 * entorno COCINA_FEEDBACK_URL (Netlify → Site settings → Environment variables).
 */
const APPS_URL = process.env.COCINA_FEEDBACK_URL ||
  'https://script.google.com/macros/s/AKfycbytbJSq5m6wSw_KPoLZBVDUdY23o163p5v2yTcjxgqwGljMEaWMv2zaJDTu9S60wLsnXg/exec';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'method' }) };
  }
  if (!APPS_URL) {
    console.error('COCINA_FEEDBACK_URL no configurada');
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'config' }) };
  }
  try {
    const d = JSON.parse(event.body || '{}');
    const mensaje = (d.mensaje || '').toString().trim();
    if (!mensaje) return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'vacio' }) };
    const payload = {
      nombre:  (d.nombre  || '').toString().slice(0, 60),
      tipo:    (d.tipo    || '').toString().slice(0, 60),
      receta:  (d.receta  || '').toString().slice(0, 120),
      mensaje: mensaje.slice(0, 4000),
    };
    const r = await fetch(APPS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });
    return { statusCode: r.ok ? 200 : 502, headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ ok: r.ok }) };
  } catch (err) {
    console.error('cocina-feedback exception:', err);
    return { statusCode: 502, body: JSON.stringify({ ok: false, error: 'upstream' }) };
  }
};

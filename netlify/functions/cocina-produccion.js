/**
 * Netlify Function: cocina-produccion
 * Pizarra de necesidades de producción del Portal de Cocina.
 *
 * GET  → devuelve las tarjetas vigentes (lee el Apps Script, no el CSV publicado: el CSV
 *        de Google se cachea varios minutos y la pizarra tiene que ir al día).
 * POST → crea una tarjeta, cambia su estado o marca ítems hechos.
 *
 * Usa el mismo Apps Script que los mensajes. La URL se puede sobrescribir con la variable
 * de entorno COCINA_FEEDBACK_URL (Netlify → Site settings → Environment variables).
 */
const APPS_URL = process.env.COCINA_FEEDBACK_URL ||
  'https://script.google.com/macros/s/AKfycbytbJSq5m6wSw_KPoLZBVDUdY23o163p5v2yTcjxgqwGljMEaWMv2zaJDTu9S60wLsnXg/exec';

const JSON_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

exports.handler = async (event) => {
  if (!APPS_URL) {
    console.error('COCINA_FEEDBACK_URL no configurada');
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'config' }) };
  }

  try {
    if (event.httpMethod === 'GET') {
      const r = await fetch(APPS_URL + '?q=produccion', { redirect: 'follow' });
      if (!r.ok) throw new Error('upstream ' + r.status);
      return { statusCode: 200, headers: JSON_HEADERS, body: await r.text() };
    }

    if (event.httpMethod === 'POST') {
      const d = JSON.parse(event.body || '{}');
      const accion = String(d.accion || '');
      if (!accion.startsWith('produccion.')) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'accion' }) };
      }
      const r = await fetch(APPS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(d),
        redirect: 'follow',
      });
      return { statusCode: r.ok ? 200 : 502, headers: JSON_HEADERS, body: await r.text() };
    }

    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'method' }) };
  } catch (err) {
    console.error('cocina-produccion exception:', err);
    return { statusCode: 502, headers: JSON_HEADERS, body: JSON.stringify({ ok: false, error: 'upstream' }) };
  }
};

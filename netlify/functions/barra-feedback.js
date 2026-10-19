/**
 * Netlify Function: barra-feedback
 * Recibe los mensajes del Portal de Barra (segreta.cl/barra) y:
 *   1. los manda por correo a pedro@segreta.cl vía Resend (RESEND_API_KEY ya está en Netlify), y
 *   2. si existe BARRA_FEEDBACK_URL (Apps Script del Sheet), los agrega también a la pestaña "Mensajes".
 * Responde ok si al menos uno de los dos canales funcionó.
 */
const APPS_URL = process.env.BARRA_FEEDBACK_URL || '';
const RESEND = process.env.RESEND_API_KEY || '';
const TO = (process.env.BARRA_FEEDBACK_TO || 'pedro@segreta.cl').split(',').map(s => s.trim());

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'method' }) };
  let d;
  try { d = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: JSON.stringify({ ok: false }) }; }
  const mensaje = (d.mensaje || '').toString().trim();
  if (!mensaje) return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'vacio' }) };
  const p = {
    nombre: (d.nombre || '').toString().slice(0, 60),
    tipo: (d.tipo || '').toString().slice(0, 60),
    receta: (d.receta || '').toString().slice(0, 120),
    mensaje: mensaje.slice(0, 4000),
  };

  const tasks = [];
  if (RESEND) {
    const asunto = `Portal de Barra · ${p.tipo}${p.receta ? ' · ' + p.receta : ''} (${p.nombre})`;
    const texto = `Mensaje desde segreta.cl/barra\n\nDe:      ${p.nombre}\nTipo:    ${p.tipo}\nTrago:   ${p.receta || '—'}\n\n${p.mensaje}`;
    tasks.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Portal de Barra <no-reply@segreta.cl>', to: TO, subject: asunto, text: texto }),
    }).then(r => r.ok).catch(() => false));
  }
  if (APPS_URL) {
    tasks.push(fetch(APPS_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(p), redirect: 'follow',
    }).then(r => r.ok).catch(() => false));
  }
  if (!tasks.length) {
    console.error('barra-feedback: sin RESEND_API_KEY ni BARRA_FEEDBACK_URL');
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'config' }) };
  }
  const res = await Promise.all(tasks);
  const ok = res.some(Boolean);
  return { statusCode: ok ? 200 : 502, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok }) };
};

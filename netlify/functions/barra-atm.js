/**
 * Netlify Function: barra-atm
 * Puente entre el módulo Arma tu Mix del Portal de Barra y el Apps Script del Sheet "Portal de Barra · Segreta"
 * (misma URL que los mensajes: variable BARRA_FEEDBACK_URL; el Apps Script rutea por tipo).
 *   GET  → todos los días y mixes  { ok, dias, mixes }
 *   POST { ops: [...] } → aplica las operaciones en orden  { ok, done: [opid], state: { dias, mixes } }
 * Sin la variable responde 503 { error: 'config' } y el portal deja todo en cola en el equipo.
 */
const APPS_URL = process.env.BARRA_FEEDBACK_URL || '';

const J = (code, body) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (!APPS_URL) return J(503, { ok: false, error: 'config' });
  try {
    if (event.httpMethod === 'GET') {
      const r = await fetch(APPS_URL + '?atm=1', { redirect: 'follow' });
      if (!r.ok) return J(502, { ok: false, error: 'upstream' });
      return J(200, await r.json());
    }
    if (event.httpMethod === 'POST') {
      const d = JSON.parse(event.body || '{}');
      const ops = Array.isArray(d.ops) ? d.ops.slice(0, 200) : [];
      if (!ops.length) return J(400, { ok: false, error: 'vacio' });
      const r = await fetch(APPS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ tipo: 'atm', ops }),
        redirect: 'follow',
      });
      if (!r.ok) return J(502, { ok: false, error: 'upstream' });
      const out = await r.json();
      return J(out.ok ? 200 : 502, out);
    }
    return J(405, { ok: false, error: 'method' });
  } catch (err) {
    console.error('barra-atm exception:', err);
    return J(502, { ok: false, error: 'upstream' });
  }
};

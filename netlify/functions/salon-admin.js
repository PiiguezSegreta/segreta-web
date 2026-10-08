/**
 * Netlify Function: salon-admin
 * Canal de "super admin" del Portal de Salón para David e Isaac.
 *  - GET  -> proxya el doGet del Apps Script y devuelve los overrides activos
 *            (aviso y stock de David/Isaac) en JSON, con caché corto para que
 *            un cambio aparezca casi al instante sin reventar cuotas.
 *  - POST -> valida la CLAVE de admin (env SALON_ADMIN_KEY, nunca en el cliente)
 *            y que el autor sea David o Isaac, y reenvía al Apps Script (doPost).
 * Reusa la misma URL del Apps Script del feedback (SALON_FEEDBACK_URL).
 */

const APPS_URL = process.env.SALON_FEEDBACK_URL ||
  'https://script.google.com/macros/s/AKfycbypv1XOhwVSdhnALxeT_AT0lPU6OMPHs52gac7K3KOwD5zGDPs7pD3N7Ti7g-2oqNLn/exec';
const ADMIN_KEY = process.env.SALON_ADMIN_KEY || '';

function arr(x) { return Array.isArray(x) ? x.slice(0, 30).map(s => s.toString().slice(0, 80)) : []; }

exports.handler = async (event) => {
  // ── Lectura en vivo de overrides ──
  if (event.httpMethod === 'GET') {
    try {
      const r = await fetch(APPS_URL, { method: 'GET', redirect: 'follow' });
      const txt = await r.text();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' },
        body: txt,
      };
    } catch (e) {
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aviso: {}, stock: {} }) };
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'method' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    if (!ADMIN_KEY || data.clave !== ADMIN_KEY) {
      return { statusCode: 401, body: JSON.stringify({ ok: false, error: 'clave' }) };
    }
    if (data.autor !== 'David' && data.autor !== 'Isaac') {
      return { statusCode: 403, body: JSON.stringify({ ok: false, error: 'autor' }) };
    }
    if (data.tipo !== 'anuncio' && data.tipo !== 'stock' && data.tipo !== 'plazas') {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'tipo' }) };
    }
    var accion = 'enviar';
    if (data.accion === 'quitar') accion = 'quitar';
    else if (data.accion === 'visibilidad') accion = 'visibilidad';
    const plz = {};
    ['T', 'M', 'P', 'B', 'S', 'K'].forEach(function (L) {
      plz[L] = ((data.plazas && data.plazas[L]) || '').toString().slice(0, 40);
    });
    const payload = {
      tipo: data.tipo,
      accion: accion,
      autor: data.autor,
      texto: (data.texto || '').toString().slice(0, 600),
      target: ['sheet', 'David', 'Isaac'].indexOf(data.target) >= 0 ? data.target : '',
      vis: data.vis === true,
      s101: arr(data.s101),
      s85: arr(data.s85),
      s86: arr(data.s86),
      plazas: plz,
      runnerBarra: (data.runnerBarra || '').toString().slice(0, 40),
      runnerCocina: (data.runnerCocina || '').toString().slice(0, 40),
      busser: (data.busser || '').toString().slice(0, 40),
    };
    const r = await fetch(APPS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });
    return { statusCode: r.ok ? 200 : 502, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: r.ok }) };
  } catch (err) {
    console.error('salon-admin exception:', err);
    return { statusCode: 502, body: JSON.stringify({ ok: false, error: 'upstream' }) };
  }
};

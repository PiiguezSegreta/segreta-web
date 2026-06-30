/**
 * Netlify Function: salon-data
 * Proxy server-side de las 3 pestañas publicadas del Sheet del Juego de Salón
 * (Ranking, Grupal, Anuncios). Se hace del lado del servidor para evitar el
 * bloqueo CORS del redirect de docs.google.com → googleusercontent.com, y de
 * paso oculta los links del Sheet al cliente.
 * El portal (segreta.cl/salon) llama a /.netlify/functions/salon-data.
 */

const SHEETS = {
  ranking:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSllQw1AZKA8M-UyXTAEIf5nQjZnq1Ozde82oeB9h-xKKdxrnj6NJQ9yqj_47tz4HFtYkEfjtyHJgrG/pub?gid=445853915&single=true&output=csv',
  grupal:   'https://docs.google.com/spreadsheets/d/e/2PACX-1vSllQw1AZKA8M-UyXTAEIf5nQjZnq1Ozde82oeB9h-xKKdxrnj6NJQ9yqj_47tz4HFtYkEfjtyHJgrG/pub?gid=1293215392&single=true&output=csv',
  anuncios: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSllQw1AZKA8M-UyXTAEIf5nQjZnq1Ozde82oeB9h-xKKdxrnj6NJQ9yqj_47tz4HFtYkEfjtyHJgrG/pub?gid=734478404&single=true&output=csv',
};

exports.handler = async () => {
  try {
    const out = {};
    await Promise.all(Object.entries(SHEETS).map(async ([k, url]) => {
      const r = await fetch(url, { redirect: 'follow' });
      out[k] = r.ok ? await r.text() : '';
    }));
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // CDN cachea 2 min; sirve stale hasta 5 min más mientras revalida
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify(out),
    };
  } catch (err) {
    console.error('salon-data exception:', err);
    return { statusCode: 502, body: JSON.stringify({ error: 'upstream' }) };
  }
};

/**
 * Netlify Function: cocina-data
 * Proxy server-side de la pestaña "Anuncios" del Sheet "Portal de Cocina · Segreta"
 * (publicada como CSV). Se hace del lado del servidor para evitar el bloqueo CORS del
 * redirect de docs.google.com → googleusercontent.com, y de paso oculta el link del Sheet.
 * El portal (segreta.cl/cocina) llama a /.netlify/functions/cocina-data.
 *
 * El link va aquí abajo. Se puede sobrescribir sin tocar el código con la variable de
 * entorno COCINA_ANUNCIOS_CSV (Netlify → Site settings → Environment variables).
 */
const CSV = process.env.COCINA_ANUNCIOS_CSV ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQzUnDdN0w1LJHxPBARyYUyl-HT-Db3Qy97mgfLoG0EcUkPn8vsZZYcVmXYR-EJcy76y5Haz_CuvvkN/pub?gid=916286478&single=true&output=csv';

exports.handler = async () => {
  if (!CSV) {
    console.error('COCINA_ANUNCIOS_CSV no configurada');
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ anuncios: '' }) };
  }
  try {
    const r = await fetch(CSV, { redirect: 'follow' });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ anuncios: r.ok ? await r.text() : '' }),
    };
  } catch (err) {
    console.error('cocina-data exception:', err);
    return { statusCode: 502, body: JSON.stringify({ error: 'upstream' }) };
  }
};

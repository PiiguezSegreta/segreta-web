/**
 * Netlify Function: barra-data
 * Proxy server-side de la pestaña "Anuncios" del Sheet "Portal de Barra · Segreta" (publicada como CSV).
 * Mismo patrón que cocina-data.js. Mientras no exista la variable BARRA_ANUNCIOS_CSV, responde vacío
 * y el portal muestra el aviso por defecto y "sin novedades de stock".
 */
const CSV = process.env.BARRA_ANUNCIOS_CSV || '';

exports.handler = async () => {
  const ok = body => ({ statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
                        body: JSON.stringify(body) });
  if (!CSV) return ok({ anuncios: '' });
  try {
    const r = await fetch(CSV, { redirect: 'follow' });
    return ok({ anuncios: r.ok ? await r.text() : '' });
  } catch (err) {
    console.error('barra-data exception:', err);
    return { statusCode: 502, body: JSON.stringify({ error: 'upstream' }) };
  }
};

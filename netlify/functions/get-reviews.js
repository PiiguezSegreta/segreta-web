/**
 * Netlify Function: get-reviews
 * Fetches Google Places reviews for Segreta Pizza & Bar via Places API (New).
 * Respuesta cacheada 24h en el CDN de Netlify — Google API se llama como máximo
 * una vez por día por nodo edge.
 */

const PLACE_ID = 'ChIJC_9ArM7PYpYRE1eAysJIdWA';
const API_URL  = `https://places.googleapis.com/v1/places/${PLACE_ID}`;
const FIELDS   = 'reviews,rating,userRatingCount';

exports.handler = async () => {
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  if (!API_KEY) {
    console.error('GOOGLE_PLACES_API_KEY no configurada');
    return { statusCode: 500, body: JSON.stringify({ error: 'config' }) };
  }

  try {
    const res = await fetch(API_URL, {
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': FIELDS,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Places API error:', res.status, err);
      return { statusCode: 502, body: JSON.stringify({ error: 'upstream' }) };
    }

    const data = await res.json();

    // Priorizar reseñas de 5 estrellas con texto; completar con 4 estrellas si faltan
    const all = (data.reviews || []).filter(r => r.text?.text);
    const fives = all.filter(r => r.rating === 5);
    const fours = all.filter(r => r.rating === 4);
    const selected = [...fives, ...fours].slice(0, 3);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // CDN cachea 24h; sirve versión stale hasta 1h más mientras revalida
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
      body: JSON.stringify({
        rating: data.rating ?? null,
        userRatingCount: data.userRatingCount ?? null,
        reviews: selected.map(r => ({
          rating:       r.rating,
          text:         r.text.text,
          author:       r.authorAttribution?.displayName ?? 'Cliente',
          relativeTime: r.relativePublishTimeDescription ?? '',
        })),
      }),
    };

  } catch (err) {
    console.error('get-reviews exception:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'internal' }) };
  }
};

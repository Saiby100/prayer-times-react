/// <reference lib="deno.ns" />
// Proxies Places API (New) "Nearby Search" so the API key never ships in the app.
// The key lives only as the GOOGLE_PLACES_API_KEY secret on this function.
//
// Uses a field mask requesting only id, displayName, and location — no ratings —
// to stay on the cheaper SKU tier and avoid returning data we never render.
//
// Deploy:  supabase functions deploy nearby-mosques
// Secret:  supabase secrets set GOOGLE_PLACES_API_KEY=...

// 50km is the maximum the Places API (New) circle search allows. With
// rankPreference DISTANCE the API still returns only the nearest results, so a
// wide radius costs nothing in cities (same nearest 20) but reaches far enough
// to find a mosque when travelling through sparse areas.
const RADIUS_METERS = 50000;
const MAX_RESULTS = 20;
// Only the fields we actually use; keeps us on the cheaper Pro SKU and out of Enterprise (ratings).
const FIELD_MASK = 'places.id,places.displayName,places.location';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type RequestBody = {
  /** Latitude in decimal degrees. */
  lat: number;
  /** Longitude in decimal degrees. */
  lng: number;
};

type PlacesResult = {
  /** Stable Place ID, safe to cache indefinitely. */
  id: string;
  /** Localised display name; `text` holds the human-readable name. */
  displayName?: { text: string; languageCode?: string };
  /** Geographic coordinates of the place. */
  location: { latitude: number; longitude: number };
};

type PlacesResponse = {
  /** Matching places; absent when there are no results. */
  places?: PlacesResult[];
  /** Present only on an error response. */
  error?: { code: number; message: string; status: string };
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  if (!apiKey) {
    return json({ error: 'GOOGLE_PLACES_API_KEY is not configured' }, 500);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { lat, lng } = body;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return json({ error: 'lat and lng must be numbers' }, 400);
  }

  let res: Response;
  let data: PlacesResponse;
  try {
    res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        includedTypes: ['mosque'],
        maxResultCount: MAX_RESULTS,
        rankPreference: 'DISTANCE',
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: RADIUS_METERS,
          },
        },
      }),
    });
    data = await res.json();
  } catch (e) {
    return json({ error: `Failed to reach Places API: ${String(e)}` }, 502);
  }

  if (!res.ok) {
    return json({ error: `Places API error: ${data.error?.message ?? res.status}` }, 502);
  }

  const mosques = (data.places ?? []).map((place) => ({
    placeId: place.id,
    name: place.displayName?.text ?? '',
    location: {
      lat: place.location.latitude,
      lng: place.location.longitude,
    },
  }));

  return json({ mosques });
});

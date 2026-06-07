/// <reference lib="deno.ns" />
// Proxies Google Places "nearby search" so the API key never ships in the app.
// The key lives only as the GOOGLE_PLACES_API_KEY secret on this function.
//
// Deploy:  supabase functions deploy nearby-mosques
// Secret:  supabase secrets set GOOGLE_PLACES_API_KEY=...

const RADIUS_METERS = 5000;

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
  place_id: string;
  name: string;
  geometry: { location: { lat: number; lng: number } };
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

  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${lat},${lng}&radius=${RADIUS_METERS}&type=mosque&key=${apiKey}`;

  let data: { status: string; results?: PlacesResult[]; error_message?: string };
  try {
    const res = await fetch(url);
    data = await res.json();
  } catch (e) {
    return json({ error: `Failed to reach Places API: ${String(e)}` }, 502);
  }

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    return json({ error: `Places API status: ${data.status}`, detail: data.error_message }, 502);
  }

  const mosques = (data.results ?? []).map((place) => ({
    placeId: place.place_id,
    name: place.name,
    location: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    },
  }));

  return json({ mosques });
});

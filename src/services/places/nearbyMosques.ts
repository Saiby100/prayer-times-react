import Constants from 'expo-constants';
import { calculateDistanceKm } from '@/utils/distance';
import log from '@/utils/logger';
import type { Mosque } from './types';

const API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey as string;
const RADIUS_METERS = 5000;

const fetchNearbyMosques = async (lat: number, lng: number): Promise<Mosque[]> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${RADIUS_METERS}&type=mosque&key=${API_KEY}`;

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      log.debug('nearbyMosques: Google Places API returned non-OK status', {
        type: 'api',
        status: response.status,
        apikey: API_KEY,
        test: "testing"
      });
      log.warn('nearbyMosques: Google Places API returned non-OK status', {
        type: 'api',
        status: response.status,
      });
      throw new Error(`Places API: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      log.warn('nearbyMosques: unexpected API status', {
        type: 'api',
        status: data.status,
        errorMessage: data.error_message,
      });
      throw new Error(`Places API status: ${data.status}`);
    }

    const mosques: Mosque[] = (data.results ?? []).map(
      (place: {
        place_id: string;
        name: string;
        geometry: { location: { lat: number; lng: number } };
      }) => ({
        placeId: place.place_id,
        name: place.name,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        distanceKm: calculateDistanceKm(
          lat,
          lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
      })
    );

    return mosques.sort((a, b) => a.distanceKm - b.distanceKm);
  } catch (e) {
    clearTimeout(timeout);
    log.warn('nearbyMosques: failed to fetch nearby mosques', {
      type: 'api',
      error: String(e),
    });
    throw e;
  }
};

export { fetchNearbyMosques };

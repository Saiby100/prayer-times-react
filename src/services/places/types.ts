type Coordinates = {
  /** Latitude in decimal degrees. */
  lat: number;
  /** Longitude in decimal degrees. */
  lng: number;
};

type Mosque = {
  /** Google Places unique identifier. */
  placeId: string;
  /** Display name of the mosque. */
  name: string;
  /** GPS coordinates of the mosque. */
  location: Coordinates;
  /** Distance from the user in kilometres. */
  distanceKm: number;
};

export type { Coordinates, Mosque };

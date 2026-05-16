type AreaCoordinate = {
  /** Latitude in decimal degrees. */
  lat: number;
  /** Longitude in decimal degrees. */
  lng: number;
};

const AREA_COORDINATES: Record<string, AreaCoordinate> = {
  'Cape Town': { lat: -33.9249, lng: 18.4241 },
  Johannesburg: { lat: -26.2041, lng: 28.0473 },
  Durban: { lat: -29.8587, lng: 31.0218 },
  Pretoria: { lat: -25.7479, lng: 28.2293 },
  'Port Elizabeth': { lat: -33.9608, lng: 25.6022 },
  Pietermaritzburg: { lat: -29.6006, lng: 30.3794 },
  'East London': { lat: -33.0153, lng: 27.9116 },
  Bloemfontein: { lat: -29.0852, lng: 26.1596 },
  Kimberley: { lat: -28.7382, lng: 24.7499 },
  Polokwane: { lat: -23.9045, lng: 29.4689 },
  Nelspruit: { lat: -25.4753, lng: 30.9694 },
  Rustenburg: { lat: -25.6715, lng: 27.242 },
  Potchefstroom: { lat: -26.7145, lng: 27.0986 },
  Klerksdorp: { lat: -26.8521, lng: 26.6599 },
  Welkom: { lat: -27.9767, lng: 26.7135 },
  Vereeniging: { lat: -26.6736, lng: 27.9262 },
  Benoni: { lat: -26.1883, lng: 28.3208 },
  Boksburg: { lat: -26.2124, lng: 28.2556 },
  Springs: { lat: -26.2547, lng: 28.4428 },
  Germiston: { lat: -26.2197, lng: 28.1676 },
  Kempton: { lat: -26.1, lng: 28.2333 },
  'Kempton Park': { lat: -26.1, lng: 28.2333 },
  Alberton: { lat: -26.2673, lng: 28.1222 },
  Lenasia: { lat: -26.3217, lng: 27.8328 },
  Laudium: { lat: -25.7667, lng: 28.1 },
  Erasmia: { lat: -25.82, lng: 28.1 },
  Roshnee: { lat: -26.5167, lng: 27.85 },
  Azaadville: { lat: -26.1667, lng: 27.6 },
  Randfontein: { lat: -26.1833, lng: 27.7 },
  Krugersdorp: { lat: -26.0858, lng: 27.7744 },
  Midrand: { lat: -25.9897, lng: 28.1272 },
  Sandton: { lat: -26.1076, lng: 28.0567 },
  Mayfair: { lat: -26.1928, lng: 27.9944 },
  Fordsburg: { lat: -26.2028, lng: 28.0267 },
  Newtown: { lat: -26.2014, lng: 28.0328 },
  Soweto: { lat: -26.2678, lng: 27.8586 },
  Chatsworth: { lat: -29.9133, lng: 30.8889 },
  Phoenix: { lat: -29.7131, lng: 31.0 },
  Overport: { lat: -29.8333, lng: 30.9833 },
  Verulam: { lat: -29.6419, lng: 31.05 },
  Stanger: { lat: -29.3383, lng: 31.2889 },
  Ladysmith: { lat: -28.5567, lng: 29.7817 },
  Newcastle: { lat: -27.7581, lng: 29.9319 },
  Dundee: { lat: -28.1669, lng: 30.2333 },
  Estcourt: { lat: -29.0033, lng: 29.8833 },
  Paarl: { lat: -33.7242, lng: 18.9725 },
  Stellenbosch: { lat: -33.9321, lng: 18.8602 },
  Worcester: { lat: -33.6464, lng: 19.4478 },
  Oudtshoorn: { lat: -33.5898, lng: 22.2034 },
  'George (W Cape)': { lat: -33.963, lng: 22.4614 },
  George: { lat: -33.963, lng: 22.4614 },
  'Mossel Bay': { lat: -34.1833, lng: 22.1333 },
  Knysna: { lat: -34.0363, lng: 23.0488 },
  Graaff: { lat: -32.2492, lng: 24.5306 },
  'Graaff-Reinet': { lat: -32.2492, lng: 24.5306 },
  Grahamstown: { lat: -33.3042, lng: 26.5328 },
  Uitenhage: { lat: -33.7667, lng: 25.4 },
  Cradock: { lat: -32.1667, lng: 25.6167 },
  Queenstown: { lat: -31.8975, lng: 26.8753 },
  'King William': { lat: -32.8811, lng: 27.3939 },
  "King William's Town": { lat: -32.8811, lng: 27.3939 },
  Umtata: { lat: -31.5889, lng: 28.7844 },
  Mthatha: { lat: -31.5889, lng: 28.7844 },
  Middelburg: { lat: -25.7747, lng: 29.4644 },
  Witbank: { lat: -25.8722, lng: 29.2167 },
  Standerton: { lat: -26.9333, lng: 29.2333 },
  Ermelo: { lat: -26.5333, lng: 29.9833 },
  Lydenburg: { lat: -25.1, lng: 30.45 },
  Tzaneen: { lat: -23.8333, lng: 30.1667 },
  'Louis Trichardt': { lat: -23.0444, lng: 29.9025 },
  Thohoyandou: { lat: -22.9486, lng: 30.4833 },
  Upington: { lat: -28.4478, lng: 21.2561 },
  Mafikeng: { lat: -25.8653, lng: 25.6436 },
  Mahikeng: { lat: -25.8653, lng: 25.6436 },
  Lichtenburg: { lat: -26.15, lng: 26.15 },
  Brits: { lat: -25.6333, lng: 27.7833 },
  Centurion: { lat: -25.8603, lng: 28.1894 },
};

const getAreaCoordinates = (areaName: string): AreaCoordinate | null => {
  const direct = AREA_COORDINATES[areaName];
  if (direct) return direct;

  const lowerName = areaName.toLowerCase();
  const match = Object.entries(AREA_COORDINATES).find(([key]) => key.toLowerCase() === lowerName);
  return match ? match[1] : null;
};

export { AREA_COORDINATES, getAreaCoordinates };
export type { AreaCoordinate };

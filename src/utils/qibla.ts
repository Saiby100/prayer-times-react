const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const toRadians = (degrees: number) => degrees * (Math.PI / 180);
const toDegrees = (radians: number) => radians * (180 / Math.PI);

const calculateQiblaBearing = (userLat: number, userLng: number): number => {
  const lat1 = toRadians(userLat);
  const lat2 = toRadians(KAABA_LAT);
  const deltaLng = toRadians(KAABA_LNG - userLng);

  const x = Math.sin(deltaLng) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  const bearing = toDegrees(Math.atan2(x, y));
  return (bearing + 360) % 360;
};

const getBearingCardinal = (bearing: number): string => {
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return cardinals[index];
};

export { KAABA_LAT, KAABA_LNG, calculateQiblaBearing, getBearingCardinal };

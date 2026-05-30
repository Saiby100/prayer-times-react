import { Linking, Platform } from 'react-native';

const openMaps = (lat: number, lng: number, label?: string) => {
  const encodedLabel = encodeURIComponent(label ?? '');
  const url = Platform.select({
    ios: `maps:0,0?q=${encodedLabel}@${lat},${lng}`,
    default: `geo:0,0?q=${lat},${lng}(${encodedLabel})`,
  })!;

  Linking.openURL(url);
};

export default openMaps;

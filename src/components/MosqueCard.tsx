import { StyleSheet, TouchableOpacity } from 'react-native';
import { Icon, Text, useTheme } from '@rneui/themed';

type MosqueCardProps = {
  /** Display name of the mosque. */
  name: string;
  /** Distance from the user in kilometres. */
  distanceKm: number;
  /** Called when the card is pressed. */
  onPress: () => void;
};

const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

const MosqueCard = ({ name, distanceKm, onPress }: MosqueCardProps) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.bgLight }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon name="map-pin" type="feather" color={theme.colors.primary} size={20} />
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={[styles.distance, { color: theme.colors.text + '80' }]}>
        {formatDistance(distanceKm)}
      </Text>
      <Icon name="chevron-right" type="feather" color={theme.colors.text + '40'} size={18} />
    </TouchableOpacity>
  );
};

export default MosqueCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  distance: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});

import { StyleSheet, TouchableOpacity } from 'react-native';
import { Icon, Text, useTheme } from '@rneui/themed';

type AreaCardProps = {
  area: string;
  onPress: (area: string) => void;
};

const AreaCard = ({ area, onPress }: AreaCardProps) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.bgLight }]}
      onPress={() => onPress(area)}
      activeOpacity={0.7}
    >
      <Icon name="location-pin" color={theme.colors.primary} size={22} />
      <Text style={styles.text}>{area}</Text>
      <Icon name="chevron-right" color={theme.colors.text + '40'} size={22} />
    </TouchableOpacity>
  );
};

export default AreaCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  text: {
    flex: 1,
    fontSize: 16,
  },
});

import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from '@rneui/themed';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const TIPS = [
  {
    icon: 'mobile-screen',
    text: 'Lay your phone flat and level for an accurate reading.',
  },
  {
    icon: 'magnet',
    text: 'Keep away from metal objects, magnets, and electronics.',
  },
  {
    icon: 'kaaba',
    text: "You're facing the Qibla when the Kaaba lines up with the top marker.",
  },
] as const;

const QiblaHelper = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.bgLight }]}>
      {TIPS.map(({ icon, text }) => (
        <View key={icon} style={styles.row}>
          <FontAwesome6 name={icon} size={16} color={theme.colors.secondary} style={styles.icon} />
          <Text style={[styles.tipText, { color: theme.colors.text + '99' }]}>{text}</Text>
        </View>
      ))}
    </View>
  );
};

export default QiblaHelper;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 20,
    textAlign: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    lineHeight: 18,
  },
});

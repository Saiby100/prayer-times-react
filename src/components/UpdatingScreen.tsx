import { ActivityIndicator, Image, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { getPresetById } from '@/theme/presets';

/**
 * Shown while a launch update downloads. Looks like the native splash (which follows the system
 * colour scheme, not the saved theme) so the switch from it is seamless.
 */
const UpdatingScreen = () => {
  const presetId = useColorScheme() === 'dark' ? 'crescent-lagoon' : 'misty-valley';
  const colors = getPresetById(presetId)?.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors?.background }]}>
      <Image source={require('../../assets/images/splash-icon.png')} style={styles.icon} />
      <View style={styles.status}>
        <ActivityIndicator color={colors?.primary} />
        <Text style={[styles.text, { color: colors?.text }]}>Updating…</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Same size as the native splash icon slot (`imageWidth` in app.config.ts).
  icon: {
    width: 288,
    height: 288,
  },
  // Below the centred icon, so the icon stays where the native splash drew it.
  status: {
    position: 'absolute',
    top: '50%',
    marginTop: 144 + 16,
    alignItems: 'center',
    gap: 12,
  },
  text: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});

export default UpdatingScreen;

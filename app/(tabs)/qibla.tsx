import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from '@rneui/themed';
import Page from '@/components/Page';
import QiblaCompass from '@/components/QiblaCompass';
import useQiblaCompass from '@/hooks/useQiblaCompass';

export default function QiblaScreen() {
  const { theme } = useTheme();
  const {
    qiblaBearing,
    dialRotation,
    isLoading,
    permissionDenied,
    sensorAvailable,
    requestPermission,
    bearingLabel,
  } = useQiblaCompass();

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (permissionDenied) {
      return (
        <View style={styles.centered}>
          <Text style={[styles.message, { color: theme.colors.text }]}>
            Location access is needed to determine the Qibla direction.
          </Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            buttonStyle={{ backgroundColor: theme.colors.primary, borderRadius: 8 }}
            titleStyle={{ fontFamily: 'Inter-Medium' }}
            containerStyle={styles.button}
          />
        </View>
      );
    }

    if (!sensorAvailable && qiblaBearing !== null) {
      return (
        <View style={styles.centered}>
          <Text style={[styles.staticBearing, { color: theme.colors.primary }]}>
            {bearingLabel}
          </Text>
          <Text style={[styles.message, { color: theme.colors.text + '80' }]}>
            Compass sensor not available on this device.{'\n'}Showing static Qibla bearing.
          </Text>
        </View>
      );
    }

    if (qiblaBearing !== null) {
      return (
        <QiblaCompass
          qiblaBearing={qiblaBearing}
          dialRotation={dialRotation}
          bearingLabel={bearingLabel}
        />
      );
    }

    return null;
  };

  return (
    <Page name="qibla" title="Qibla" showBackground>
      {renderContent()}
    </Page>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    marginTop: 20,
    minWidth: 180,
  },
  staticBearing: {
    fontSize: 48,
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
  },
});

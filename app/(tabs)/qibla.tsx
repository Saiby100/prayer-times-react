import { Share, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from '@rneui/themed';
import { useRouter } from 'expo-router';
import Page from '@/components/Page';
import QiblaCompass from '@/components/QiblaCompass';
import OptionsMenu from '@/components/OptionsMenu';
import useQiblaCompass from '@/hooks/useQiblaCompass';

export default function QiblaScreen() {
  const { theme } = useTheme();
  const router = useRouter();
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
    <Page
      name="qibla"
      title="Qibla"
      showBackground
      loading={isLoading}
      options={{
        headerRight: () => (
          <OptionsMenu
            items={[
              { label: 'Settings', icon: 'settings', onPress: () => router.push('/settings') },
              { label: 'Location', icon: 'map-pin', onPress: () => router.push('/areas') },
              {
                label: 'Share App',
                icon: 'share-2',
                onPress: () =>
                  Share.share({
                    message:
                      'Download Reminder - Prayer Times app: https://github.com/Saiby100/prayer-times-react/releases/latest/download/reminder.apk',
                  }),
              },
            ]}
          />
        ),
      }}
    >
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

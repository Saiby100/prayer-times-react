import { Share, StyleSheet, View } from 'react-native';
import { Button, Icon, Text, useTheme } from '@rneui/themed';
import { useRouter } from 'expo-router';
import Page from '@/components/Page';
import QiblaCompass from '@/components/QiblaCompass';
import QiblaHelper from '@/components/QiblaHelper';
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
    isAligned,
    needsCalibration,
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
        <View style={styles.compassContainer}>
          {needsCalibration && (
            <View style={[styles.calibrationBanner, { backgroundColor: theme.colors.bgLight }]}>
              <Icon name="rotate-cw" type="feather" size={18} color={theme.colors.secondary} />
              <Text style={[styles.calibrationText, { color: theme.colors.text }]}>
                Compass needs calibration. Move your phone in a figure-8 motion.
              </Text>
            </View>
          )}
          <QiblaCompass
            qiblaBearing={qiblaBearing}
            dialRotation={dialRotation}
            bearingLabel={bearingLabel}
            isAligned={isAligned}
          />
          <QiblaHelper />
        </View>
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
  compassContainer: {
    flex: 1,
  },
  calibrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  calibrationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    lineHeight: 20,
  },
});

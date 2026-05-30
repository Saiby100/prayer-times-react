import { ActivityIndicator, FlatList, Share, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from '@rneui/themed';
import { useRouter } from 'expo-router';
import Page from '@/components/Page';
import MosqueCard from '@/components/MosqueCard';
import OptionsMenu from '@/components/OptionsMenu';
import useNearbyMosques from '@/hooks/useNearbyMosques';
import openMaps from '@/utils/openMaps';

export default function MosquesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { mosques, isLoading, error, permissionDenied, requestPermission, retry } =
    useNearbyMosques();

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
            Location access is needed to find nearby mosques.
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

    if (mosques.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={[styles.message, { color: theme.colors.text + '80' }]}>
            No mosques found nearby.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={mosques}
        keyExtractor={(item) => item.placeId}
        renderItem={({ item }) => (
          <MosqueCard
            name={item.name}
            distanceKm={item.distanceKm}
            onPress={() => openMaps(item.location.lat, item.location.lng, item.name)}
          />
        )}
        contentContainerStyle={styles.list}
      />
    );
  };

  return (
    <Page
      name="mosques"
      title="Nearby Mosques"
      showBackground
      error={error}
      onRetry={retry}
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
  list: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 24,
  },
});

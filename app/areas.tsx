import { StyleSheet, FlatList } from 'react-native';
import { useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { ListItem, Icon } from '@rneui/themed';
import LoadingList from '@/components/LoadingList';
import getStorage from '@/utils/localStore';
import * as SplashScreen from 'expo-splash-screen';
import Page from '@/components/Page';
import usePTAreas from '@/hooks/usePTAreas';
import NetworkError from '@/components/NetworkError';

export default function Areas() {
  const { areas, isLoading, error, retry } = usePTAreas();

  const navigateHome = (area: string) => {
    const storage = getStorage();
    storage.set('area', area);

    router.dismissAll();
    router.replace('/home');
  };

  useFocusEffect(
    useCallback(() => {
      SplashScreen.hide();
    }, [])
  );

  return (
    <Page name="areas" title="Select Area" showBackground>
      {error ? (
        <NetworkError onRetry={retry} />
      ) : isLoading ? (
        <LoadingList />
      ) : (
        <FlatList
          data={areas}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <ListItem
              bottomDivider
              onPress={() => {
                navigateHome(item);
              }}
              containerStyle={[styles.item]}
            >
              <Icon name="location-pin" />
              <ListItem.Title>{item}</ListItem.Title>
            </ListItem>
          )}
          contentContainerStyle={styles.list}
        ></FlatList>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    justifyContent: 'center',
  },
  item: {
    width: 250,
  },
  list: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});

import { StyleSheet, FlatList } from 'react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import PTApi from '@/utils/PTApi';
import { ListItem, Icon } from '@rneui/themed';
import LoadingList from '@/components/LoadingList';
import getStorage from '@/utils/localStore';
import * as SplashScreen from 'expo-splash-screen';
import Page from '@/components/Page';

export default function Areas() {
  const api = useRef(new PTApi());
  const [areas, setAreas] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigateHome = (area: string) => {
    const storage = getStorage();
    storage.set('area', area);

    router.push({ pathname: '/home', params: { area } });
  };

  const fetchAreas = async () => {
    setIsLoading(true);
    const fetchedAreas = await api.current.fetchAreas();
    setAreas(fetchedAreas);
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      SplashScreen.hide();
    }, [])
  );

  useEffect(() => {
    fetchAreas();
  }, []);

  return (
    <Page name="areas" title="Select Area">
      {isLoading ? (
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
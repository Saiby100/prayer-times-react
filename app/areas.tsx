import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, FlatList, StatusBar } from 'react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import { router, Stack, useFocusEffect } from 'expo-router';
import PTApi from '../utils/PTApi';
import { Button, useTheme, useThemeMode } from '@rneui/themed';
import LoadingList from '@/components/LoadingList';
import getStorage from '../utils/localStore';
import globalStyles from '@/utils/globalStyles';
import * as SplashScreen from 'expo-splash-screen';

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

  const { theme } = useTheme();
  const { mode } = useThemeMode();

  const shadow = mode == 'light' ? styles.shadow : {};

  useFocusEffect(
    useCallback(() => {
      SplashScreen.hide();
    }, [])
  );

  useEffect(() => {
    fetchAreas();
  }, []);

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        name="areas"
        options={{
          title: 'Select Area',
          headerShown: true,
          headerTitleStyle: { ...globalStyles.text, color: theme.colors.text },
          headerStyle: { backgroundColor: theme.colors.bgLight },
        }}
      />
      <StatusBar backgroundColor={theme.colors.background} />
      {isLoading ? (
        <LoadingList />
      ) : (
        <FlatList
          data={areas}
          renderItem={({ item, index }) => (
            <Button
              buttonStyle={styles.button}
              containerStyle={[shadow, { backgroundColor: theme.colors.bgLight }]}
              titleStyle={{ color: theme.colors.text }}
              key={index}
              title={item}
              type="outline"
              radius="lg"
              onPress={() => {
                navigateHome(item);
              }}
            />
          )}
          contentContainerStyle={styles.list}
        ></FlatList>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    justifyContent: 'center',
  },
  button: {
    width: 200,
    borderWidth: 1.5,
  },
  shadow: {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  list: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});

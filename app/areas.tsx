import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { router } from 'expo-router';
import PTApi from "../utils/PTApi";
import { Button, useTheme } from '@rneui/themed';
import LoadingList from "@/components/LoadingList";
import getStorage from "../utils/localStore";

export default function Areas() {
  const api = new PTApi();
  const [areas, setAreas]  = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigateHome = (area: string) => {
    const storage = getStorage();
    storage.set('area', area);

    router.push({pathname: '/home', params: { area }});
  }

  const fetchAreas = async () => {
    setIsLoading(true);
    const fetchedAreas = await api.fetchAreas();
    setAreas(fetchedAreas)
    setIsLoading(false);
  }

  const { theme } = useTheme();

  useEffect(() => {
    fetchAreas();
  }, [])

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      {isLoading?
        <LoadingList />
        :
        <FlatList
          data={areas}
          renderItem={
            ({item, index}) =>
              <Button
                buttonStyle={styles.button}
                titleStyle={{color: theme.colors.text}}
                key={index}
                title={item}
                type='outline'
                radius='lg'
                onPress={() => {navigateHome(item)}}/>
          }
          contentContainerStyle={styles.list}
        >
        </FlatList>
      }
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
    borderWidth: 1.5
  },
  list: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  }
});

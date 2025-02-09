import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { router } from 'expo-router';
import PTApi from "../utils/PTApi";
import { Button } from '@rneui/themed';
import LoadingList from "@/components/LoadingList";

export default function Areas() {
  const api = new PTApi();
  const [areas, setAreas]  = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigateHome = (area: string) => {
    router.push({pathname: '/home', params: { area }});
  }

  const fetchAreas = async () => {
    setIsLoading(true);
    const fetchedAreas = await api.fetchAreas();
    setAreas(fetchedAreas)
    setIsLoading(false);
  }

  useEffect(() => {
    fetchAreas();
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      {isLoading?
        <LoadingList />
        :
        <FlatList
          data={areas}
          renderItem={
            ({item, index}) =>
              <Button
                containerStyle={styles.button}
                key={index}
                title={item}
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
    margin: 30,
    padding: 10,
    justifyContent: 'center',
  },
  button: {
    width: 200,
    borderRadius: 8
  },
  list: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  }
});

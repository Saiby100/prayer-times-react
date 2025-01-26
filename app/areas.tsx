import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, FlatList } from "react-native";
import TextButton  from '../components/TextButton';
import { useEffect, useState } from "react";
import { router } from 'expo-router';
import PTApi from "../utils/PTApi";

export default function Areas() {
  const api = new PTApi();
  const [areas, setAreas]  = useState([]);

  const navigateHome = (area: string) => {
    router.push({pathname: '/home', params: { area }});
  }

  const fetchAreas = async () => {
    const fetchedAreas = await api.fetchAreas();
    setAreas(fetchedAreas)
  }

  useEffect(() => {
    fetchAreas();
  }, [])

  return (
    <SafeAreaView style={styles.container}>
        <FlatList
          data={areas}
          renderItem={
            ({item, index}) =>
              <TextButton
                textStyle={styles.buttonText}
                style={styles.button}
                key={index}
                title={item}
                onPress={() => {navigateHome(item)}}/>
          }
          contentContainerStyle={styles.list}
        >
        </FlatList>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  button: {
    width: 200,
    paddingVertical: 8
  },
  buttonText: {
    fontSize: 18
  },
  list: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  }
});

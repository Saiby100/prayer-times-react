import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { router } from 'expo-router';
import PTApi from "../utils/PTApi";
import { Button } from '@rneui/themed';

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
              <Button
                containerStyle={styles.button}
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
    margin: 30,
    padding: 10,
    // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    // borderRadius: 8,
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

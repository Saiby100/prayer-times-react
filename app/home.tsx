import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from 'expo-router';
import PTApi from "../utils/PTApi";
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, FlatList } from "react-native";
import TextButton  from '../components/TextButton';

export default function Home() {
  const api = new PTApi();
  const [times, setTimes] =  useState<Array<object>>([]);
  const params = useLocalSearchParams();
  const { area } = params;

  const fetchData = async () => {
    if (typeof area === 'string') {
      api.setArea(area);
      const times = await api.fetchTimes(new Date());
      setTimes(times ?? []);
    }
  }

  useEffect(() => {
    fetchData();
  }, [])

  return (
    <SafeAreaView style={styles.container}>
        <FlatList
          data={Object.keys(times[0] ?? {})}
          renderItem={
            ({item, index}) =>
              <TextButton
                textStyle={styles.buttonText}
                style={styles.button}
                key={index}
                title={`${item} : ${times[0][item]}`}
                onPress={() => {console.log('item', item)}}/>
          }
          contentContainerStyle={styles.list}
          extraData={times}
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

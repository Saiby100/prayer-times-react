import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from 'expo-router';
import PTApi from "../utils/PTApi";
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, FlatList, Text } from "react-native";

export default function Home() {
  const api = new PTApi();
  const [times, setTimes] =  useState<Array<object>>([]);
  const day = useRef(0);
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
    day.current = new Date().getDate();
    fetchData();
  }, [])

  return (
    <SafeAreaView style={styles.container}>
        <FlatList
          data={Object.keys(times[day.current - 1] ?? {})}
          renderItem={
            ({item, index}) =>
              <Text key={index} style={styles.text}>{`${item} : ${times[day.current - 1][item]}`}</Text>
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
  text: {
    width: 200,
    paddingVertical: 8,
    fontSize: 18,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    textAlign: 'center',
    borderWidth: 1, // Border width
    borderColor: '#a1855e', // Border color
    borderStyle: 'solid', // Border style (optional, default is 'solid')
  },
  list: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  }
});

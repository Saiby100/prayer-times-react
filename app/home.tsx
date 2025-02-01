import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from 'expo-router';
import PTApi from "../utils/PTApi";
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, FlatList, Text, View } from "react-native";
import { Button, Icon } from '@rneui/themed';

export default function Home() {
  const api = new PTApi();

  const [times, setTimes] = useState<Array<object>>([]);
  const [todayTimes, setTodayTimes] = useState<object>({});
  const date = useRef(new Date());

  const params = useLocalSearchParams();
  const { area } = params;

  const changeDay = (i: number) => {
    if (i > 0) {
      if (date.current.getDate() > times.length) { // TODO: Use custom date class
        date.current = new Date();
      }
    }
  }

  const fetchData = async () => {
    if (typeof area === 'string') {
      api.setArea(area);
      const times = await api.fetchTimes(new Date());
      setTimes(times ?? []);
      setTodayTimes(times[date.current.getDate() - 1])
    }
  }

  useEffect(() => {
    date.current = new Date();
    fetchData();
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <FlatList
          data={Object.keys(todayTimes ?? {})}
          renderItem={
            ({item, index}) =>
              <Text key={index} style={styles.text}>{`${item} : ${todayTimes[item]}`}</Text>
          }
          contentContainerStyle={styles.list}
          extraData={todayTimes}
        >
        </FlatList>
      </View>
      <View style={styles.buttonLayout}>
        <Icon
          name='left'
          color='white'
          type='antdesign'
          containerStyle={styles.iconButton}
          // onPress={() => {
          //   date.current.getDate() -= 1;
          //   setTodayTimes(times[day.current - 1])
          // }}
        />
        <Text></Text>
        <Icon
          name='right'
          color='white'
          type='antdesign'
          containerStyle={styles.iconButton}
          // onPress={() => {
          //   day.current += 1;
          //   setTodayTimes(times[day.current - 1])
          // }}
        />
      </View>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 42,
    justifyContent: 'center',
    gap: 24
  },
  card: {
    borderRadius: 12,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    padding: 20
  },
  buttonLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  iconButton: {
    backgroundColor: '#2089DC',
    padding: 8,
    borderRadius: 12,
  },
  text: {
    width: 200,
    paddingVertical: 8,
    fontSize: 18,
    borderRadius: 8,
    textAlign: 'center',
    backgroundColor: '#2089DC',
    color: 'white',
  },
  list: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  }
});

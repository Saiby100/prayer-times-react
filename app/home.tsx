import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from 'expo-router';
import PTApi from "../utils/PTApi";
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, FlatList, Text, View } from "react-native";
import {  Icon, Button } from '@rneui/themed';
import { getNextDay, getPrevDay, dateToString } from "@/utils/date";
import LoadingList from "@/components/LoadingList";

export default function Home() {
  const api = new PTApi();
  const date = useRef(new Date());

  const [times, setTimes] = useState<Array<object>>([]);
  const [todayTimes, setTodayTimes] = useState<object>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dateString, setDateString] = useState<string>('');
  const dayString = useCallback(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.current.getDay()];
  }, [dateString]);

  const params = useLocalSearchParams();
  const { area } = params;

  const setToday = () => {
    if (date.current.getMonth() !== new Date().getMonth()) {
      date.current = new Date();
      fetchData();
      return;
    }
    date.current = new Date();
    setTodayTimes(times[date.current.getDate() - 1]);
    setDateString(dateToString(date.current));
  }
  const changeDay = (i: number) => {
    const oldMonth = date.current.getMonth();
    date.current = i > 0 ? getNextDay(date.current) : getPrevDay(date.current);
    if (date.current.getMonth() !== oldMonth) {
      fetchData();
      return;
    }
    setTodayTimes(times[date.current.getDate() - 1]);
    setDateString(dateToString(date.current));
  }

  const fetchData = async () => {
    if (typeof area === 'string') {
      setIsLoading(true);
      api.setArea(area);
      const times = await api.fetchTimes(date.current);
      setTimes(times ?? []);
      setTodayTimes(times[date.current.getDate() - 1]);
      setDateString(dateToString(date.current));
      setIsLoading(false);
    }
  }

  useEffect(() => {
    date.current = new Date();
    fetchData();
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      {
        isLoading ?
        <LoadingList />
        :
        <View>
          <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 4}}>
            <Text style={styles.defaultText}>{dayString()}</Text>
            <Button
              size='sm'
              radius='lg'
              type='outline'
              titleStyle={{padding: 4, fontSize: 14, paddingVertical: 4}}
              buttonStyle={{borderWidth: 1, padding: 0}}
              title={JSON.stringify(new Date().getDate())}
              onPress={() => { setToday() }}
            />
          </View>
          <View style={styles.card}>
            <FlatList
              data={Object.keys(todayTimes ?? {})}
              renderItem={
                ({item, index}) =>
                  <Text key={index} style={[styles.defaultText, styles.textButton]}>{`${item} : ${todayTimes[item]}`}</Text>
              }
              contentContainerStyle={styles.list}
              extraData={todayTimes}
            >
            </FlatList>
          </View>
          <View style={styles.buttonLayout}>
            <Button
              size='sm'
              radius='lg'
              onPress={() => {
                changeDay(-1);
              }}
              containerStyle={styles.iconButton}
            >
              <Icon
                name='left'
                color='white'
                type='antdesign'
              />
            </Button>
            <Text style={[styles.defaultText, { padding: 8}]}>{dateString}</Text>
            <Button
              size='sm'
              radius='lg'
              onPress={() => {
                changeDay(1);
              }}
              containerStyle={styles.iconButton}
            >
              <Icon
                name='right'
                color='white'
                type='antdesign'
              />
            </Button>
          </View>
        </View>
    }
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 42,
    justifyContent: 'center',
  },
  defaultText: {
    fontSize: 18,
  },
  card: {
    borderRadius: 12,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    padding: 20,
    marginBottom: 24
  },
  buttonLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  iconButton: {
    backgroundColor: '#2089DC',
    padding: 6,
    borderRadius: 12,
  },
  textButton: {
    width: 200,
    paddingVertical: 8,
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

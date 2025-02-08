import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from 'expo-router';
import PTApi from "../utils/PTApi";
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, FlatList, Text, View } from "react-native";
import {  Icon, Button, Skeleton } from '@rneui/themed';
import { getNextDay, getPrevDay, dateToString } from "@/utils/date";

export default function Home() {
  const api = new PTApi();

  const [times, setTimes] = useState<Array<object>>([]);
  const [todayTimes, setTodayTimes] = useState<object>({});
  const [dateString, setDateString] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const date = useRef(new Date());

  const params = useLocalSearchParams();
  const { area } = params;

  const changeDay = (i: number) => {
    const oldMonth = date.current.getMonth();
    date.current = i > 0 ? getNextDay(date.current) : getPrevDay(date.current);
    if (date.current.getMonth() !== oldMonth) {
      console.log('fetching new month');
      fetchData();
      setDateString(dateToString(date.current));
      return;
    }
    setTodayTimes(times[date.current.getDate() - 1])
    setDateString(dateToString(date.current));
  }

  const fetchData = async () => {
    if (typeof area === 'string') {
      setIsLoading(true);
      api.setArea(area);
      const times = await api.fetchTimes(new Date());
      setTimes(times ?? []);
      setTodayTimes(times[date.current.getDate() - 1])
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
        isLoading ? (
          <View style={{ gap: 8 }}>
            <Skeleton
              animation="pulse"
              width={300}
              height={50}
              style={{ marginHorizontal: "auto" }}
            />
            <Skeleton
              animation="pulse"
              width={300}
              height={50}
              style={{ marginHorizontal: "auto" }}
            />
            <Skeleton
              animation="pulse"
              width={300}
              height={50}
              style={{ marginHorizontal: "auto" }}
            />
            <Skeleton
              animation="pulse"
              width={300}
              height={50}
              style={{ marginHorizontal: "auto" }}
            />
            <Skeleton
              animation="pulse"
              width={300}
              height={50}
              style={{ marginHorizontal: "auto" }}
            />
          </View>
        )
        :
        (
          <View style={styles.viewContainer}>
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
              <Button
                size='sm'
                radius='lg'
                onPress={() => {
                  changeDay(-1);
                }}
              >
                <Icon
                  name='left'
                  color='white'
                  type='antdesign'
                  containerStyle={styles.iconButton}
                />
              </Button>
              <Text style={{padding: 8, fontSize: 18  }}>{dateString}</Text>
              <Button
                size='sm'
                radius='lg'
                onPress={() => {
                  changeDay(1);
                }}
              >
                <Icon
                  name='right'
                  color='white'
                  type='antdesign'
                  containerStyle={styles.iconButton}
                />
              </Button>
            </View>
          </View>
        )
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
  viewContainer: {
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

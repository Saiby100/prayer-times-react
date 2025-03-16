import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import PTApi from '../utils/PTApi';
import globalStyles from '../utils/globalStyles';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, FlatList, Text, View, StatusBar } from 'react-native';
import { Icon, Button, useTheme, useThemeMode } from '@rneui/themed';
import { getNextDay, getPrevDay, dateToString } from '@/utils/date';
import LoadingList from '@/components/LoadingList';
import getStorage from '../utils/localStore';
import * as SplashScreen from 'expo-splash-screen';

export default function Home() {
  const api = useRef(new PTApi());
  const date = useRef(new Date());
  const nextTimeSet = useRef(false);

  const [times, setTimes] = useState<Array<object>>([]);
  const [todayTimes, setTodayTimes] = useState<object>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dateString, setDateString] = useState<string>('');
  const dayString = useCallback(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.current.getDay()];
  }, [dateString]);

  const params = useLocalSearchParams();
  const { area } = params as { area: string };

  const { theme } = useTheme();
  const { mode, setMode } = useThemeMode();

  const setToday = () => {
    if (date.current.getMonth() !== new Date().getMonth()) {
      date.current = new Date();
      fetchData();
      return;
    }
    date.current = new Date();
    setTodayTimes(times[date.current.getDate() - 1]);
    setDateString(dateToString(date.current));
  };
  const changeDay = (i: number) => {
    const oldMonth = date.current.getMonth();
    date.current = i > 0 ? getNextDay(date.current) : getPrevDay(date.current);
    if (date.current.getMonth() !== oldMonth) {
      fetchData();
      return;
    }
    setTodayTimes(times[date.current.getDate() - 1]);
    setDateString(dateToString(date.current));
  };

  const fetchData = async () => {
    if (typeof area === 'string') {
      setIsLoading(true);
      api.current.setArea(area);
      const timesData = (await api.current.fetchTimes(date.current)) ?? [];
      setTimes(timesData);
      setTodayTimes(timesData[date.current.getDate() - 1]);
      setDateString(dateToString(date.current));
      setIsLoading(false);
    }
  };

  // Determine the next prayer time for higlighting
  const isNextTime = (time: string) => {
    if (new Date().getDate() !== date.current.getDate() || nextTimeSet.current) return false;
    const [hour, minutes] = time.split(':');
    const currentHour = new Date().getHours();
    const currentMinutes = new Date().getMinutes();

    if (Number(hour) === currentHour) {
      const value = Number(minutes) > currentMinutes;
      nextTimeSet.current = value;
      return value;
    }

    const value = Number(hour) > currentHour;
    nextTimeSet.current = value;
    return value;
  };

  useFocusEffect(
    useCallback(() => {
      SplashScreen.hide();
    }, [])
  );

  useEffect(() => {
    date.current = new Date();
    fetchData();
  }, []);

  useEffect(() => {
    nextTimeSet.current = false;
  }, [todayTimes]);

  const shadow = mode === 'light' ? styles.shadow : {};
  const storage = useRef(getStorage());

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        name="home"
        options={{
          title: area,
          headerShown: true,
          headerTitleStyle: { ...globalStyles.text, color: theme.colors.text },
          headerStyle: { backgroundColor: theme.colors.bgLight },
          headerTintColor: theme.colors.text,
          headerRight: () => (
            <Button
              onPressIn={() => {
                if (mode === 'light') {
                  setMode('dark');
                  storage.current.set('themeMode', 'dark');
                } else {
                  setMode('light');
                  storage.current.set('themeMode', 'light');
                }
              }}
              icon={
                <Icon
                  name={mode === 'light' ? 'moon' : 'sun'}
                  color={theme.colors.primary}
                  type="feather"
                />
              }
              color={theme.colors.bgLight}
            />
          ),
        }}
      />
      <StatusBar backgroundColor={theme.colors.background} />
      {isLoading ? (
        <LoadingList />
      ) : (
        <View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 4,
            }}
          >
            <Text style={[globalStyles.text, { color: theme.colors.text }]}>{dayString()}</Text>
            <Button
              size="sm"
              radius="md"
              type="outline"
              titleStyle={{
                ...globalStyles.text,
                padding: 4,
                fontSize: 14,
                paddingVertical: 4,
                color: theme.colors.text,
              }}
              buttonStyle={{ borderWidth: 1, padding: 0 }}
              title={JSON.stringify(new Date().getDate())}
              onPress={() => {
                setToday();
              }}
            />
          </View>
          <View style={[shadow, styles.card, { backgroundColor: theme.colors.bgLight }]}>
            <FlatList
              data={Object.keys(todayTimes ?? {})}
              renderItem={({ item, index }) => (
                <Text
                  key={index}
                  style={[
                    globalStyles.text,
                    styles.textButton,
                    {
                      width: '100%',
                      borderWidth: 1.5,
                      borderColor: isNextTime(todayTimes[item]) //TODO: Put in state
                        ? theme.colors.primary
                        : theme.colors.bgLight,
                      color: theme.colors.text,
                    },
                  ]}
                >{`${item} : ${todayTimes[item]}`}</Text>
              )}
              contentContainerStyle={styles.list}
              extraData={todayTimes}
            ></FlatList>
          </View>
          <View style={styles.buttonLayout}>
            <Button
              onPress={() => {
                changeDay(-1);
              }}
              icon={<Icon name="left" color={theme.colors.primary} type="antdesign" size={30} />}
              color={theme.colors.bgLight}
              containerStyle={[
                shadow,
                {
                  backgroundColor: theme.colors.bgLight,
                  borderRadius: 8,
                },
              ]}
            />
            <Text
              style={[
                globalStyles.text,
                { padding: 8, color: theme.colors.text, flex: 1, textAlign: 'center' },
              ]}
            >
              {dateString}
            </Text>
            <Button
              onPress={() => {
                changeDay(1);
              }}
              icon={<Icon name="right" color={theme.colors.primary} type="antdesign" size={30} />}
              color={theme.colors.bgLight}
              containerStyle={[
                shadow,
                {
                  backgroundColor: theme.colors.bgLight,
                  borderRadius: 8,
                },
              ]}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 42,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 24,
  },
  shadow: {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  buttonLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textButton: {
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 12,
  },
});

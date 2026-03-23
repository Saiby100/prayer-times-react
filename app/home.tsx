import { useCallback, useState } from 'react';

import * as SplashScreen from 'expo-splash-screen';
import LoadingList from '@/components/LoadingList';
import Page from '@/components/Page';
import CalendarPopup from '@/components/CalendarPopup';
import InfoPopup from '@/components/InfoPopup';
import Card from '@/components/Card';
import usePTApi from '@/hooks/usePTApi';
import NetworkError from '@/components/NetworkError';
import useHijriDate from '@/hooks/useHijriDate';
import OptionsMenu from '@/components/OptionsMenu';
import getStorage from '@/utils/localStore';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Text, useTheme } from '@rneui/themed';

export default function Home() {
  const storage = getStorage();
  const area = storage.getString('area') ?? '';
  const router = useRouter();

  const { theme } = useTheme();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const {
    isLoading,
    error,
    retry,
    navigate,
    date,
    highlighted,
    dateString,
    dayString,
    todayTimes,
  } = usePTApi({
    area,
  });
  const { hijriDateString, hijriDateInfoList } = useHijriDate(date);
  const [hijriInfoVisible, setHijriInfoVisible] = useState(false);
  const hasHijriInfo = hijriDateInfoList.length > 0;

  useFocusEffect(
    useCallback(() => {
      SplashScreen.hide();
    }, [])
  );

  return (
    <Page
      name="home"
      title={area}
      showBackground
      options={{
        headerRight: () => (
          <OptionsMenu
            items={[
              {
                label: 'Settings',
                icon: 'settings',
                onPress: () => router.push('/settings' as any),
              },
              { label: 'Location', icon: 'map-pin', onPress: () => router.push('/areas') },
            ]}
          />
        ),
      }}
    >
      <View style={{ paddingHorizontal: 42 }}>
        {error ? (
          <NetworkError onRetry={retry} />
        ) : isLoading ? (
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
              <View>
                <Text>{dayString}</Text>
                {hijriDateString &&
                  (hasHijriInfo ? (
                    <TouchableOpacity onPress={() => setHijriInfoVisible(true)}>
                      <Text
                        style={{
                          fontSize: 13,
                          opacity: 0.7,
                          textDecorationLine: 'underline',
                        }}
                      >
                        {hijriDateString}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ fontSize: 13, opacity: 0.7 }}>{hijriDateString}</Text>
                  ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Button
                  size="sm"
                  radius="md"
                  type="outline"
                  titleStyle={{
                    padding: 4,
                    fontSize: 14,
                    paddingVertical: 4,
                  }}
                  buttonStyle={{ borderWidth: 1, paddingHorizontal: 6, paddingVertical: 1 }}
                  title={JSON.stringify(new Date().getDate())}
                  onPress={() => {
                    navigate.today();
                  }}
                />
                <Button
                  size="sm"
                  radius="md"
                  type="outline"
                  buttonStyle={{ borderWidth: 1, paddingHorizontal: 4, paddingVertical: 6 }}
                  icon={{
                    name: 'calendar',
                    type: 'feather',
                    size: 16,
                  }}
                  onPress={() => setCalendarVisible(true)}
                />
              </View>
            </View>
            <Card style={{ marginBottom: 24 }}>
              <FlatList
                data={Object.keys(todayTimes ?? {})}
                renderItem={({ item, index }) => (
                  <Text
                    key={index}
                    style={[
                      styles.textButton,
                      {
                        width: '100%',
                        borderWidth: 1.5,
                        borderColor:
                          todayTimes[item] === highlighted
                            ? theme.colors.primary
                            : theme.colors.bgLight,
                      },
                    ]}
                  >{`${item} : ${todayTimes[item]}`}</Text>
                )}
                contentContainerStyle={styles.list}
                extraData={todayTimes}
              ></FlatList>
            </Card>
            <View style={styles.buttonLayout}>
              <Button
                onPress={() => {
                  navigate.prev();
                }}
                icon={{
                  name: 'left',
                  type: 'antdesign',
                  size: 30,
                }}
                containerStyle={[
                  {
                    backgroundColor: theme.colors.bgLight,
                    borderRadius: 8,
                  },
                ]}
              />
              <Text
                style={{
                  padding: 8,
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 18,
                }}
              >
                {dateString}
              </Text>
              <Button
                onPress={() => {
                  navigate.next();
                }}
                icon={{
                  name: 'right',
                  type: 'antdesign',
                  size: 30,
                }}
                containerStyle={[
                  {
                    borderRadius: 8,
                  },
                ]}
              />
            </View>
          </View>
        )}
        <InfoPopup
          visible={hijriInfoVisible}
          onClose={() => setHijriInfoVisible(false)}
          items={hijriDateInfoList}
        />
        <CalendarPopup
          visible={calendarVisible}
          onClose={() => setCalendarVisible(false)}
          onDateSelect={navigate.goToDate}
          selectedDate={date}
        />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  buttonLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textButton: {
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
  },
  list: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 12,
  },
});

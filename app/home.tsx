import { useCallback } from 'react';

import * as SplashScreen from 'expo-splash-screen';
import LoadingList from '@/components/LoadingList';
import Page from '@/components/Page';
import getStorage from '@/utils/localStore';
import usePTApi from '@/hooks/usePTApi';
import usePTNotification from '@/hooks/usePTNotification';
import { StyleSheet, FlatList, View } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import { Button, Text, useTheme, useThemeMode } from '@rneui/themed';

export default function Home() {
  const params = useLocalSearchParams();
  const { area } = params as { area: string };
  const router = useRouter();

  const { theme } = useTheme();
  const { mode, setMode } = useThemeMode();
  const { isLoading, navigate, highlighted, dateString, dayString, todayTimes } = usePTApi({
    area,
  });
  const {
    clearAllPrayerReminders,
    initPrayerReminders,
    notificationsIsScheduled,
    refreshAndReschedule,
  } = usePTNotification();

  useFocusEffect(
    useCallback(() => {
      SplashScreen.hide();
      // Refresh notification preferences when returning from settings
      refreshAndReschedule();
    }, [refreshAndReschedule])
  );

  const storage = getStorage();

  return (
    <Page
      name="home"
      title={area}
      options={{
        headerRight: () => (
          <>
            <Button
              onPressIn={() => {
                if (mode === 'light') {
                  setMode('dark');
                  storage.set('themeMode', 'dark');
                } else {
                  setMode('light');
                  storage.set('themeMode', 'light');
                }
              }}
              icon={{
                name: mode === 'light' ? 'moon' : 'sun',
                type: 'feather',
              }}
            />
            <Button
              icon={{
                name: notificationsIsScheduled ? 'bell' : 'bell-off',
                type: 'feather',
              }}
              onPressIn={() => {
                if (notificationsIsScheduled) {
                  storage.set('remindersEnabled', false);
                  clearAllPrayerReminders();
                  return;
                }
                initPrayerReminders();
                storage.set('remindersEnabled', true);
              }}
            />
            <Button
              icon={{
                name: 'settings',
                type: 'feather',
              }}
              onPressIn={() => {
                router.push('/settings' as any);
              }}
            />
          </>
        ),
      }}
    >
      <View style={{ paddingHorizontal: 42 }}>
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
              <Text>{dayString}</Text>
              <Button
                size="sm"
                radius="md"
                type="outline"
                titleStyle={{
                  padding: 4,
                  fontSize: 14,
                  paddingVertical: 4,
                }}
                buttonStyle={{ borderWidth: 1, padding: 0 }}
                title={JSON.stringify(new Date().getDate())}
                onPress={() => {
                  navigate.today();
                }}
              />
            </View>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.bgLight,
                  boxShadow: theme.colors.shadow,
                },
              ]}
            >
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
            </View>
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
                    boxShadow: theme.colors.shadow,
                  },
                ]}
              />
              <Text style={{ padding: 8, flex: 1, textAlign: 'center' }}>{dateString}</Text>
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
                    boxShadow: theme.colors.shadow,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 24,
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

import { useCallback } from 'react';

import * as SplashScreen from 'expo-splash-screen';
import LoadingList from '@/components/LoadingList';
import Page from '@/components/Page';
import ThemedButton from '@/components/ThemedButton';
import getStorage from '@/utils/localStore';
import globalStyles from '@/utils/globalStyles';
import usePTApi from '@/hooks/usePTApi';
import usePTNotification from '@/hooks/usePTNotification';
import { StyleSheet, FlatList, Text, View } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import { useTheme, useThemeMode } from '@rneui/themed';

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

  const shadow = mode === 'light' ? styles.shadow : {};
  const storage = getStorage();

  return (
    <Page
      name="home"
      title={area}
      options={{
        headerRight: () => (
          <>
            <ThemedButton
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
            <ThemedButton
              icon={{
                name: notificationsIsScheduled ? 'bell' : 'bell-off',
                type: 'feather',
              }}
              color={theme.colors.bgLight}
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
            <ThemedButton
              icon={{
                name: 'settings',
                type: 'feather',
              }}
              color={theme.colors.bgLight}
              onPressIn={() => {
                router.push('/settings' as any);
              }}
            />
            {/* <ThemedButton
              icon={{
                name: 'eye',
                type: 'feather',
              }}
              color={theme.colors.bgLight}
              onPressIn={async () => {
                const reminders = await getAllScheduledPrayerReminders();
                console.log('Scheduled prayer reminders', reminders);
              }}
            /> */}
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
              <Text style={[globalStyles.text, { color: theme.colors.text }]}>{dayString}</Text>
              <ThemedButton
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
                        borderColor:
                          todayTimes[item] == highlighted
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
              <ThemedButton
                onPress={() => {
                  navigate.prev();
                }}
                icon={{
                  name: 'left',
                  type: 'antdesign',
                  size: 30,
                }}
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
              <ThemedButton
                onPress={() => {
                  navigate.next();
                }}
                icon={{
                  name: 'right',
                  type: 'antdesign',
                  size: 30,
                }}
                containerStyle={[
                  shadow,
                  {
                    borderRadius: 8,
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

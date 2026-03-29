import { useCallback, useState } from 'react';

import * as SplashScreen from 'expo-splash-screen';
import LoadingList from '@/components/LoadingList';
import Page from '@/components/Page';
import CalendarPopup from '@/components/CalendarPopup';
import InfoPopup from '@/components/InfoPopup';
import Card from '@/components/Card';
import Scrim from '@/components/Scrim';
import usePTApi from '@/hooks/usePTApi';
import useHijriDate from '@/hooks/useHijriDate';
import useDisabledPrayers from '@/hooks/notifications/useDisabledPrayers';
import OptionsMenu from '@/components/OptionsMenu';
import PrayerReminderPopup from '@/components/PrayerReminderPopup';
import PrayerTimeRow from '@/components/PrayerTimeRow';
import { getArea } from '@/stores';
import { Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Text, useTheme } from '@rneui/themed';

export default function Home() {
  const area = getArea() ?? '';
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
  const { togglePrayer, isPrayerDisabled } = useDisabledPrayers();
  const [popupPrayer, setPopupPrayer] = useState<string | null>(null);
  const [hijriInfoVisible, setHijriInfoVisible] = useState(false);
  const hasHijriInfo = hijriDateInfoList.length > 0;
  const handleShareApp = async () => {
    await Share.share({
      message:
        'Download Reminder - Prayer Times app: https://github.com/Saiby100/prayer-times-react/releases/latest/download/reminder.apk',
    });
  };

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
      error={error}
      onRetry={retry}
      options={{
        headerRight: () => (
          <OptionsMenu
            items={[
              { label: 'Settings', icon: 'settings', onPress: () => router.push('/settings') },
              { label: 'Location', icon: 'map-pin', onPress: () => router.push('/areas') },
              { label: 'Share App', icon: 'share-2', onPress: handleShareApp },
            ]}
          />
        ),
      }}
    >
      <Scrim style={styles.scrimContent}>
        {isLoading ? (
          <LoadingList />
        ) : (
          <View style={styles.mainContent}>
            <View style={styles.dateHeader}>
              <View>
                <Text style={styles.dayString}>{dayString}</Text>
                {hijriDateString &&
                  (hasHijriInfo ? (
                    <TouchableOpacity onPress={() => setHijriInfoVisible(true)}>
                      <Text style={styles.hijriLink}>{hijriDateString}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.hijriText}>{hijriDateString}</Text>
                  ))}
              </View>
              <View style={styles.dateActions}>
                <Button
                  size="sm"
                  radius="md"
                  type="outline"
                  titleStyle={styles.todayButtonTitle}
                  buttonStyle={styles.todayButton}
                  title={String(new Date().getDate())}
                  onPress={() => navigate.today()}
                />
                <Button
                  size="sm"
                  radius="md"
                  type="outline"
                  buttonStyle={styles.calendarButton}
                  icon={{ name: 'calendar', type: 'feather', size: 16 }}
                  onPress={() => setCalendarVisible(true)}
                />
              </View>
            </View>

            <Card style={styles.timesCard}>
              {Object.keys(todayTimes ?? {}).map((key) => (
                <PrayerTimeRow
                  key={key}
                  name={key}
                  time={todayTimes[key]}
                  isHighlighted={todayTimes[key] === highlighted}
                  isDisabled={isPrayerDisabled(key)}
                  colors={theme.colors}
                  onLongPress={() => setPopupPrayer(key)}
                />
              ))}
            </Card>

            <View style={styles.navRow}>
              <Button
                onPress={() => navigate.prev()}
                icon={{ name: 'chevron-left', type: 'feather', size: 24 }}
                containerStyle={[styles.navButton, { backgroundColor: theme.colors.bgLight }]}
              />
              <Text style={styles.dateString}>{dateString}</Text>
              <Button
                onPress={() => navigate.next()}
                icon={{ name: 'chevron-right', type: 'feather', size: 24 }}
                containerStyle={[styles.navButton, { backgroundColor: theme.colors.bgLight }]}
              />
            </View>
          </View>
        )}
        <PrayerReminderPopup
          visible={popupPrayer !== null}
          prayerName={popupPrayer ?? ''}
          isEnabled={popupPrayer ? !isPrayerDisabled(popupPrayer) : true}
          onToggle={() => popupPrayer && togglePrayer(popupPrayer)}
          onClose={() => setPopupPrayer(null)}
        />
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
      </Scrim>
    </Page>
  );
}

const styles = StyleSheet.create({
  scrimContent: {
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  mainContent: {
    gap: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dayString: {
    fontSize: 20,
    fontFamily: 'Inter-Medium',
  },
  hijriText: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  hijriLink: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
    textDecorationLine: 'underline',
  },
  dateActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  todayButtonTitle: {
    fontSize: 14,
    paddingHorizontal: 4,
  },
  todayButton: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  calendarButton: {
    borderWidth: 1,
    padding: 8,
  },
  timesCard: {
    padding: 8,
    gap: 6,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    borderRadius: 12,
  },
  dateString: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});

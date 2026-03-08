# Data Flows

## 1. App Startup

```
App Launch
  |
  v
_layout.tsx
  |-- createTheme() with light/dark colors
  |-- Wrap app in ThemeProvider
  v
index.tsx (renders nothing)
  |
  |-- [useEffect] Read themeMode from MMKV --> setMode()
  |-- [useEffect] registerDefinedTask.prayerReminderTask()
  |-- [useEffect] scheduleTodayNotifications()
  |
  |-- [useFocusEffect] Read 'area' from MMKV
  |     |
  |     +-- area exists? --> replace('/areas') + push('/home', {area})
  |     +-- no area?     --> replace('/areas')
  v
areas.tsx or home.tsx
  |-- SplashScreen.hide()
```

## 2. Area Selection

```
areas.tsx [mount]
  |
  |-- fetchAreas()
  |     |
  |     v
  |   PTApi.fetchAreas()
  |     |-- fetch('https://masjids.co.za/salaahtimes')
  |     |-- cheerio: parse .col-lg-8 h5 elements
  |     +-- return string[]
  |
  |-- setAreas(result) --> render FlatList
  |
  v
User taps area row
  |
  |-- storage.set('area', area)
  |-- router.push('/home', { area })
```

## 3. Prayer Times Display

```
home.tsx [mount]
  |
  v
usePTApi({ area })
  |
  |-- [useEffect on date change]
  |     |
  |     +-- fetchTimes()
  |           |-- Check MMKV cache: times_{month}_{year}_{area}
  |           |     |
  |           |     +-- cached? --> JSON.parse(cached)
  |           |     +-- miss?   --> PTApi.setArea() + PTApi.fetchTimes(date)
  |           |                       |-- fetch(masjids.co.za/{area}/{year}-{month})
  |           |                       +-- cheerio: parse table rows
  |           |
  |           v
  |         setTimes(allDays)
  |         setTodayTimes(allDays[date - 1])
  |
  |-- [useEffect on times change]
  |     +-- Cache current month to MMKV (if not already cached)
  |
  |-- [useMemo] highlighted = first future prayer time (today only)
  |-- [useMemo] dateString = formatted date
  |-- [useMemo] dayString = day name
  |
  v
Render: day label, prayer card (with highlight), date nav buttons
```

## 4. Notification Toggle

```
home.tsx: User taps bell button
  |
  +-- notificationsIsScheduled == true (turning OFF)
  |     |-- storage.set('remindersEnabled', false)
  |     |-- clearAllPrayerReminders()
  |           |-- clearScheduledNotifications(ids)
  |           +-- setScheduledNotifications([])
  |
  +-- notificationsIsScheduled == false (turning ON)
        |-- initPrayerReminders()
        |     |-- scheduleTodayNotifications()
        |           |-- Read 'remindersEnabled' from MMKV --> check enabled
        |           |-- fetchTodayPrayerTimes() --> from cache or API
        |           |-- Read 'prayerReminderPref' from MMKV
        |           |-- formatPrayerTimes(times, minutesBefore)
        |           |-- clearExistingReminders()
        |           |-- For each future prayer:
        |           |     schedulePushNotification({ title, body, data, date })
        |           +-- return scheduledIds
        |
        +-- storage.set('remindersEnabled', true)
```

## 5. Settings Change

```
home.tsx: User taps settings gear
  |
  v
router.push('/settings')
  |
  v
settings.tsx [mount]
  |-- Read 'prayerReminderPref' from MMKV (default 5)
  |-- Set slider position
  |
  v
User drags slider
  |-- onValueChange: update display (real-time)
  |-- onSlidingComplete: storage.set('prayerReminderPref', minutes)
  |
  v
User navigates back to home.tsx
  |
  v
home.tsx [useFocusEffect]
  |-- refreshAndReschedule()
        |-- Read 'prayerReminderPref' from MMKV
        |-- Read 'remindersEnabled' from MMKV
        |-- If enabled: initPrayerReminders()
        |     +-- scheduleTodayNotifications() (with new preference)
```

## 6. Background Task

```
OS triggers PRAYER_REMINDER_BACKGROUND_TASK (every ~24h)
  |
  v
prayerReminderTask.handler()
  |
  v
scheduleTodayNotifications()
  |-- Check remindersEnabled in MMKV
  |-- fetchTodayPrayerTimes()
  |     +-- cache hit or PTApi.fetchTimes()
  |-- Read prayerReminderPref from MMKV
  |-- clearExistingReminders()
  |-- Schedule notifications for future prayers
  |
  v
Return BackgroundTaskResult.Success or .Failed
```

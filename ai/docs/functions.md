# Functions

## Utils (`src/utils/`)

| File | Function / Export | Purpose |
| ---- | ----------------- | ------- |
| `PTApi.tsx` | `PTApi` (class) | API client that scrapes masjids.co.za for areas and monthly prayer times |
| `PTApi.tsx` | `.setArea(area)` | Normalizes and sets the area slug for API requests |
| `PTApi.tsx` | `.fetchAreas()` | Fetches and parses the area list from the main page |
| `PTApi.tsx` | `.fetchTimes(date)` | Fetches the monthly prayer timetable for the configured area |
| `localStore.tsx` | `getStorage(id?)` | Returns a singleton MMKV instance (multi-process mode) |
| `date.tsx` | `getNextDay(date)` | Returns a new Date incremented by one day |
| `date.tsx` | `getPrevDay(date)` | Returns a new Date decremented by one day |
| `date.tsx` | `getNextMonth(date)` | Returns a new Date incremented by one month |
| `date.tsx` | `getPrevMonth(date)` | Returns a new Date decremented by one month |
| `date.tsx` | `dateToString(date)` | Formats a Date as "15 January 2025" (en-GB) |
| `globalStyles.tsx` | `globalStyles` | Shared `StyleSheet` with base text style (Inter-Medium, 18px) |

## Hooks (`src/hooks/`)

| File | Hook | Purpose |
| ---- | ---- | ------- |
| `usePTApi.tsx` | `usePTApi({ area })` | Manages prayer time fetching, MMKV caching, date navigation, and next-prayer highlighting |
| `usePTNotification.tsx` | `usePTNotification()` | Manages notification permissions, channel creation, scheduling/clearing reminders, and toggle state |

## Services (`src/services/notifications/`)

| File | Function | Purpose |
| ---- | -------- | ------- |
| `notification.ts` | `createNotificationChannel(id, name)` | Creates an Android notification channel (no-op on iOS) |
| `notification.ts` | `schedulePushNotification({title, body, data, date})` | Schedules a local notification at a specific date/time |
| `notification.ts` | `requestNotificationPermission()` | Requests OS notification permission, returns boolean |
| `notification.ts` | `notificationPermissionGranted()` | Checks if notification permission is currently granted |
| `notification.ts` | `clearScheduledNotifications(ids)` | Cancels scheduled notifications by ID |
| `notification.ts` | `getScheduledNotifications()` | Returns all currently scheduled notifications |
| `scheduleReminders.ts` | `formatPrayerTimes(times, minutesBefore)` | Converts prayer time strings to Date objects offset by reminder preference |
| `scheduleReminders.ts` | `fetchTodayPrayerTimes()` | Gets today's prayer times from cache or API |
| `scheduleReminders.ts` | `clearExistingReminders()` | Finds and cancels all scheduled `prayer_reminder` type notifications |
| `scheduleReminders.ts` | `scheduleTodayNotifications()` | Orchestrates: check enabled, fetch times, clear old, schedule new reminders |

## Background Tasks (`src/backgroundTasks/`)

| File | Export | Purpose |
| ---- | ------ | ------- |
| `index.ts` | `registerDefinedTask.prayerReminderTask()` | Registers the daily prayer reminder background task |
| `tasks/prayerReminderTask.ts` | `NAME` | Task identifier: `PRAYER_REMINDER_BACKGROUND_TASK` |
| `tasks/prayerReminderTask.ts` | `handler` | Calls `scheduleTodayNotifications()`, returns success/failed |
| `tasks/prayerReminderTask.ts` | `options` | `{ minimumInterval: 86400 }` (24 hours) |
| `utils.ts` | `registerTask(name, options)` | Registers a background task if not already registered |
| `utils.ts` | `unregisterTask(name)` | Unregisters a background task if registered |
| `utils.ts` | `isTaskRegistered(name)` | Checks if a task is currently registered |

## Components (`src/components/`)

| File | Component | Purpose |
| ---- | --------- | ------- |
| `Page.tsx` | `Page` | Screen wrapper: themed SafeAreaView + Stack.Screen header + StatusBar |
| `LoadingList.tsx` | `LoadingList` | 5 skeleton placeholder bars for loading states |
| `ThemedButton.tsx` | `ThemedButton` | Button that auto-applies theme colors and supports icon prop |
| `ThemedIcon.tsx` | `ThemedIcon` | Icon that defaults to theme primary color |

# Architecture

## Overview

Prayer Times React is an Expo Router mobile app that displays Islamic prayer times scraped from [masjids.co.za](https://masjids.co.za/salaahtimes). Users select an area, view daily prayer schedules with date navigation, and optionally receive reminder notifications before each prayer.

**Tech stack:** React Native, Expo (Router, Notifications, Background Task), `@rneui/themed`, MMKV, `react-native-cheerio`.

## System Diagram

```
+----------------------------------------------------------+
|                      Routes (app/)                       |
|  _layout  |  index  |  areas  |  home  |  settings      |
+----------------------------------------------------------+
        |            |           |            |
        v            v           v            v
+----------------------------------------------------------+
|                    Hooks (src/hooks/)                     |
|           usePTApi          usePTNotification             |
+----------------------------------------------------------+
        |            |           |            |
        v            v           v            v
+----------------------------------------------------------+
|                  Services & Utils (src/)                  |
|  PTApi  |  localStore  |  notification  |  scheduleRem.  |
+----------------------------------------------------------+
        |                        |
        v                        v
+----------------------------------------------------------+
|               Background Tasks (src/backgroundTasks/)    |
|       prayerReminderTask  |  utils (register/unregister) |
+----------------------------------------------------------+
        |                        |
        v                        v
+----------------------------------------------------------+
|                    External / Platform                    |
|  masjids.co.za API  |  expo-notifications  |  MMKV store |
+----------------------------------------------------------+
```

## Layers

- **Routes** -- File-based Expo Router screens. Each screen is a self-contained page using the `Page` wrapper component for consistent theming and header configuration.
- **Hooks** -- `usePTApi` manages prayer time fetching, caching, and date navigation. `usePTNotification` manages notification permissions, scheduling, and toggle state.
- **Services & Utils** -- `PTApi` scrapes prayer data via cheerio. `localStore` provides singleton MMKV instances. `notification.ts` wraps expo-notifications APIs. `scheduleReminders.ts` orchestrates fetching times and scheduling notifications.
- **Background Tasks** -- `prayerReminderTask` runs daily via `expo-background-task` to reschedule notifications. `utils.ts` provides register/unregister helpers.
- **External / Platform** -- The masjids.co.za website (data source), expo-notifications (OS-level notifications), and MMKV (persistent key-value storage).

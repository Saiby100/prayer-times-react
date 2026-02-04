# Storage

## MMKV Schema

All values are stored in a single MMKV instance with ID `'default'` (multi-process mode).

| Key | Type | Description | Set By | Read By |
| --- | ---- | ----------- | ------ | ------- |
| `area` | `string` | Selected area name (e.g. "Cape Town") | `areas.tsx` on area tap | `index.tsx` (redirect logic), `scheduleReminders.ts` |
| `themeMode` | `string` | `'light'` or `'dark'` | `index.tsx` (init default), `home.tsx` (toggle) | `index.tsx` (restore on launch) |
| `times_{month}_{year}_{area}` | `string` (JSON) | Cached monthly prayer times array. Month is 0-indexed. | `usePTApi` (after fetch), `scheduleReminders.ts` (after fetch) | `usePTApi` (before fetch), `scheduleReminders.ts` (before fetch) |
| `remindersEnabled` | `boolean` | Whether prayer notifications are enabled | `home.tsx` (bell toggle) | `scheduleReminders.ts`, `usePTNotification` |
| `prayerReminderPref` | `number` | Minutes before prayer to send reminder (0-60) | `settings.tsx` (slider) | `settings.tsx` (init), `usePTNotification`, `scheduleReminders.ts` |
| `notificationPermissionDenied` | `boolean` | Tracks if user denied OS notification permission | `usePTNotification` | `usePTNotification` (skip permission request if denied) |

### Cache Key Format

Prayer times are cached with the key pattern `times_{month}_{year}_{area}` where:
- `month` = `Date.getMonth()` (0-11)
- `year` = `Date.getFullYear()`
- `area` = raw area name as stored (e.g. "Cape Town")

---

## Notification Lifecycle

### Permission

1. On app open, `usePTNotification.setupNotifications()` runs.
2. If `notificationPermissionDenied` is `true`, skip (don't re-prompt).
3. Otherwise call `requestNotificationPermission()` (wraps `expo-notifications`).
4. If denied, set `notificationPermissionDenied = true` and disable notification features.
5. If granted, create the `prayer_reminder` Android notification channel.

### Scheduling

1. `scheduleTodayNotifications()` is the shared entry point (used by both foreground and background task).
2. Checks `remindersEnabled` in MMKV -- exits early if `false`.
3. Fetches today's prayer times (cache first, then API fallback).
4. Reads `prayerReminderPref` for the offset in minutes.
5. Clears all existing `prayer_reminder` type notifications.
6. For each prayer time that is still in the future (after subtracting the reminder offset), schedules a local notification.

### Notification Content

Each scheduled notification has:
- **Title:** `"{PrayerName} Reminder"` (e.g. "Dhuhr Reminder")
- **Body:** `"{PrayerName} prayer at {HH:MM}."` (e.g. "Dhuhr prayer at 12:30.")
- **Data:** `{ type: 'prayer_reminder', prayer: '{PrayerName}' }`
- **Trigger:** `DATE` type at the computed reminder time

### Toggle Flow

- **Enable (bell-off -> bell):** Calls `initPrayerReminders()` which runs `scheduleTodayNotifications()`, then sets `remindersEnabled = true`.
- **Disable (bell -> bell-off):** Cancels all tracked notification IDs, clears state, sets `remindersEnabled = false`.

### Background Rescheduling

The `PRAYER_REMINDER_BACKGROUND_TASK` runs approximately every 24 hours via `expo-background-task`. It calls `scheduleTodayNotifications()` to refresh notifications for the new day.

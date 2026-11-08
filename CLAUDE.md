# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                # Start dev server (APP_VARIANT=development)
npm run android          # Prebuild + run the dev build (com.salasaiet.reminder.dev)
npm run android:release  # Prebuild + run a production-ID release build (com.salasaiet.reminder)
npm run ios              # Run on iOS (dev variant)
expo start --web    # Run on web
expo lint           # Lint (ESLint with expo config)
jest --watchAll     # Run tests (jest-expo)
jest path/to/test   # Run a single test file
```

Build and deploy use EAS (`eas build`, `eas update`). CI workflows live in `.github/workflows/`.

## Architecture

**Expo Router app** (file-based routing) for displaying Islamic prayer times fetched from Supabase. Expo SDK 54 / React Native 0.81 / React 19, targeting Android API 36.

### Routes (`app/`)

- `index.tsx` — Splash/init screen; redirects to `/areas` (first launch) or `/home`
- `areas.tsx` — Area selector (fetched from API)
- `(tabs)/home.tsx` — Main prayer times view with date navigation
- `settings.tsx` — Notification reminder preferences
- `_layout.tsx` — Root layout with theme provider

### Source (`src/`)

- **`services/prayerTimes.ts`** — Prayer times data client. Fetches areas and daily/monthly prayer times from Supabase (`fetchAreas`, `fetchTimes`, `areaToSlug`). The `prayer_times` table holds only 2026 rows (times repeat yearly), so `fetchTimes` always queries the 2026 range for the requested month and returns a `MonthTimes` map keyed by `MM-DD`. Look days up with `getTimesForDay` (`utils/monthTimes.ts`), which maps 29 Feb to 28 Feb. `prayerTimesCache` keys by month and area only (`times_<month>_<area>`). `loadMonth(date, area)` is the shared cache-else-fetch (display names, cached on success, null when offline), used by the reminder sync and the widgets.
- **`utils/widgetData.ts`** + **`services/widgets/loadWidgetData.ts`** — What the home screen widgets show. `buildWidgetData` (pure) returns `no-area` / `not-loaded` / `all-hidden`, or `ready` with the next visible prayer (`next`, whose `date` sets the widget refresh), its `day` and that day's visible `rows` — tomorrow's after the last visible prayer, unlike Home. `loadWidgetData()` reads the stores and loads months, fetching tomorrow's month only when today has no visible prayer left.
- **`widgets/`** — Android home screen widgets (`react-native-android-widget`). The library's config plugin in `app.config.ts` declares each widget (name, picker label, size, resize mode, 30-minute `updatePeriodMillis`) and copies its `fonts` (Inter-Medium, Inter-SemiBold, Feather.ttf from `@expo/vector-icons`) into the native assets, so widget or font changes need a store build. The JS entry is `index.ts` (`package.json` `main`): it loads `expo-router/entry` and registers `widgetTaskHandler`, which runs headless on add / update / resize, calls `loadWidgetData()` and draws the widget named in `WIDGETS` (`NextPrayer` → `NextPrayerWidget`). Widgets are drawn as bitmaps in `light` and `dark` variants that Android switches between by the phone's dark mode: `getWidgetThemes(getPickedThemeId())` gives the picked theme in both, or Misty Valley / Crescent Lagoon when none is picked (no `Appearance` in the headless task). Icons are Feather glyphs (`featherGlyph`); empty-state texts are in `widgetMessages.ts`. The whole widget is one `OPEN_APP` tap target (cold start goes through `app/index.tsx`, so no area → Areas).
- **`utils/localStore.ts`** — Internal MMKV instance factory. Not imported directly — use `@/stores` instead.
- **`stores/`** — Domain-scoped storage modules. Each module owns its MMKV keys with typed getters/setters. Barrel re-export at `stores/index.ts`.
- **`hooks/usePTApi.tsx`** — Manages prayer time fetching (via `services/prayerTimes`), date navigation, and caching logic. `highlighted` is the name of the next prayer (`utils/nextPrayer.ts`) when it falls on the shown day, so after Isha it's tomorrow's Fajr. There is no timer: `now` only updates when the app comes back to the foreground (`AppState` → `active`), which also moves a "today" view to the new day.
- **`hooks/notifications/usePrayerReminders.ts`** — Manages notification permission, channel setup, and prayer reminder scheduling lifecycle.
- **`services/notifications/notification.ts`** — Core notification APIs (schedule, permissions, channels).
- **`services/notifications/scheduleReminders.ts`** — Fetches prayer times and schedules the reminders, as notifications or prayer alarms by the reminder type.
- **`services/alarms/alarm.ts`** — JS wrapper for the native prayer alarm module (`scheduleAlarm`, `cancelAlarms`, `getScheduledAlarms`, `testAlarm`, `alarmsAvailable`, `setAlarmTheme`, `canUseFullScreenIntent`, `openFullScreenIntentSettings`), shaped like `notification.ts`. Does nothing on iOS/web or builds without the module.
- **`hooks/notifications/useAlarmPermissions.ts`** — Full-screen and notification permission state for Settings → Notifications, re-checked on screen focus and on return to the foreground; also `previewReminder(type)` (toast "Reminder preview in 5 seconds") and `openFullScreenSettings()`.
- **`backgroundTasks/`** — Background task definitions. `index.ts` exports `registerAllBackgroundTasks()` to register all tasks at app startup. Each task gets its own file (e.g. `prayerReminderTask.ts`).
- **`theme/`** — Theme system: `colors.ts` defines one palette per theme preset (`mistyColors`, `sunsetColors`, `crescentColors`, `twilightColors`), `presets.ts` pairs each with its wallpaper (`assets/images/backgrounds/`) and picker preview (`assets/images/previews/`), `components.ts` overrides `@rneui/themed` component styles, `types.ts` augments the `Colors` interface with custom properties. Uses the `Inter-Medium` font (titles use `Inter-SemiBold` instead of `fontWeight`); both are embedded from `assets/fonts/` by the `expo-font` config plugin in `app.config.ts`, so adding a font needs a new store build.
- **`components/`** — Reusable UI components (Page, LoadingList, etc.).

### Key Patterns

- **No Redux/Context** — state is managed via React hooks + MMKV for persistence.
- **Path alias** — `@/*` maps to `./src/*` (configured in `tsconfig.json`).
- **UI library** — `@rneui/themed` v5 (React Native Elements) for components and theming. Its icon sets (`feather`, `material`, `ionicon`) are registered against `@expo/vector-icons` in `app/_layout.tsx` via `registerCustomIconType`; register any new icon `type` there too, or it renders blank.
- **Edge-to-edge** — Android always draws behind the status and navigation bars. Use `react-native-safe-area-context` insets for spacing; status/navigation bar colour props are ignored. Status bar icon style follows the in-app theme via `expo-status-bar` in `Page`.
- **OTA vs build gating** — `runtimeVersion` uses the `fingerprint` policy (hash of the native layer, tuned by `fingerprint.config.js` to ignore version bumps, `extra` and `package.json` scripts). On push to `main`, `scripts/ci/production-build-status.sh` looks up production Android builds for the current fingerprint: if one exists in any active state (queued, in progress or finished), `publish-production-update.yml` publishes an OTA update and `build-production-android.yml` skips; otherwise a new build runs and the OTA is skipped. Publishing while the build is still running is intentional — the build fetches the update once installed, so JS pushed mid-build isn't lost. Config-referenced assets (icon, splash, notification icon) are part of the fingerprint; JS-`require()`d assets ship over the air.
- **Versioning** — `version` (versionName) comes from `package.json`. Android `versionCode` and iOS `buildNumber` are managed remotely by EAS (`appVersionSource: remote`) and auto-incremented on each production build; inspect or change them with `eas build:version:get` / `eas build:version:set`.
- **Google Play only** — Releases ship only through Google Play (`submit-production-android.yml`); no git tags or GitHub Releases are created.
- **Legacy GitHub APK** — Versions up to v3.0.0 shipped as an APK on GitHub Releases. That APK polls GitHub `releases/latest` and prompts to update when the tag is newer than its own, and it runs `runtimeVersion` `3.0` on the `production` channel. To leave those users unaffected: never create a GitHub Release, never publish an OTA update for runtime `3.0`, and keep the old releases and tags.
- **Notification flow** — On app open, `registerBackgroundTask()` (from `backgroundTasks/`) sets up daily task → `syncPrayerReminders()` (from `services/notifications/scheduleReminders`) runs immediately → background task repeats every 24h. Turning reminders on/off, changing the offset or reminder type, hiding a prayer and changing area also call it.
- **Reminder sync** — `syncPrayerReminders()` makes the scheduled reminders match the settings: today's remaining prayers plus the next 6 days (≤ 42) when on, none when off. They're delivered as the **reminder type** (`getReminderType()`, Notification by default, or Alarm via the prayer alarm module); a saved Alarm counts only when `alarmsAvailable()`, so iOS and builds without the module get notifications. Each reminder's id is `prayer_reminder:YYYY-MM-DD:<prayer>` in either scheduler; a notification's fire time is in `data.fireAt`, an alarm's in its saved `fireAt`. `planSync` (`utils/reminderPlan.ts`) diffs the chosen type with `diffReminders`, so only missing or changed reminders are scheduled (the same id replaces the old one) and unwanted ones are cancelled, and cancels every reminder of the other type. The chosen type is scheduled before anything is cancelled. Alarms are scheduled one by one (`allSettled`): failures (e.g. exact alarms not allowed) are logged once at `warn` and stay unscheduled, with no notification fallback, until the next sync. The snooze / test alarm slot is never listed, so sync never touches it. Never clear-then-reschedule: a run cut off partway would lose reminders. Reminders on days whose month couldn't be loaded are kept, and if no month loads nothing changes. Runs go through `createSerialRunner` (`utils/serialRunner.ts`): one at a time, with calls made during a run merged into one rerun, so a quick off after on can't leave reminders scheduled.
- **Exact alarms** — Reminders only fire on time when expo-notifications can schedule exact alarms (otherwise Android defers them in Doze). `plugins/withExactAlarmPermission.js` declares `USE_EXACT_ALARM` (API 33+, granted at install) and `SCHEDULE_EXACT_ALARM` capped at `maxSdkVersion` 32 (Android 12/12L, granted by default), so no user prompt is needed. Never let a dependency add an uncapped `SCHEDULE_EXACT_ALARM` — check the merged manifest when adding native deps.
- **Prayer alarm module** — `modules/prayer-alarm/` is a local Expo module (Kotlin, Android only, autolinked from `modules/`; part of the fingerprint, so changes need a store build). It schedules alarms with `AlarmManager.setAlarmClock()` (fires in Doze; shows the system alarm icon and "next alarm"), one PendingIntent per id (`prayeralarm://<id>` data URI) so the same id replaces. AlarmManager can't list alarms and forgets them on restart, so `AlarmStore` keeps each alarm (id, fireAt, prayer, prayerTime, title, body) as JSON in device-protected SharedPreferences (`prayer_alarms`), readable before the first unlock. Saved alarms are re-registered by `RescheduleReceiver` on `LOCKED_BOOT_COMPLETED` / `BOOT_COMPLETED` / `MY_PACKAGE_REPLACED`, and when the module loads (a force-stop cancels them all); alarms whose time passed are dropped, not fired late. `AlarmReceiver` is the single "alarm fired" entry point (direct-boot aware): it forgets the alarm and starts the ringing service. The module's manifest adds `RECEIVE_BOOT_COMPLETED`, `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_SYSTEM_EXEMPTED`, `WAKE_LOCK`, `VIBRATE` and `USE_FULL_SCREEN_INTENT`; exact-alarm permissions stay in `withExactAlarmPermission.js`.
- **Alarm ringing** — `AlarmRingService` is a direct-boot-aware foreground service of type `systemExempted` (allowed for apps holding `USE_EXACT_ALARM` that keep alarms ringing; declared on Play Console). It loops the default alarm tone at alarm volume (`AlarmSound`, falling back to the notification tone, then the ringtone) and vibrates, with a heads-up notification (title = prayer, "Prayer at 05:12", **Snooze 5 min** / **Dismiss**) on the "Prayer alarms" channel (`prayer_alarm`, high importance, no sound/vibration of its own; created natively when an alarm or test is scheduled or rings). The ringer decides: normal → sound + vibration, vibrate → vibration, silent / DND / any call → notification only; a call starting mid-ring silences the rest of that ring. Snooze rings again in 5 min; after 10 min it stops by itself, leaving nothing behind; swiping the notification away counts as Dismiss; `ACTION_SILENCE` stops sound and vibration but keeps ringing (for the ringing screen's volume keys). If notifications or the channel are off, it doesn't ring at all (no way to stop it). Snoozes and the test alarm (`testAlarm()`, 5 s ahead, prayer "Test alarm") share one slot in `OneOffAlarmStore` (`prayer_alarm_oneoff` prefs, id `prayer_alarm_oneoff`) that the JS sync never sees; a new ring cancels it, so only the newest alarm rings (no queue).
- **Ringing screen** — `AlarmActivity` is a native activity (views built in Kotlin, no React Native) opened by the ringing notification's full-screen intent (locked / screen off: turns the screen on and shows over the lock screen, also before the first unlock) and by tapping the notification (phone in use: heads-up only). It shows the 24-hour current time (`TextClock`), prayer, "Prayer at 05:12" (`AlarmNotification.subtitle`, "Rings at …" for the test alarm), **Snooze 5 min** and **Dismiss** in `Inter-SemiBold` / `Inter-Medium` loaded from the app's `assets/fonts/` (copied there by expo-font). It always shows `AlarmRingService.ringing` and follows the service's `ACTION_RING_CHANGED` broadcast: a new alarm replaces what's shown; ringing stopping (dismiss, snooze, auto-stop) closes it. Its own task, out of Recents (`singleInstance`, empty `taskAffinity`): Back / Home leave it while the alarm keeps ringing, and tapping the notification brings it back. Volume keys send `ACTION_SILENCE`. Colours are a flat theme background, no wallpaper: `InnerLayout` (`app/_layout.tsx`) sends the current theme's `background`/`text`/`primary`/`bgLight` with `setAlarmTheme` on every open and theme change, saved by `AlarmTheme` in device-protected prefs (`prayer_alarm_theme`), falling back to Crescent Lagoon — so new or changed theme presets need no native change. On Android 14+ Play (or the user) can take away full-screen access: alarms then ring with the heads-up only; `canUseFullScreenIntent()` tells, `openFullScreenIntentSettings()` opens Android's setting (app notification settings below 14). Play Console needs the full-screen intent declaration (alarm use case).
- **Reminder type setting** — Settings → Notifications has a **Reminder type** row (shown only with reminders on and `canUseAlarms`, i.e. Android with the module) opening `ReminderTypePopup`: tapping Notification / Alarm saves it and closes at once (`setReminderType` re-syncs); **Preview reminder** sends the picked type 5 s later — the test alarm, or a preview notification (`sendPreviewNotification`, `services/notifications/testNotification.ts`, `data.type` `reminder_preview` so sync ignores it) — and is disabled while notifications are blocked. Picking Alarm without full-screen access still saves Alarm, then a popup offers the setting; `FullScreenAlarmWarning` stays on the screen while Alarm is picked and access is missing.
- **Qibla heading** — `useQiblaCompass` on Android reads the heading from `expo-sensors` `DeviceMotion` (gyro-fused rotation vector, `headingFromRotationAlpha` in `utils/qibla.ts`) plus the declination cached from `watchHeadingAsync`, because expo-location's Android heading uses the raw accelerometer and magnetometer and jitters. `watchHeadingAsync` still runs for the calibration accuracy, and drives the heading on iOS and on Android devices without the sensors `DeviceMotion` needs. The bearing shows at once from the system's last known position (nothing is saved by the app) and is refined quietly by a fresh fix, which can take seconds on Android; if the fix fails, the last known position stays.
- **Background task pattern** — Each task exports `NAME`, `handler`, and `options` constants. `registerDefinedTask` object provides per-task registration methods.
- **Initial theme** — Until the user picks a theme in Settings → Appearance, `getThemeId()` (`appearanceStore`) follows the system colour scheme (Crescent Lagoon on dark, Misty Valley otherwise), resolved once per cold start and not saved. A saved `themeId` wins if it still names a preset; a stale one (e.g. a removed theme) is deleted and the system default applies. The native splash draws one transparent icon (`assets/images/splash-icon.png`, rendered from `splash-icon.svg`) on these two defaults' `background` colours, set in `app.config.ts`; it follows the system mode, not the saved theme.
- **Hijri adjustment** — `useHijriDate` shifts the date by `-hijri_adjustment` (Supabase `app_settings`, single row, −2..2; 1 = the local month starts a day after Umm al-Qura) before converting. The developer edits it by hand when a month starts differently. It's fetched on open and on each return to the foreground (`services/hijriAdjustment.ts`), saved in `hijriStore` (`hijriAdjustment` key) for offline use, and defaults to 0. Prayer times, navigation and reminders use the real date.
- **Storage** — All MMKV access is centralized in `src/stores/` with domain-scoped modules (`areaStore`, `prayerTimesCache`, `appearanceStore`, `notificationStore`, `deviceStore`, `qiblaStore`, `hijriStore`). Barrel export at `@/stores`. `notificationStore`'s `reminderPromptSeen` key records that the one-time "Get prayer reminders?" popup on Home (`useReminderPrompt`) was answered or skipped; it is skipped when notifications are already blocked. Its `reminderType` key (`'notification' | 'alarm'`, missing → `notification`) picks how reminders are delivered. No file outside `src/stores/` should import `getStorage` directly.
- **Logging** — Use `log` from `@/utils/logger`. Every call passes a `type`: a kebab-case slug for the action being carried out (`sync-reminders`, `fetch-prayer-times`, …), from the `LogType` union; add a slug there for a new action. Release builds send only `warn`/`error` to the Supabase `logs` table (`info`/`debug` stay on the console), so log at `warn` anything that must be seen remotely. Rows older than 30 days are deleted daily by the `delete-old-logs` `pg_cron` job; `PRIVACY.md` states both.

## IMPORTANT: Always Clarify Before Acting

**Do NOT assume requirements. Always ask questions first.**

Before starting any task — especially feature work, refactors, or anything with ambiguity — ask clarifying questions to fully understand what is expected. Do not guess at intent, scope, or implementation details. It is always better to ask one too many questions than to build the wrong thing.

## Code Style

- Prefer small, focused files with utility functions over large files with many functions. Group closely related functions together in the same file.
- TypeScript strict mode
- Prettier: single quotes, 100 print width, 2-space indent (`.prettierrc`)
- ESLint extends `expo` config with `eslint-import-resolver-typescript` for `@/` alias resolution

## Component Definition Style

- **Do not use `React.FC`**: Define components as plain arrow functions with props typed inline — `const Foo = ({ bar }: FooProps) => { ... }`. This is consistent with the existing codebase (e.g. `LoadingList`). `React.FC` adds no value in React 18+ and is avoided here.

## UI Component Guidelines

- **Keep screens thin**: Screen files in `app/` should primarily compose components and manage data fetching/navigation — not contain complex rendering logic.
- **Extract logic into custom hooks**: Move data fetching, subscriptions, and non-trivial logic out of screen files into custom hooks in `src/hooks/`. Screen files should read like a declarative composition of hooks and components.
- **Organize hooks by domain entity, not by screen or query**: Group related queries and mutations into a single hook file per domain entity. Add new queries to the existing entity hook rather than creating a new hook file per query.
- **Single responsibility**: Each component should do one thing. Prefer focused components over monolithic screens that render everything inline.
- **Composable and prop-driven**: Components should accept props for data and callbacks — avoid reaching into global state from deep UI components.
- **Avoid premature abstraction**: Don't create a wrapper component for something used only once. Extract when there's actual reuse or the file becomes hard to follow.

## UI Design Style

- **Rounded cards**: List items and interactive rows should use rounded card styling — `borderRadius: 12`, `bgLight` background from theme, with horizontal padding. Avoid flat divider-separated rows (`bottomDivider`).
- **FlatList layout**: Use `paddingHorizontal: 16`, `gap: 10`, and `paddingBottom: 24` on `contentContainerStyle` for consistent list spacing.
- **Expandable cards**: When wrapping content that expands (e.g. `ListItem.Accordion`), wrap the whole component in a `View` with `borderRadius: 12` and `overflow: 'hidden'` so corners stay rounded in both collapsed and expanded states.
- **Search bars**: For filterable lists, add a sticky `SearchBar` header with `round` style, themed input background (`bgLight`), and a solid `background` color on the container to prevent content showing through when scrolling.

## Type Definition Guidelines

- **Use `type` over `interface`**: Prefer `type` for consistency. Use `interface` only when declaration merging is needed (e.g., theme augmentation in `src/theme/types.ts`).
- **No `any`**: Use `unknown` for truly unknown data, or type it properly. `Record<string, unknown>` over `Record<string, any>`.
- **Prefer narrow types**: Use string literal unions over plain `string` for fields with known values.
- **Props types next to components**: Component prop types should be defined in the same file as the component, not in `src/types/`.
- **Document type fields**: Every field in a `type` definition must have a brief JSDoc comment (`/** ... */`) describing its purpose.

## Commit Guidelines

- **One commit per task**: Separate tasks must be committed separately — never bundle unrelated changes into a single commit. If you completed multiple tasks before committing, create one commit per task.
- **Ask when unsure**: If it's unclear whether changes belong in one commit or multiple, ask before committing.

## Maintaining this file

When making changes that affect architecture, commands, key patterns, or storage keys, update the relevant sections of this CLAUDE.md to keep it accurate.

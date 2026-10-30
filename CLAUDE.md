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
- `home.tsx` — Main prayer times view with date navigation
- `settings.tsx` — Notification reminder preferences
- `_layout.tsx` — Root layout with theme provider

### Source (`src/`)

- **`services/prayerTimes.ts`** — Prayer times data client. Fetches areas and daily/monthly prayer times from Supabase (`fetchAreas`, `fetchTimes`, `areaToSlug`). The `prayer_times` table holds only 2026 rows (times repeat yearly), so `fetchTimes` always queries the 2026 range for the requested month and returns a `MonthTimes` map keyed by `MM-DD`. Look days up with `getTimesForDay` (`utils/monthTimes.ts`), which maps 29 Feb to 28 Feb. `prayerTimesCache` keys by month and area only (`times_<month>_<area>`).
- **`utils/localStore.ts`** — Internal MMKV instance factory. Not imported directly — use `@/stores` instead.
- **`stores/`** — Domain-scoped storage modules. Each module owns its MMKV keys with typed getters/setters. Barrel re-export at `stores/index.ts`.
- **`hooks/usePTApi.tsx`** — Manages prayer time fetching (via `services/prayerTimes`), date navigation, and caching logic. `highlighted` is the name of the next prayer (`utils/nextPrayer.ts`) when it falls on the shown day, so after Isha it's tomorrow's Fajr. There is no timer: `now` only updates when the app comes back to the foreground (`AppState` → `active`), which also moves a "today" view to the new day.
- **`hooks/notifications/usePrayerReminders.ts`** — Manages notification permission, channel setup, and prayer reminder scheduling lifecycle.
- **`services/notifications/notification.ts`** — Core notification APIs (schedule, permissions, channels).
- **`services/notifications/scheduleReminders.ts`** — Fetches prayer times and schedules reminder notifications.
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
- **Notification flow** — On app open, `registerBackgroundTask()` (from `backgroundTasks/`) sets up daily task → `syncPrayerReminders()` (from `services/notifications/scheduleReminders`) runs immediately → background task repeats every 24h. Turning reminders on/off, changing the offset, hiding a prayer and changing area also call it.
- **Reminder sync** — `syncPrayerReminders()` makes the scheduled reminders match the settings: today's remaining prayers plus the next 6 days (≤ 42) when on, none when off. Each reminder's notification id is `prayer_reminder:YYYY-MM-DD:<prayer>` and its fire time is in `data.fireAt`; `diffReminders` (`utils/reminderPlan.ts`) compares with what's scheduled, so only missing or changed reminders are scheduled (the same id replaces the old one) and unwanted ones are cancelled. Never clear-then-reschedule: a run cut off partway would lose reminders. Reminders on days whose month couldn't be loaded are kept, and if no month loads nothing changes. Runs go through `createSerialRunner` (`utils/serialRunner.ts`): one at a time, with calls made during a run merged into one rerun, so a quick off after on can't leave reminders scheduled.
- **Exact alarms** — Reminders only fire on time when expo-notifications can schedule exact alarms (otherwise Android defers them in Doze). `plugins/withExactAlarmPermission.js` declares `USE_EXACT_ALARM` (API 33+, granted at install) and `SCHEDULE_EXACT_ALARM` capped at `maxSdkVersion` 32 (Android 12/12L, granted by default), so no user prompt is needed. Never let a dependency add an uncapped `SCHEDULE_EXACT_ALARM` — check the merged manifest when adding native deps.
- **Qibla heading** — `useQiblaCompass` on Android reads the heading from `expo-sensors` `DeviceMotion` (gyro-fused rotation vector, `headingFromRotationAlpha` in `utils/qibla.ts`) plus the declination cached from `watchHeadingAsync`, because expo-location's Android heading uses the raw accelerometer and magnetometer and jitters. `watchHeadingAsync` still runs for the calibration accuracy, and drives the heading on iOS and on Android devices without the sensors `DeviceMotion` needs. `DeviceMotion` keeps running for 30 s after the Qibla tab loses focus (readings ignored), because restarting the rotation vector makes the heading settle visibly. The bearing shows at once from the system's last known position (or the one saved in `qiblaStore`'s `qiblaLastPosition` key) and is refined quietly by a fresh fix, which can take seconds on Android; if the fix fails, the cached position stays.
- **Background task pattern** — Each task exports `NAME`, `handler`, and `options` constants. `registerDefinedTask` object provides per-task registration methods.
- **Initial theme** — Until the user picks a theme in Settings → Appearance, `getThemeId()` (`appearanceStore`) follows the system colour scheme (Crescent Lagoon on dark, Misty Valley otherwise), resolved once per cold start and not saved. A saved `themeId` wins if it still names a preset; a stale one (e.g. a removed theme) is deleted and the system default applies. The native splash draws one transparent icon (`assets/images/splash-icon.png`, rendered from `splash-icon.svg`) on these two defaults' `background` colours, set in `app.config.ts`; it follows the system mode, not the saved theme.
- **Hijri adjustment** — `useHijriDate` shifts the date by `-hijri_adjustment` (Supabase `app_settings`, single row, −2..2; 1 = the local month starts a day after Umm al-Qura) before converting. The developer edits it by hand when a month starts differently. It's fetched on open and on each return to the foreground (`services/hijriAdjustment.ts`), saved in `hijriStore` (`hijriAdjustment` key) for offline use, and defaults to 0. Prayer times, navigation and reminders use the real date.
- **Storage** — All MMKV access is centralized in `src/stores/` with domain-scoped modules (`areaStore`, `prayerTimesCache`, `appearanceStore`, `notificationStore`, `deviceStore`, `qiblaStore`, `hijriStore`). Barrel export at `@/stores`. `notificationStore`'s `reminderPromptSeen` key records that the one-time "Get prayer reminders?" popup on Home (`useReminderPrompt`) was answered or skipped; it is skipped when notifications are already blocked. `qiblaStore`'s `qiblaLastPosition` holds the last fresh position the Qibla was found from. No file outside `src/stores/` should import `getStorage` directly.
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

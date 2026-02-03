# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
expo start          # Start dev server
expo run:android    # Run on Android
expo run:ios        # Run on iOS
expo start --web    # Run on web
expo lint           # Lint (ESLint with expo config)
jest --watchAll     # Run tests (jest-expo)
jest path/to/test   # Run a single test file
```

Build and deploy use EAS (`eas build`, `eas update`). CI workflows live in `.github/workflows/`.

## Architecture

**Expo Router app** (file-based routing) for displaying Islamic prayer times scraped from masjids.co.za.

### Routes (`app/`)

- `index.tsx` — Splash/init screen; redirects to `/areas` (first launch) or `/home`
- `areas.tsx` — Area selector (fetched from API)
- `home.tsx` — Main prayer times view with date navigation
- `settings.tsx` — Notification reminder preferences
- `_layout.tsx` — Root layout with theme provider

### Source (`src/`)

- **`utils/PTApi.tsx`** — API client class. Scrapes HTML from `masjids.co.za/salaahtimes` using `react-native-cheerio`. Returns area list and monthly prayer time tables.
- **`utils/localStore.ts`** — MMKV-based persistent storage. Stores selected area, theme, cached prayer times (keyed `times_${month}_${year}_${area}`), notification preferences.
- **`hooks/usePTApi.ts`** — Manages prayer time fetching, date navigation, and caching logic.
- **`hooks/usePTNotification.ts`** — Manages notification permission and scheduling lifecycle.
- **`services/notifications/notification.ts`** — Core notification APIs (schedule, permissions, channels).
- **`services/notifications/scheduleReminders.ts`** — Fetches prayer times and schedules reminder notifications.
- **`backgroundTasks/`** — Background task definitions. `index.ts` exports `registerAllBackgroundTasks()` to register all tasks at app startup. Each task gets its own file (e.g. `prayerReminderTask.ts`).
- **`components/`** — Reusable UI components (Page, LoadingList, etc.).
- **`types/`** — TypeScript type definitions.

### Key Patterns

- **No Redux/Context** — state is managed via React hooks + MMKV for persistence.
- **Path alias** — `@/*` maps to `./src/*` (configured in `tsconfig.json`).
- **UI library** — `@rneui/themed` (React Native Elements) for components and theming.
- **Notification flow** — On app open, `registerBackgroundTask()` (from `backgroundTasks/`) sets up daily task → `scheduleTodayNotifications()` (from `services/notifications/scheduleReminders`) runs immediately → background task repeats every 24h.

## Code Style

- Prefer small, focused files with utility functions over large files with many functions. Group closely related functions together in the same file.
- TypeScript strict mode
- Prettier: single quotes, 100 print width, 2-space indent (`.prettierrc`)
- ESLint extends `expo` config with `eslint-import-resolver-typescript` for `@/` alias resolution
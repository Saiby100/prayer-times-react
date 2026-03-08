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
- **`utils/localStore.tsx`** — `getStorage(id)` factory function returning MMKV instances with lazy initialization and multi-process support.
- **`hooks/usePTApi.tsx`** — Manages prayer time fetching, date navigation, and caching logic.
- **`hooks/usePTNotification.tsx`** — Manages notification permission and scheduling lifecycle.
- **`services/notifications/notification.ts`** — Core notification APIs (schedule, permissions, channels).
- **`services/notifications/scheduleReminders.ts`** — Fetches prayer times and schedules reminder notifications.
- **`backgroundTasks/`** — Background task definitions. `index.ts` exports `registerAllBackgroundTasks()` to register all tasks at app startup. Each task gets its own file (e.g. `prayerReminderTask.ts`).
- **`theme/`** — Theme system: `colors.ts` defines `lightColors`/`darkColors`, `components.ts` overrides `@rneui/themed` component styles, `types.ts` augments the `Colors` interface with custom properties. Uses `Inter-Medium` font.
- **`components/`** — Reusable UI components (Page, LoadingList, etc.).

### Key Patterns

- **No Redux/Context** — state is managed via React hooks + MMKV for persistence.
- **Path alias** — `@/*` maps to `./src/*` (configured in `tsconfig.json`).
- **UI library** — `@rneui/themed` (React Native Elements) for components and theming.
- **Notification flow** — On app open, `registerBackgroundTask()` (from `backgroundTasks/`) sets up daily task → `scheduleTodayNotifications()` (from `services/notifications/scheduleReminders`) runs immediately → background task repeats every 24h.
- **Background task pattern** — Each task exports `NAME`, `handler`, and `options` constants. `registerDefinedTask` object provides per-task registration methods.
- **Storage keys** — `area`, `themeMode`, `times_${month}_${year}_${area}` (cached prayer times), `prayerReminderPref` (minutes before prayer), `remindersEnabled`, `notificationPermissionDenied`, `showHijriDate` (boolean, show Hijri date on home screen).

## IMPORTANT: Always Clarify Before Acting

**Do NOT assume requirements. Always ask questions first.**

Before starting any task — especially feature work, refactors, or anything with ambiguity — ask clarifying questions to fully understand what is expected. Do not guess at intent, scope, or implementation details. It is always better to ask one too many questions than to build the wrong thing.

## Code Style

- Prefer small, focused files with utility functions over large files with many functions. Group closely related functions together in the same file.
- TypeScript strict mode
- Prettier: single quotes, 100 print width, 2-space indent (`.prettierrc`)
- ESLint extends `expo` config with `eslint-import-resolver-typescript` for `@/` alias resolution

## UI Component Guidelines

- **Keep screens thin**: Screen files in `app/` should primarily compose components and manage data fetching/navigation — not contain complex rendering logic.
- **Extract logic into custom hooks**: Move data fetching, subscriptions, and non-trivial logic out of screen files into custom hooks in `src/hooks/`. Screen files should read like a declarative composition of hooks and components.
- **Organize hooks by domain entity, not by screen or query**: Group related queries and mutations into a single hook file per domain entity. Add new queries to the existing entity hook rather than creating a new hook file per query.
- **Single responsibility**: Each component should do one thing. Prefer focused components over monolithic screens that render everything inline.
- **Composable and prop-driven**: Components should accept props for data and callbacks — avoid reaching into global state from deep UI components.
- **Avoid premature abstraction**: Don't create a wrapper component for something used only once. Extract when there's actual reuse or the file becomes hard to follow.

## Type Definition Guidelines

- **Use `type` over `interface`**: Prefer `type` for consistency. Use `interface` only when declaration merging is needed (e.g., theme augmentation in `src/theme/types.ts`).
- **No `any`**: Use `unknown` for truly unknown data, or type it properly. `Record<string, unknown>` over `Record<string, any>`.
- **Prefer narrow types**: Use string literal unions over plain `string` for fields with known values.
- **Props types next to components**: Component prop types should be defined in the same file as the component, not in `src/types/`.

## Maintaining this file

When making changes that affect architecture, commands, key patterns, or storage keys, update the relevant sections of this CLAUDE.md to keep it accurate.

# Routes

All screens live in `app/` and use Expo Router's file-based routing. Every screen wraps its content in the `<Page>` component, which provides a themed `SafeAreaView`, configures the `Stack.Screen` header, and sets the `StatusBar` color.

---

## `_layout.tsx` -- Root Layout

**Purpose:** Wraps the entire app in the RNEUI `ThemeProvider` and configures the Expo Router `Stack` navigator.

### Setup

- Calls `createTheme()` with custom light and dark color palettes (see [theme.md](./theme.md) for token details).
- Extends the `@rneui/themed` `Colors` interface with two custom tokens: `text` and `bgLight`.
- Renders `<ThemeProvider theme={themeConfig}>` around `<Stack screenOptions={{ headerShown: false }} />`.

### Behavior

- All headers are hidden at the Stack level (`headerShown: false`). Individual screens re-enable headers via `<Page>` and its `Stack.Screen` options.
- Theme mode (light/dark) is not set here -- it is restored in `index.tsx` on app launch.

---

## `index.tsx` -- Splash / Init Screen

**Purpose:** Entry point that runs one-time initialization and immediately redirects. Renders nothing (`return;`).

### Initialization (useEffect, runs once)

1. **Restore theme** -- Reads `themeMode` from MMKV. If missing, defaults to `'light'` and persists it. Calls `setMode()` to apply.
2. **Register background task** -- Calls `registerDefinedTask.prayerReminderTask()` to register the daily notification scheduling task with expo-background-task.
3. **Schedule today's notifications** -- Calls `scheduleTodayNotifications()` to immediately schedule prayer reminders for the current day (if reminders are enabled).

### Redirect Logic (useFocusEffect)

Runs every time the screen gains focus:

- Reads `area` from MMKV storage.
- **Area exists:** Replaces the stack with `/areas`, then pushes `/home` with the area param. This means Areas is in the back stack so users can go back to change area.
- **No area:** Replaces with `/areas` only (first-time launch flow).

### Navigation Flow

```
index.tsx
  |
  +-- area stored? --yes--> replace('/areas') + push('/home', {area})
  |
  +-- no area? ---------> replace('/areas')
```

### Notes

- `SplashScreen.preventAutoHideAsync()` is called at module level to keep the native splash visible. The splash is hidden later in `areas.tsx` or `home.tsx` via `SplashScreen.hide()`.

---

## `areas.tsx` -- Area Selector

**Purpose:** Displays a list of South African areas/cities fetched from masjids.co.za. The user taps an area to navigate to the prayer times view.

### Layout

```
+-----------------------------------+
|  Header: "Select Area"            |
+-----------------------------------+
|                                   |
|  [Loading skeleton]  or           |
|                                   |
|    [pin] Area Name 1              |
|    [pin] Area Name 2              |
|    [pin] Area Name 3              |
|    ...                            |
|                                   |
+-----------------------------------+
```

### UI Sections

- **Header** -- Title "Select Area", configured via `<Page>`.
- **Loading state** -- While areas are being fetched, displays `<LoadingList>` (5 skeleton bars).
- **Area list** -- A centered `FlatList` of `ListItem` rows. Each row has a location pin icon (themed primary color) and the area name.

### State

| State      | Type      | Purpose                         |
| ---------- | --------- | ------------------------------- |
| `areas`    | `string[]`| Area names from API             |
| `isLoading`| `boolean` | Controls skeleton vs list       |

### User Interactions

- **Tap area row** -- Calls `navigateHome(item)`:
  1. Persists the area to MMKV (`storage.set('area', area)`).
  2. Pushes `/home` with `{ area }` param.

### Lifecycle

- `useEffect` -- Fetches areas from `PTApi.fetchAreas()` on mount.
- `useFocusEffect` -- Hides the native splash screen when this screen gains focus.

---

## `home.tsx` -- Prayer Times View

**Purpose:** The main screen. Displays today's prayer times for the selected area in a card layout, with date navigation and header action buttons.

### Layout

```
+-------------------------------------------+
|  Header: "{Area Name}"                    |
|  [moon/sun] [bell] [settings]    (right)  |
+-------------------------------------------+
|                                           |
|  Monday                        [15]       |
|                                           |
|  +-------------------------------------+ |
|  |  Fajr : 05:30                       | |
|  |  Sunrise : 06:45                    | |
|  |  Dhuhr : 12:30       <-- highlighted| |
|  |  Asr : 15:45                        | |
|  |  Maghrib : 18:15                    | |
|  |  Isha : 19:30                       | |
|  +-------------------------------------+ |
|                                           |
|  [<]       15 January 2025         [>]    |
|                                           |
+-------------------------------------------+
```

### UI Sections

1. **Header bar** -- Area name as title, with three action buttons on the right:
   - **Theme toggle** (moon/sun icon) -- Toggles between light and dark mode. Persists to MMKV `themeMode`.
   - **Notification toggle** (bell/bell-off icon) -- Toggles prayer reminders on/off. When enabling, calls `initPrayerReminders()` and sets `remindersEnabled` to `true`. When disabling, calls `clearAllPrayerReminders()` and sets `remindersEnabled` to `false`.
   - **Settings** (gear icon) -- Navigates to `/settings`.

2. **Day label row** -- Shows the day name (e.g. "Monday") on the left and a "today" button (showing today's date number) on the right.

3. **Prayer times card** -- A rounded card (`borderRadius: 12`) with a light shadow (light mode only). Contains a `FlatList` of prayer name/time rows. The upcoming prayer time is highlighted with a primary-colored border.

4. **Date navigation row** -- Left arrow, formatted date string (e.g. "15 January 2025"), right arrow. Arrows navigate to previous/next day.

### State (from hooks)

| Source             | Values                                                                 |
| ------------------ | ---------------------------------------------------------------------- |
| `usePTApi`         | `isLoading`, `navigate` (`next`, `prev`, `today`), `highlighted`, `dateString`, `dayString`, `todayTimes` |
| `usePTNotification`| `clearAllPrayerReminders`, `initPrayerReminders`, `notificationsIsScheduled`, `refreshAndReschedule` |
| `useTheme`         | `theme` (color tokens)                                                 |
| `useThemeMode`     | `mode`, `setMode`                                                      |

### Highlight Logic

The `highlighted` value from `usePTApi` identifies the next upcoming prayer. It compares each prayer time against `Date.now()` and returns the earliest future time string. If the user navigates away from today, highlighting is disabled (returns `''`).

In the FlatList, each prayer row gets a primary-colored border if its time matches `highlighted`, otherwise a transparent border matching the card background.

### Lifecycle

- `useFocusEffect` -- Hides the splash screen and calls `refreshAndReschedule()` to pick up any notification preference changes made in settings.

### Navigation

- Back button returns to `/areas`.
- Settings button pushes `/settings`.

---

## `settings.tsx` -- Notification Settings

**Purpose:** Lets the user configure how many minutes before each prayer they want to receive a reminder notification.

### Layout

```
+-------------------------------------------+
|  Header: "Settings"           [< back]    |
+-------------------------------------------+
|                                           |
|  +-------------------------------------+ |
|  |  Prayer Reminder                    | |
|  |                                     | |
|  |  Notify me:                         | |
|  |  15 minutes before                  | |
|  |                                     | |
|  |  o----o----O----o----o----o----o    | |
|  |  0        15        30        60    | |
|  |                                     | |
|  |  You will receive a notification    | |
|  |  before each prayer time            | |
|  +-------------------------------------+ |
|                                           |
+-------------------------------------------+
```

### UI Sections

1. **Header** -- Title "Settings" with a back button (via `headerBackVisible: true`).

2. **Reminder card** -- A rounded card with shadow (light mode only) containing:
   - **Section title** -- "Prayer Reminder" (20px, semi-bold).
   - **Label** -- "Notify me:".
   - **Value display** -- Shows the current selection in primary color, e.g. "15 minutes before", "At prayer time", or "1 hour before".
   - **Slider** -- An `@rneui/themed` `Slider` with discrete steps mapped to `REMINDER_OPTIONS = [0, 5, 10, 15, 20, 30, 45, 60]` minutes. The slider index (0-7) maps to the corresponding minutes value.
   - **Tick labels** -- Shows "0", "15", "30", "60" at the edges/midpoints.
   - **Hint text** -- "You will receive a notification before each prayer time" (60% opacity).

### State

| State            | Type     | Purpose                                    |
| ---------------- | -------- | ------------------------------------------ |
| `reminderMinutes`| `number` | Currently selected minutes value           |
| `sliderIndex`    | `number` | Slider position (0-7)                      |

### User Interactions

- **Drag slider** -- `onValueChange` updates the display in real time (rounds to nearest step).
- **Release slider** -- `onSlidingComplete` persists the value to MMKV as `prayerReminderPref`.

### Persistence

- On mount, reads `prayerReminderPref` from MMKV (defaults to 5 minutes).
- On slider release, writes the selected minutes to `prayerReminderPref`.
- The actual rescheduling of notifications happens when the user returns to the home screen (via `refreshAndReschedule()` in `useFocusEffect`).

<div align="center">

<img src="assets/images/icon.png" alt="Reminder app icon" width="120" />

# Reminder

**Prayer times for South Africa, on your phone.**

Reminder shows daily salah times for your area, tells you which way the Qibla is, and lets you know before each prayer comes in — so you never have to guess or go looking.

<img src="docs/demo.gif" alt="Reminder app walkthrough" width="260" />

</div>

Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev). Android and iOS.

## Screenshots

<p align="center">
  <img src="docs/screenshots/home.jpg" alt="Daily prayer times with the next prayer highlighted" width="160" />
  <img src="docs/screenshots/islamic-day-info.jpg" alt="Information about a significant Islamic day" width="160" />
  <img src="docs/screenshots/calendar.jpg" alt="Calendar date picker" width="160" />
  <img src="docs/screenshots/area-picker.jpg" alt="Area picker with search" width="160" />
  <img src="docs/screenshots/qibla.jpg" alt="Qibla compass" width="160" />
</p>

## What you can do

- **See today's prayer times** — Pick your area once; the app remembers it. Times are shown for the whole day at a glance.
- **Look ahead or back** — Swipe between days or jump to any date with the calendar picker. The Islamic (Hijri) date is shown alongside the Gregorian one.
- **Get reminded** — Turn on notifications and choose how many minutes before each prayer you want to be alerted.
- **Choose which prayers to be reminded about** — Hide the ones you don't need; the rest stay on.
- **Find the Qibla** — A live compass points toward the Kaaba using your location.
- **Learn about special days** — Significant Islamic days, like the White Days, Day of Arafah and Laylatul Qadr, come with a short explanation when they come up.
- **Make it yours** — Three themes with matching wallpapers: Light Mosque, Dark Mosque, and Serene Night.

Reminders keep working in the background: the app refreshes tomorrow's schedule daily, so alerts stay accurate without you opening it.

## Getting the app

Reminder is currently in testing on Google Play. A public release is coming soon.

## Where the times come from

Prayer times are sourced from [masjids.co.za](https://masjids.co.za/salaahtimes) and served through a Supabase backend. Once fetched, a month's times are cached on your device, so the app works offline for days you've already viewed.

## Permissions

| Permission    | Why it's needed                                    |
| ------------- | -------------------------------------------------- |
| Notifications | To alert you before each prayer                    |
| Location      | To work out the Qibla direction from where you are |
| Exact alarms  | So reminders fire at the right minute (Android)    |

Your area choice, settings, and cached times stay on your device. Location is used only to calculate the Qibla and is never stored or sent anywhere.

## For developers

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- Android Studio (Android) or Xcode (iOS)
- A `.env` with Supabase credentials

### Setup

```bash
npm install
npx expo start          # Start the dev server
npx expo run:android    # Run on Android
npx expo run:ios        # Run on iOS
npm run lint            # ESLint
npm test                # Jest (jest-expo)
```

### Project layout

```
app/                    # File-based routes (Expo Router)
  (tabs)/               # Home, Qibla
  areas.tsx             # Area selector
  settings/             # Notifications, appearance, preferences, about

src/
  components/           # Reusable UI
  hooks/                # Data fetching, notifications, Qibla, theming
  services/             # Supabase client, notification scheduling
  stores/               # MMKV-backed persistence, one module per domain
  backgroundTasks/      # Daily reminder scheduling task
  theme/                # Presets, colors, component overrides
```

See [CLAUDE.md](CLAUDE.md) for architecture notes and code conventions.

### Tech stack

| Category      | Library                                  |
| ------------- | ---------------------------------------- |
| Framework     | Expo SDK 54, React Native 0.81           |
| Routing       | Expo Router (file-based)                 |
| UI            | @rneui/themed (React Native Elements)    |
| Storage       | react-native-mmkv                        |
| Notifications | expo-notifications, expo-background-task |
| Backend       | Supabase                                 |

### Build and release

Builds run on [EAS Build](https://docs.expo.dev/build/introduction/), driven by workflows in `.github/workflows/`: production Android (AAB) and iOS builds, preview and dev builds, OTA updates via `eas update`, a submit job that uploads the latest Android build to the Google Play internal testing track, and a release job that tags the version and creates a GitHub release.

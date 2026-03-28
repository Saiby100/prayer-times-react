# Reminder - Prayer Times App

A mobile app that displays Islamic prayer (salah) times for areas in South Africa. Data is sourced from [masjids.co.za](https://masjids.co.za/salaahtimes) and presented with date navigation, Hijri calendar info, and configurable prayer reminders.

Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev).

## Features

- **Prayer times by area** - Select your area and view daily prayer times scraped from masjids.co.za
- **Date navigation** - Browse prayer times for any day with a calendar picker or swipe between dates
- **Hijri calendar** - Displays the current Islamic date alongside the Gregorian date
- **Prayer reminders** - Schedule notifications before each prayer, with configurable lead time
- **Background scheduling** - A daily background task keeps reminders up to date automatically
- **Dark mode** - Light and dark themes that follow system preference or manual selection
- **Custom backgrounds** - Choose from a selection of background images
- **Auto-updates** - Checks GitHub releases for new versions and prompts to update (Android)
- **Share** - Share the app with others via the system share dialog

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Android Studio (for Android development) or Xcode (for iOS development)

### Installation

```bash
npm install
```

### Running the App

```bash
npx expo start          # Start the dev server
npx expo run:android    # Run on Android
npx expo run:ios        # Run on iOS
npx expo start --web    # Run on web
```

### Linting and Testing

```bash
npm run lint            # Run ESLint
npm test                # Run tests with jest-expo
```

## Project Structure

```
app/                    # File-based routes (Expo Router)
  _layout.tsx           # Root layout with theme provider
  index.tsx             # Splash screen, redirects to /areas or /home
  areas.tsx             # Area selector
  home.tsx              # Main prayer times view
  settings.tsx          # Notification and theme preferences

src/
  components/           # Reusable UI components
  hooks/                # Custom React hooks (data fetching, notifications, etc.)
  services/             # Notification scheduling, GitHub API
  backgroundTasks/      # Background task definitions
  theme/                # Light/dark color schemes and component overrides
  utils/                # API client, storage, date helpers
  config/               # Hijri date configuration
```

## Tech Stack

| Category      | Library                                  |
| ------------- | ---------------------------------------- |
| Framework     | Expo SDK 52, React Native 0.76           |
| Routing       | Expo Router (file-based)                 |
| UI            | @rneui/themed (React Native Elements)    |
| Storage       | react-native-mmkv                        |
| Notifications | expo-notifications, expo-background-task |
| Data source   | react-native-cheerio (HTML scraping)     |
| Backend       | Supabase                                 |

## Build and Deploy

Builds are managed with [EAS Build](https://docs.expo.dev/build/introduction/). CI workflows in `.github/workflows/` handle:

- **Production build** - Triggers on push to `main`
- **Preview / Dev builds** - Triggered manually
- **OTA updates** - Published via `eas update`
- **GitHub releases** - Downloads the APK from EAS and creates a tagged release

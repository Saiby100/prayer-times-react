import { ExpoConfig, ConfigContext } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getAppName = () => {
  if (IS_DEV) return 'Reminder (Dev)';
  // if (IS_PREVIEW) return 'Reminder (Preview)';
  return 'Reminder';
};

const getBundleId = () => {
  if (IS_DEV) return 'com.salasaiet.reminder.dev';
  if (IS_PREVIEW) return 'com.salasaiet.reminder.preview';
  return 'com.salasaiet.reminder';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'reminder',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/myicon.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: getBundleId(),
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#ffffff',
        image: './assets/images/splash-light.png',
        dark: {
          image: './assets/images/splash-dark.png',
          backgroundColor: '#232634',
        },
      },
    ],
    'expo-background-task',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '4f89f60c-f7fa-4e13-97c3-bb74260287e8',
    },
  },
  android: {
    package: getBundleId(),
  },
  owner: 'salasaiet',
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/4f89f60c-f7fa-4e13-97c3-bb74260287e8',
  },
});

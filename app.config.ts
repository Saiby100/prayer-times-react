import { ExpoConfig, ConfigContext } from 'expo/config';
import { execSync } from 'child_process';
import packageJson from './package.json';

const appVersion = packageJson.version;

// Derive Android versionCode from semver: 1.2.3 → 10203
const getVersionCode = (version: string): number => {
  const [major, minor, patch] = version.split('.').map(Number);
  return major * 10000 + minor * 100 + patch;
};

let commitHash = 'unknown';
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  // EAS build environment may not have .git directory
}

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getAppName = () => {
  if (IS_DEV) return 'Reminder (Dev)';
  if (IS_PREVIEW) return 'Reminder (Preview)';
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
  version: appVersion,
  orientation: 'portrait',
  icon: './assets/images/icon.png',
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
        backgroundColor: '#F7F5F0',
        image: './assets/images/splash-light.png',
        dark: {
          image: './assets/images/splash-dark.png',
          backgroundColor: '#0B1026',
        },
      },
    ],
    'expo-background-task',
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#0D7C5F',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    commitHash,
    router: {
      origin: false,
    },
    eas: {
      projectId: '4f89f60c-f7fa-4e13-97c3-bb74260287e8',
    },
  },
  android: {
    package: getBundleId(),
    versionCode: getVersionCode(appVersion),
    permissions: ['SCHEDULE_EXACT_ALARM'],
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#08182f',
    },
  },
  owner: 'salasaiet',
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/4f89f60c-f7fa-4e13-97c3-bb74260287e8',
  },
});

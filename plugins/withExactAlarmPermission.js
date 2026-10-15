const { withAndroidManifest } = require('expo/config-plugins');

// Exact alarms keep prayer reminders on time. USE_EXACT_ALARM is granted at install on
// Android 13+ (API 33); SCHEDULE_EXACT_ALARM covers Android 12/12L, where it is granted by
// default. SCHEDULE_EXACT_ALARM is capped at API 32 so it isn't declared alongside
// USE_EXACT_ALARM, which would pull the app into an extra Play permission review.
const PERMISSIONS = [
  { name: 'android.permission.USE_EXACT_ALARM' },
  { name: 'android.permission.SCHEDULE_EXACT_ALARM', maxSdkVersion: '32' },
];

const withExactAlarmPermission = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const usesPermissions = manifest['uses-permission'] ?? [];

    for (const { name, maxSdkVersion } of PERMISSIONS) {
      const exists = usesPermissions.some((p) => p.$['android:name'] === name);
      if (exists) continue;

      usesPermissions.push({
        $: {
          'android:name': name,
          ...(maxSdkVersion && { 'android:maxSdkVersion': maxSdkVersion }),
        },
      });
    }

    manifest['uses-permission'] = usesPermissions;
    return config;
  });
};

module.exports = withExactAlarmPermission;

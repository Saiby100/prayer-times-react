const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withAlarmSound = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const rawDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'raw'
      );

      fs.mkdirSync(rawDir, { recursive: true });

      const src = path.join(projectRoot, 'assets', 'sounds', 'alarm.wav');
      const dest = path.join(rawDir, 'alarm.wav');

      fs.copyFileSync(src, dest);

      return config;
    },
  ]);
};

module.exports = withAlarmSound;

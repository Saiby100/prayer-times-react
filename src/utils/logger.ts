import { logger, transportFunctionType } from 'react-native-logs';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/utils/supabase';
import { getDeviceId } from '@/utils/deviceId';

const LEVEL_NAMES = ['debug', 'info', 'warn', 'error'] as const;

function parseTransportProps(props: Parameters<transportFunctionType<object>>[0]) {
  const { msg, level } = props;
  const messages = props.rawMsg as unknown[];
  const levelName = LEVEL_NAMES[level.severity] ?? 'info';
  const data = messages.length > 1 ? messages[1] : undefined;

  return { message: msg, levelName, data };
}

const supabaseTransport: transportFunctionType<object> = (props) => {
  const { message, levelName, data } = parseTransportProps(props);

  if (levelName === 'debug') return;

  supabase
    .from('logs')
    .insert({
      level: levelName,
      message,
      data: data ?? null,
      device_id: getDeviceId(),
      device_metadata: {
        os: Platform.OS,
        os_version: Platform.Version,
      },
      app_version: Constants.expoConfig?.version ?? null,
    })
    .then(({ error }) => {
      if (error) console.warn('Failed to send log to Supabase:', error.message);
    });
};

const consoleTransport: transportFunctionType<object> = (props) => {
  const { message, levelName, data } = parseTransportProps(props);
  const consoleFn =
    levelName === 'error' ? console.error : levelName === 'warn' ? console.warn : console.log;
  consoleFn(`[${levelName.toUpperCase()}] ${message}`, data ?? '');
};

const log = logger.createLogger({
  severity: 'debug',
  transport: [consoleTransport, supabaseTransport],
  transportOptions: {},
});

export default log;

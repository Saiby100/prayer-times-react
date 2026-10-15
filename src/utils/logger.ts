import { logger, transportFunctionType } from 'react-native-logs';
import { consoleTransport } from 'react-native-logs/src/transports/consoleTransport';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/utils/supabase';
import { getDeviceId } from '@/utils/deviceId';

/** The action being carried out when the log was written, as a kebab-case slug. */
export type LogType =
  | 'init-app'
  | 'create-storage'
  | 'load-prayer-times'
  | 'fetch-areas'
  | 'fetch-prayer-times'
  | 'fetch-hijri-adjustment'
  | 'request-notification-permission'
  | 'show-reminder-prompt'
  | 'sync-reminders'
  | 'run-reminder-task'
  | 'register-task'
  | 'unregister-task';

type LogData = {
  /** Action being carried out when the log was written. */
  type: LogType;
  /** Arbitrary additional data attached to the log. */
  [key: string]: unknown;
};

const LEVEL_NAMES = ['debug', 'info', 'warn', 'error'] as const;

function parseTransportProps(props: Parameters<transportFunctionType<object>>[0]) {
  const { msg, level } = props;
  const messages = props.rawMsg as unknown[];
  const levelName = LEVEL_NAMES[level.severity] ?? 'info';
  const rawData = messages.length > 1 ? (messages[1] as LogData | undefined) : undefined;
  const type = rawData?.type;
  const { type: _, ...data } = rawData ?? {};

  return { message: msg, levelName, type, data: Object.keys(data).length > 0 ? data : undefined };
}

const supabaseTransport: transportFunctionType<object> = (props) => {
  const { message, levelName, type, data } = parseTransportProps(props);

  // Only warnings and errors are sent, to keep the logs table small.
  if ((levelName !== 'warn' && levelName !== 'error') || !supabase) return;

  supabase
    .from('logs')
    .insert({
      level: levelName,
      type: type ?? null,
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

const isDev = __DEV__;

const log = logger.createLogger({
  severity: 'debug',
  transport: isDev ? [consoleTransport] : [consoleTransport, supabaseTransport],
  transportOptions: {
    colors: {
      debug: 'blue',
      info: 'white',
      warn: 'yellow',
      error: 'red',
    },
  },
});

export default log;

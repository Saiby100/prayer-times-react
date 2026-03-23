import { logger, transportFunctionType } from 'react-native-logs';
import { consoleTransport } from 'react-native-logs/src/transports/consoleTransport';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/utils/supabase';
import { getDeviceId } from '@/utils/deviceId';

export type LogType = 'api' | 'notification' | 'background-task' | 'storage' | 'update' | 'app';

type LogData = {
  type: LogType;
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

  if (levelName === 'debug') return;

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

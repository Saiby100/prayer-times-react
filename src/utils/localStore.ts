import { MMKV, Mode } from 'react-native-mmkv';
import log from '@/utils/logger';

const storage: Record<string, MMKV> = {};

function getStorage(id: string = 'default') {
  if (!storage[id]) {
    log.debug('localStore: creating storage instance', { type: 'storage', id });
    storage[id] = new MMKV({ id, mode: Mode.MULTI_PROCESS, readOnly: false });
  }
  return storage[id];
}

export default getStorage;

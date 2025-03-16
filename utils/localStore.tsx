import { MMKV, Mode } from 'react-native-mmkv';

const storage: Record<string, MMKV> = {};

function getStorage(id: string = 'default') {
  console.log(`Getting storage for id: ${id}.`);
  if (!storage[id]) {
    storage[id] = new MMKV({ id, mode: Mode.MULTI_PROCESS, readOnly: false });
  }
  return storage[id];
}

export default getStorage;

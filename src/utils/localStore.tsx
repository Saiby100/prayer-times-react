import { MMKV, Mode } from 'react-native-mmkv';

const storage: Record<string, MMKV> = {};

function getStorage(id: string = 'default') {
  if (!storage[id]) {
    console.log(`Creating storage instance with id: ${id}`);
    storage[id] = new MMKV({ id, mode: Mode.MULTI_PROCESS, readOnly: false });
  }
  return storage[id];
}

export default getStorage;

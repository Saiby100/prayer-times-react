import { useCallback, useSyncExternalStore } from 'react';
import { ImageSourcePropType } from 'react-native';
import getStorage from '@/utils/localStore';
import { getBackgroundById } from '@/theme/backgrounds';

const STORAGE_KEY = 'backgroundImage';
const storage = getStorage();

let listeners: (() => void)[] = [];

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): string {
  return storage.getString(STORAGE_KEY) ?? 'none';
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

type UseBackgroundImage = {
  /** Currently selected background option ID. */
  backgroundId: string;
  /** Update the selected background option. */
  setBackgroundId: (id: string) => void;
  /** Resolved image source for the selected background, or null for 'none'. */
  backgroundSource: ImageSourcePropType | null;
};

export default function useBackgroundImage(): UseBackgroundImage {
  const backgroundId = useSyncExternalStore(subscribe, getSnapshot);

  const setBackgroundId = useCallback((id: string) => {
    storage.set(STORAGE_KEY, id);
    emitChange();
  }, []);

  const option = getBackgroundById(backgroundId);
  const backgroundSource = option?.source ?? null;

  return { backgroundId, setBackgroundId, backgroundSource };
}

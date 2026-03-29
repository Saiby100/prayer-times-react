import { useCallback, useSyncExternalStore } from 'react';
import { ImageSourcePropType } from 'react-native';
import { subscribeBackground, getBackgroundId, setBackgroundId } from '@/stores';
import { getBackgroundById } from '@/theme/backgrounds';

type UseBackgroundImage = {
  /** Currently selected background option ID. */
  backgroundId: string;
  /** Update the selected background option. */
  setBackgroundId: (id: string) => void;
  /** Resolved image source for the selected background, or null for 'none'. */
  backgroundSource: ImageSourcePropType | null;
};

export default function useBackgroundImage(): UseBackgroundImage {
  const backgroundId = useSyncExternalStore(subscribeBackground, getBackgroundId);

  const updateBackgroundId = useCallback((id: string) => {
    setBackgroundId(id);
  }, []);

  const option = getBackgroundById(backgroundId);
  const backgroundSource = option?.source ?? null;

  return { backgroundId, setBackgroundId: updateBackgroundId, backgroundSource };
}

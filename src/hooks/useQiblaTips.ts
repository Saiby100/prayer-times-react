import { useCallback, useState } from 'react';
import { hasSeenQiblaTips, setQiblaTipsSeen } from '@/stores';

/** Controls the Qibla tips popup, which opens automatically until first dismissed. */
export default function useQiblaTips() {
  const [visible, setVisible] = useState(() => !hasSeenQiblaTips());

  const open = useCallback(() => setVisible(true), []);

  const close = useCallback(() => {
    setVisible(false);
    setQiblaTipsSeen();
  }, []);

  return { visible, open, close };
}

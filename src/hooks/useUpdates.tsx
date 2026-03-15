import { useState, useCallback } from 'react';
import * as Updates from 'expo-updates';

export type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'up-to-date' | 'error';

export default function useUpdates() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');

  const checkForUpdates = useCallback(async () => {
    if (!Updates.channel) return;

    setUpdateStatus('checking');
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setUpdateStatus('downloading');
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } else {
        setUpdateStatus('up-to-date');
        setTimeout(() => setUpdateStatus('idle'), 3000);
      }
    } catch {
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    }
  }, []);

  return { updateStatus, checkForUpdates };
}

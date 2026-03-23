import { useState, useCallback } from 'react';
import * as Updates from 'expo-updates';
import log from '@/utils/logger';

export type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'up-to-date' | 'error';

export default function useUpdates() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');

  const checkForUpdates = useCallback(async () => {
    if (!Updates.channel) return;

    log.info('useUpdates: checking for updates', { type: 'update' });
    setUpdateStatus('checking');
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        log.info('useUpdates: update available, downloading', { type: 'update' });
        setUpdateStatus('downloading');
        await Updates.fetchUpdateAsync();
        log.info('useUpdates: update downloaded, reloading', { type: 'update' });
        await Updates.reloadAsync();
      } else {
        log.info('useUpdates: already up to date', { type: 'update' });
        setUpdateStatus('up-to-date');
        setTimeout(() => setUpdateStatus('idle'), 3000);
      }
    } catch (e) {
      log.error('useUpdates: update check failed', { type: 'update', error: String(e) });
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    }
  }, []);

  return { updateStatus, checkForUpdates };
}

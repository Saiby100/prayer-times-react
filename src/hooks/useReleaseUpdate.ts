import { useEffect, useState, useCallback, useRef } from 'react';
import { Linking } from 'react-native';
import Constants from 'expo-constants';
import log from '@/utils/logger';
import {
  fetchLatestRelease,
  isNewerVersion,
  shouldCheckForRelease,
  markReleaseChecked,
  getDismissedVersion,
  setDismissedVersion,
} from '@/services/github/releaseChecker';

export type ReleaseCheckStatus = 'idle' | 'checking' | 'up-to-date' | 'update-available' | 'error';

export default function useReleaseUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [apkDownloadUrl, setApkDownloadUrl] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [checkStatus, setCheckStatus] = useState<ReleaseCheckStatus>('idle');
  const isChecking = useRef(false);

  const checkForUpdate = useCallback(
    async (options?: { skipThrottle?: boolean; skipDismissed?: boolean }) => {
      if (__DEV__ || isChecking.current) return;
      isChecking.current = true;

      const currentVersion = Constants.expoConfig?.version;
      if (!currentVersion) {
        isChecking.current = false;
        return;
      }

      log.info('useReleaseUpdate: checking GitHub releases', { type: 'update' });
      setCheckStatus('checking');

      const release = await fetchLatestRelease();
      markReleaseChecked();

      if (!release) {
        setCheckStatus('error');
        setTimeout(() => setCheckStatus('idle'), 3000);
        isChecking.current = false;
        return;
      }

      const version = release.tagName.replace(/^v/, '');

      if (isNewerVersion(release.tagName, currentVersion)) {
        if (!options?.skipDismissed) {
          const dismissed = getDismissedVersion();
          if (dismissed === version) {
            log.info('useReleaseUpdate: user dismissed this version', {
              type: 'update',
              version,
            });
            setCheckStatus('up-to-date');
            setTimeout(() => setCheckStatus('idle'), 3000);
            isChecking.current = false;
            return;
          }
        }

        log.info('useReleaseUpdate: new version available', {
          type: 'update',
          version,
          current: currentVersion,
        });
        setLatestVersion(version);
        setApkDownloadUrl(release.apkDownloadUrl);
        setUpdateAvailable(true);
        setCheckStatus('update-available');
      } else {
        log.info('useReleaseUpdate: app is up to date', { type: 'update' });
        setCheckStatus('up-to-date');
        setTimeout(() => setCheckStatus('idle'), 3000);
      }

      isChecking.current = false;
    },
    []
  );

  const downloadUpdate = useCallback(() => {
    if (!apkDownloadUrl) return;
    log.info('useReleaseUpdate: opening APK download URL', { type: 'update' });
    Linking.openURL(apkDownloadUrl);
  }, [apkDownloadUrl]);

  useEffect(() => {
    if (shouldCheckForRelease()) {
      checkForUpdate();
    }
  }, [checkForUpdate]);

  const dismiss = useCallback(() => {
    if (latestVersion) {
      setDismissedVersion(latestVersion);
    }
    setUpdateAvailable(false);
    setCheckStatus('idle');
  }, [latestVersion]);

  const loading = checkStatus === 'checking';

  return {
    updateAvailable,
    latestVersion,
    checkStatus,
    loading,
    checkForUpdate,
    downloadUpdate,
    dismiss,
  };
}

import { useEffect, useState, useCallback, useRef } from 'react';
import { Linking } from 'react-native';
import Constants from 'expo-constants';
import log from '@/utils/logger';
import {
  fetchLatestRelease,
  isNewerVersion,
  shouldCheckForRelease,
  markReleaseChecked,
  setDismissedVersion,
} from '@/services/github/releaseChecker';

export type ReleaseCheckStatus = 'idle' | 'checking' | 'up-to-date' | 'update-available' | 'error';

type UseReleaseUpdateOptions = {
  /** Whether to check for updates automatically on mount. */
  autoCheck?: boolean;
};

export default function useReleaseUpdate(options?: UseReleaseUpdateOptions) {
  const { autoCheck = false } = options ?? {};
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [apkDownloadUrl, setApkDownloadUrl] = useState<string | null>(null);
  const [releaseUrl, setReleaseUrl] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [checkStatus, setCheckStatus] = useState<ReleaseCheckStatus>('idle');
  const isChecking = useRef(false);

  const checkForUpdate = useCallback(async (): Promise<boolean> => {
    if (__DEV__ || isChecking.current) return false;
    isChecking.current = true;

    const currentVersion = Constants.expoConfig?.version;
    if (!currentVersion) {
      isChecking.current = false;
      return false;
    }

    log.info('useReleaseUpdate: checking GitHub releases', { type: 'update' });
    setCheckStatus('checking');

    const release = await fetchLatestRelease();
    markReleaseChecked();

    if (!release) {
      setCheckStatus('error');
      setTimeout(() => setCheckStatus('idle'), 3000);
      isChecking.current = false;
      return false;
    }

    const version = release.tagName.replace(/^v/, '');

    if (isNewerVersion(release.tagName, currentVersion)) {
      log.info('useReleaseUpdate: new version available', {
        type: 'update',
        version,
        current: currentVersion,
      });
      setLatestVersion(version);
      setApkDownloadUrl(release.apkDownloadUrl);
      setReleaseUrl(release.htmlUrl);
      setUpdateAvailable(true);
      setCheckStatus('update-available');
      isChecking.current = false;
      return true;
    } else {
      log.info('useReleaseUpdate: app is up to date', { type: 'update' });
      setCheckStatus('up-to-date');
      setTimeout(() => setCheckStatus('idle'), 3000);
    }

    isChecking.current = false;
    return false;
  }, []);

  // Production releases ship to Play as an AAB, so there is usually no APK
  // asset to link to. Fall back to the release page when one is absent.
  const downloadUpdate = useCallback(() => {
    const url = apkDownloadUrl ?? releaseUrl;
    if (!url) return;
    log.info('useReleaseUpdate: opening update URL', { type: 'update' });
    Linking.openURL(url);
  }, [apkDownloadUrl, releaseUrl]);

  useEffect(() => {
    if (autoCheck && shouldCheckForRelease()) {
      checkForUpdate();
    }
  }, [autoCheck, checkForUpdate]);

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

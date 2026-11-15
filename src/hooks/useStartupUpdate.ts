import { useEffect, useRef, useState } from 'react';
import * as Updates from 'expo-updates';
import {
  CHECK_TIMEOUT_MS,
  DOWNLOAD_TIMEOUT_MS,
  getStartupUpdatePhase,
  StartupUpdatePhase,
} from '@/utils/startupUpdate';
import log from '@/utils/logger';

/**
 * Waits on the splash screen for expo-updates' own launch check (it doesn't start another one)
 * and reloads onto a found update as soon as it has downloaded, instead of on the next cold start.
 * Gives up after `CHECK_TIMEOUT_MS` / `DOWNLOAD_TIMEOUT_MS`; expo-updates then still applies the
 * update on the next cold start, as it would without this.
 */
export function useStartupUpdate(): StartupUpdatePhase {
  const updates = Updates.useUpdates();
  const [checkTimedOut, setCheckTimedOut] = useState(false);
  const [downloadTimedOut, setDownloadTimedOut] = useState(false);
  const reloading = useRef(false);
  const hasCheckError = !!updates.checkError;
  const hasDownloadError = !!updates.downloadError;

  const wasReady = useRef(false);
  const currentPhase = getStartupUpdatePhase(
    {
      isEnabled: Updates.isEnabled,
      restartCount: updates.restartCount,
      isStartupProcedureRunning: updates.isStartupProcedureRunning,
      isChecking: updates.isChecking,
      isUpdateAvailable: updates.isUpdateAvailable,
      isDownloading: updates.isDownloading,
      isUpdatePending: updates.isUpdatePending,
      hasCheckError,
      hasDownloadError,
    },
    { checkTimedOut, downloadTimedOut }
  );
  // Once the app has started, a late download must not bring the updating screen back.
  if (currentPhase === 'ready') wasReady.current = true;
  const phase: StartupUpdatePhase = wasReady.current ? 'ready' : currentPhase;

  useEffect(() => {
    const timer = setTimeout(() => setCheckTimedOut(true), CHECK_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const isUpdating = phase === 'updating';
  useEffect(() => {
    if (!isUpdating) return;
    const timer = setTimeout(() => {
      setDownloadTimedOut(true);
      log.warn('startupUpdate: download timed out, starting on the current bundle', {
        type: 'apply-update',
      });
    }, DOWNLOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isUpdating]);

  const canReload = isUpdating;
  useEffect(() => {
    if (!updates.isUpdatePending || !canReload || reloading.current) return;
    reloading.current = true;
    Updates.reloadAsync().catch((error) => {
      log.warn('startupUpdate: failed to reload onto the update', {
        type: 'apply-update',
        error: String(error),
      });
    });
  }, [updates.isUpdatePending, canReload]);

  useEffect(() => {
    if (!hasCheckError) return;
    // Usually just offline, so not sent remotely.
    log.info('startupUpdate: update check failed', {
      type: 'apply-update',
      error: String(updates.checkError),
    });
  }, [hasCheckError, updates.checkError]);

  useEffect(() => {
    if (!hasDownloadError) return;
    log.warn('startupUpdate: update download failed', {
      type: 'apply-update',
      error: String(updates.downloadError),
    });
  }, [hasDownloadError, updates.downloadError]);

  return phase;
}

/** How long the splash screen waits for the launch update check before starting the app. */
export const CHECK_TIMEOUT_MS = 3000;

/** How long the "Updating…" screen waits for a found update to download before giving up. */
export const DOWNLOAD_TIMEOUT_MS = 20000;

/**
 * What the app shows while expo-updates' launch check runs:
 * `checking` keeps the splash, `updating` shows the "Updating…" screen, `ready` starts the app.
 */
export type StartupUpdatePhase = 'checking' | 'updating' | 'ready';

/** The parts of expo-updates' `useUpdates()` state the phase depends on. */
export type StartupUpdateState = {
  /** Whether expo-updates is on (false in dev builds and Expo Go). */
  isEnabled: boolean;
  /** Times the JS has been reloaded since the cold start. */
  restartCount: number;
  /** Whether the native launch procedure is still running. */
  isStartupProcedureRunning: boolean;
  /** Whether a check for an update is in progress. */
  isChecking: boolean;
  /** Whether a newer update (or rollback) was found. */
  isUpdateAvailable: boolean;
  /** Whether the found update is downloading. */
  isDownloading: boolean;
  /** Whether the found update has downloaded and is ready to run. */
  isUpdatePending: boolean;
  /** Whether the check failed (e.g. offline). */
  hasCheckError: boolean;
  /** Whether the download failed. */
  hasDownloadError: boolean;
};

/** Which waits have run out. */
export type StartupUpdateTimeouts = {
  /** The check took longer than `CHECK_TIMEOUT_MS`. */
  checkTimedOut: boolean;
  /** The download took longer than `DOWNLOAD_TIMEOUT_MS`. */
  downloadTimedOut: boolean;
};

export function getStartupUpdatePhase(
  state: StartupUpdateState,
  { checkTimedOut, downloadTimedOut }: StartupUpdateTimeouts
): StartupUpdatePhase {
  // Already running the newest JS after a reload, or updates are off.
  if (!state.isEnabled || state.restartCount > 0) return 'ready';
  // Downloaded: the app is about to reload onto it.
  if (state.isUpdatePending) return 'updating';
  if (state.hasDownloadError) return 'ready';
  if (state.isUpdateAvailable || state.isDownloading) {
    return downloadTimedOut ? 'ready' : 'updating';
  }
  if (state.hasCheckError) return 'ready';
  if (state.isChecking || state.isStartupProcedureRunning) {
    return checkTimedOut ? 'ready' : 'checking';
  }
  return 'ready';
}

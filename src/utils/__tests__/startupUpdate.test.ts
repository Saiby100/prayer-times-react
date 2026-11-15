import { getStartupUpdatePhase, StartupUpdateState } from '../startupUpdate';

const idle: StartupUpdateState = {
  isEnabled: true,
  restartCount: 0,
  isStartupProcedureRunning: false,
  isChecking: false,
  isUpdateAvailable: false,
  isDownloading: false,
  isUpdatePending: false,
  hasCheckError: false,
  hasDownloadError: false,
};

const noTimeouts = { checkTimedOut: false, downloadTimedOut: false };

describe('getStartupUpdatePhase', () => {
  it('is ready when updates are off', () => {
    expect(getStartupUpdatePhase({ ...idle, isEnabled: false, isChecking: true }, noTimeouts)).toBe(
      'ready'
    );
  });

  it('is ready after a reload', () => {
    expect(getStartupUpdatePhase({ ...idle, restartCount: 1, isChecking: true }, noTimeouts)).toBe(
      'ready'
    );
  });

  it('keeps the splash while checking', () => {
    expect(getStartupUpdatePhase({ ...idle, isChecking: true }, noTimeouts)).toBe('checking');
    expect(getStartupUpdatePhase({ ...idle, isStartupProcedureRunning: true }, noTimeouts)).toBe(
      'checking'
    );
  });

  it('starts the app when the check times out', () => {
    expect(
      getStartupUpdatePhase({ ...idle, isChecking: true }, { ...noTimeouts, checkTimedOut: true })
    ).toBe('ready');
  });

  it('starts the app when the check fails (offline)', () => {
    expect(
      getStartupUpdatePhase(
        { ...idle, isStartupProcedureRunning: true, hasCheckError: true },
        noTimeouts
      )
    ).toBe('ready');
  });

  it('starts the app when no update is found', () => {
    expect(getStartupUpdatePhase(idle, noTimeouts)).toBe('ready');
  });

  it('shows updating while a found update downloads', () => {
    expect(
      getStartupUpdatePhase(
        { ...idle, isUpdateAvailable: true, isDownloading: true },
        { ...noTimeouts, checkTimedOut: true }
      )
    ).toBe('updating');
  });

  it('starts the app when the download times out or fails', () => {
    const downloading = { ...idle, isUpdateAvailable: true, isDownloading: true };
    expect(getStartupUpdatePhase(downloading, { ...noTimeouts, downloadTimedOut: true })).toBe(
      'ready'
    );
    expect(
      getStartupUpdatePhase(
        { ...idle, isUpdateAvailable: true, hasDownloadError: true },
        noTimeouts
      )
    ).toBe('ready');
  });

  it('keeps showing updating once downloaded, while it reloads', () => {
    expect(
      getStartupUpdatePhase(
        { ...idle, isUpdateAvailable: true, isUpdatePending: true },
        { checkTimedOut: true, downloadTimedOut: true }
      )
    ).toBe('updating');
  });
});

import getStorage from '@/utils/localStore';

export function getLastReleaseCheck(): number | undefined {
  return getStorage().getNumber('lastReleaseCheck');
}

export function setLastReleaseCheck(timestamp: number): void {
  getStorage().set('lastReleaseCheck', timestamp);
}

export function getDismissedReleaseVersion(): string | undefined {
  return getStorage().getString('dismissedReleaseVersion');
}

export function setDismissedReleaseVersion(version: string): void {
  getStorage().set('dismissedReleaseVersion', version);
}

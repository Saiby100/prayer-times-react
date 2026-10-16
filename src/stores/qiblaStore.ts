import getStorage from '@/utils/localStore';

const TIPS_SEEN_KEY = 'qiblaTipsSeen';

export function hasSeenQiblaTips(): boolean {
  return getStorage().getBoolean(TIPS_SEEN_KEY) ?? false;
}

export function setQiblaTipsSeen(): void {
  getStorage().set(TIPS_SEEN_KEY, true);
}

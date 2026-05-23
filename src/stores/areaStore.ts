import getStorage from '@/utils/localStore';

const KEY = 'area';

export function getArea(): string | undefined {
  return getStorage().getString(KEY);
}

export function setArea(area: string): void {
  getStorage().set(KEY, area);
}

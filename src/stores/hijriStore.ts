import getStorage from '@/utils/localStore';

const ADJUSTMENT_KEY = 'hijriAdjustment';

export function getHijriAdjustment(): number {
  return getStorage().getNumber(ADJUSTMENT_KEY) ?? 0;
}

export function setHijriAdjustment(adjustment: number): void {
  getStorage().set(ADJUSTMENT_KEY, adjustment);
}

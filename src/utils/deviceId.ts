import getStorage from '@/utils/localStore';

const DEVICE_ID_KEY = 'device_id';

export function getDeviceId(): string {
  const storage = getStorage();
  const existing = storage.getString(DEVICE_ID_KEY);
  if (existing) return existing;

  const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

  storage.set(DEVICE_ID_KEY, id);
  return id;
}

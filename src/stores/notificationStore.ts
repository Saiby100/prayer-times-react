import getStorage from '@/utils/localStore';

type NotificationType = 'notification' | 'alarm';

// --- Reminders enabled ---

export function isRemindersEnabled(): boolean {
  return getStorage().getBoolean('remindersEnabled') ?? false;
}

export function setRemindersEnabled(enabled: boolean): void {
  getStorage().set('remindersEnabled', enabled);
}

// --- Reminder offset ---

export function getReminderOffset(): number {
  return getStorage().getNumber('prayerReminderPref') ?? 5;
}

export function setReminderOffset(minutes: number): void {
  getStorage().set('prayerReminderPref', minutes);
}

// --- Notification type ---

export function getNotificationType(): NotificationType {
  return (getStorage().getString('notificationType') as NotificationType) ?? 'notification';
}

export function setNotificationType(type: NotificationType): void {
  getStorage().set('notificationType', type);
}

// --- Disabled prayers ---

let disabledPrayerListeners: (() => void)[] = [];
let disabledPrayersSnapshot: string[] | null = null;

export function subscribeDisabledPrayers(listener: () => void) {
  disabledPrayerListeners = [...disabledPrayerListeners, listener];
  return () => {
    disabledPrayerListeners = disabledPrayerListeners.filter((l) => l !== listener);
  };
}

export function getDisabledPrayers(): string[] {
  if (!disabledPrayersSnapshot) {
    const raw = getStorage().getString('disabledPrayerReminders');
    disabledPrayersSnapshot = raw ? JSON.parse(raw) : [];
  }
  return disabledPrayersSnapshot;
}

export function setDisabledPrayers(prayers: string[]): void {
  getStorage().set('disabledPrayerReminders', JSON.stringify(prayers));
  disabledPrayersSnapshot = prayers;
  for (const listener of disabledPrayerListeners) {
    listener();
  }
}

// --- Notification permission ---

export function isNotificationPermissionDenied(): boolean {
  return getStorage().getBoolean('notificationPermissionDenied') || false;
}

export function setNotificationPermissionDenied(denied: boolean): void {
  getStorage().set('notificationPermissionDenied', denied);
}

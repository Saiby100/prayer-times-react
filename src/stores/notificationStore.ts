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

export function getDisabledPrayers(): string[] {
  const raw = getStorage().getString('disabledPrayerReminders');
  return raw ? JSON.parse(raw) : [];
}

export function setDisabledPrayers(prayers: string[]): void {
  getStorage().set('disabledPrayerReminders', JSON.stringify(prayers));
}

// --- Notification permission ---

export function isNotificationPermissionDenied(): boolean {
  return getStorage().getBoolean('notificationPermissionDenied') || false;
}

export function setNotificationPermissionDenied(denied: boolean): void {
  getStorage().set('notificationPermissionDenied', denied);
}

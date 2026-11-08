import getStorage from '@/utils/localStore';

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

// --- Reminder type ---

/** How prayer reminders are delivered: a notification, or an alarm that rings (Android only). */
export type ReminderType = 'notification' | 'alarm';

export function getReminderType(): ReminderType {
  return getStorage().getString('reminderType') === 'alarm' ? 'alarm' : 'notification';
}

export function setReminderType(type: ReminderType): void {
  getStorage().set('reminderType', type);
}

// --- Reminder prompt (one-time "Get prayer reminders?" popup on Home) ---

export function hasSeenReminderPrompt(): boolean {
  return getStorage().getBoolean('reminderPromptSeen') ?? false;
}

export function setReminderPromptSeen(): void {
  getStorage().set('reminderPromptSeen', true);
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
    disabledPrayersSnapshot = raw ? (JSON.parse(raw) as string[]) : [];
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

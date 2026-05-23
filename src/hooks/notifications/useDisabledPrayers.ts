import { useSyncExternalStore } from 'react';
import { subscribeDisabledPrayers, getDisabledPrayers, setDisabledPrayers } from '@/stores';
import { scheduleTodayNotifications } from '@/services/notifications/scheduleReminders';

function useDisabledPrayers() {
  const disabledPrayers = useSyncExternalStore(subscribeDisabledPrayers, getDisabledPrayers);

  const isPrayerDisabled = (name: string) => disabledPrayers.includes(name);

  const togglePrayer = (name: string) => {
    const updated = isPrayerDisabled(name)
      ? disabledPrayers.filter((p) => p !== name)
      : [...disabledPrayers, name];

    setDisabledPrayers(updated);
    scheduleTodayNotifications();
  };

  const resetAll = () => {
    setDisabledPrayers([]);
    scheduleTodayNotifications();
  };

  return { disabledPrayers, togglePrayer, isPrayerDisabled, resetAll };
}

export default useDisabledPrayers;

import { useState } from 'react';
import { getDisabledPrayers, setDisabledPrayers } from '@/stores';
import { scheduleTodayNotifications } from '@/services/notifications/scheduleReminders';

function useDisabledPrayers() {
  const [disabledPrayers, setLocalDisabledPrayers] = useState<string[]>(getDisabledPrayers);

  const isPrayerDisabled = (name: string) => disabledPrayers.includes(name);

  const togglePrayer = (name: string) => {
    const updated = isPrayerDisabled(name)
      ? disabledPrayers.filter((p) => p !== name)
      : [...disabledPrayers, name];

    setDisabledPrayers(updated);
    setLocalDisabledPrayers(updated);
    scheduleTodayNotifications();
  };

  return { disabledPrayers, togglePrayer, isPrayerDisabled };
}

export default useDisabledPrayers;

import { useSyncExternalStore } from 'react';
import { subscribeDisabledPrayers, getDisabledPrayers, setDisabledPrayers } from '@/stores';
import { syncPrayerReminders } from '@/services/notifications/scheduleReminders';
import { refreshWidgets } from '@/widgets/refreshWidgets';

function useDisabledPrayers() {
  const disabledPrayers = useSyncExternalStore(subscribeDisabledPrayers, getDisabledPrayers);

  const isPrayerDisabled = (name: string) => disabledPrayers.includes(name);

  const togglePrayer = (name: string) => {
    const updated = isPrayerDisabled(name)
      ? disabledPrayers.filter((p) => p !== name)
      : [...disabledPrayers, name];

    setDisabledPrayers(updated);
    syncPrayerReminders();
    refreshWidgets();
  };

  const resetAll = () => {
    setDisabledPrayers([]);
    syncPrayerReminders();
    refreshWidgets();
  };

  return { disabledPrayers, togglePrayer, isPrayerDisabled, resetAll };
}

export default useDisabledPrayers;

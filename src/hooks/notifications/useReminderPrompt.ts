import { useEffect, useState } from 'react';
import { getNotificationPermission } from '@/services/notifications/notification';
import { hasSeenReminderPrompt, isRemindersEnabled, setReminderPromptSeen } from '@/stores';
import usePrayerReminders from './usePrayerReminders';
import log from '@/utils/logger';

// One-time "Get prayer reminders?" prompt on Home. Any answer marks it seen for good.
function useReminderPrompt() {
  const { enable, reminderOffset } = usePrayerReminders();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasSeenReminderPrompt() || isRemindersEnabled()) return;

    let cancelled = false;
    (async () => {
      const { granted, canAskAgain } = await getNotificationPermission();
      // Blocked means the user already refused notifications, so don't ask again.
      if (!granted && !canAskAgain) {
        log.info('useReminderPrompt: skipped, permission blocked', {
          type: 'show-reminder-prompt',
        });
        setReminderPromptSeen();
        return;
      }
      if (!cancelled) setVisible(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function close() {
    setReminderPromptSeen();
    setVisible(false);
  }

  function turnOn() {
    close();
    enable();
  }

  return { visible, reminderOffset, turnOn, notNow: close };
}

export default useReminderPrompt;

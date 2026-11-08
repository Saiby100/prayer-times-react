import { schedulePushNotification } from './notification';
import { ensureChannelsExist } from './setup';

/**
 * Sends a preview of a prayer reminder notification 5 seconds from now, on the reminders'
 * channel. Its `data.type` isn't `prayer_reminder`, so a reminder sync never lists or cancels it.
 */
async function sendPreviewNotification() {
  await ensureChannelsExist();
  const date = new Date(Date.now() + 5000);

  await schedulePushNotification({
    title: 'Preview reminder',
    body: 'Prayer reminders will look like this.',
    data: { type: 'reminder_preview' },
    date,
    channelId: 'prayer_reminder',
  });
}

export { sendPreviewNotification };

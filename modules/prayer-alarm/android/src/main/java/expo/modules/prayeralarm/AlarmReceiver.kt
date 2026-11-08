package expo.modules.prayeralarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * The single "alarm fired" entry point, for prayer alarms, snoozes and the test alarm. Forgets the
 * alarm and starts [AlarmRingService]. Runs before the first unlock too (direct-boot aware).
 */
class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val id = intent.getStringExtra(EXTRA_ID) ?: return
    val alarm = AlarmScheduler(context).takeFired(id)
    if (alarm == null) {
      Log.w(AlarmScheduler.TAG, "Alarm fired but isn't saved: $id")
      return
    }
    AlarmNotification.ensureChannel(context)
    // Without a notification there's no Snooze or Dismiss to stop the tone, so don't ring.
    if (!AlarmNotification.canShow(context)) {
      Log.w(AlarmScheduler.TAG, "Not ringing $id: notifications or the alarm channel are off")
      return
    }
    Log.i(AlarmScheduler.TAG, "Alarm fired: $id (${alarm.prayer} at ${alarm.prayerTime})")
    try {
      AlarmRingService.start(context, alarm)
    } catch (e: Exception) {
      Log.w(AlarmScheduler.TAG, "Could not start ringing $id", e)
    }
  }

  companion object {
    const val EXTRA_ID = "id"
  }
}

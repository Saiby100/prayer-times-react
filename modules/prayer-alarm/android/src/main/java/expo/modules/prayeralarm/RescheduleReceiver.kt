package expo.modules.prayeralarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Registers the saved alarms again after a restart (`LOCKED_BOOT_COMPLETED` before the first
 * unlock, `BOOT_COMPLETED` after it) and after an app update (`MY_PACKAGE_REPLACED`), since
 * AlarmManager forgets them in both cases.
 */
class RescheduleReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    when (intent.action) {
      Intent.ACTION_LOCKED_BOOT_COMPLETED,
      Intent.ACTION_BOOT_COMPLETED,
      Intent.ACTION_MY_PACKAGE_REPLACED -> {
        Log.i(AlarmScheduler.TAG, "Restoring alarms after ${intent.action}")
        AlarmScheduler(context).restoreAll()
      }
    }
  }
}

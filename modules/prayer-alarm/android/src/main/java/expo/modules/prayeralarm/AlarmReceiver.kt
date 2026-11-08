package expo.modules.prayeralarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * The single "alarm fired" entry point. For now it only logs (check with
 * `adb logcat -s PrayerAlarm`); the ringing service replaces this later.
 */
class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val id = intent.getStringExtra(EXTRA_ID) ?: return
    val store = AlarmStore(context)
    val alarm = store.get(id)
    store.remove(listOf(id))
    Log.i(AlarmScheduler.TAG, "Alarm fired: $id (${alarm?.prayer} at ${alarm?.prayerTime})")
  }

  companion object {
    const val EXTRA_ID = "id"
  }
}

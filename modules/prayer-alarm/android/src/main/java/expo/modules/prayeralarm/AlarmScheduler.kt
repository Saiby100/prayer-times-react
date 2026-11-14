package expo.modules.prayeralarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Thrown when the system won't let the app schedule exact alarms. */
class ExactAlarmNotAllowedException : Exception("Exact alarms are not allowed for this app")

/**
 * Schedules prayer alarms with `AlarmManager.setAlarmClock()` (fires on time in Doze and shows
 * the system alarm icon) and keeps [AlarmStore] in step with what's registered. Snoozes and the
 * test alarm go through [OneOffAlarmStore] instead, so the JS sync doesn't see them.
 */
class AlarmScheduler(context: Context) {
  private val context = context.applicationContext
  private val alarmManager = this.context.getSystemService(AlarmManager::class.java)
  private val store = AlarmStore(this.context)
  private val oneOff = OneOffAlarmStore(this.context)

  /**
   * Registers the alarm, replacing any with the same id, then saves it. An alarm whose time has
   * passed isn't registered (AlarmManager would ring it at once) and replaces the old one by
   * cancelling it.
   */
  fun schedule(alarm: Alarm) {
    if (alarm.fireAt <= System.currentTimeMillis()) {
      Log.i(TAG, "Not scheduling ${alarm.id}: its time has passed")
      cancel(listOf(alarm.id))
      return
    }
    AlarmNotification.ensureChannel(context)
    register(alarm)
    store.put(alarm)
  }

  fun cancel(ids: List<String>) {
    ids.forEach(::unregister)
    store.remove(ids)
  }

  /**
   * Saved alarms that haven't fired yet, soonest first. Deletes nothing: an alarm that's due may
   * not have reached [AlarmReceiver] yet, which needs it saved to ring.
   */
  fun list(): List<Alarm> {
    val now = System.currentTimeMillis()
    return store.all().filter { it.fireAt > now }
  }

  /** Registers a snooze or the test alarm, replacing the one pending. */
  fun scheduleOneOff(alarm: Alarm) {
    AlarmNotification.ensureChannel(context)
    val oneOffAlarm = alarm.copy(id = OneOffAlarmStore.ID)
    register(oneOffAlarm)
    oneOff.put(oneOffAlarm)
  }

  /** Cancels the pending snooze or test alarm, if any. */
  fun cancelOneOff() {
    unregister(OneOffAlarmStore.ID)
    oneOff.clear()
  }

  /** Rings a test alarm [TEST_DELAY_MS] from now. Replaces a pending snooze. */
  fun scheduleTest() {
    val fireAt = System.currentTimeMillis() + TEST_DELAY_MS
    val time = SimpleDateFormat("HH:mm", Locale.US).format(Date(fireAt))
    scheduleOneOff(Alarm(OneOffAlarmStore.ID, fireAt, AlarmNotification.TEST_PRAYER, time, "", ""))
  }

  /** Returns the alarm that just fired and forgets it, or null if it's no longer saved. */
  fun takeFired(id: String): Alarm? {
    if (id == OneOffAlarmStore.ID) return oneOff.get().also { oneOff.clear() }
    return store.get(id).also { store.remove(listOf(id)) }
  }

  /**
   * Registers the saved alarms that haven't fired yet again. Used after a restart or app update,
   * and when the module loads, since a force-stop cancels every alarm the app set. Registering
   * an alarm that's already set just replaces it.
   *
   * Alarms whose time passed are missed (the app was force-stopped or the phone was off), so
   * they're dropped, not rung late. Normally [AlarmReceiver] forgets an alarm when it fires;
   * this is the only other cleanup, and it waits [STALE_AFTER_MS] past the alarm's time so it
   * can't delete one that's due but hasn't reached the receiver yet.
   */
  fun restoreAll() {
    val now = System.currentTimeMillis()
    store.prune(now - STALE_AFTER_MS)
    val alarms = store.all().filter { it.fireAt > now }.toMutableList()
    oneOff.get()?.let {
      if (it.fireAt > now) alarms.add(it) else if (it.fireAt <= now - STALE_AFTER_MS) oneOff.clear()
    }
    for (alarm in alarms) {
      try {
        register(alarm)
      } catch (e: Exception) {
        Log.w(TAG, "Could not restore alarm ${alarm.id}", e)
      }
    }
    Log.i(TAG, "Restored ${alarms.size} alarm(s)")
  }

  /**
   * Runs [restoreAll] only when a force-stop has cancelled the alarms, so a normal app start
   * doesn't register every alarm again. A force-stop also deletes the app's PendingIntents, so
   * if the soonest saved alarm still has its PendingIntent, the alarms are intact.
   */
  fun restoreIfCancelled() {
    val now = System.currentTimeMillis()
    val soonest = store.all().firstOrNull { it.fireAt > now }
      ?: oneOff.get()?.takeIf { it.fireAt > now }
    if (soonest != null && firePendingIntent(soonest.id, PendingIntent.FLAG_NO_CREATE) != null) {
      return
    }
    restoreAll()
  }

  private fun register(alarm: Alarm) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
      throw ExactAlarmNotAllowedException()
    }
    val operation = firePendingIntent(alarm.id, PendingIntent.FLAG_UPDATE_CURRENT)!!
    val info = AlarmManager.AlarmClockInfo(alarm.fireAt, showPendingIntent())
    alarmManager.setAlarmClock(info, operation)
  }

  private fun unregister(id: String) {
    val operation = firePendingIntent(id, PendingIntent.FLAG_NO_CREATE) ?: return
    alarmManager.cancel(operation)
    operation.cancel()
  }

  // The data URI makes each id its own PendingIntent, so the same id replaces the earlier alarm.
  private fun firePendingIntent(id: String, flag: Int): PendingIntent? {
    val intent = Intent(context, AlarmReceiver::class.java)
      .setAction(ACTION_FIRE)
      .setData(Uri.Builder().scheme(URI_SCHEME).opaquePart(id).build())
      .putExtra(AlarmReceiver.EXTRA_ID, id)
    return PendingIntent.getBroadcast(context, 0, intent, flag or PendingIntent.FLAG_IMMUTABLE)
  }

  // Opens the app when the user taps the next alarm in quick settings or on the lock screen.
  private fun showPendingIntent(): PendingIntent? {
    val launch = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return null
    return PendingIntent.getActivity(
      context,
      0,
      launch,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  companion object {
    const val TAG = "PrayerAlarm"
    private const val ACTION_FIRE = "expo.modules.prayeralarm.FIRE"
    private const val URI_SCHEME = "prayeralarm"
    private const val TEST_DELAY_MS = 5_000L

    /** How long past its time a saved alarm is kept for [AlarmReceiver] before it's dropped. */
    private const val STALE_AFTER_MS = 60_000L
  }
}

package expo.modules.prayeralarm

import android.content.Context

/**
 * Holds the one alarm that isn't a scheduled prayer alarm: a snooze or the test alarm. Kept apart
 * from [AlarmStore] so the JS reminder sync never sees or cancels it, and holding at most one so
 * a new snooze or test replaces the old one (no queue). Device-protected, like [AlarmStore].
 */
class OneOffAlarmStore(context: Context) {
  private val prefs = context.applicationContext
    .createDeviceProtectedStorageContext()
    .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  fun get(): Alarm? = prefs.getString(KEY, null)?.let { Alarm.fromJson(it) }

  fun put(alarm: Alarm) {
    prefs.edit().putString(KEY, alarm.toJson()).commit()
  }

  fun clear() {
    prefs.edit().remove(KEY).commit()
  }

  companion object {
    /** Alarm id the one-off alarm is registered and saved under. */
    const val ID = "prayer_alarm_oneoff"
    private const val PREFS_NAME = "prayer_alarm_oneoff"
    private const val KEY = "alarm"
  }
}

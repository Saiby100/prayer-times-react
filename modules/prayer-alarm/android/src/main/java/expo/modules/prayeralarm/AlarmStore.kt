package expo.modules.prayeralarm

import android.content.Context
import org.json.JSONObject

/** A prayer alarm as saved on the device and passed to and from JS. */
data class Alarm(
  /** Alarm id, `prayer_reminder:YYYY-MM-DD:<prayer>`; scheduling the same id replaces it. */
  val id: String,
  /** Fire time in ms since the epoch. */
  val fireAt: Long,
  /** Prayer display name, e.g. "Fajr". */
  val prayer: String,
  /** Prayer time text, e.g. "05:12". */
  val prayerTime: String,
  /** Notification title. */
  val title: String,
  /** Notification body. */
  val body: String,
) {
  fun toJson(): String = JSONObject()
    .put("id", id)
    .put("fireAt", fireAt)
    .put("prayer", prayer)
    .put("prayerTime", prayerTime)
    .put("title", title)
    .put("body", body)
    .toString()

  fun toMap(): Map<String, Any> = mapOf(
    "id" to id,
    "fireAt" to fireAt.toDouble(),
    "prayer" to prayer,
    "prayerTime" to prayerTime,
    "title" to title,
    "body" to body,
  )

  companion object {
    fun fromJson(json: String): Alarm? = try {
      val o = JSONObject(json)
      Alarm(
        id = o.getString("id"),
        fireAt = o.getLong("fireAt"),
        prayer = o.getString("prayer"),
        prayerTime = o.getString("prayerTime"),
        title = o.getString("title"),
        body = o.getString("body"),
      )
    } catch (_: Exception) {
      null
    }
  }
}

/**
 * The module's own record of scheduled alarms, since AlarmManager can't list them and forgets
 * them on restart. Kept in device-protected storage so it can be read before the first unlock.
 */
class AlarmStore(context: Context) {
  private val prefs = context.applicationContext
    .createDeviceProtectedStorageContext()
    .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  fun put(alarm: Alarm) {
    prefs.edit().putString(alarm.id, alarm.toJson()).commit()
  }

  fun remove(ids: Collection<String>) {
    val editor = prefs.edit()
    ids.forEach { editor.remove(it) }
    editor.commit()
  }

  fun get(id: String): Alarm? = prefs.getString(id, null)?.let { Alarm.fromJson(it) }

  fun all(): List<Alarm> = prefs.all.values
    .mapNotNull { (it as? String)?.let(Alarm::fromJson) }
    .sortedBy { it.fireAt }

  /**
   * Drops alarms due at or before [before] (missed, e.g. while the phone was off) and unreadable
   * entries.
   */
  fun prune(before: Long) {
    val stale = prefs.all.filter { (_, value) ->
      val alarm = (value as? String)?.let(Alarm::fromJson)
      alarm == null || alarm.fireAt <= before
    }.keys
    if (stale.isNotEmpty()) remove(stale)
  }

  private companion object {
    const val PREFS_NAME = "prayer_alarms"
  }
}

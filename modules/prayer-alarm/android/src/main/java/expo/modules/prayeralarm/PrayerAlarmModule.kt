package expo.modules.prayeralarm

import android.content.Context
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

/** An alarm as JS passes it to `schedule`. */
class AlarmRecord : Record {
  /** Alarm id; scheduling the same id replaces the earlier alarm. */
  @Field val id: String = ""

  /** Fire time in ms since the epoch. */
  @Field val fireAt: Double = 0.0

  /** Prayer display name. */
  @Field val prayer: String = ""

  /** Prayer time text, e.g. "05:12". */
  @Field val prayerTime: String = ""

  /** Notification title. */
  @Field val title: String = ""

  /** Notification body. */
  @Field val body: String = ""

  fun toAlarm() = Alarm(id, fireAt.toLong(), prayer, prayerTime, title, body)
}

class PrayerAlarmModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val scheduler by lazy { AlarmScheduler(context) }

  override fun definition() = ModuleDefinition {
    Name("PrayerAlarm")

    // A force-stop cancels every alarm the app set while the saved list keeps them, so
    // register them again whenever the app (or its background task) starts.
    OnCreate {
      scheduler.restoreAll()
    }

    AsyncFunction("schedule") { alarm: AlarmRecord ->
      scheduler.schedule(alarm.toAlarm())
    }

    AsyncFunction("cancel") { ids: List<String> ->
      scheduler.cancel(ids)
    }

    AsyncFunction("list") {
      scheduler.list().map { it.toMap() }
    }
  }
}

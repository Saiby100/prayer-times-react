package expo.modules.prayeralarm

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
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

/** The app's current theme colours (`#RRGGBB`), for the ringing screen. */
class ThemeRecord : Record {
  /** Screen background. */
  @Field val background: String = ""

  /** Main text colour. */
  @Field val text: String = ""

  /** Accent colour. */
  @Field val primary: String = ""

  /** Card / input background colour. */
  @Field val bgLight: String = ""
}

class PrayerAlarmModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val scheduler by lazy { AlarmScheduler(context) }

  override fun definition() = ModuleDefinition {
    Name("PrayerAlarm")

    // A force-stop cancels every alarm the app set while the saved list keeps them, so
    // register them again when the app (or its background task) starts after one. A failure
    // here must not stop the module from loading.
    OnCreate {
      try {
        scheduler.restoreIfCancelled()
      } catch (e: Exception) {
        Log.w(AlarmScheduler.TAG, "Could not restore alarms on start", e)
      }
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

    // Rings a test alarm 5 seconds from now, replacing a pending snooze.
    AsyncFunction("test") {
      scheduler.scheduleTest()
    }

    // Saves the colours the ringing screen uses (device-protected, readable before unlock).
    AsyncFunction("setTheme") { theme: ThemeRecord ->
      AlarmTheme(context).save(theme.background, theme.text, theme.primary, theme.bgLight)
    }

    Function("canUseFullScreenIntent") {
      AlarmNotification.canUseFullScreenIntent(context)
    }

    // Android 14+: the app's "full-screen notifications" setting. Earlier versions always allow
    // it, so open the app's notification settings instead.
    AsyncFunction("openFullScreenIntentSettings") {
      val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, Uri.parse("package:${context.packageName}"))
      } else {
        Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
          .putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
      }
      context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
  }
}

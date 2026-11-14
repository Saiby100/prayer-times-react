package expo.modules.prayeralarm

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

/** The "Prayer alarms" channel and the heads-up notification shown while an alarm rings. */
object AlarmNotification {
  const val CHANNEL_ID = "prayer_alarm"
  const val NOTIFICATION_ID = 7301

  /** Prayer name the test alarm is saved with; its notification reads "Rings at" instead. */
  const val TEST_PRAYER = "Test alarm"

  private const val CHANNEL_NAME = "Prayer alarms"

  /**
   * Creates the channel if it's missing (does nothing if it exists, so user changes stay). It has
   * no sound or vibration of its own: [AlarmRingService] plays the tone and vibrates.
   */
  fun ensureChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = context.getSystemService(NotificationManager::class.java)
    if (manager.getNotificationChannel(CHANNEL_ID) != null) return
    val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_HIGH)
      .apply {
        description = "Prayer alarms that ring until you snooze or dismiss them"
        setSound(null, null)
        enableVibration(false)
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
      }
    manager.createNotificationChannel(channel)
  }

  /**
   * Whether the alarm's notification can be shown. If not, its Snooze and Dismiss can't be
   * reached, so the alarm shouldn't ring at all.
   */
  fun canShow(context: Context): Boolean {
    val manager = context.getSystemService(NotificationManager::class.java)
    if (!manager.areNotificationsEnabled()) return false
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return true
    val channel = manager.getNotificationChannel(CHANNEL_ID) ?: return true
    return channel.importance != NotificationManager.IMPORTANCE_NONE
  }

  /**
   * Whether the system lets the app show its ringing screen over the lock screen. Android 14+
   * can take this away (Play, or the user in settings); then alarms ring with the heads-up only.
   */
  fun canUseFullScreenIntent(context: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return true
    return context.getSystemService(NotificationManager::class.java).canUseFullScreenIntent()
  }

  /** The line under the prayer name: "Prayer at 05:12", or "Rings at 14:03" for the test alarm. */
  fun subtitle(alarm: Alarm): String =
    if (alarm.prayer == TEST_PRAYER) "Rings at ${alarm.prayerTime}" else "Prayer at ${alarm.prayerTime}"

  fun build(context: Context, alarm: Alarm): Notification {
    val dismiss = serviceIntent(context, AlarmRingService.ACTION_DISMISS)
    val screen = screenIntent(context)
    val builder = NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(smallIcon(context))
      .setContentTitle(alarm.prayer)
      .setContentText(subtitle(alarm))
      // Locked / screen off: opens the ringing screen. In use: Android shows the heads-up instead,
      // and tapping it opens the screen.
      .setFullScreenIntent(screen, true)
      .setContentIntent(screen)
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
      // Android 14+ lets users swipe away foreground service notifications; treat that as Dismiss
      // so the tone never keeps playing without its buttons.
      .setDeleteIntent(dismiss)
      .addAction(0, "Snooze 5 min", serviceIntent(context, AlarmRingService.ACTION_SNOOZE))
      .addAction(0, "Dismiss", dismiss)
    iconColor(context)?.let { builder.setColor(it) }
    return builder.build()
  }

  // The screen reads the ringing alarm from AlarmRingService, so the intent carries nothing.
  private fun screenIntent(context: Context): PendingIntent {
    val intent = Intent(context, AlarmActivity::class.java)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    return PendingIntent.getActivity(
      context,
      0,
      intent,
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )
  }

  private fun serviceIntent(context: Context, action: String): PendingIntent {
    val intent = Intent(context, AlarmRingService::class.java).setAction(action)
    return PendingIntent.getService(context, 0, intent, PendingIntent.FLAG_IMMUTABLE)
  }

  // The icon and colour the expo-notifications config plugin adds to the app's resources.
  private fun smallIcon(context: Context): Int {
    val id = context.resources.getIdentifier("notification_icon", "drawable", context.packageName)
    return if (id != 0) id else context.applicationInfo.icon
  }

  private fun iconColor(context: Context): Int? {
    val id = context.resources.getIdentifier("notification_icon_color", "color", context.packageName)
    return if (id != 0) ContextCompat.getColor(context, id) else null
  }
}

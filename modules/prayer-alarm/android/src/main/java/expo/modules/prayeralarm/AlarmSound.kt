package expo.modules.prayeralarm

import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log

/** What a ring does, from the ringer mode, Do Not Disturb and whether a call is going on. */
enum class RingMode {
  SOUND_AND_VIBRATION,
  VIBRATION,
  QUIET,
}

/** Decides how an alarm rings and plays the tone and vibration. */
object AlarmSound {
  val ALARM_ATTRIBUTES: AudioAttributes = AudioAttributes.Builder()
    .setUsage(AudioAttributes.USAGE_ALARM)
    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
    .build()

  private val VIBRATION_PATTERN = longArrayOf(0, 800, 800)

  /**
   * Follows the ringer: normal rings and vibrates, vibrate only vibrates, silent stays quiet.
   * Do Not Disturb and a phone or VoIP call (any audio mode but normal) also keep it quiet.
   */
  fun ringMode(context: Context): RingMode {
    if (inCall(context) || dndOn(context)) return RingMode.QUIET
    return when (context.getSystemService(AudioManager::class.java).ringerMode) {
      AudioManager.RINGER_MODE_NORMAL -> RingMode.SOUND_AND_VIBRATION
      AudioManager.RINGER_MODE_VIBRATE -> RingMode.VIBRATION
      else -> RingMode.QUIET
    }
  }

  /** Whether a call is going on (or ringing), so the alarm should go quiet. */
  fun inCall(context: Context): Boolean =
    context.getSystemService(AudioManager::class.java).mode != AudioManager.MODE_NORMAL

  /**
   * Plays the default alarm tone on a loop at alarm volume, falling back to the default
   * notification sound and then the ringtone. Null if none could be played.
   */
  fun play(context: Context): MediaPlayer? {
    val types = intArrayOf(
      RingtoneManager.TYPE_ALARM,
      RingtoneManager.TYPE_NOTIFICATION,
      RingtoneManager.TYPE_RINGTONE,
    )
    for (type in types) {
      // The settings URI (not the actual file) also plays before the first unlock, from
      // Android's cached copy of the default tone.
      val uri = RingtoneManager.getDefaultUri(type) ?: continue
      val player = MediaPlayer()
      try {
        player.setAudioAttributes(ALARM_ATTRIBUTES)
        player.setDataSource(context, uri)
        player.isLooping = true
        player.prepare()
        player.start()
        return player
      } catch (e: Exception) {
        Log.w(AlarmScheduler.TAG, "Could not play tone $uri", e)
        player.release()
      }
    }
    return null
  }

  /** Starts vibrating in a loop; returns the vibrator to cancel later. */
  fun vibrate(context: Context): Vibrator {
    val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      context.getSystemService(VibratorManager::class.java).defaultVibrator
    } else {
      @Suppress("DEPRECATION")
      context.getSystemService(Vibrator::class.java)
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      @Suppress("DEPRECATION")
      vibrator.vibrate(VibrationEffect.createWaveform(VIBRATION_PATTERN, 0), ALARM_ATTRIBUTES)
    } else {
      @Suppress("DEPRECATION")
      vibrator.vibrate(VIBRATION_PATTERN, 0, ALARM_ATTRIBUTES)
    }
    return vibrator
  }

  private fun dndOn(context: Context): Boolean {
    val filter = context.getSystemService(NotificationManager::class.java).currentInterruptionFilter
    return filter != NotificationManager.INTERRUPTION_FILTER_ALL &&
      filter != NotificationManager.INTERRUPTION_FILTER_UNKNOWN
  }
}

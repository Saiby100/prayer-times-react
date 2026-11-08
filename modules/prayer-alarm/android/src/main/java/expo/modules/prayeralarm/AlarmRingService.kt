package expo.modules.prayeralarm

import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.Vibrator
import android.util.Log
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat

/**
 * Foreground service that rings an alarm: the tone on a loop and vibration (as [AlarmSound]
 * decides), with the heads-up notification, until Snooze, Dismiss, or [AUTO_STOP_MS] passes.
 * A new ring replaces the current one and cancels a pending snooze. Stopping leaves nothing
 * behind (no "missed alarm" notification).
 */
class AlarmRingService : Service() {
  private val handler = Handler(Looper.getMainLooper())
  private val autoStop = Runnable {
    Log.i(AlarmScheduler.TAG, "Alarm stopped by itself after ${AUTO_STOP_MS / 60_000} min")
    stopRinging()
  }

  private var current: Alarm? = null
  private var player: MediaPlayer? = null
  private var vibrator: Vibrator? = null
  private var focusRequest: AudioFocusRequest? = null
  private var wakeLock: PowerManager.WakeLock? = null

  // A call starting mid-ring takes audio focus: go quiet for the rest of this ring.
  private val focusListener = AudioManager.OnAudioFocusChangeListener { change ->
    val lost = change == AudioManager.AUDIOFOCUS_LOSS || change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT
    if (lost && AlarmSound.inCall(this)) silence()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_RING -> {
        val alarm = intent.getStringExtra(EXTRA_ALARM)?.let(Alarm::fromJson)
        if (alarm != null) ring(alarm) else if (current == null) stopRinging()
      }
      ACTION_SNOOZE -> snooze()
      ACTION_SILENCE -> silence()
      ACTION_DISMISS -> stopRinging()
      else -> if (current == null) stopRinging()
    }
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    handler.removeCallbacks(autoStop)
    stopSound()
    releaseWakeLock()
    super.onDestroy()
  }

  private fun ring(alarm: Alarm) {
    stopSound()
    handler.removeCallbacks(autoStop)
    AlarmScheduler(this).cancelOneOff()
    current = alarm

    AlarmNotification.ensureChannel(this)
    val notification = AlarmNotification.build(this, alarm)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      ServiceCompat.startForeground(
        this,
        AlarmNotification.NOTIFICATION_ID,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_SYSTEM_EXEMPTED,
      )
    } else {
      startForeground(AlarmNotification.NOTIFICATION_ID, notification)
    }
    acquireWakeLock()

    val mode = AlarmSound.ringMode(this)
    Log.i(AlarmScheduler.TAG, "Ringing ${alarm.prayer} at ${alarm.prayerTime} ($mode)")
    if (mode == RingMode.SOUND_AND_VIBRATION) {
      requestFocus()
      player = AlarmSound.play(this)
    }
    if (mode != RingMode.QUIET) vibrator = AlarmSound.vibrate(this)
    handler.postDelayed(autoStop, AUTO_STOP_MS)
  }

  private fun snooze() {
    val alarm = current
    if (alarm != null) {
      try {
        AlarmScheduler(this).scheduleOneOff(alarm.copy(fireAt = System.currentTimeMillis() + SNOOZE_MS))
        Log.i(AlarmScheduler.TAG, "Snoozed ${alarm.prayer} for ${SNOOZE_MS / 60_000} min")
      } catch (e: Exception) {
        Log.w(AlarmScheduler.TAG, "Could not snooze ${alarm.prayer}", e)
      }
    }
    stopRinging()
  }

  /** Stops sound and vibration; the notification and auto-stop timer stay. */
  private fun silence() {
    stopSound()
  }

  private fun stopRinging() {
    handler.removeCallbacks(autoStop)
    stopSound()
    current = null
    ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
    releaseWakeLock()
    stopSelf()
  }

  private fun stopSound() {
    player?.run {
      try {
        stop()
      } catch (_: IllegalStateException) {
      }
      release()
    }
    player = null
    vibrator?.cancel()
    vibrator = null
    abandonFocus()
  }

  private fun requestFocus() {
    val audio = getSystemService(AudioManager::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
        .setAudioAttributes(AlarmSound.ALARM_ATTRIBUTES)
        .setOnAudioFocusChangeListener(focusListener, handler)
        .build()
      audio.requestAudioFocus(request)
      focusRequest = request
    } else {
      @Suppress("DEPRECATION")
      audio.requestAudioFocus(focusListener, AudioManager.STREAM_ALARM, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
    }
  }

  private fun abandonFocus() {
    val audio = getSystemService(AudioManager::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      focusRequest?.let { audio.abandonAudioFocusRequest(it) }
      focusRequest = null
    } else {
      @Suppress("DEPRECATION")
      audio.abandonAudioFocus(focusListener)
    }
  }

  // Keeps the CPU awake so the auto-stop timer runs on time with the screen off.
  private fun acquireWakeLock() {
    if (wakeLock?.isHeld == true) return
    wakeLock = getSystemService(PowerManager::class.java)
      .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "PrayerAlarm:ring")
      .apply { acquire(AUTO_STOP_MS + 10_000L) }
  }

  private fun releaseWakeLock() {
    wakeLock?.let { if (it.isHeld) it.release() }
    wakeLock = null
  }

  companion object {
    const val ACTION_RING = "expo.modules.prayeralarm.RING"
    const val ACTION_SNOOZE = "expo.modules.prayeralarm.SNOOZE"
    const val ACTION_DISMISS = "expo.modules.prayeralarm.DISMISS"

    /** Stops sound and vibration but keeps ringing silently (volume buttons on the screen). */
    const val ACTION_SILENCE = "expo.modules.prayeralarm.SILENCE"

    private const val EXTRA_ALARM = "alarm"
    private const val AUTO_STOP_MS = 10 * 60_000L
    private const val SNOOZE_MS = 5 * 60_000L

    /** Starts ringing [alarm], replacing any ring going on. */
    fun start(context: Context, alarm: Alarm) {
      val intent = Intent(context, AlarmRingService::class.java)
        .setAction(ACTION_RING)
        .putExtra(EXTRA_ALARM, alarm.toJson())
      ContextCompat.startForegroundService(context, intent)
    }
  }
}

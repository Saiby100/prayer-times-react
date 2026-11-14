package expo.modules.prayeralarm

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextClock
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.core.graphics.ColorUtils
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

/**
 * The ringing screen: current time, prayer, "Prayer at 05:12", Snooze 5 min and Dismiss, on the
 * app's theme colours ([AlarmTheme]). Shows over the lock screen (also before the first unlock)
 * from the notification's full-screen intent, or when the notification is tapped.
 *
 * It shows whatever [AlarmRingService.ringing] is and closes when ringing stops. Back / Home only
 * leave the screen; the alarm keeps ringing and tapping the notification brings it back. Volume
 * keys silence this ring.
 */
class AlarmActivity : Activity() {
  private lateinit var prayerView: TextView
  private lateinit var subtitleView: TextView

  private val ringChanged = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) = render()
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    showOverLockScreen()
    setContentView(buildContent(AlarmTheme(this).colors()))
    ContextCompat.registerReceiver(
      this,
      ringChanged,
      IntentFilter(AlarmRingService.ACTION_RING_CHANGED),
      ContextCompat.RECEIVER_NOT_EXPORTED,
    )
    render()
  }

  override fun onResume() {
    super.onResume()
    render()
  }

  override fun onDestroy() {
    unregisterReceiver(ringChanged)
    super.onDestroy()
  }

  // Either volume key silences this ring; the screen and notification stay.
  override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
    if (!isVolumeKey(keyCode)) return super.onKeyDown(keyCode, event)
    if (event.repeatCount == 0) AlarmRingService.send(this, AlarmRingService.ACTION_SILENCE)
    return true
  }

  // Swallowed so the volume doesn't change and the volume panel doesn't open.
  override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean =
    isVolumeKey(keyCode) || super.onKeyUp(keyCode, event)

  private fun isVolumeKey(keyCode: Int) =
    keyCode == KeyEvent.KEYCODE_VOLUME_UP ||
      keyCode == KeyEvent.KEYCODE_VOLUME_DOWN ||
      keyCode == KeyEvent.KEYCODE_VOLUME_MUTE

  /** Shows the ringing alarm, or closes when nothing rings (dismissed, snoozed, auto-stopped). */
  private fun render() {
    val alarm = AlarmRingService.ringing
    if (alarm == null) {
      finish()
      return
    }
    prayerView.text = alarm.prayer
    subtitleView.text = AlarmNotification.subtitle(alarm)
  }

  private fun act(action: String) {
    AlarmRingService.send(this, action)
    finish()
  }

  @Suppress("DEPRECATION")
  private fun showOverLockScreen() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON,
      )
    }
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
  }

  @Suppress("DEPRECATION")
  private fun buildContent(colors: AlarmColors): View {
    // Edge-to-edge, with status bar icons that read on the theme background.
    WindowCompat.setDecorFitsSystemWindows(window, false)
    window.statusBarColor = Color.TRANSPARENT
    window.navigationBarColor = Color.TRANSPARENT
    val lightBackground = ColorUtils.calculateLuminance(colors.background) > 0.5
    WindowInsetsControllerCompat(window, window.decorView).apply {
      isAppearanceLightStatusBars = lightBackground
      isAppearanceLightNavigationBars = lightBackground
    }

    val medium = font("Inter-Medium", Typeface.NORMAL)
    val semiBold = font("Inter-SemiBold", Typeface.BOLD)
    val mutedText = ColorUtils.setAlphaComponent(colors.text, 0xA6)

    val clock = TextClock(this).apply {
      // 24-hour like the app's prayer times, whatever the phone's setting.
      format12Hour = "HH:mm"
      format24Hour = "HH:mm"
      style(84f, colors.text, semiBold)
    }
    prayerView = TextView(this).apply { style(40f, colors.primary, semiBold) }
    subtitleView = TextView(this).apply { style(18f, mutedText, medium) }

    val snooze = button("Snooze 5 min", semiBold, text = colors.primary, fill = colors.bgLight, stroke = colors.primary) {
      act(AlarmRingService.ACTION_SNOOZE)
    }
    val dismiss = button("Dismiss", semiBold, text = colors.background, fill = colors.primary, stroke = null) {
      act(AlarmRingService.ACTION_DISMISS)
    }

    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setBackgroundColor(colors.background)
      addView(space(), LinearLayout.LayoutParams(0, 0, 2f))
      addView(clock, wrap())
      addView(prayerView, wrap(top = 48))
      addView(subtitleView, wrap(top = 8))
      addView(space(), LinearLayout.LayoutParams(0, 0, 3f))
      addView(snooze, buttonParams(top = 0))
      addView(dismiss, buttonParams(top = 16))
    }
    val basePadding = dp(40)
    ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
      val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
      view.setPadding(bars.left, bars.top, bars.right, bars.bottom + basePadding)
      insets
    }
    return root
  }

  private fun TextView.style(sizeSp: Float, color: Int, face: Typeface) {
    setTextSize(TypedValue.COMPLEX_UNIT_SP, sizeSp)
    setTextColor(color)
    typeface = face
    gravity = Gravity.CENTER
    includeFontPadding = false
  }

  private fun button(
    label: String,
    face: Typeface,
    text: Int,
    fill: Int,
    stroke: Int?,
    onClick: () -> Unit,
  ) = TextView(this).apply {
    this.text = label
    style(18f, text, face)
    val shape = GradientDrawable().apply {
      cornerRadius = dp(30).toFloat()
      setColor(fill)
      if (stroke != null) setStroke(dp(1.5f), stroke)
    }
    val ripple = ColorUtils.setAlphaComponent(text, 0x33)
    background = RippleDrawable(ColorStateList.valueOf(ripple), shape, null)
    isClickable = true
    isFocusable = true
    setOnClickListener { onClick() }
  }

  private fun buttonParams(top: Int) =
    LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(60)).apply {
      setMargins(dp(40), dp(top), dp(40), 0)
    }

  private fun wrap(top: Int = 0) =
    LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT)
      .apply { topMargin = dp(top) }

  private fun space() = View(this)

  // The Inter fonts expo-font copies into the app's assets/fonts.
  private fun font(name: String, fallbackStyle: Int): Typeface =
    try {
      Typeface.createFromAsset(assets, "fonts/$name.ttf")
    } catch (e: RuntimeException) {
      Log.w(AlarmScheduler.TAG, "Font $name not found; using the system font", e)
      Typeface.defaultFromStyle(fallbackStyle)
    }

  private fun dp(value: Int): Int = dp(value.toFloat())

  private fun dp(value: Float): Int =
    TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, value, resources.displayMetrics).toInt()
}

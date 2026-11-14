package expo.modules.prayeralarm

import android.content.Context
import android.graphics.Color

/** The theme colours the ringing screen uses, as Android colour ints. */
data class AlarmColors(
  /** Screen background. */
  val background: Int,
  /** Clock and secondary text. */
  val text: Int,
  /** Prayer name, Snooze outline and the Dismiss button. */
  val primary: Int,
  /** Snooze button fill. */
  val bgLight: Int,
)

/**
 * Keeps the app's current theme colours for [AlarmActivity]. JS sends them on every app open and
 * theme change, so there's no copy of the palettes here. Device-protected, so the ringing screen
 * can read them before the first unlock after a restart.
 */
class AlarmTheme(context: Context) {
  private val prefs = context.applicationContext
    .createDeviceProtectedStorageContext()
    .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  /** Saves the colours (`#RRGGBB` strings from JS). Throws if one doesn't parse. */
  fun save(background: String, text: String, primary: String, bgLight: String) {
    listOf(background, text, primary, bgLight).forEach { Color.parseColor(it) }
    prefs.edit()
      .putString(KEY_BACKGROUND, background)
      .putString(KEY_TEXT, text)
      .putString(KEY_PRIMARY, primary)
      .putString(KEY_BG_LIGHT, bgLight)
      .apply()
  }

  /** The saved colours, or Crescent Lagoon's if none are saved (or one doesn't parse). */
  fun colors(): AlarmColors = AlarmColors(
    background = read(KEY_BACKGROUND, "#061837"),
    text = read(KEY_TEXT, "#E8E6F0"),
    primary = read(KEY_PRIMARY, "#E3B464"),
    bgLight = read(KEY_BG_LIGHT, "#13254A"),
  )

  private fun read(key: String, fallback: String): Int =
    try {
      Color.parseColor(prefs.getString(key, null) ?: fallback)
    } catch (_: IllegalArgumentException) {
      Color.parseColor(fallback)
    }

  private companion object {
    const val PREFS_NAME = "prayer_alarm_theme"
    const val KEY_BACKGROUND = "background"
    const val KEY_TEXT = "text"
    const val KEY_PRIMARY = "primary"
    const val KEY_BG_LIGHT = "bgLight"
  }
}

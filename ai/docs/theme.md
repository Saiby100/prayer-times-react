# Theme

## Color Tokens

Defined in `app/_layout.tsx` via `createTheme()`. The `Colors` interface is extended with `text` and `bgLight`.

| Token | Light | Dark | Usage |
| ----- | ----- | ---- | ----- |
| `primary` | `#2089DC` (blue) | `#6E61FF` (purple) | Buttons, icons, slider, prayer time highlight border |
| `secondary` | `#2089DC` (blue) | `#6E61FF` (purple) | Skeleton loading bars |
| `text` | `#000000` (black) | `#ffffff` (white) | All text, header title, tick labels |
| `bgLight` | `#ffffff` (white) | `#3d3d3d` (dark gray) | Card backgrounds, header background, button backgrounds |
| `background` | `#ffffff` (white) | `#121212` (near black) | Screen background (SafeAreaView), StatusBar |

## Conditional Styling

- **Card shadows** are only applied in light mode (`mode === 'light' ? styles.shadow : {}`). Used in `home.tsx` and `settings.tsx`.
- **Slider track** maximum color is `#d3d3d3` in light mode, `#555555` in dark mode (hardcoded in `settings.tsx`).

## Persistence

- Stored in MMKV as `themeMode` with value `'light'` or `'dark'`.
- **Restore:** `index.tsx` reads `themeMode` on app launch and calls `setMode()`. Defaults to `'light'` if not set.
- **Toggle:** `home.tsx` header button toggles mode and writes to MMKV immediately.
- The `ThemeProvider` in `_layout.tsx` does not read from storage directly -- mode is set imperatively via the `useThemeMode` hook.

## Typography

Global text style defined in `src/utils/globalStyles.tsx`:
- Font: `Inter-Medium`
- Size: `18px`

Applied to all text via `globalStyles.text` spread into style arrays.

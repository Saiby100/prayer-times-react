import glyphMap from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Feather.json';

/** Font name of the Feather icon font bundled for widgets (`Feather.ttf`). */
export const FEATHER_FONT = 'Feather';

/** The character that draws Feather icon `name` in `FEATHER_FONT`; a clock for unknown names. */
export function featherGlyph(name: string): string {
  const map = glyphMap as Record<string, number>;
  return String.fromCodePoint(map[name] ?? map.clock);
}

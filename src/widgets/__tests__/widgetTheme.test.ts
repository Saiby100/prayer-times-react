import { crescentColors, mistyColors, sunsetColors } from '@/theme/colors';
import { getWidgetThemes } from '../widgetTheme';

describe('getWidgetThemes', () => {
  it('uses the picked theme in both modes', () => {
    expect(getWidgetThemes('sunset-medina')).toEqual({ light: sunsetColors, dark: null });
  });

  it('follows the phone with Misty Valley light and Crescent Lagoon dark when none is picked', () => {
    expect(getWidgetThemes(null)).toEqual({ light: mistyColors, dark: crescentColors });
  });
});

import { ImageSourcePropType } from 'react-native';

export type BackgroundOption = {
  /** Unique identifier for the background option. */
  id: 'none' | 'light-mosque' | 'dark-mosque';
  /** Display label shown in the picker. */
  label: string;
  /** Image source asset; omitted for the 'none' option. */
  source?: ImageSourcePropType;
};

export const backgroundOptions: BackgroundOption[] = [
  { id: 'none', label: 'None' },
  {
    id: 'light-mosque',
    label: 'Light Mosque',
    source: require('../../assets/images/backgrounds/light-mosque.png'),
  },
  {
    id: 'dark-mosque',
    label: 'Dark Mosque',
    source: require('../../assets/images/backgrounds/dark-mosque.png'),
  },
];

export function getBackgroundById(id: string): BackgroundOption | undefined {
  return backgroundOptions.find((opt) => opt.id === id);
}

import { ImageSourcePropType } from 'react-native';

export type BackgroundOption = {
  id: 'none' | 'light-mosque' | 'dark-mosque';
  label: string;
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

import React from 'react';
import { Icon, useTheme, IconProps } from '@rneui/themed';

type ThemedIconProps = IconProps & {
  name: string;
  type: string;
  color?: string;
};

const ThemedIcon: React.FC<ThemedIconProps> = ({ name, type, color, ...properties }) => {
  const { theme } = useTheme();

  return <Icon name={name} type={type} color={color || theme.colors.primary} {...properties} />;
};

export default ThemedIcon;

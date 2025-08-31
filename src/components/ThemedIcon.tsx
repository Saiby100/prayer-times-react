import React from 'react';

import { Icon, useTheme } from '@rneui/themed';

type IconProps = {
  name: string;
  type: string;
  color?: string;
};

const ThemedIcon: React.FC<IconProps> = ({ name, type, color }) => {
  const { theme } = useTheme();

  return <Icon name={name} type={type} color={color || theme.colors.primary} />;
};

export default ThemedIcon;

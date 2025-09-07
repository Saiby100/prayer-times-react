import React from 'react';

import { Button, useTheme, ButtonProps } from '@rneui/themed';
import globalStyles from '@/utils/globalStyles';
import ThemedIcon from './ThemedIcon';

type ThemedButtonProps = ButtonProps & {
  icon?: {
    name: string;
    type: string;
    size?: number;
  };
};

const ThemedButton: React.FC<ThemedButtonProps> = ({ title, color, icon, ...properties }) => {
  const { theme } = useTheme();

  return (
    <Button
      title={title}
      titleStyle={{
        ...globalStyles.text,
        color: theme.colors.text, // TODO: Move into global styles
      }}
      icon={icon && <ThemedIcon name={icon.name} type={icon.type} size={icon.size} />}
      color={color || theme.colors.bgLight}
      {...properties}
    />
  );
};

export default ThemedButton;

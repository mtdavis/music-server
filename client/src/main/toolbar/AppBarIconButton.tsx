import React from 'react';

import { IconButton } from '@mui/material';
import { IconButtonProps } from '@mui/material/IconButton';

interface Props extends IconButtonProps {
  Icon: React.ComponentType;
}

const AppBarIconButton = ({
  Icon,
  disabled,
  className,
  onClick,
}: Props): React.ReactElement => (
  <IconButton color='inherit' disabled={disabled} className={className} onClick={onClick}>
    <Icon />
  </IconButton>
);

export default AppBarIconButton;

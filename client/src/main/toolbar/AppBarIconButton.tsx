import React from 'react';
import {IconButton} from '@mui/material';
import {IconButtonProps} from '@mui/material/IconButton';

interface Props extends IconButtonProps {
  Icon: React.ComponentType;
}

const AppBarIconButton = ({
  Icon,
  ...props
}: Props): React.ReactElement => (
  <IconButton color='inherit' {...props}>
    <Icon />
  </IconButton>
);

export default AppBarIconButton;

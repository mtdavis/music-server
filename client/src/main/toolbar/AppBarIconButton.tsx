import React from 'react';
import {IconButton} from '@material-ui/core';
import {IconButtonProps} from '@material-ui/core/IconButton';

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

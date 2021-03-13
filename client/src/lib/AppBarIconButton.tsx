import React from 'react';
import {IconButton} from '@material-ui/core';
import {IconButtonProps} from '@material-ui/core/IconButton';

interface Props extends IconButtonProps {
  Icon: React.ComponentType;
}

export default class AppBarIconButton extends React.Component<Props> {
  render() {
    const {Icon, ...props} = this.props;
    return (
      <IconButton color='inherit' {...props}>
        <Icon />
      </IconButton>
    );
  }
}

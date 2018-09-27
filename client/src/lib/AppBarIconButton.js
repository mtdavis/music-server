import React from 'react';
import {IconButton} from '@material-ui/core';
import {withTheme} from '@material-ui/core/styles';

@withTheme()
export default class AppBarIconButton extends React.Component {
  render() {
    const {theme, icon, ...props} = this.props;
    const color = this.props.disabled ?
      theme.palette.disabledColor :
      'inherit';
    return (
      <IconButton
        color={color}
        {...props}
      >
        {icon}
      </IconButton>
    );
  }
}

AppBarIconButton.propTypes = {
  ...IconButton.propTypes
};

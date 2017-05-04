import React from 'react';
import {IconButton} from 'material-ui';
import {muiThemeable} from 'material-ui/styles';

const AppBarIconButton = muiThemeable()(React.createClass({
  propTypes: {
    ...IconButton.propTypes
  },

  render() {
    const {muiTheme, ...props} = this.props;
    const color = this.props.disabled ?
      muiTheme.palette.disabledColor :
      muiTheme.appBar.textColor;
    return (
      <IconButton
        style={{marginTop: 8}}
        iconStyle={{color: color}}
        {...props} />
    );
  }
}));

export default AppBarIconButton;

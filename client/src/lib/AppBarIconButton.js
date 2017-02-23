import React from 'react';
import {IconButton} from 'material-ui';
import {muiThemeable} from 'material-ui/styles';

const AppBarIconButton = muiThemeable()(React.createClass({
  render: function() {
    var color = this.props.disabled ?
      this.props.muiTheme.palette.disabledColor :
      this.props.muiTheme.appBar.textColor;
    var {muiTheme, ...props} = this.props;
    return (
      <IconButton
        style={{marginTop: 8}}
        iconStyle={{color: color}}
        {...props} />
    );
  }
}));

export default AppBarIconButton;

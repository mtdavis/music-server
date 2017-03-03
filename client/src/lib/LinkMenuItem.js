import React from 'react';
import {FontIcon, MenuItem} from 'material-ui';
import {Link} from 'react-router';

const LinkMenuItem = React.createClass({
  render: function() {
    let icon = <FontIcon className={this.props.iconClassName} />;

    return (
      <MenuItem innerDivStyle={{padding: 0}} leftIcon={icon}>
        <Link to={this.props.to} onClick={this.props.onClick} style={{
          position: 'absolute',
          left: 0,
          right: 0,
          padding: '0px 16px 0px 56px',
          textDecoration: 'none',
          color: 'inherit'
        }}>
          {this.props.children}
        </Link>
      </MenuItem>
    )
  }
});

export default LinkMenuItem;

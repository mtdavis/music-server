import React from 'react';
import PropTypes from 'prop-types';
import {ListItem, ListItemIcon, ListItemText} from '@material-ui/core';
import {withRouter} from 'react-router-dom';

@withRouter
export default class LinkMenuItem extends React.Component {
  render() {
    const {icon} = this.props;

    return (
      <ListItem button onClick={this.onClick}>
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText>
            {this.props.children}
        </ListItemText>
      </ListItem>
    );
  }

  onClick = (event) => {
    this.props.history.push(this.props.to)
    this.props.onClick(event);
  }
}

LinkMenuItem.propTypes = {
  icon: PropTypes.node.isRequired,
  to: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

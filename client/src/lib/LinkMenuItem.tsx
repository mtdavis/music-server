import React from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@material-ui/core';
import {
  RouteComponentProps,
  withRouter,
} from 'react-router-dom';

import {UiStore} from '../stores';

interface Props extends RouteComponentProps {
  icon: React.ReactElement<any>,
  to: string,
  children: React.ReactNode,
}

interface InjectedProps extends Props {
  uiStore: UiStore;
}

@inject('uiStore')
@observer
class LinkMenuItem extends React.Component<Props> {
  get injected() {
    return this.props as InjectedProps;
  }

  render() {
    const {icon, children} = this.props;
    const {uiStore} = this.injected;

    return (
      <ListItem button onClick={this.onClick}>
        <Tooltip placement='right' title={uiStore.drawerOpen ? '' : children}>
          <ListItemIcon>
            {icon}
          </ListItemIcon>
        </Tooltip>
        <ListItemText>
          {this.props.children}
        </ListItemText>
      </ListItem>
    );
  }

  onClick = () => {
    this.props.history.push(this.props.to);
  }
}

export default withRouter(LinkMenuItem);

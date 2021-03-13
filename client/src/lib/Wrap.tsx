import React from 'react';
import {inject, observer} from 'mobx-react';

import {UiStore} from '../stores';

import LeftNavComponent from './LeftNavComponent';

import {
  withStyles,
} from '@material-ui/core/styles';

interface InjectedProps {
  uiStore: UiStore,
}

@inject('uiStore')
@observer
class Wrap extends React.Component {
  get injected() {
    return this.props as InjectedProps;
  }

  render() {
    const {children} = this.props;
    const {uiStore} = this.injected;
    const drawerWidth = uiStore.drawerOpen ? 300 : 56;

    return (
      <div style={{display: 'flex', width: '100vw', paddingTop: 64, minHeight: 'calc(100vh - 64px)'}}>
        <LeftNavComponent />

        <main style={{flex: 1, padding: 16}}>
          {children}
        </main>
      </div>
    )
  }
}

export default Wrap;

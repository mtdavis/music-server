import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {inject} from 'mobx-react';

import {MusicStore} from '../stores';

interface Props {
  id?: string,
}

interface InjectedProps extends Props {
  musicStore: MusicStore,
}

@inject('musicStore')
export default class GaplessPlayer extends Component<Props> {

  componentDidMount() {
    this.injected.musicStore.initializePlayer(ReactDOM.findDOMNode(this) as Element);
  }

  get injected() {
    return this.props as InjectedProps;
  }

  render() {
    const {id = 'player'} = this.props;
    return (
      <p id={id} style={{display:"none"}}></p>
      // <p id={id} style={{ position:"absolute", right:20, top:120 }}></p>
    );
  }
}

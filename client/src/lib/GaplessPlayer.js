import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {inject} from 'mobx-react';

@inject('musicStore')
export default class GaplessPlayer extends Component {

  componentDidMount() {
    this.props.musicStore.initializePlayer(ReactDOM.findDOMNode(this));
  }

  render() {
    return (
      <p id={this.props.id} style={{display:"none"}}></p>
      // <p id={this.props.id} style={{ position:"absolute", right:20, top:120 }}></p>
    );
  }
}

GaplessPlayer.propTypes = {
  id: PropTypes.string
};

GaplessPlayer.defaultProps = {
  id: "player"
};

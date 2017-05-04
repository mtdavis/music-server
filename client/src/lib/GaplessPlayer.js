import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {FluxMixin} from './util';

const GaplessPlayer = React.createClass({
  mixins: [FluxMixin],

  propTypes: {
    id: PropTypes.string
  },

  getDefaultProps() {
    return {
      id: "player"
    };
  },

  componentDidMount() {
    this.getFlux().actions.initializePlayer(ReactDOM.findDOMNode(this));
  },

  render() {
    return (
      <p id={this.props.id} style={{display:"none"}}></p>
      // <p id={this.props.id} style={{ position:"absolute", right:20, top:120 }}></p>
    );
  }
});

export default GaplessPlayer;

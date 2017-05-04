import React, {PropTypes} from 'react';
import {FluxMixin} from '../lib/util';
import {
  FontIcon,
  RaisedButton
} from 'material-ui';

const ShuffleButton = React.createClass({
  mixins: [FluxMixin],

  propTypes: {
    minutes: PropTypes.number.isRequired
  },

  render() {
    return (
      <RaisedButton
        primary={true}
        onClick={this.onClick}
        label={this.props.minutes + ' Minutes'}
        icon={<FontIcon className="icon-shuffle" style={{top:'-1.5px'}}/>} />
    );
  },

  onClick() {
    this.getFlux().actions.playShuffle(this.props.minutes);
  }
});

export default React.createClass({
  render() {
    return (
      <div className='shuffle-page container-fluid'>
        <div className="row">
          <div className="col-xs-12" style={{textAlign:"center"}}>
            <ShuffleButton minutes={30} />
            <br />
            <br />
            <ShuffleButton minutes={60} />
            <br />
            <br />
            <ShuffleButton minutes={90} />
          </div>
        </div>
      </div>
    );
  }
});

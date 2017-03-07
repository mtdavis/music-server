import React from 'react';
import AlbumList from '../lib/AlbumList';
import {FluxMixin} from '../lib/util';
import {
  FontIcon,
  RaisedButton
} from 'material-ui';

var ShuffleButton = React.createClass({
  mixins: [FluxMixin],

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
})

module.exports = React.createClass({
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

import React, {Component, PropTypes} from 'react';
import {inject} from 'mobx-react';
import {
  FontIcon,
  RaisedButton
} from 'material-ui';

@inject('musicStore')
class ShuffleButton extends Component {
  render() {
    return (
      <RaisedButton
        primary={true}
        onClick={this.onClick}
        label={this.props.minutes + ' Minutes'}
        icon={<FontIcon className="icon-shuffle" style={{top:'-1.5px'}}/>} />
    );
  }

  onClick = () => {
    this.props.musicStore.playShuffle(this.props.minutes);
  }
}

ShuffleButton.propTypes = {
  minutes: PropTypes.number.isRequired
};

export default class ShufflePage extends Component {
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
}

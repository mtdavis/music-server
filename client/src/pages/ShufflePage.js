import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {inject} from 'mobx-react';
import {
  Button
} from '@material-ui/core';
import ShuffleIcon from '@material-ui/icons/Shuffle';

@inject('musicStore')
class ShuffleButton extends Component {
  render() {
    return (
      <Button variant='contained' color='primary' onClick={this.onClick}>
        <ShuffleIcon />
        {this.props.minutes + ' Minutes'}
      </Button>
    );
  }

  onClick = () => {
    this.props.musicStore.playShuffle(this.props.minutes);
  }
}

ShuffleButton.propTypes = {
  minutes: PropTypes.number.isRequired
};

export default function ShufflePage() {
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

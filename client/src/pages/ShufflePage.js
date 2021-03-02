import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {inject} from 'mobx-react';
import {
  Button,
  Grid,
} from '@material-ui/core';
import ShuffleIcon from '@material-ui/icons/Shuffle';

@inject('musicStore')
class ShuffleButton extends Component {
  render() {
    return (
      <Button variant='contained' color='primary' onClick={this.onClick}>
        <ShuffleIcon style={{marginRight: 8}} />
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
    <Grid container spacing={16} direction='column' alignItems='center'>
      <Grid item>
        <ShuffleButton minutes={30} />
      </Grid>
      <Grid item>
        <ShuffleButton minutes={60} />
      </Grid>
      <Grid item>
        <ShuffleButton minutes={90} />
      </Grid>
    </Grid>
  );
}

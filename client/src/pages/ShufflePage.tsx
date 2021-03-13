import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {inject} from 'mobx-react';
import {
  Button,
  Grid,
} from '@material-ui/core';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import {MusicStore} from '../stores';

interface ShuffleButtonProps {
  minutes: number;
}

interface InjectedProps extends ShuffleButtonProps {
  musicStore: MusicStore;
}

@inject('musicStore')
class ShuffleButton extends Component<ShuffleButtonProps> {
  get injected() {
    return this.props as InjectedProps
  }

  render() {
    return (
      <Button variant='contained' color='primary' onClick={this.onClick}>
        <ShuffleIcon style={{marginRight: 8}} />
        {this.props.minutes + ' Minutes'}
      </Button>
    );
  }

  onClick = () => {
    this.injected.musicStore.playShuffle(this.props.minutes);
  }
}

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

import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {colors} from '@material-ui/core';
import {
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import {Slider} from '@material-ui/lab';

import {MusicStore} from '../stores';
import PlayerState from './PlayerState';
import CurrentTimeLabel from './CurrentTimeLabel';

const styles = {
  wrapper: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    marginLeft: 24,
  },
  track: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  trackBefore: {
    backgroundColor: colors.common.white,
  },
  thumb: {
    backgroundColor: colors.common.white,
  },
};

enum DragState {
  NO = 0,
  YES = 1,
  JUST_ENDED = 2,
};

interface Props extends WithStyles<typeof styles> {
}

interface InjectedProps extends Props {
  musicStore: MusicStore;
}

interface State {
  dragging: DragState;
  draggingValue: number;
}

@inject('musicStore')
@observer
class CurrentTimeSlider extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      dragging: DragState.NO,
      draggingValue: 0,
    };
  }

  get injected() {
    return this.props as InjectedProps;
  }

  render() {
    const {musicStore} = this.injected;
    const {wrapper, ...classes} = this.props.classes;

    let seconds = 0;
    const playing = musicStore.playerState !== PlayerState.STOPPED;
    // let sliderValue = 0;
    let sliderMax = 1;
    let sliderDisabled = true;

    if(playing && musicStore.currentTrack !== null) {
      const currentTrackDuration = musicStore.currentTrack.duration;

      if(this.state.dragging === DragState.NO) {
        // sliderValue = musicStore.currentTrackPosition;
        seconds = musicStore.currentTrackPosition;
      }
      else {
        // sliderValue = this.state.draggingValue;
        seconds = this.state.draggingValue;
      }

      sliderMax = currentTrackDuration;
      sliderDisabled = false;
    }

    return (
      <div className={wrapper}>
        <Slider
          classes={classes}
          min={0}
          max={sliderMax}
          value={seconds}
          disabled={sliderDisabled}
          onChange={this.onSliderChange}
          onDragStart={this.onSliderDragStart}
          onDragEnd={this.onSliderDragEnd}
        />

        <CurrentTimeLabel enabled={playing} seconds={seconds} />
      </div>
    );
  }

  onSliderChange = (event: React.ChangeEvent<{}>, value: number) => {
    if(this.state.dragging === DragState.YES) {
      this.setState({draggingValue: value});
    }
    else {
      this.injected.musicStore.seekToPosition(value);
    }
  }

  onSliderDragStart = () => {
    this.setState({
      dragging: DragState.YES,
      draggingValue: this.injected.musicStore.currentTrackPosition,
    });
  }

  onSliderDragEnd = () => {
    this.injected.musicStore.seekToPosition(this.state.draggingValue);

    this.setState({
      dragging: DragState.JUST_ENDED,
    });

    setTimeout(() => {
      // run this in a moment to prevent a flash of the previous time while player is updating
      this.setState({
        dragging: DragState.NO,
        draggingValue: 0,
      });
    }, 100);
  }
}

export default withStyles(styles)(CurrentTimeSlider);

import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {colors} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import {Slider} from '@material-ui/lab';

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

const DragState = {
  NO: 0,
  YES: 1,
  JUST_ENDED: 2,
};

@withStyles(styles)
@inject('musicStore')
@observer
class CurrentTimeSlider extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dragging: DragState.NO,
      draggingValue: null,
    };
  }

  render() {
    const {musicStore} = this.props;
    const {wrapper, ...classes} = this.props.classes;

    let seconds = 0;
    const playing = musicStore.playerState !== PlayerState.STOPPED;
    let sliderValue = 0;
    let sliderMax = 1;
    let sliderDisabled = true;

    if(playing) {
      const currentTrackDuration = musicStore.currentTrack.duration;

      if(this.state.dragging === DragState.NO) {
        sliderValue = musicStore.currentTrackPosition;
        seconds = musicStore.currentTrackPosition;
      }
      else {
        sliderValue = this.state.draggingValue;
        seconds = this.state.draggingValue;
      }

      sliderMax = currentTrackDuration;
      sliderDisabled = false;
    }

    return (
      <div className={wrapper}>
        <Slider
          classes={classes}
          name="currentTime"
          min={0}
          max={sliderMax}
          value={sliderValue}
          disabled={sliderDisabled}
          onChange={this.onSliderChange}
          onDragStart={this.onSliderDragStart}
          onDragEnd={this.onSliderDragEnd}
        />

        <CurrentTimeLabel enabled={playing} seconds={seconds} />
      </div>
    );
  }

  onSliderChange = (event, value) => {
    if(this.state.dragging === DragState.YES) {
      this.setState({draggingValue: value});
    }
    else {
      this.props.musicStore.seekToPosition(value);
    }
  }

  onSliderDragStart = () => {
    this.setState({
      dragging: DragState.YES,
      draggingValue: this.props.musicStore.currentTrackPosition,
    });
  }

  onSliderDragEnd = () => {
    this.props.musicStore.seekToPosition(this.state.draggingValue);

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

export default CurrentTimeSlider;

import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {secondsToTimeString} from './util';
import {
  colors,
  Typography,
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import {fade} from '@material-ui/core/styles/colorManipulator';
import {Slider} from '@material-ui/lab';

import PlayerState from './PlayerState';

const styles = {
  track: {
    backgroundColor: 'rgba(0, 0, 0, 0.26)',
  },
  trackBefore: {
    backgroundColor: colors.common.white,
  },
  thumb: {
    backgroundColor: colors.common.white,
  },
  focused: {
    boxShadow: `0px 0px 0px 9px ${fade(colors.common.white, 0.16)}`,
  },
  timeLabel: {
    margin: 'auto 0 auto 10px'
  },
};

const DragState = {
  NO: 0,
  YES: 1,
  JUST_ENDED: 2,
}

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
    const {classes, musicStore} = this.props;

    let timeString = "0:00";
    let sliderValue = 0;
    let sliderMax = 1;
    let sliderDisabled = true;

    if(musicStore.playerState !== PlayerState.STOPPED) {
      const currentTrackDuration = musicStore.currentTrack.duration;
      // timeLabelStyles.color = this.props.theme.appBar.textColor;

      if(this.state.dragging !== DragState.NO) {
        sliderValue = this.state.draggingValue;
        timeString = secondsToTimeString(this.state.draggingValue);
      }
      else {
        sliderValue = musicStore.currentTrackPosition;
        timeString = secondsToTimeString(musicStore.currentTrackPosition);
      }

      // strip off decimal
      if(timeString.indexOf(".") > -1) {
        timeString = timeString.split(".")[0];
      }

      sliderMax = currentTrackDuration;
      sliderDisabled = false;
    }

    return (
      <div className="time-wrapper">
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

        <Typography variant="title" color="inherit" className={classes.timeLabel}>
          {timeString}
        </Typography>
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

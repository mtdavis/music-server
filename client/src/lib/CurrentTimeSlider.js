import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {secondsToTimeString} from './util';
import {Slider} from 'material-ui';
import {colors, getMuiTheme, muiThemeable, MuiThemeProvider} from 'material-ui/styles';

import PlayerState from './PlayerState';

@muiThemeable()
@inject('musicStore')
@observer
export default class CurrentTimeSlider extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dragging: false,
      draggingValue: 0
    };

    this.muiTheme = getMuiTheme({
      slider: {
        trackColor: colors.minBlack,
        trackColorSelected: colors.lightWhite,
        selectionColor: colors.white,
        rippleColor: colors.white,
        handleColorZero: colors.white,
        handleFillColor: colors.white,
      }
    });
  }

  render() {
    const {musicStore} = this.props;

    let timeString = "0:00";
    let sliderValue = 0;
    let sliderMax = 1;
    let sliderDisabled = true;

    const timeLabelStyles = {
      color: this.props.muiTheme.palette.disabledColor,
      fontWeight: this.props.muiTheme.appBar.titleFontWeight,
      height: this.props.muiTheme.appBar.height,
      lineHeight: this.props.muiTheme.appBar.height + 'px',
      paddingTop: 0,
      paddingRight: this.props.muiTheme.padding,
      paddingBottom: 0,
      paddingLeft: this.props.muiTheme.padding,
      margin: 0,
      fontSize: 24
    };

    if(musicStore.playerState !== PlayerState.STOPPED) {
      const currentTrackDuration = musicStore.playlist[musicStore.nowPlaying].duration;
      timeLabelStyles.color = this.props.muiTheme.appBar.textColor;

      if(this.state.dragging) {
        sliderValue = undefined;
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
      <MuiThemeProvider muiTheme={this.muiTheme}>
        <div className="time-wrapper">
          <Slider
            className="time-slider"
            name="currentTime"
            min={0}
            max={sliderMax}
            value={sliderValue}
            disabled={sliderDisabled}
            onChange={this.onSliderChange}
            onDragStart={this.onSliderDragStart}
            onDragStop={this.onSliderDragStop}
          />

          <h1 className={'time-label'} style={timeLabelStyles}>
            {timeString}
          </h1>
        </div>
      </MuiThemeProvider>
    );
  }

  onSliderChange = (event, value) => {
    if(this.state.dragging) {
      this.setState({draggingValue: value});
    }
    else {
      this.props.musicStore.seekToPosition(value);
    }
  }

  onSliderDragStart = () => {
    const {musicStore} = this.props;
    this.setState({
      dragging: true,
      draggingValue: musicStore.currentTrackPosition
    });
  }

  onSliderDragStop = () => {
    this.props.musicStore.seekToPosition(this.state.draggingValue);
    this.setState({
      dragging: false,
      draggingValue: 0
    });
  }
}

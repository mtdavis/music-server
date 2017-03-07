import React from 'react';
import {FluxMixin} from './util';
import {Slider} from 'material-ui';
import {colors, getMuiTheme, muiThemeable, MuiThemeProvider} from 'material-ui/styles';

import PlayerState from './PlayerState';
import {secondsToTimeString} from './util';

const CurrentTimeSlider = muiThemeable()(React.createClass({
  mixins: [FluxMixin],

  muiTheme: getMuiTheme({
    slider: {
      trackColor: colors.minBlack,
      trackColorSelected: colors.lightWhite,
      selectionColor: colors.white,
      rippleColor: colors.white,
      handleColorZero: colors.white,
      handleFillColor: colors.white,
    }
  }),

  getInitialState() {
    return {
      dragging: false,
      draggingValue: 0
    };
  },

  render() {
    var musicStore = this.getFlux().store("MusicStore");

    var timeString = "0:00";
    var sliderValue = 0;
    var sliderMax = 1;
    var sliderDisabled = true;

    var timeLabelStyles = {
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
      var currentTrackDuration = musicStore.playlist[musicStore.nowPlaying].duration;
      timeLabelStyles.color = this.props.muiTheme.appBar.textColor;

      if(this.state.dragging) {
        sliderValue = undefined;
        timeString = secondsToTimeString(this.state.draggingValue);
      }
      else {
        sliderValue = musicStore.currentTrackPosition;
        timeString = secondsToTimeString(musicStore.currentTrackPosition);
      }

      //strip off decimal
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
  },

  onSliderChange(event, value) {
    if(this.state.dragging) {
      this.setState({draggingValue: value});
    }
    else {
      this.getFlux().actions.seekToPosition(value);
    }
  },

  onSliderDragStart() {
    var musicStore = this.getFlux().store("MusicStore");
    this.setState({
      dragging: true,
      draggingValue: musicStore.currentTrackPosition
    });
  },

  onSliderDragStop() {
    this.getFlux().actions.seekToPosition(this.state.draggingValue);
    this.setState({
      dragging: false,
      draggingValue: 0
    });
  }
}));

export default CurrentTimeSlider;

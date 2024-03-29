import React from 'react';

import {
  colors,
  Slider,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import PlayerState from 'lib/PlayerState';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';

import CurrentTimeLabel from './CurrentTimeLabel';

const useStyles = makeStyles(() => ({
  rail: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  track: {
    backgroundColor: colors.common.white,
  },
  thumb: {
    backgroundColor: colors.common.white,
  },
}));

enum DragState {
  NO = 0,
  YES = 1,
  JUST_ENDED = 2,
}

const CurrentTimeSlider = () => {
  const { musicStore } = useStores();
  const classes = useStyles();

  const [dragging, setDragging] = React.useState(DragState.NO);
  const [draggingValue, setDraggingValue] = React.useState(0);

  let seconds = 0;
  const playing = musicStore.playerState !== PlayerState.STOPPED;
  // let sliderValue = 0;
  let sliderMax = 1;
  let sliderDisabled = true;

  if (playing && musicStore.currentTrack !== null) {
    const currentTrackDuration = musicStore.currentTrack.duration;

    if (dragging === DragState.NO) {
      seconds = musicStore.currentTrackPosition;
    } else {
      seconds = draggingValue;
    }

    sliderMax = currentTrackDuration;
    sliderDisabled = false;
  }

  const onSliderChange = (event: Event, value: number | number[]) => {
    if (dragging === DragState.NO) {
      // dragging just started.
      setDragging(DragState.YES);
      setDraggingValue(musicStore.currentTrackPosition);
    } else if (dragging === DragState.YES) {
      // mid-drag.
      setDraggingValue(value as number);
    }
  };

  const onSliderChangeCommitted = () => {
    musicStore.seekToPosition(draggingValue);

    setDragging(DragState.JUST_ENDED);

    setTimeout(() => {
      // run this in a moment to prevent a flash of the previous time while player is updating
      setDragging(DragState.NO);
      setDraggingValue(0);
    }, 100);
  };

  return (
    <>
      <Slider
        classes={classes}
        min={0}
        max={sliderMax}
        value={seconds}
        disabled={sliderDisabled}
        onChange={onSliderChange}
        onChangeCommitted={onSliderChangeCommitted}
        size='small'
        sx={{
          marginLeft: 2,
          marginRight: 2,
        }}
      />

      <CurrentTimeLabel enabled={playing} seconds={seconds} />
    </>
  );
};

export default observer(CurrentTimeSlider);

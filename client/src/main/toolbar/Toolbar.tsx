import React from 'react';
import {observer} from 'mobx-react-lite';

import {useStores} from 'stores';

import CurrentTimeSlider from './CurrentTimeSlider';
import AppBarIconButton from './AppBarIconButton';
import VolumeButton from './VolumeButton';
import PlayerState from 'lib/PlayerState';
import ScrobbleState from 'lib/ScrobbleState';

import {
  IconButton,
  Toolbar as MUIToolbar,
} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {Theme} from '@mui/material/styles';

import MenuIcon from '@mui/icons-material/Menu';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import StopIcon from '@mui/icons-material/Stop';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import LastFmIcon from './LastFmIcon';

import Tooltip from 'lib/Tooltip';
import Title from './Title';

const useStyles = makeStyles((theme: Theme) => ({
  toolbar: {
    paddingLeft: 4,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const Toolbar = () => {
  const classes = useStyles();
  const {musicStore, scrobbleStore, uiStore} = useStores();

  const openLastFm = () => {
    window.open("https://last.fm/user/ogreatone43");
  };

  const onStopButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    if(event.ctrlKey || event.metaKey) {
      musicStore.toggleStopAfterCurrent();
    }
    else {
      musicStore.stopPlayback();
    }
  };

  const playButtonEnabled = musicStore.playlist.length > 0;
  const playOrPauseIcon = musicStore.playerState === PlayerState.PLAYING ?
    PauseIcon : PlayArrowIcon;
  const stopButtonEnabled = musicStore.playerState !== PlayerState.STOPPED;
  const prevButtonEnabled = musicStore.playlist.length > 1 &&
    musicStore.currentTrackIndex > 0;
  const nextButtonEnabled = musicStore.playlist.length > 1 &&
    musicStore.currentTrackIndex < musicStore.playlist.length - 1;

  const scrobbleTooltip: {[key in ScrobbleState]: string} = {
    [ScrobbleState.NO_TRACK]: "last.fm",
    [ScrobbleState.TRACK_QUEUED]: "Queued",
    [ScrobbleState.TRACK_SCROBBLED]: "Scrobbled",
    [ScrobbleState.SCROBBLE_FAILED]: "Scrobble failed!",
  };

  return (
    <MUIToolbar className={classes.toolbar}>
      <IconButton color="inherit" onClick={uiStore.toggleDrawer}>
        <MenuIcon />
      </IconButton>

      <Title />

      <CurrentTimeSlider />

      <AppBarIconButton
        Icon={SkipPreviousIcon}
        disabled={!prevButtonEnabled}
        onClick={() => musicStore.jumpToPreviousTrack()}
      />
      <AppBarIconButton
        Icon={playOrPauseIcon}
        disabled={!playButtonEnabled}
        onClick={() => musicStore.playOrPausePlayback()}
      />
      <AppBarIconButton
        Icon={StopIcon}
        className={musicStore.willStopAfterCurrent ? "pulsate" : ""}
        disabled={!stopButtonEnabled}
        onClick={onStopButtonClick}
      />
      <AppBarIconButton
        Icon={SkipNextIcon}
        disabled={!nextButtonEnabled}
        onClick={() => musicStore.jumpToNextTrack()}
      />

      <VolumeButton />

      {musicStore.demoMode ?
        null :
        <Tooltip title={scrobbleTooltip[scrobbleStore.scrobbleState]}>
          <div>
            <AppBarIconButton
              Icon={LastFmIcon}
              onClick={openLastFm}
            />
          </div>
        </Tooltip>
      }
    </MUIToolbar>
  );
};

export default observer(Toolbar);

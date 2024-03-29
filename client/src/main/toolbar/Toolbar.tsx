import React from 'react';

import MenuIcon from '@mui/icons-material/Menu';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import StopIcon from '@mui/icons-material/Stop';
import {
  IconButton,
  Toolbar as MUIToolbar,
} from '@mui/material';
import PlayerState from 'lib/PlayerState';
import ScrobbleState from 'lib/ScrobbleState';
import Tooltip from 'lib/Tooltip';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';

import AppBarIconButton from './AppBarIconButton';
import CurrentTimeSlider from './CurrentTimeSlider';
import LastFmIcon from './LastFmIcon';
import Title from './Title';
import VolumeButton from './VolumeButton';

const Toolbar = () => {
  const { musicStore, scrobbleStore, uiStore } = useStores();

  const openLastFm = () => {
    window.open('https://last.fm/user/ogreatone43');
  };

  const onStopButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    if (event.ctrlKey || event.metaKey) {
      musicStore.toggleStopAfterCurrent();
    } else {
      musicStore.stopPlayback();
    }
  };

  const playButtonEnabled = musicStore.playlist.length > 0;
  const playOrPauseIcon = musicStore.playerState === PlayerState.PLAYING
    ? PauseIcon : PlayArrowIcon;
  const stopButtonEnabled = musicStore.playerState !== PlayerState.STOPPED;
  const prevButtonEnabled = musicStore.playlist.length > 1
    && musicStore.currentTrackIndex > 0;
  const nextButtonEnabled = musicStore.playlist.length > 1
    && musicStore.currentTrackIndex < musicStore.playlist.length - 1;

  const scrobbleTooltip: { [key in ScrobbleState]: string } = {
    [ScrobbleState.NO_TRACK]: 'last.fm',
    [ScrobbleState.TRACK_QUEUED]: 'Queued',
    [ScrobbleState.TRACK_SCROBBLED]: 'Scrobbled',
    [ScrobbleState.SCROBBLE_FAILED]: 'Scrobble failed!',
  };

  return (
    <MUIToolbar
      disableGutters
      sx={{
        display: 'flex',
        gap: 1,
        paddingLeft: 1,
        paddingRight: 1,
      }}
    >
      <IconButton color='inherit' onClick={uiStore.toggleDrawer}>
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
        className={musicStore.willStopAfterCurrent ? 'pulsate' : ''}
        disabled={!stopButtonEnabled}
        onClick={onStopButtonClick}
      />
      <AppBarIconButton
        Icon={SkipNextIcon}
        disabled={!nextButtonEnabled}
        onClick={() => musicStore.jumpToNextTrack()}
      />

      <VolumeButton />

      {musicStore.demoMode ? null : (
        <Tooltip title={scrobbleTooltip[scrobbleStore.scrobbleState]}>
          <div>
            <AppBarIconButton
              Icon={LastFmIcon}
              onClick={openLastFm}
            />
          </div>
        </Tooltip>
      )}
    </MUIToolbar>
  );
};

export default observer(Toolbar);

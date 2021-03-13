import React, {Component} from 'react';
import {Route, Switch} from 'react-router';
import {HashRouter} from 'react-router-dom';
import {inject, observer} from 'mobx-react';

import {MusicStore, ScrobbleStore, UiStore} from './stores';

import GaplessPlayer from './lib/GaplessPlayer';
import CurrentTimeSlider from './lib/CurrentTimeSlider';
import AppBarIconButton from './lib/AppBarIconButton';
import VolumeButton from './lib/VolumeButton';
import PlayerState from './lib/PlayerState';
import ScrobbleState from './lib/ScrobbleState';
import LeftNavComponent from './lib/LeftNavComponent';

import {
  AppBar,
  Icon,
  IconButton,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography
} from '@material-ui/core';
import {
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import MenuIcon from '@material-ui/icons/Menu';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import StopIcon from '@material-ui/icons/Stop';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import LastFmIcon from './lib/LastFmIcon';

import Wrap from './lib/Wrap';
import Title from './lib/Title';
import HomePage from './pages/HomePage';
import LyricsPage from './pages/LyricsPage';
import AlbumsPage from './pages/AlbumsPage';
import NotRecentlyPlayedPage from './pages/NotRecentlyPlayedPage';
import NeverPlayedPage from './pages/NeverPlayedPage';
import FavoriteAlbumsPage from './pages/FavoriteAlbumsPage';
import AllTracksPage from './pages/AllTracksPage';
import ShufflePage from './pages/ShufflePage';
import PlaylistsPage from './pages/PlaylistsPage';

interface Props {
};

interface State {
  demoSnackbarClosed: boolean,
};

const styles = (theme: Theme) => ({
  toolbar: {
    paddingLeft: 4,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
});

interface InjectedProps extends WithStyles<typeof styles> {
  musicStore: MusicStore;
  scrobbleStore: ScrobbleStore;
  uiStore: UiStore;
}

@inject('musicStore', 'scrobbleStore', 'uiStore')
@observer
class Master extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      demoSnackbarClosed: false,
    };
  }

  get injected() {
    return this.props as InjectedProps;
  }

  openLastFm = () => {
    window.open("https://last.fm/user/ogreatone43");
  }

  onStopButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    if(event.ctrlKey || event.metaKey) {
      this.injected.musicStore.toggleStopAfterCurrent();
    }
    else {
      this.injected.musicStore.stopPlayback();
    }
  }

  onDemoSnackbarClose = () => {
    this.setState({
      demoSnackbarClosed: true
    });
  }

  render() {
    const {classes, musicStore, scrobbleStore, uiStore} = this.injected;
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

    const toolbar = (
      <Toolbar className={classes.toolbar}>
        <IconButton color="inherit" onClick={uiStore.toggleDrawer}>
          <MenuIcon />
        </IconButton>

        <Title />

        <GaplessPlayer />

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
          onClick={this.onStopButtonClick}
        />
        <AppBarIconButton
          Icon={SkipNextIcon}
          disabled={!nextButtonEnabled}
          onClick={() => musicStore.jumpToNextTrack()}
        />

        <VolumeButton />

        {
          musicStore.demoMode ? null :
          <Tooltip title={scrobbleTooltip[scrobbleStore.scrobbleState]}>
            <AppBarIconButton
              Icon={LastFmIcon}
              onClick={this.openLastFm}
            />
          </Tooltip>
        }
      </Toolbar>
    );

    return (
      <div>
        <AppBar className={classes.appBar}>
          {toolbar}
        </AppBar>

        <HashRouter>
          <Switch>
            <Route exact path='/'><Wrap><HomePage /></Wrap></Route>
            <Route path='/lyrics'><Wrap><LyricsPage /></Wrap></Route>
            <Route path='/albums'><Wrap><AlbumsPage /></Wrap></Route>
            <Route path='/not-recently-played'><Wrap><NotRecentlyPlayedPage /></Wrap></Route>
            <Route path='/never-played'><Wrap><NeverPlayedPage /></Wrap></Route>
            <Route path='/favorite-albums'><Wrap><FavoriteAlbumsPage /></Wrap></Route>
            <Route path='/tracks'><Wrap><AllTracksPage /></Wrap></Route>
            <Route path='/shuffle'><Wrap><ShufflePage /></Wrap></Route>
            <Route path='/playlists'><Wrap><PlaylistsPage /></Wrap></Route>
            <Route path='*'><Wrap><HomePage /></Wrap></Route>
          </Switch>
        </HashRouter>

        <Snackbar open={scrobbleStore.scrobbleState === ScrobbleState.SCROBBLE_FAILED}
          message='Scrobble failed.' />

        <Snackbar
          open={musicStore.demoMode && !this.state.demoSnackbarClosed}
          autoHideDuration={10000}
          onClose={this.onDemoSnackbarClose}
          message={
            <span>
              This is a demo instance that uses public-domain music.<br/>
              A few features are disabled, e.g., scrobbling to last.fm.
            </span>
          }
        />
      </div>
    );
  }
}

export default withStyles(styles)(Master);

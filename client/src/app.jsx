import React, {Component} from 'react';
import {render} from 'react-dom';
import {Route, Switch, withRouter} from 'react-router';
import {HashRouter} from 'react-router-dom';
import {inject, observer, Provider} from 'mobx-react';

import {DbStore, LyricsStore, MusicStore, ScrobbleStore} from './stores';

import GaplessPlayer from './lib/GaplessPlayer';
import CurrentTimeSlider from './lib/CurrentTimeSlider';
import AppBarIconButton from './lib/AppBarIconButton';
import VolumeButton from './lib/VolumeButton';
import PlayerState from './lib/PlayerState';
import ScrobbleState from './lib/ScrobbleState';
import LeftNavComponent from './lib/LeftNavComponent';

import {
  AppBar,
  colors,
  Icon,
  IconButton,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography
} from '@material-ui/core';
import {
  createMuiTheme,
  MuiThemeProvider
} from '@material-ui/core/styles';

import MenuIcon from '@material-ui/icons/Menu';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import StopIcon from '@material-ui/icons/Stop';
import SkipNextIcon from '@material-ui/icons/SkipNext';

import HomePage from './pages/HomePage';
import LyricsPage from './pages/LyricsPage';
import AlbumsPage from './pages/AlbumsPage';
import NotRecentlyPlayedPage from './pages/NotRecentlyPlayedPage';
import NeverPlayedPage from './pages/NeverPlayedPage';
import FavoriteAlbumsPage from './pages/FavoriteAlbumsPage';
import AllTracksPage from './pages/AllTracksPage';
import ShufflePage from './pages/ShufflePage';
import PlaylistsPage from './pages/PlaylistsPage';
import ScanPage from './pages/ScanPage';

const titles = {
  '/': "Now Playing",
  '/lyrics': "Lyrics",
  '/albums': "All Albums",
  '/not-recently-played': "Not Recently Played",
  '/never-played': "Never Played",
  '/favorite-albums': "Favorite Albums",
  '/tracks': "All Tracks",
  '/shuffle': "Shuffle",
  '/scan': "Scan",
  '/playlists': "Playlists",
};

@withRouter
@inject('musicStore', 'scrobbleStore')
@observer
class Master extends Component {
  constructor(props) {
    super(props);

    // automatically show the menu if the initial page is the home page
    this.state = {
      drawerOpen: window.location.hash === '#/'
    };
  }

  openLastFm = () => {
    window.open("https://last.fm/user/ogreatone43");
  }

  onStopButtonClick = (event) => {
    if(event.ctrlKey || event.metaKey) {
      this.props.musicStore.toggleStopAfterCurrent();
    }
    else {
      this.props.musicStore.stopPlayback();
    }
  }

  openDrawer = () => {
    this.setState({
      drawerOpen: true
    });
  }

  onDrawerClose = () => {
    this.setState({
      drawerOpen: false
    });
  }

  render() {
    const {musicStore, scrobbleStore} = this.props;
    const playButtonEnabled = musicStore.playlist.length > 0;
    const playOrPauseIcon = musicStore.playerState === PlayerState.PLAYING ?
      <PauseIcon /> : <PlayArrowIcon />;
    const stopButtonEnabled = musicStore.playerState !== PlayerState.STOPPED;
    const prevButtonEnabled = musicStore.playlist.length > 1 &&
      musicStore.currentTrackIndex > 0;
    const nextButtonEnabled = musicStore.playlist.length > 1 &&
      musicStore.currentTrackIndex < musicStore.playlist.length - 1;

    const scrobbleTooltip = {};
    scrobbleTooltip[ScrobbleState.NO_TRACK] = "last.fm";
    scrobbleTooltip[ScrobbleState.TRACK_QUEUED] = "Queued";
    scrobbleTooltip[ScrobbleState.TRACK_SCROBBLED] = "Scrobbled";
    scrobbleTooltip[ScrobbleState.SCROBBLE_FAILED] = "Scrobble failed!";

    const title = titles[this.props.location.pathname] || 'Now Playing';

    const lastFmIcon = (
      <Tooltip title={scrobbleTooltip[scrobbleStore.scrobbleState]}>
        <Icon className='icon-lastfm' />
      </Tooltip>
    );

    const toolbar = (
      <Toolbar>
        <IconButton color="inherit" onClick={this.openDrawer}>
          <MenuIcon />
        </IconButton>
        <Typography variant="title" color="inherit">
          {title}
        </Typography>

        <GaplessPlayer />

        <CurrentTimeSlider />

        <AppBarIconButton icon={<SkipPreviousIcon />}
          disabled={!prevButtonEnabled}
          onClick={() => musicStore.jumpToPreviousTrack()} />
        <AppBarIconButton icon={playOrPauseIcon}
          disabled={!playButtonEnabled}
          onClick={() => musicStore.playOrPausePlayback()} />
        <AppBarIconButton icon={<StopIcon />}
          className={musicStore.willStopAfterCurrent ? "pulsate" : ""}
          disabled={!stopButtonEnabled}
          onClick={this.onStopButtonClick} />
        <AppBarIconButton icon={<SkipNextIcon />}
          disabled={!nextButtonEnabled}
          onClick={() => musicStore.jumpToNextTrack()} />

        <VolumeButton />

        <AppBarIconButton icon={lastFmIcon}
          tooltip={scrobbleTooltip[scrobbleStore.scrobbleState]}
          onClick={this.openLastFm} />
      </Toolbar>
    );

    return (
      <div>
        <AppBar>
          {toolbar}
        </AppBar>

        <LeftNavComponent open={this.state.drawerOpen} onClose={this.onDrawerClose} />

        <div style={{position: 'relative', top: 64}}>
          {this.props.children}
        </div>

        <Snackbar open={scrobbleStore.scrobbleState === ScrobbleState.SCROBBLE_FAILED}
          message='Scrobble failed.' />
      </div>
    );
  }
}

const musicStore = new MusicStore();
const dbStore = new DbStore();
const lyricsStore = new LyricsStore(musicStore);
const scrobbleStore = new ScrobbleStore(musicStore, dbStore);

const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: colors.lightBlue['600'],
    },
    secondary: {
      main: colors.deepOrange['200'],
    },
    contrastThreshold: 3,
  }
});

const router = (
  <MuiThemeProvider theme={muiTheme}>
    <Provider
      musicStore={musicStore}
      dbStore={dbStore}
      lyricsStore={lyricsStore}
      scrobbleStore={scrobbleStore}>

      <HashRouter>
        <Master>
          <Switch>
            <Route exact path='/' component={HomePage} />
            <Route path='/lyrics' component={LyricsPage} />
            <Route path='/albums' component={AlbumsPage} />
            <Route path='/not-recently-played' component={NotRecentlyPlayedPage} />
            <Route path='/never-played' component={NeverPlayedPage} />
            <Route path='/favorite-albums' component={FavoriteAlbumsPage} />
            <Route path='/tracks' component={AllTracksPage} />
            <Route path='/shuffle' component={ShufflePage} />
            <Route path='/scan' component={ScanPage} />
            <Route path='/playlists' component={PlaylistsPage} />
            <Route path='*' component={HomePage} />
          </Switch>
        </Master>
      </HashRouter>
    </Provider>
  </MuiThemeProvider>
);

render(router, document.getElementById('app'));

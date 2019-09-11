import React, {Component} from 'react';
import {render} from 'react-dom';
import {Route, Switch} from 'react-router';
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
  MuiThemeProvider,
  withStyles,
} from '@material-ui/core/styles';

import MenuIcon from '@material-ui/icons/Menu';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import StopIcon from '@material-ui/icons/Stop';
import SkipNextIcon from '@material-ui/icons/SkipNext';

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
import ScanPage from './pages/ScanPage';

import './style/main.css';
import './style/bootstrap.css';
import './style/icomoon/style.css';

interface Props {
};

interface InjectedProps extends Props {
  musicStore: MusicStore,
  scrobbleStore: ScrobbleStore,
}

interface State {
  demoSnackbarClosed: boolean,
  drawerOpen: boolean,
};

const styles = {
  toolbar: {
    paddingLeft: 12,
  },
};

@withStyles(styles)
@inject('musicStore', 'scrobbleStore')
@observer
class Master extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      demoSnackbarClosed: false,

      // automatically show the menu if the initial page is the home page
      drawerOpen: window.location.hash === '#/',
    };
  }

  get injected() {
    return this.props as InjectedProps;
  }

  openLastFm = () => {
    window.open("https://last.fm/user/ogreatone43");
  }

  onStopButtonClick = (event: KeyboardEvent) => {
    if(event.ctrlKey || event.metaKey) {
      this.injected.musicStore.toggleStopAfterCurrent();
    }
    else {
      this.injected.musicStore.stopPlayback();
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

  onDemoSnackbarClose = () => {
    this.setState({
      demoSnackbarClosed: true
    });
  }

  render() {
    const {classes} = this.props;
    const {musicStore, scrobbleStore} = this.injected;
    const playButtonEnabled = musicStore.playlist.length > 0;
    const playOrPauseIcon = musicStore.playerState === PlayerState.PLAYING ?
      <PauseIcon /> : <PlayArrowIcon />;
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

    const lastFmIcon = (
      <Tooltip title={scrobbleTooltip[scrobbleStore.scrobbleState]}>
        <Icon className='icon-lastfm' />
      </Tooltip>
    );

    const toolbar = (
      <Toolbar className={classes.toolbar}>
        <IconButton color="inherit" onClick={this.openDrawer}>
          <MenuIcon />
        </IconButton>

        <Title />

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

        {
          musicStore.demoMode ? null :
          <AppBarIconButton icon={lastFmIcon}
            tooltip={scrobbleTooltip[scrobbleStore.scrobbleState]}
            onClick={this.openLastFm} />
        }
      </Toolbar>
    );

    return (
      <div>
        <AppBar>
          {toolbar}
        </AppBar>

        <HashRouter>
          <Switch>
            <Route exact path='/' component={this.renderRoute(HomePage)} />
            <Route path='/lyrics' component={this.renderRoute(LyricsPage)} />
            <Route path='/albums' component={this.renderRoute(AlbumsPage)} />
            <Route path='/not-recently-played' component={this.renderRoute(NotRecentlyPlayedPage)} />
            <Route path='/never-played' component={this.renderRoute(NeverPlayedPage)} />
            <Route path='/favorite-albums' component={this.renderRoute(FavoriteAlbumsPage)} />
            <Route path='/tracks' component={this.renderRoute(AllTracksPage)} />
            <Route path='/shuffle' component={this.renderRoute(ShufflePage)} />
            <Route path='/scan' component={this.renderRoute(ScanPage)} />
            <Route path='/playlists' component={this.renderRoute(PlaylistsPage)} />
            <Route path='*' component={this.renderRoute(HomePage)} />
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

  renderRoute(Comp: typeof Component | React.StatelessComponent) {
    return () => (
      <div>
        <LeftNavComponent open={this.state.drawerOpen} onClose={this.onDrawerClose} />

        <div style={{position: 'relative', top: 64}}>
          <Comp />
        </div>
      </div>
    );
  }
}

const dbStore = new DbStore();
const musicStore = new MusicStore(dbStore);
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
      scrobbleStore={scrobbleStore}
    >
      <Master />
    </Provider>
  </MuiThemeProvider>
);

render(router, document.getElementById('app'));

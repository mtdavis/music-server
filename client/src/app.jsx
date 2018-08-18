import React, {Component} from 'react';
import {render} from 'react-dom';
import {Router, Route, hashHistory, IndexRoute, withRouter} from 'react-router';
import injectTapEventPlugin from "react-tap-event-plugin";
import {inject, observer, Provider} from 'mobx-react';

import {DbStore, LyricsStore, MusicStore, ScrobbleStore} from './stores';

import GaplessPlayer from './lib/GaplessPlayer';
import CurrentTimeSlider from './lib/CurrentTimeSlider';
import AppBarIconButton from './lib/AppBarIconButton';
import VolumeButton from './lib/VolumeButton';
import PlayerState from './lib/PlayerState';
import ScrobbleState from './lib/ScrobbleState';
import LinkMenuItem from './lib/LinkMenuItem';

import {AppBar, Divider, Drawer, Snackbar} from 'material-ui';
import {colors, getMuiTheme, MuiThemeProvider} from 'material-ui/styles';

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

injectTapEventPlugin();

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

class LeftNavComponent extends Component {
  constructor(props) {
    super(props);

    // automatically show the menu if the initial page is the home page
    this.state = {
      open: window.location.hash === '#/'
    };
  }

  render() {
    return (
      <Drawer open={this.state.open} onRequestChange={this.onRequestChange} docked={false} width={320}>
        <AppBar title="Mike's Music Player" onLeftIconButtonTouchTap={this.close} />
        <LinkMenuItem to='/' iconClassName={'icon-music'} onClick={this.close}>
          Now Playing
        </LinkMenuItem>
        <LinkMenuItem to='/lyrics' iconClassName={'icon-music'} onClick={this.close}>
          Lyrics
        </LinkMenuItem>
        <Divider />
        <LinkMenuItem to='/albums' iconClassName='icon-album' onClick={this.close}>
          All Albums
        </LinkMenuItem>
        <LinkMenuItem to='/not-recently-played' iconClassName='icon-album' onClick={this.close}>
          Not Recently Played
        </LinkMenuItem>
        <LinkMenuItem to='/never-played' iconClassName='icon-album' onClick={this.close}>
          Never Played
        </LinkMenuItem>
        <LinkMenuItem to='/favorite-albums' iconClassName='icon-album' onClick={this.close}>
          Favorite Albums
        </LinkMenuItem>
        <Divider />
        <LinkMenuItem to='/tracks' iconClassName='icon-music' onClick={this.close}>
          All Tracks
        </LinkMenuItem>
        <LinkMenuItem to='/playlists' iconClassName='icon-music' onClick={this.close}>
          Playlists
        </LinkMenuItem>
        <LinkMenuItem to='/shuffle' iconClassName='icon-shuffle' onClick={this.close}>
          Shuffle
        </LinkMenuItem>
        <Divider />
        <LinkMenuItem to='/scan' iconClassName='icon-search' onClick={this.close}>
          Scan
        </LinkMenuItem>
      </Drawer>
    );
  }

  onRequestChange = (open) => {
    this.setState({
      open: open
    });
  }

  open = () => {
    this.setState({
      open: true
    });
  }

  close = () => {
    this.setState({
      open: false
    });
  }
}

@withRouter
@inject('musicStore', 'scrobbleStore')
@observer
class Master extends Component {
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

  render() {
    const {musicStore, scrobbleStore} = this.props;
    const playButtonEnabled = musicStore.playlist.length > 0;
    const playOrPause = musicStore.playerState === PlayerState.PLAYING ? "icon-pause" : "icon-play";
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

    const toolbar = (
      <div className='app-bar-toolbar'>
        <GaplessPlayer />

        <CurrentTimeSlider />

        <AppBarIconButton iconClassName="icon-previous"
          disabled={!prevButtonEnabled}
          onClick={() => musicStore.jumpToPreviousTrack()} />
        <AppBarIconButton iconClassName={playOrPause}
          disabled={!playButtonEnabled}
          onClick={() => musicStore.playOrPausePlayback()} />
        <AppBarIconButton iconClassName="icon-stop"
          className={musicStore.willStopAfterCurrent ? "pulsate" : ""}
          disabled={!stopButtonEnabled}
          onClick={this.onStopButtonClick} />
        <AppBarIconButton iconClassName="icon-next"
          disabled={!nextButtonEnabled}
          onClick={() => musicStore.jumpToNextTrack()} />

        <VolumeButton />

        <AppBarIconButton iconClassName="icon-lastfm"
          tooltip={scrobbleTooltip[scrobbleStore.scrobbleState]}
          onClick={this.openLastFm} />
      </div>
    );

    const title = titles[this.props.router.getCurrentLocation().pathname] || 'Now Playing';

    return (
      <div>
        <AppBar
          title={title}
          onLeftIconButtonTouchTap={() => this.refs.leftNav.open()}
          zDepth={1}
          iconElementRight={toolbar}
          iconStyleRight={{
            margin: 0,
            flex: 1
          }}
          titleStyle={{
            flex: 'none'
          }}
          style={{
            position: 'fixed'
          }}
        />

        <LeftNavComponent ref='leftNav' />

        <div className='mui-app-content-canvas' style={{position: 'relative', top: 64}}>
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

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: colors.lightBlue500,
    primary2Color: colors.lightBlue700,
    primary3Color: colors.grey400,
    accent1Color: colors.deepOrange200,
    accent2Color: colors.grey100,
    accent3Color: colors.grey500,
  }
});

const router = (
  <MuiThemeProvider muiTheme={muiTheme}>
    <Provider
      musicStore={musicStore}
      dbStore={dbStore}
      lyricsStore={lyricsStore}
      scrobbleStore={scrobbleStore}>

      <Router history={hashHistory}>
        <Route path='/' component={Master}>
          <IndexRoute component={HomePage} />
          <Route path='lyrics' component={LyricsPage} />
          <Route path='albums' component={AlbumsPage} />
          <Route path='not-recently-played' component={NotRecentlyPlayedPage} />
          <Route path='never-played' component={NeverPlayedPage} />
          <Route path='favorite-albums' component={FavoriteAlbumsPage} />
          <Route path='tracks' component={AllTracksPage} />
          <Route path='shuffle' component={ShufflePage} />
          <Route path='scan' component={ScanPage} />
          <Route path='playlists' component={PlaylistsPage} />
          <Route path='*' component={HomePage} />
        </Route>
      </Router>
    </Provider>
  </MuiThemeProvider>
);

render(router, document.getElementById('app'));

import React from 'react';
import {render} from 'react-dom';
import {Router, Route, hashHistory, IndexRoute, withRouter} from 'react-router';
import injectTapEventPlugin from "react-tap-event-plugin";

import Fluxxor, {StoreWatchMixin} from 'fluxxor';
import FluxProvider from './lib/FluxProvider';

import MusicStore from './stores/MusicStore';
import DbStore from './stores/DbStore';
import LyricsStore from './stores/LyricsStore';
import Actions from './stores/Actions';

import GaplessPlayer from './lib/GaplessPlayer';
import CurrentTimeSlider from './lib/CurrentTimeSlider';
import AppBarIconButton from './lib/AppBarIconButton';
import VolumeButton from './lib/VolumeButton';
import PlayerState from './lib/PlayerState';
import ScrobbleState from './lib/ScrobbleState';
import {FluxMixin} from './lib/util';
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
};

const LeftNavComponent = React.createClass({
  getInitialState() {
    return {
      open: false
    };
  },

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
        <LinkMenuItem to='/shuffle' iconClassName='icon-shuffle' onClick={this.close}>
          Shuffle
        </LinkMenuItem>
        <Divider />
        <LinkMenuItem to='/scan' iconClassName='icon-search' onClick={this.close}>
          Scan
        </LinkMenuItem>
      </Drawer>
    );
  },

  onRequestChange(open) {
    this.setState({
      open: open
    });
  },

  open() {
    this.setState({
      open: true
    });
  },

  close() {
    this.setState({
      open: false
    });
  }
});

const Master = withRouter(React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("MusicStore", "DbStore")],

  muiTheme: getMuiTheme({
    palette: {
      primary1Color: colors.lightBlue500,
      primary2Color: colors.lightBlue700,
      primary3Color: colors.grey400,
      accent1Color: colors.deepOrange200,
      accent2Color: colors.grey100,
      accent3Color: colors.grey500,
    }
  }),

  contextTypes: {
    flux: React.PropTypes.object.isRequired
  },

  getStateFromFlux() {
    return this.getFlux().store("MusicStore").getState();
  },

  openLastFm() {
    window.open("http://last.fm/user/ogreatone43");
  },

  stopButtonClicked(event) {
    if(event.ctrlKey || event.metaKey) {
      this.getFlux().actions.toggleStopAfterCurrent();
    }
    else {
      this.getFlux().actions.stop();
    }
  },

  render() {
    const musicStore = this.getFlux().store("MusicStore");
    const playButtonEnabled = musicStore.playlist.length > 0;
    const playOrPause = musicStore.playerState === PlayerState.PLAYING ? "icon-pause" : "icon-play";
    const stopButtonEnabled = musicStore.playerState !== PlayerState.STOPPED;
    const prevButtonEnabled = musicStore.playlist.length > 1 &&
      musicStore.nowPlaying > 0;
    const nextButtonEnabled = musicStore.playlist.length > 1 &&
      musicStore.nowPlaying < musicStore.playlist.length - 1;

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
          onClick={this.getFlux().actions.jumpToPreviousTrack} />
        <AppBarIconButton iconClassName={playOrPause}
          disabled={!playButtonEnabled}
          onClick={this.getFlux().actions.playOrPause} />
        <AppBarIconButton iconClassName="icon-stop"
          className={musicStore.willStopAfterCurrent ? "pulsate" : ""}
          disabled={!stopButtonEnabled}
          onClick={this.stopButtonClicked} />
        <AppBarIconButton iconClassName="icon-next"
          disabled={!nextButtonEnabled}
          onClick={this.getFlux().actions.jumpToNextTrack} />

        <VolumeButton />

        <AppBarIconButton iconClassName="icon-lastfm"
          tooltip={scrobbleTooltip[musicStore.scrobbleState]}
          onClick={this.openLastFm} />
      </div>
    );

    const title = titles[this.props.router.getCurrentLocation().pathname] || 'Now Playing';

    return (
      <MuiThemeProvider muiTheme={this.muiTheme}>
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

          <Snackbar open={musicStore.scrobbleState === ScrobbleState.SCROBBLE_FAILED}
            message='Scrobble failed.' />
        </div>
      </MuiThemeProvider>
    );
  }
}));

const actions = {
  playAlbum(album) {
    this.dispatch(Actions.PLAY_ALBUM, album);
  },

  enqueueAlbum(album) {
    this.dispatch(Actions.ENQUEUE_ALBUM, album);
  },

  playTrack(track) {
    this.dispatch(Actions.PLAY_TRACK, track);
  },

  enqueueTrack(track) {
    this.dispatch(Actions.ENQUEUE_TRACK, track);
  },

  playShuffle(minutes) {
    this.dispatch(Actions.PLAY_SHUFFLE, minutes);
  },

  initializePlayer(playerNode) {
    this.dispatch(Actions.INITIALIZE_PLAYER, playerNode);
  },

  playOrPause() {
    this.dispatch(Actions.PLAY_OR_PAUSE_PLAYBACK);
  },

  stop() {
    this.dispatch(Actions.STOP_PLAYBACK);
  },

  toggleStopAfterCurrent() {
    this.dispatch(Actions.TOGGLE_STOP_AFTER_CURRENT);
  },

  jumpToPlaylistItem(index) {
    this.dispatch(Actions.JUMP_TO_PLAYLIST_ITEM, index);
  },

  jumpToPreviousTrack() {
    this.dispatch(Actions.JUMP_TO_PREVIOUS_TRACK);
  },

  jumpToNextTrack() {
    this.dispatch(Actions.JUMP_TO_NEXT_TRACK);
  },

  seekToPosition(position) {
    this.dispatch(Actions.SEEK_TO_POSITION, position);
  },

  setVolume(volume) {
    this.dispatch(Actions.SET_VOLUME, volume);
  },

  scanForChangedMetadata() {
    this.dispatch(Actions.SCAN_FOR_CHANGED_METADATA);
  },

  scanForMovedFiles() {
    this.dispatch(Actions.SCAN_FOR_MOVED_FILES);
  },

  scanForNewFiles() {
    this.dispatch(Actions.SCAN_FOR_NEW_FILES);
  },

  getLyrics() {
    this.dispatch(Actions.GET_LYRICS);
  }
};

const stores = {
  MusicStore: new MusicStore(),
  DbStore: new DbStore(),
  LyricsStore: new LyricsStore(),
};

const flux = new Fluxxor.Flux(stores, actions);

const router = (
  <FluxProvider flux={flux}>
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
        <Route path='*' component={HomePage} />
      </Route>
    </Router>
  </FluxProvider>
);

render(router, document.getElementById('app'));

import React from 'react';
import {render} from 'react-dom';
import {Router, Route, hashHistory, IndexRoute, withRouter} from 'react-router';
import injectTapEventPlugin from "react-tap-event-plugin";

import Fluxxor, {StoreWatchMixin} from 'fluxxor';
import FluxProvider from './lib/FluxProvider';

import MusicStore from './stores/MusicStore';
import GaplessPlayer from './lib/GaplessPlayer';
import CurrentTimeSlider from './lib/CurrentTimeSlider';
import AppBarIconButton from './lib/AppBarIconButton';
import VolumeButton from './lib/VolumeButton';
import PlayerState from './lib/PlayerState';
import ScrobbleState from './lib/ScrobbleState';
import {secondsToTimeString, FluxMixin} from './lib/util';
import LinkMenuItem from './lib/LinkMenuItem';

import {AppBar, Divider, Drawer, Snackbar} from 'material-ui';
import {colors, getMuiTheme, MuiThemeProvider} from 'material-ui/styles';

import HomePage from './pages/HomePage';
import AlbumsPage from './pages/AlbumsPage';
import NotRecentlyPlayedPage from './pages/NotRecentlyPlayedPage';
import NeverPlayedPage from './pages/NeverPlayedPage';
import AllTracksPage from './pages/AllTracksPage';
import ShufflePage from './pages/ShufflePage';
import ScanPage from './pages/ScanPage';

injectTapEventPlugin();

var titles = {
  '/': "Now Playing",
  '/albums': "All Albums",
  '/not-recently-played': "Not Recently Played",
  '/never-played': "Never Played",
  '/tracks': "All Tracks",
  '/shuffle': "Shuffle",
  '/scan': "Scan",
}

var LeftNavComponent = React.createClass({
  getInitialState() {
    return {
      open: false
    };
  },

  render: function() {
    return (
      <Drawer open={this.state.open} onRequestChange={this.onRequestChange} docked={false} width={320}>
        <AppBar title="Mike's Music Player" onLeftIconButtonTouchTap={this.close} />
        <LinkMenuItem to='/' iconClassName={'icon-music'} onClick={this.close}>Now Playing</LinkMenuItem>
        <Divider />
        <LinkMenuItem to='/albums' iconClassName='icon-album' onClick={this.close}>All Albums</LinkMenuItem>
        <LinkMenuItem to='/not-recently-played' iconClassName='icon-album' onClick={this.close}>Not Recently Played</LinkMenuItem>
        <LinkMenuItem to='/never-played' iconClassName='icon-album' onClick={this.close}>Never Played</LinkMenuItem>
        <LinkMenuItem to='/tracks' iconClassName='icon-music' onClick={this.close}>All Tracks</LinkMenuItem>
        <LinkMenuItem to='/shuffle' iconClassName='icon-shuffle' onClick={this.close}>Shuffle</LinkMenuItem>
        <Divider />
        <LinkMenuItem to='/scan' iconClassName='icon-search' onClick={this.close}>Scan</LinkMenuItem>
      </Drawer>
    );
  },

  onRequestChange: function(open) {
    this.setState({
      open: open
    });
  },

  open: function() {
    this.setState({
      open: true
    })
  },

  close: function() {
    this.setState({
      open: false
    });
  }
});

var Master = withRouter(React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("MusicStore")],

  muiTheme: getMuiTheme({
    palette: {
      primary1Color: colors.lightBlue500,
      primary2Color: colors.lightBlue700,
      primary3Color: colors.grey400,
      accent1Color: colors.deepOrange200,
      accent2Color: colors.grey100,
      accent3Color: colors.grey500,
    },
    slider: {
      trackColor: colors.minBlack,
      trackColorSelected: colors.faintBlack,
      selectionColor: colors.lightBlue200,
      rippleColor: colors.lightBlue200,
      handleColorZero: colors.faintBlack,
      handleFillColor: colors.white,
    }
  }),

  contextTypes: {
    flux: React.PropTypes.object.isRequired
  },

  getStateFromFlux: function() {
    return this.getFlux().store("MusicStore").getState();
  },

  openLastFm: function() {
    window.open("http://last.fm/user/ogreatone43");
  },

  stopButtonClicked: function(event)
  {
    if(event.ctrlKey || event.metaKey)
    {
      this.getFlux().actions.toggleStopAfterCurrent();
    }
    else
    {
      this.getFlux().actions.stop();
    }
  },

  render: function () {
    var musicStore = this.getFlux().store("MusicStore");
    var playButtonEnabled = musicStore.playlist.length > 0;
    var playOrPause = musicStore.playerState === PlayerState.PLAYING ? "icon-pause" : "icon-play"
    var stopButtonEnabled = musicStore.playerState !== PlayerState.STOPPED;
    var prevButtonEnabled = musicStore.playlist.length > 1 &&
        musicStore.nowPlaying > 0;
    var nextButtonEnabled = musicStore.playlist.length > 1 &&
        musicStore.nowPlaying < musicStore.playlist.length - 1;

    var scrobbleTooltip = {};
    scrobbleTooltip[ScrobbleState.NO_TRACK] = "last.fm";
    scrobbleTooltip[ScrobbleState.TRACK_QUEUED] = "Queued";
    scrobbleTooltip[ScrobbleState.TRACK_SCROBBLED] = "Scrobbled";
    scrobbleTooltip[ScrobbleState.SCROBBLE_FAILED] = "Scrobble failed!";

    var toolbar = (
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

    var title = titles[this.props.router.getCurrentLocation().pathname] || 'Now Playing';

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

var actions = {
    playAlbum: function(album) {
        this.dispatch("PLAY_ALBUM", album);
    },

    enqueueAlbum: function(album) {
        this.dispatch("ENQUEUE_ALBUM", album);
    },

    playTrack: function(track) {
        this.dispatch("PLAY_TRACK", track);
    },

    enqueueTrack: function(track) {
        this.dispatch("ENQUEUE_TRACK", track);
    },

    playShuffle: function(minutes) {
        this.dispatch("PLAY_SHUFFLE", minutes);
    },

    initializePlayer: function(playerNode) {
        this.dispatch("INITIALIZE_PLAYER", playerNode);
    },

    playOrPause: function() {
        this.dispatch("PLAY_OR_PAUSE_PLAYBACK");
    },

    stop: function() {
        this.dispatch("STOP_PLAYBACK");
    },

    toggleStopAfterCurrent: function() {
        this.dispatch("TOGGLE_STOP_AFTER_CURRENT");
    },

    jumpToPlaylistItem: function(index) {
        this.dispatch("JUMP_TO_PLAYLIST_ITEM", index);
    },

    jumpToPreviousTrack: function() {
        this.dispatch("JUMP_TO_PREVIOUS_TRACK");
    },

    jumpToNextTrack: function() {
        this.dispatch("JUMP_TO_NEXT_TRACK");
    },

    seekToPosition: function(position) {
        this.dispatch("SEEK_TO_POSITION", position);
    },

    setVolume: function(volume) {
      this.dispatch("SET_VOLUME", volume);
    },

    scanForChangedMetadata: function() {
        this.dispatch("SCAN_FOR_CHANGED_METADATA");
    },

    scanForMovedFiles: function() {
        this.dispatch("SCAN_FOR_MOVED_FILES");
    },

    scanForNewFiles: function() {
        this.dispatch("SCAN_FOR_NEW_FILES");
    }
};

var stores = {
    MusicStore: new MusicStore()
};

var flux = new Fluxxor.Flux(stores, actions);

var router = (
  <FluxProvider flux={flux}>
    <Router history={hashHistory}>
      <Route path='/' component={Master}>
        <IndexRoute component={HomePage} />
        <Route path='albums' component={AlbumsPage} />
        <Route path='not-recently-played' component={NotRecentlyPlayedPage} />
        <Route path='never-played' component={NeverPlayedPage} />
        <Route path='tracks' component={AllTracksPage} />
        <Route path='shuffle' component={ShufflePage} />
        <Route path='scan' component={ScanPage} />
        <Route path='*' component={HomePage} />
      </Route>
    </Router>
  </FluxProvider>
);

render(router, document.getElementById('app'));

var React = require('react');
var {render} = require('react-dom')
var {Router, Route, hashHistory} = require('react-router');
var mui = require('material-ui');
var injectTapEventPlugin = require("react-tap-event-plugin");

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var MusicStore = require('./stores/MusicStore');
var {
  PlayerState, ScrobbleState, GaplessPlayer, CurrentTimeSlider,
  secondsToTimeString
} = require('./music-lib');

var {AppBar, Drawer, Paper, IconButton, MenuItem, MuiThemeProvider} = mui;

// A lot of the code is auto-generated. However, fiddling around with it
// shouldn't be a catastrophic failure. Just that you'd need to know your way
// around a little. However, **BE CAREFUL WHILE DELETING SOME OF THE COMMENTS IN
// THIS FILE; THE AUTO-GENERATORS RELY ON SOME OF THEM**.

// inject:pagerequire
var HomePage = require('./pages/HomePage');
var AlbumsPage = require('./pages/AlbumsPage');
var NotRecentlyPlayedPage = require('./pages/NotRecentlyPlayedPage');
var NeverPlayedPage = require('./pages/NeverPlayedPage');
var ShufflePage = require('./pages/ShufflePage');
var ScanPage = require('./pages/ScanPage');
// endinject

/*var menuItems = [
  // inject:menuitems
  { payload: 'home', text: 'Now Playing' },
  { type: MenuItem.Types.SUBHEADER, text: 'Browse' },
  { payload: 'albums', text: 'All Albums' },
  { payload: 'not-recently-played', text: 'Not Recently Played' },
  { payload: 'never-played', text: 'Never Played' },
  { payload: 'shuffle', text: 'Shuffle' },
  { type: MenuItem.Types.SUBHEADER, text: 'Tools' },
  { payload: 'scan', text: 'Scan Files and Metadata' },
  // endinject
];*/

var titles = {
  // inject:titles
  '/': 'Now Playing',
  '/home': 'Now Playing',
  '/albums': 'All Albums',
  '/not-recently-played': 'Not Recently Played',
  '/never-played': 'Never Played',
  '/shuffle': 'Shuffle',
  '/scan': 'Scan Files and Metadata',
  // endinject
};

injectTapEventPlugin();

var LeftNavComponent = React.createClass({
  //mixins: [Router.Navigation],

  render: function () {
    // Optionally, you may add a header to the left navigation bar, by setting
    // the `LeftNav`'s `header` property to a React component, like os:
    //
    //     header={<div className='logo'>Header Title.</div>}
    return (
      <Drawer
        ref="leftNav"
        header={<div className="logo">{"Mike's Music Player"}</div>}
        docked={false}
        open={this.props.open}
        menuItems={this.props.menuItems}
        onClick={this._onLeftNavChange}
        onChange={this._onLeftNavChange} />
    );
  },

  close: function () {
    this.refs.leftNav.close()
  },

  _onLeftNavChange: function(e, selectedIndex, menuItem) {
    this.transitionTo(menuItem.payload);
    this.refs.leftNav.close();
  }
});

var Master = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("MusicStore")],

  /*getChildContext: function() {
    return {
      flux: this.getFlux()
    };
  },

  childContextTypes: {
    flux: React.PropTypes.object
  },*/

  getInitialState() {
    return {
      leftNavOpen: false
    };
  },

  getStateFromFlux: function() {
    return this.getFlux().store("MusicStore").getState();
  },

  _onMenuIconButtonTouchTap: function () {
    this.setState({
      leftNavOpen: !this.state.leftNavOpen
    });
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
      <div className="app-bar-toolbar">
          <GaplessPlayer />

          <CurrentTimeSlider />

          <IconButton iconClassName="icon-previous"
              disabled={!prevButtonEnabled}
              onClick={this.getFlux().actions.jumpToPreviousTrack} />
          <IconButton iconClassName={playOrPause}
              disabled={!playButtonEnabled}
              onClick={this.getFlux().actions.playOrPause} />
          <IconButton iconClassName="icon-stop"
              className={musicStore.willStopAfterCurrent ? "pulsate" : ""}
              disabled={!stopButtonEnabled}
              onClick={this.stopButtonClicked} />
          <IconButton iconClassName="icon-next"
              disabled={!nextButtonEnabled}
              onClick={this.getFlux().actions.jumpToNextTrack} />

          {"volume..."}

          <IconButton iconClassName="icon-lastfm"
              className={musicStore.scrobbleState === ScrobbleState.SCROBBLE_FAILED ? "accent" : ""}
              tooltip={scrobbleTooltip[musicStore.scrobbleState]}
              onClick={this.openLastFm} />
      </div>
    );

    return (
      <MuiThemeProvider>
        <div>
          <AppBar
            className="mui-dark-theme"
            title="Mike's Music Player" /*{titles[this.getPath()]}*/
            onLeftIconButtonTouchTap={this._onMenuIconButtonTouchTap}
            zDepth={1}
            iconElementRight={toolbar}
          />

          <LeftNavComponent open={this.state.leftNavOpen} />

          <div className='mui-app-content-canvas'>
            <Router history={hashHistory}>
              <Route path='/' component={HomePage}>
                <Route path='home' component={HomePage} />
                <Route path='albums' component={AlbumsPage} />
                <Route path='not-recently-played' component={NotRecentlyPlayedPage} />
                <Route path='never-played' component={NeverPlayedPage} />
                <Route path='shuffle' component={ShufflePage} />
                <Route path='scan' component={ScanPage} />
                <Route path='*' component={HomePage} />
              </Route>
            </Router>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
});

var actions = {
    playAlbum: function(album) {
        this.dispatch("PLAY_ALBUM", album);
    },

    enqueueAlbum: function(album) {
        this.dispatch("ENQUEUE_ALBUM", album);
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

render(<Master flux={flux} />, document.getElementById('app'));

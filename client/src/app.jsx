var React = require('react');
var Router = require('react-router');
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

var {Paper, IconButton, MenuItem} = mui;

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

var menuItems = [
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
];

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

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var RouteHandler = Router.RouteHandler;

var AppCanvas = mui.AppCanvas;
var AppBar = mui.AppBar;
var LeftNav = mui.LeftNav;

injectTapEventPlugin();

var LeftNavComponent = React.createClass({
  mixins: [Router.Navigation],

  render: function () {
    // Optionally, you may add a header to the left navigation bar, by setting
    // the `LeftNav`'s `header` property to a React component, like os:
    //
    //     header={<div className='logo'>Header Title.</div>}
    return (
      <LeftNav
        ref="leftNav"
        header={<div className="logo">{"Mike's Music Player"}</div>}
        docked={false}
        isInitiallyOpen={false}
        menuItems={this.props.menuItems}
        onClick={this._onLeftNavChange}
        onChange={this._onLeftNavChange} />
    );
  },

  toggle:function () {
    this.refs.leftNav.toggle();
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
  mixins: [Router.State, FluxMixin, StoreWatchMixin("MusicStore")],

  getStateFromFlux: function() {
    return this.getFlux().store("MusicStore").getState();
  },

  _onMenuIconButtonTouchTap: function () {
    this.refs.leftNav.toggle();
  },

  openLastFm: function() {
    window.open("//last.fm/user/ogreatone43");
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
    scrobbleTooltip[ScrobbleState.TRACK_QUEUED] = "last.fm: track queued for scrobbling.";
    scrobbleTooltip[ScrobbleState.TRACK_SCROBBLED] = "last.fm: track scrobbled.";
    scrobbleTooltip[ScrobbleState.SCROBBLE_FAILED] = "last.fm: scrobble failed!";

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
              disabled={!stopButtonEnabled}
              onClick={this.getFlux().actions.stop} />
          <IconButton iconClassName="icon-hour-glass"
              className={musicStore.willStopAfterCurrent ? "pulsate" : "smaller-icon"}
              disabled={!stopButtonEnabled}
              tooltip="Stop After Current"
              onClick={this.getFlux().actions.toggleStopAfterCurrent} />
          <IconButton iconClassName="icon-next"
              disabled={!nextButtonEnabled}
              onClick={this.getFlux().actions.jumpToNextTrack} />

          <IconButton iconClassName="icon-lastfm"
              tooltip={scrobbleTooltip[musicStore.scrobbleState]}
              onClick={this.openLastFm} />
      </div>
    );

    return (
      <AppCanvas predefinedLayout={1}>

        <AppBar
          className="mui-dark-theme"
          title={titles[this.getPath()]}
          onMenuIconButtonTouchTap={this._onMenuIconButtonTouchTap}
          zDepth={1}>
          {toolbar}
        </AppBar>

        <LeftNavComponent ref='leftNav' menuItems={menuItems} />

        <div className='mui-app-content-canvas'>
          <RouteHandler />
        </div>

      </AppCanvas>
    );
  }
});

var routes = (
  <Route name='app' path='/' handler={Master}>
    {/* inject:route */}
    <Route name='home' handler={HomePage} />
    <Route name='albums' handler={AlbumsPage} />
    <Route name='not-recently-played' handler={NotRecentlyPlayedPage} />
    <Route name='never-played' handler={NeverPlayedPage} />
    <Route name='shuffle' handler={ShufflePage} />
    <Route name='scan' handler={ScanPage} />
    {/* endinject */}
    <DefaultRoute handler={HomePage} />
  </Route>
);

var actions = {
    playAlbum: function(album) {
        this.dispatch("PLAY_ALBUM", album);
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

Router.run(routes, function (Handler) {
  React.render(<Handler flux={flux} />, document.body);
});

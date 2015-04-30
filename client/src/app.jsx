var React = require('react');
var Router = require('react-router');
var mui = require('material-ui');
var injectTapEventPlugin = require("react-tap-event-plugin");

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var MusicStore = require('./stores/MusicStore');
var {PlayerState, GaplessPlayer, secondsToTimeString} = require('./music-lib');

var {Paper, IconButton, MenuItem} = mui;

// A lot of the code is auto-generated. However, fiddling around with it
// shouldn't be a catastrophic failure. Just that you'd need to know your way
// around a little. However, **BE CAREFUL WHILE DELETING SOME OF THE COMMENTS IN
// THIS FILE; THE AUTO-GENERATORS RELY ON SOME OF THEM**.

// inject:pagerequire
var HomePage = require('./pages/HomePage');
var AlbumsPage = require('./pages/AlbumsPage');
var NotRecentlyPlayedPage = require('./pages/NotRecentlyPlayedPage');
// endinject

var menuItems = [
  // inject:menuitems
  { payload: 'home', text: 'Now Playing' },
  { type: MenuItem.Types.SUBHEADER, text: 'Browse' },
  { payload: 'albums', text: 'All Albums' },
  { payload: 'not-recently-played', text: 'Not Recently Played' },
  // endinject
];

var titles = {
  // inject:titles
  '/': 'Now Playing',
  '/home': 'Now Playing',
  '/albums': 'All Albums',
  '/not-recently-played': 'Not Recently Played',
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
        header={<h1>{"Mike's Music Player"}</h1>}
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

  render: function () {
    var musicStore = this.getFlux().store("MusicStore");
    var playButtonEnabled = musicStore.playlist.length > 0;
    var playOrPause = musicStore.playerState === PlayerState.PLAYING ? "icon-pause" : "icon-play"
    var stopButtonEnabled = musicStore.playerState !== PlayerState.STOPPED;
    var prevButtonEnabled = musicStore.playlist.length > 1 &&
        musicStore.nowPlaying > 0;
    var nextButtonEnabled = musicStore.playlist.length > 1 &&
        musicStore.nowPlaying < musicStore.playlist.length - 1;

    var toolbar = (
      <div style={{textAlign:"right"}}>
          <GaplessPlayer />

          <IconButton iconClassName="icon-previous"
              disabled={!prevButtonEnabled}
              onClick={this.getFlux().actions.jumpToPreviousTrack} />
          <IconButton iconClassName={playOrPause}
              disabled={!playButtonEnabled}
              onClick={this.getFlux().actions.playOrPause} />
          <IconButton iconClassName="icon-stop"
              disabled={!stopButtonEnabled}
              onClick={this.getFlux().actions.stop} />
          <IconButton iconClassName="icon-next"
              disabled={!nextButtonEnabled}
              onClick={this.getFlux().actions.jumpToNextTrack} />
      </div>
    );

    var timeIndicator = "";
    if(musicStore.playerState !== PlayerState.STOPPED)
    {
      timeIndicator = " \u2022 " + secondsToTimeString(musicStore.currentTrackPosition);
    }

    return (
      <AppCanvas predefinedLayout={1}>

        <AppBar
          className="mui-dark-theme"
          title={titles[this.getPath()] + timeIndicator}
          onMenuIconButtonTouchTap={this._onMenuIconButtonTouchTap}
          zDepth={0}>
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
    {/* endinject */}
    <DefaultRoute handler={HomePage} />
  </Route>
);

var actions = {
    playAlbum: function(album) {
        this.dispatch("PLAY_ALBUM", album);
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

    jumpToPlaylistItem: function(index) {
        this.dispatch("JUMP_TO_PLAYLIST_ITEM", index);
    },

    jumpToPreviousTrack: function() {
        this.dispatch("JUMP_TO_PREVIOUS_TRACK");
    },

    jumpToNextTrack: function() {
        this.dispatch("JUMP_TO_NEXT_TRACK");
    }
};

var stores = {
    MusicStore: new MusicStore()
};

var flux = new Fluxxor.Flux(stores, actions);

Router.run(routes, function (Handler) {
  React.render(<Handler flux={flux} />, document.body);
});

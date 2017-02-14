var React = require('react');
var {render} = require('react-dom')
var {Router, Route, hashHistory, Link, IndexRoute} = require('react-router');
var mui = require('material-ui');
var injectTapEventPlugin = require("react-tap-event-plugin");

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;
var FluxProvider = require('./lib/FluxProvider');

var MusicStore = require('./stores/MusicStore');
var {
  PlayerState, ScrobbleState, GaplessPlayer, CurrentTimeSlider,
  secondsToTimeString
} = require('./music-lib');

var {AppBar, Divider, Drawer, FontIcon, Paper, IconButton, MenuItem} = mui;
var {colors, getMuiTheme, MuiThemeProvider} = require('material-ui/styles');

var HomePage = require('./pages/HomePage');
var AlbumsPage = require('./pages/AlbumsPage');
var NotRecentlyPlayedPage = require('./pages/NotRecentlyPlayedPage');
var NeverPlayedPage = require('./pages/NeverPlayedPage');
var ShufflePage = require('./pages/ShufflePage');
var ScanPage = require('./pages/ScanPage');

injectTapEventPlugin();

var LinkMenuItem = React.createClass({
  render: function() {
    let icon = <FontIcon className={this.props.iconClassName} />;

    return (
      <MenuItem innerDivStyle={{padding: 0}} leftIcon={icon}>
        <Link to={this.props.to} onClick={this.props.onClick} style={{
          position: 'absolute',
          left: 0,
          right: 0,
          padding: '0px 16px 0px 56px',
          textDecoration: 'none',
          color: 'inherit'
        }}>
          {this.props.children}
        </Link>
      </MenuItem>
    )
  }
});

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

var Master = React.createClass({
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
      trackColor: colors.grey500,
      trackColorSelected: colors.grey300,
      selectionColor: colors.white,
      rippleColor: colors.white,
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
      <MuiThemeProvider muiTheme={this.muiTheme}>
        <div>
          <AppBar
            className="mui-dark-theme"
            title="Mike's Music Player" /*{titles[this.getPath()]}*/
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
          />

          <LeftNavComponent ref='leftNav' />

          <div className='mui-app-content-canvas'>
            {this.props.children}
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

var router = (
  <FluxProvider flux={flux}>
    <Router history={hashHistory}>
      <Route path='/' component={Master}>
        <IndexRoute component={HomePage} />
        <Route path='albums' component={AlbumsPage} />
        <Route path='not-recently-played' component={NotRecentlyPlayedPage} />
        <Route path='never-played' component={NeverPlayedPage} />
        <Route path='shuffle' component={ShufflePage} />
        <Route path='scan' component={ScanPage} />
        <Route path='*' component={HomePage} />
      </Route>
    </Router>
  </FluxProvider>
);

render(router, document.getElementById('app'));

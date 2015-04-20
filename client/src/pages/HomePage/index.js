var React = require('react');

var Fluxxor = require('Fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var mui = require('material-ui');
var RaisedButton = mui.RaisedButton;
var FlatButton = mui.FlatButton;
var Paper = mui.Paper;
var Toolbar = mui.Toolbar;
var ToolbarGroup = mui.ToolbarGroup;
var Tabs = mui.Tabs;
var Tab = mui.Tab;

// If you are going to be using stores, be sure to first load in the `Fluxxor`
// module.
//
//     var Fluxxor = require('Fluxxor');
//
// If you want to leverage the use of stores, a suggestion would be to
// initialize an object, and set it to a `stores` variable, and adding a new
// instance of the store as a property to the object, like so:
//
//     var stores = {
//       SomeStore: new SomeStore()
//     };
//
// And also, because we are using the Flux architecture, you may also initialize
// an object full of methods that represent "actions" that will be called upon
// by a "dispatcher", like so:
//
//     var actions = {
//       doSomething: function (info) {
//         this.dispatch('DO_SOMETHING', {info: info});
//       }
//     };
//
// And finally, you would pass the stores and actions to our dispatcher, like
// so:
//
//     var flux = new Fluxxor.Flux(stores, actions);
//
// And, then, you would pass in the reference of your dispatcher to the view
// relies on the dispatcher (that view is returned by the `render` method), like
// so:
//
//     <SomeView flux={flux} />

var PlayerState = {
    STOPPED: "STOPPED",
    PLAYING: "PLAYING",
    PAUSED: "PAUSED"
}

var MusicStore = Fluxxor.createStore({
    initialize: function() {
        this.albums = [];
        this.api = null;
        this.playerState = PlayerState.STOPPED;
        this.playlist = [];
        this.previouslyPlayed = 0;
        this.nowPlaying = 0;

        $.getJSON("/albums", function(albums) {
            this.albums = albums;
            this.emit("change");
        }.bind(this));

        this.bindActions(
            "PLAY_ALBUM", this.onPlayAlbum,
            "INITIALIZE_PLAYER", this.onInitializePlayer,
            "PLAY_OR_PAUSE_PLAYBACK", this.onPlayOrPausePlayback,
            "STOP_PLAYBACK", this.onStopPlayback
        );
    },

    getState: function() {
        return {
            albums: this.albums,
            playerState: this.playerState,
            playlist: this.playList,
            nowPlaying: this.nowPlaying
        };
    },

    onPlayAlbum: function(album) {
        var query = {
            album_artist: album.album_artist,
            album: album.album
        };

        $.getJSON("/tracks", query, function(tracks) {
            this.onStopPlayback();
            this.setPlaylist(tracks);
            this.onPlayOrPausePlayback();
            this.emit("change");
        }.bind(this));
    },

    onInitializePlayer: function(playerId) {
        this.api = new Gapless5(playerId);

        this.api.onplay = function() {
            console.log("gapless5 onplay");
            this.playerState = PlayerState.PLAYING;
            this.emit("change");
        }.bind(this);

        this.api.onpause = function() {
            console.log("gapless5 onpause");
            this.playerState = PlayerState.PAUSED;
            this.emit("change");
        }.bind(this);

        this.api.onstop = function() {
            console.log("gapless5 onstop");
            this.playerState = PlayerState.STOPPED;
            this.emit("change");
        }.bind(this);

        this.api.onfinishedtrack = function() {
            console.log("gapless5 onfinishedtrack");
            this.onSubmitPreviouslyPlayed();
            this.emit("change");
        }.bind(this);

        this.api.onfinishedall = function() {
            console.log("gapless5 onfinishedall");
            this.playerState = PlayerState.STOPPED;
            this.emit("change");
        }.bind(this);

        this.api.onprev = function() {
            console.log("gapless5 onprev");
            this.previouslyPlayed = this.nowPlaying;
            this.nowPlaying -= 1;
            this.emit("change");
        }.bind(this);

        this.api.onnext = function() {
            console.log("gapless5 onnext");
            this.previouslyPlayed = this.nowPlaying;
            this.nowPlaying += 1;
            this.emit("change");
        }.bind(this);

        this.emit("change");
    },

    onPlayOrPausePlayback: function() {
        if(this.api)
        {
            if(this.playerState === PlayerState.PLAYING)
            {
                this.api.pause();
            }
            else
            {
                this.api.play();
            }

            this.emit("change");
        }
    },

    onStopPlayback: function() {
        if(this.api)
        {
            this.api.stop();
            this.emit("change");
        }
    },

    clearPlaylist: function(tracks)
    {
        this.previouslyPlayed = 0;
        this.nowPlaying = 0;
        this.playlist = [];
        this.api.removeAllTracks();
        this.emit("change");
    },

    setPlaylist: function(tracks) {
        if(this.api)
        {
            this.clearPlaylist();

            for(var i = 0; i < tracks.length; i++)
            {
                this.playlist.push(tracks[i]);
                this.api.addTrack("/stream/" + tracks[i].path);
            }

            this.emit("change");
        }
    },

    onSubmitPreviouslyPlayed: function() {
        var playedTrack = this.playlist[this.previouslyPlayed];
        var postData = {
            id: playedTrack.id
        };
        $.post("submit-play", postData);
    }
});

var stores = {
    MusicStore: new MusicStore()
};

var actions = {
    playAlbum: function(album) {
        this.dispatch("PLAY_ALBUM", album);
    },

    initializePlayer: function(playerId) {
        this.dispatch("INITIALIZE_PLAYER", playerId);
    },

    playOrPause: function() {
        this.dispatch("PLAY_OR_PAUSE_PLAYBACK");
    },

    stop: function() {
        this.dispatch("STOP_PLAYBACK");
    }
};

var flux = new Fluxxor.Flux(stores, actions);

var PlaylistItem = React.createClass({
    mixins: [FluxMixin],

    getDefaultProps: function() {
        return {
            track: null
        };
    },

    render: function() {
        var musicStore = this.getFlux().store("MusicStore");
        var nowPlaying = this.props.track === musicStore.playlist[musicStore.nowPlaying] ? "> " : "";
        return (
            <li>{nowPlaying}{this.props.track.artist} - {this.props.track.title}</li>
        );
    }
})

var Playlist = React.createClass({
    mixins: [FluxMixin],

    render: function() {
        var musicStore = this.getFlux().store("MusicStore");
        var playlistItems = musicStore.playlist.map(track =>
            <PlaylistItem key={track.id} track={track} />);

        return (
            <ol>
                {playlistItems}
            </ol>
        );
    }
})

var AlbumButton = React.createClass({
    mixins: [FluxMixin],

    getDefaultProps: function() {
        return {
            album: null
        };
    },

    render: function() {
        var label = this.props.album.album_artist + " - " + this.props.album.album;

        return <Paper onClick={this.playAlbum}><p>{label}</p></Paper>;
    },

    playAlbum: function() {
        this.getFlux().actions.playAlbum(this.props.album);
    }
});

var AlbumButtonList = React.createClass({
    mixins: [FluxMixin],

    render: function() {
        var musicStore = this.getFlux().store("MusicStore");
        var albumButtons = musicStore.albums.map(album =>
            <AlbumButton key={album.id} album={album} />);

        return (
            <div>
                {albumButtons}
            </div>
        );
    }
});

var GaplessPlayer = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin("MusicStore")],

    getDefaultProps: function() {
        return {
            id: "player"
        };
    },

    componentDidMount: function() {
        this.getFlux().actions.initializePlayer(this.props.id);
    },

    getStateFromFlux: function() {
        return this.getFlux().store("MusicStore").getState();
    },

    render: function() {
        var musicStore = this.getFlux().store("MusicStore");
        var playOrPause = musicStore.playerState === PlayerState.PLAYING ? "Pause" : "Play"
        var stoppable = musicStore.playerState !== PlayerState.STOPPED;

        return (
            <div>
                <Paper>
                    <p id={this.props.id}></p>
                </Paper>

                <Toolbar>
                    <ToolbarGroup key={0}>
                        <FlatButton label={playOrPause} onClick={this.getFlux().actions.playOrPause} />
                        <FlatButton label="Stop" onClick={this.getFlux().actions.stop} disabled={!stoppable}/>
                    </ToolbarGroup>
                </Toolbar>

                <Playlist />

                <AlbumButtonList />
            </div>
        );
    },
});

module.exports = React.createClass({
  render: function () {
    return (
      <div className='home-page'>
        <GaplessPlayer flux={flux} />
      </div>
    );
  }

});

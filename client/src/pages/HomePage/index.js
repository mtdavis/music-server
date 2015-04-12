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

var MusicStore = Fluxxor.createStore({
    initialize: function() {
        this.albums = [];
        this.api = null;

        $.getJSON("/albums", function(albums) {
            this.albums = albums;
            this.emit("change");
        }.bind(this));

        this.bindActions(
            "PLAY_ALBUM", this.onPlayAlbum,
            "INITIALIZE_PLAYER", this.onInitializePlayer
        );
    },

    getState: function() {
        return {
            albums: this.albums
        };
    },

    onPlayAlbum: function(album) {
        var query = {
            album_artist: album.album_artist,
            album: album.album
        };

        $.getJSON("/tracks", query, function(tracks) {
            this.api.stop();
            this.api.removeAllTracks();

            for(var i = 0; i < tracks.length; i++)
            {
                this.api.addTrack("/stream/" + tracks[i].path);
            }

            this.api.play();
        }.bind(this));
    },

    onInitializePlayer: function(playerId) {
        this.api = new Gapless5(playerId);
        this.emit("change");
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
    }
};

var flux = new Fluxxor.Flux(stores, actions);

var AlbumButton = React.createClass({
    mixins: [FluxMixin],

    getDefaultProps: function() {
        return {
            album: null,
            api: null
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

        return (
            <div>
                <Paper>
                    <p id={this.props.id}></p>
                </Paper>

                <Toolbar>
                    <ToolbarGroup key={0}>
                        <FlatButton label="Play" onClick={this.play} />
                        <FlatButton label="Pause" onClick={this.pause} />
                        <FlatButton label="Stop" onClick={this.stop} />
                    </ToolbarGroup>
                </Toolbar>

                <AlbumButtonList />
            </div>
        );
    },

    play: function() {
        if(this.state.api)
        {
            this.state.api.play();
        }
    },

    pause: function() {
        if(this.state.api)
        {
            this.state.api.pause();
        }
    },

    stop: function() {
        if(this.state.api)
        {
            this.state.api.stop();
        }
    }
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

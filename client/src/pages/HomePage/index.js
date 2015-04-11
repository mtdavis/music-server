var React = require('react');
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

var GaplessPlayer = React.createClass({
    getDefaultProps: function() {
        return {
            id: "player"
        };
    },

    getInitialState: function() {
        return {
            api: null,
            albums: []
        };
    },

    componentDidMount: function() {
        var api = new Gapless5(this.props.id);
        this.setState({api: api});

        $.getJSON("/albums", function(albums) {
            if(this.isMounted())
            {
                this.setState({albums: albums});
            }
        }.bind(this));
    },

    playAlbum: function(album) {
        var query = {
            album_artist: album.album_artist,
            album: album.album
        };

        $.getJSON("/tracks", query, function(tracks) {
            this.state.api.stop();
            this.state.api.removeAllTracks();

            for(var i = 0; i < tracks.length; i++)
            {
                this.state.api.addTrack("/stream/" + tracks[i].path);
            }

            this.state.api.play();
        }.bind(this));
    },

    render: function() {
        var albums = this.state.albums.map(function(album){
            var playAlbum = this.playAlbum.bind(this, album);
            var key = album.album_artist + " - " + album.album;

            return (
                <Paper onClick={playAlbum} key={key}><p>{key}</p></Paper>
            );
        }.bind(this));

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

                {albums}
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
        <GaplessPlayer />
      </div>
    );
  }

});

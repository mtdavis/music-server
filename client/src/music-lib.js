var React = require('react');

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);

var mui = require('material-ui');
var Menu = mui.Menu;

var PlayerState = {
    STOPPED: "STOPPED",
    PLAYING: "PLAYING",
    PAUSED: "PAUSED"
};

var GaplessPlayer = React.createClass({
    mixins: [FluxMixin],

    getDefaultProps: function() {
        return {
            id: "player"
        };
    },

    componentDidMount: function() {
        this.getFlux().actions.initializePlayer(this.getDOMNode());
    },

    componentWillUnmount: function() {
        console.log("GaplessPlayer unmounting!");
    },

    render: function() {
        var musicStore = this.getFlux().store("MusicStore");

        return (
            <p id={this.props.id} style={{display:"none"}}></p>
            //<p id={this.props.id} style={{ position:"absolute", right:"20", top:"120" }}></p>
        );
    },
});

var AlbumList = React.createClass({
    mixins: [FluxMixin],

    getDefaultProps: function() {
        return {
            albums: []
        };
    },

    render: function() {
        var albumItems = this.props.albums.map(function(album) {
            return {
                payload: album,
                text: album.album_artist + " - " + album.album
            };
        });

        return (
            <Menu menuItems={albumItems} onItemClick={this.onAlbumClick}/>
        );
    },

    onAlbumClick: function(event, index, item)
    {
        this.getFlux().actions.playAlbum(item.payload);
    }
});

var Playlist = React.createClass({
    mixins: [FluxMixin],

    render: function() {
        var musicStore = this.getFlux().store("MusicStore");

        var playlistItems = musicStore.playlist.map(function(track, index) {
            var icon = "icon-music";

            if(track === musicStore.playlist[musicStore.nowPlaying])
            {
                if(musicStore.playerState === PlayerState.PLAYING)
                {
                    icon = "icon-play2";
                }
                else if(musicStore.playerState === PlayerState.PAUSED)
                {
                    icon = "icon-pause2";
                }
                else if(musicStore.playerState === PlayerState.STOPPED)
                {
                    icon = "icon-stop2";
                }
            }

            return {
                payload: track,
                text: (index + 1) + ". " + track.artist + " - " + track.title,
                iconClassName: icon
            }
        });

        if(playlistItems.length === 0)
        {
            var menuItems = [{text: "The playlist is empty!"}];
            result = <Menu menuItems={menuItems} />
        }
        else
        {
            result = <Menu menuItems={playlistItems} onItemClick={this.onTrackClick}/>
        }

        return result;
    },

    onTrackClick: function(event, index, item)
    {
        this.getFlux().actions.jumpToPlaylistItem(index);
    }
});

var secondsToTimeString = function(seconds)
{
    var minutes = Math.floor(seconds / 60);
    var remainderSeconds = seconds % 60;
    var leadingZero = remainderSeconds < 10 ? "0" : "";
    return minutes + ":" + leadingZero + remainderSeconds;
};

var timeStringToSeconds = function(timeString)
{
    var split = timeString.split(":");
    var minutes = parseInt(split[0], 10);
    var seconds = parseInt(split[1], 10);
    return minutes * 60 + seconds;
};

module.exports = {
    PlayerState: PlayerState,
    GaplessPlayer: GaplessPlayer,
    AlbumList: AlbumList,
    Playlist: Playlist,
    secondsToTimeString: secondsToTimeString,
    timeStringToSeconds: timeStringToSeconds
};

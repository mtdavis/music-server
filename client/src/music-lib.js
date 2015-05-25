var React = require('react');

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);

var mui = require('material-ui');
var {Menu, Slider} = mui;

var DataTable = require('./material-data-table');

var PlayerState = {
    STOPPED: "STOPPED",
    PLAYING: "PLAYING",
    PAUSED: "PAUSED"
};

var ScrobbleState = {
    NO_TRACK: "NO_TRACK",
    TRACK_QUEUED: "TRACK_QUEUED",
    TRACK_SCROBBLED: "TRACK_SCROBBLED",
    SCROBBLE_FAILED: "SCROBBLE_FAILED"
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
        var columns = [
            {key:"album_artist", header:"Artist"},
            {key:"album", header:"Album"},
            {key:"year", header:"Year"},
            {key:"tracks", header:"Tracks"},
            {key:"duration", header:"Length", renderer:secondsToTimeString},
            {key:"play_count", header:"Play Count"},
            {key:"last_play", header:"Last Played", renderer:unixTimestampToDateString}
        ];

        return (
            <DataTable rows={this.props.albums} columns={columns} onRowClick={this.onAlbumClick}/>
        );
    },

    onAlbumClick: function(album)
    {
        this.getFlux().actions.playAlbum(album);
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
            result = <Menu menuItems={menuItems} autoWidth={false} />
        }
        else
        {
            result = <Menu menuItems={playlistItems} onItemClick={this.onTrackClick} autoWidth={false} />
        }

        return result;
    },

    onTrackClick: function(event, index, item)
    {
        this.getFlux().actions.jumpToPlaylistItem(index);
    }
});

var CurrentTimeSlider = React.createClass({
    mixins: [FluxMixin],

    getInitialState: function() {
        return {
            dragging: false
        };
    },

    render: function() {
        var musicStore = this.getFlux().store("MusicStore");

        var timeIndicator = <div />;
        var slider = <div />;

        if(musicStore.playerState !== PlayerState.STOPPED)
        {
            var duration = musicStore.playlist[musicStore.nowPlaying].duration;

            var timeString = secondsToTimeString(musicStore.currentTrackPosition);

            //strip off decimal
            if(timeString.indexOf(".") > -1)
            {
                timeString = timeString.split(".")[0];
            }

            timeIndicator = (
                <div className="time-label">
                    {timeString}
                </div>
            );

            var value = this.state.dragging ? undefined : musicStore.currentTrackPosition;

            slider = (
                <Slider
                    className="time-slider"
                    name="currentTime"
                    min={0}
                    max={duration}
                    value={value}
                    onChange={this.onSliderChange}
                    onDragStart={this.onSliderDragStart}
                    onDragStop={this.onSliderDragStop}
                />
            );
        }

        return (
            <div className="time-wrapper">
                {slider}
                {timeIndicator}
            </div>
        );
    },

    onSliderChange(event, value)
    {
        if(!this.state.dragging)
        {
            console.log(value);
            this.getFlux().actions.seekToPosition(value);
        }
    },

    onSliderDragStart()
    {
        this.setState({
            dragging: true
        });
    },

    onSliderDragStop()
    {
        this.setState({
            dragging: false
        });
    }
})

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
    var seconds = Number(split[1]);
    return minutes * 60 + seconds;
};

var unixTimestampToDateString = function(timestamp)
{
    var dateObj = new Date(timestamp * 1000);

    var year = dateObj.getFullYear();

    var month = dateObj.getMonth()+1;
    if(month < 10)
    {
        month = "0" + month;
    }

    var date = dateObj.getDate();
    if(date < 10)
    {
        date = "0" + date;
    }

    return year + "-" + month + "-" + date;
}

module.exports = {
    PlayerState: PlayerState,
    ScrobbleState: ScrobbleState,
    GaplessPlayer: GaplessPlayer,
    AlbumList: AlbumList,
    Playlist: Playlist,
    CurrentTimeSlider: CurrentTimeSlider,
    secondsToTimeString: secondsToTimeString,
    timeStringToSeconds: timeStringToSeconds
};

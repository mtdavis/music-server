var React = require('react');

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);

var mui = require('material-ui');
var {IconButton, Menu, Slider} = mui;
var {ClickAwayable} = mui.Mixins;

var DataTable = require('./material-data-table');
var VerticalSlider = require('./lib/vertical-slider');

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
            {key:"year", header:"Year", textAlign:"right"},
            {key:"tracks", header:"Tracks", textAlign:"right"},
            {key:"duration", header:"Length", renderer:secondsToTimeString, textAlign:"right"},
            {key:"play_count", header:"Play Count", textAlign:"right"},
            {key:"last_play", header:"Last Played", renderer:unixTimestampToDateString, textAlign:"right"}
        ];

        return (
            <DataTable
                {...this.props}
                rows={this.props.albums}
                columns={columns}
                onRowClick={this.onAlbumClick}
            />
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

        //check whether all artists are equal.
        var allArtistsEqual = true;
        var artist = null;
        for(var i = 0; i < musicStore.playlist.length; i++)
        {
            if(artist === null)
            {
                artist = musicStore.playlist[i].artist;
            }
            else if(artist !== musicStore.playlist[i].artist)
            {
                allArtistsEqual = false;
            }
        }

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

            var text = allArtistsEqual ?
                (index + 1) + ". " + track.title :
                (index + 1) + ". " + track.artist + " - " + track.title;

            return {
                id: index,
                icon: icon,
                text: text,
                duration: track.duration
            };
        });

        var columns = [
            {key:"icon", renderer:"icon"},
            {key:"text"},
            {key:"duration", renderer:secondsToTimeString, textAlign:"right"}
        ];

        return (
            <DataTable
                rows={playlistItems}
                showHeader={false}
                showFilter={false}
                responsive={false}
                condensed={true}
                columns={columns}
                onRowClick={this.onTrackClick}
                placeholderText={"The playlist is empty!"}
            />
        );
    },

    onTrackClick: function(item)
    {
        this.getFlux().actions.jumpToPlaylistItem(item.id);
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
});

var VolumeButton = React.createClass({
    mixins: [ClickAwayable],

    componentClickAway: function() {
        this.setState({
            volumeSliderVisible: false
        });
    },

    getInitialState: function() {
        return {
            volume: .5,
            volumeSliderVisible: false
        };
    },

    render: function() {
        var className = "volume-slider mui-paper mui-z-depth-2";
        if(this.state.volumeSliderVisible)
        {
            className += " open"
        }

        var iconClassName;
        if(this.state.volume < .01)
        {
            iconClassName = "icon-volume-mute";
        }
        else if(this.state.volume < .33)
        {
            iconClassName = "icon-volume-low";
        }
        else if(this.state.volume < .67)
        {
            iconClassName = "icon-volume-medium";
        }
        else
        {
            iconClassName = "icon-volume-high";
        }

        return (
            <div className="volume-button-wrapper">
                <IconButton iconClassName={iconClassName} onClick={this.toggleVolumeSlider} />
                <div className={className}>
                    <IconButton iconClassName={iconClassName} onClick={this.toggleVolumeSlider} />
                    <VolumeSlider onVolumeChange={this.onVolumeChange} />
                </div>
            </div>
        );
    },

    toggleVolumeSlider: function() {
        this.setState({
            volumeSliderVisible: !this.state.volumeSliderVisible
        });
    },

    onVolumeChange: function(volume) {
        this.setState({
            volume: volume
        });
    }
});

var VolumeSlider = React.createClass({
    mixins: [FluxMixin],

    getDefaultProps: function()
    {
        return {
            name: "bob"
        };
    },

    render: function()
    {
        return (
            <VerticalSlider
                name={this.props.name}
                min={0}
                max={1}
                defaultValue={.5}
                height={200}
                onChange={this.onSliderChange}
            />
        );
    },

    onSliderChange(event, value)
    {
        this.getFlux().actions.setVolume(value);
        if(this.props.onVolumeChange)
        {
            this.props.onVolumeChange(value);
        }
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
    VolumeButton: VolumeButton,
    VolumeSlider: VolumeSlider,
    secondsToTimeString: secondsToTimeString,
    timeStringToSeconds: timeStringToSeconds
};

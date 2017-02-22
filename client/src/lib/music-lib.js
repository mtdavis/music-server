var React = require('react');
var ReactDOM = require('react-dom');

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);

var mui = require('material-ui');
var {IconButton, Menu, Slider, Snackbar, AppBar, Popover} = mui;
var {muiThemeable} = require('material-ui/styles');
var {PopoverAnimationVertical} = require('material-ui/Popover');

var DataTable = require('./table/material-data-table');

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
        this.getFlux().actions.initializePlayer(ReactDOM.findDOMNode(this));
    },

    componentWillUnmount: function() {
        console.log("GaplessPlayer unmounting!");
    },

    render: function() {
        var musicStore = this.getFlux().store("MusicStore");

        return (
            <p id={this.props.id} style={{display:"none"}}></p>
            // <p id={this.props.id} style={{ position:"absolute", right:20, top:120 }}></p>
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

    getInitialState: function() {
        return {
            enqueueSnackbarOpen: false
        };
    },

    render: function() {
        var columns = [
            {key:"album_artist", header:"Album Artist"},
            {key:"album", header:"Album"},
            {key:"year", header:"Year", textAlign:"right"},
            {key:"tracks", header:"Tracks", textAlign:"right"},
            {key:"duration", header:"Duration", renderer:secondsToTimeString, textAlign:"right", wrap:false},
            {key:"play_count", header:"Play Count", textAlign:"right"},
            {key:"last_play", header:"Last Play", renderer:unixTimestampToDateString, textAlign:"right", wrap:false}
        ];

        return (
            <div>
                <DataTable
                    {...this.props}
                    rows={this.props.albums}
                    columns={columns}
                    onRowClick={this.onAlbumClick}
                    onRowCtrlClick={this.onAlbumCtrlClick}
                    condensed={true}
                />

                <Snackbar
                    message="Album enqueued."
                    open={this.state.enqueueSnackbarOpen}
                />
            </div>
        );
    },

    onAlbumClick: function(album)
    {
        this.getFlux().actions.playAlbum(album);
    },

    onAlbumCtrlClick: function(album)
    {
        this.setState({enqueueSnackbarOpen: true});
        this.getFlux().actions.enqueueAlbum(album);

        setTimeout(() => {
            this.setState({enqueueSnackbarOpen: false});
        }, 2000);
    }
});

var Playlist = React.createClass({
    mixins: [FluxMixin],

      contextTypes: {
          flux: React.PropTypes.object
      },

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

var CurrentTimeSlider = muiThemeable()(React.createClass({
    mixins: [FluxMixin],

    getInitialState: function() {
        return {
            dragging: false,
            draggingValue: 0
        };
    },

    render: function() {
        var musicStore = this.getFlux().store("MusicStore");

        var timeString = "0:00";
        var sliderValue = 0;
        var sliderMax = 1;
        var sliderDisabled = true;

        var timeLabelStyles = {
            color: this.props.muiTheme.palette.disabledColor,
            fontWeight: this.props.muiTheme.appBar.titleFontWeight,
            height: this.props.muiTheme.appBar.height,
            lineHeight: this.props.muiTheme.appBar.height + 'px',
            paddingTop: 0,
            paddingRight: this.props.muiTheme.padding,
            paddingBottom: 0,
            paddingLeft: this.props.muiTheme.padding,
            margin: 0,
            fontSize: 24
        };

        if(musicStore.playerState !== PlayerState.STOPPED)
        {
            var currentTrackDuration = musicStore.playlist[musicStore.nowPlaying].duration;
            timeLabelStyles.color = this.props.muiTheme.appBar.textColor;

            if(this.state.dragging)
            {
                sliderValue = undefined;
                timeString = secondsToTimeString(this.state.draggingValue);
            }
            else
            {
                sliderValue = musicStore.currentTrackPosition;
                timeString = secondsToTimeString(musicStore.currentTrackPosition);
            }

            //strip off decimal
            if(timeString.indexOf(".") > -1)
            {
                timeString = timeString.split(".")[0];
            }

            sliderMax = currentTrackDuration;
            sliderDisabled = false;
        }

        return (
            <div className="time-wrapper">
                <Slider
                    className="time-slider"
                    name="currentTime"
                    min={0}
                    max={sliderMax}
                    value={sliderValue}
                    disabled={sliderDisabled}
                    onChange={this.onSliderChange}
                    onDragStart={this.onSliderDragStart}
                    onDragStop={this.onSliderDragStop}
                />

                <h1 className={'time-label'} style={timeLabelStyles}>
                    {timeString}
                </h1>
            </div>
        );
    },

    onSliderChange(event, value)
    {
        if(this.state.dragging)
        {
            this.setState({draggingValue: value});
        }
        else
        {
            this.getFlux().actions.seekToPosition(value);
        }
    },

    onSliderDragStart()
    {
        var musicStore = this.getFlux().store("MusicStore");
        this.setState({
            dragging: true,
            draggingValue: musicStore.currentTrackPosition
        });
    },

    onSliderDragStop()
    {
        this.getFlux().actions.seekToPosition(this.state.draggingValue);
        this.setState({
            dragging: false,
            draggingValue: 0
        });
    }
}));

var AppBarIconButton = muiThemeable()(React.createClass({
  render: function() {
    var color = this.props.disabled ?
      this.props.muiTheme.palette.disabledColor :
      this.props.muiTheme.appBar.textColor;
    var {muiTheme, ...props} = this.props;
    return (
      <IconButton
        style={{marginTop: 8}}
        iconStyle={{color: color}}
        {...props} />
    );
  }
}));

var VolumeButton = React.createClass({
    mixins: [FluxMixin],

    getInitialState: function() {
        return {
            volume: .5,
            volumePopoverVisible: false
        };
    },

    render: function() {
        var iconClassName;
        if(this.state.volume < .01) {
            iconClassName = "icon-volume-mute";
        }
        else if(this.state.volume < .33) {
            iconClassName = "icon-volume-low";
        }
        else if(this.state.volume < .67) {
            iconClassName = "icon-volume-medium";
        }
        else {
            iconClassName = "icon-volume-high";
        }

        return (
            <div>
                <div ref='button'>
                    <AppBarIconButton
                        iconClassName={iconClassName}
                        onClick={this.toggleVolumePopover} />
                </div>

                <Popover
                    open={this.state.volumePopoverVisible}
                    onRequestClose={this.handleRequestClose}
                    anchorEl={this.refs.button}
                    animation={PopoverAnimationVertical}
                    anchorOrigin={{horizontal:"middle", vertical:"bottom"}}
                    targetOrigin={{horizontal:"middle", vertical:"top"}}
                    style={{transformOrigin: 'center top'}}
                    zDepth={2}>
                    <Slider
                        style={{height: 100, margin: '24px 12px'}}
                        axis='y'
                        value={this.state.volume}
                        onChange={this.onVolumeChange} />
                </Popover>
            </div>
        );
    },

    toggleVolumePopover: function() {
        this.setState({
            volumePopoverVisible: !this.state.volumePopoverVisible
        });
    },

    handleRequestClose: function() {
        this.setState({
            volumePopoverVisible: false
        });
    },

    onVolumeChange: function(event, newVolume) {
        this.getFlux().actions.setVolume(newVolume);
        this.setState({
            volume: newVolume
        });
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
    AppBarIconButton: AppBarIconButton,
    VolumeButton: VolumeButton,
    secondsToTimeString: secondsToTimeString,
    timeStringToSeconds: timeStringToSeconds
};

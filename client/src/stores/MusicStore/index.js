var Fluxxor = require('fluxxor');
var {PlayerState, ScrobbleState, timeStringToSeconds} = require('../../music-lib');

module.exports = Fluxxor.createStore({

    initialize: function() {
        this.albums = [];
        this.albumsNotRecentlyPlayed = [];
        this.api = null;
        this.playerState = PlayerState.STOPPED;
        this.playlist = [];
        this.nowPlaying = 0;
        this.currentTrackPosition = 0;
        this.scrobbleState = ScrobbleState.NO_TRACK;
        this.scrobblePlayTimer = null;
        this.scrobbleNowPlayingTimer = null;

        $.getJSON("/albums", function(albums) {
            this.albums = albums;
            this.emit("change");
        }.bind(this));

        $.getJSON("/albums/not-recently-played", function(albumsNotRecentlyPlayed) {
            this.albumsNotRecentlyPlayed = albumsNotRecentlyPlayed;
            this.emit("change");
        }.bind(this));

        this.bindActions(
            "PLAY_ALBUM", this.onPlayAlbum,
            "INITIALIZE_PLAYER", this.onInitializePlayer,
            "PLAY_OR_PAUSE_PLAYBACK", this.onPlayOrPausePlayback,
            "STOP_PLAYBACK", this.onStopPlayback,
            "JUMP_TO_PREVIOUS_TRACK", this.onJumpToPreviousTrack,
            "JUMP_TO_NEXT_TRACK", this.onJumpToNextTrack,
            "JUMP_TO_PLAYLIST_ITEM", this.onJumpToPlaylistItem
        );
    },

    getState: function() {
        return {
            albums: this.albums,
            albumsNotRecentlyPlayed: this.albumsNotRecentlyPlayed,
            playerState: this.playerState,
            scrobbleState: this.scrobbleState,
            playlist: this.playList,
            nowPlaying: this.nowPlaying,
            currentTrackPosition: this.currentTrackPosition
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
            location.hash = "home";
            this.emit("change");
        }.bind(this));
    },

    onInitializePlayer: function(playerNode) {
        this.api = new Gapless5(playerNode.id);

        this.api.onplay = function() {
            this.playerState = PlayerState.PLAYING;

            //avoid restarting the scrobble timers, in case of player state moving from paused to play
            if(this.scrobbleState === ScrobbleState.NO_TRACK)
            {
                this.startScrobbleTimers();
            }

            this.emit("change");
        }.bind(this);

        this.api.onpause = function() {
            this.playerState = PlayerState.PAUSED;
            this.emit("change");
        }.bind(this);

        this.api.onstop = function() {
            this.playerState = PlayerState.STOPPED;
            this.clearScrobbleTimers();
            this.emit("change");
        }.bind(this);

        this.api.onfinishedtrack = function() {
            this.emit("change");
        }.bind(this);

        this.api.onfinishedall = function() {
            this.playerState = PlayerState.STOPPED;
            this.clearScrobbleTimers();
            this.emit("change");
        }.bind(this);

        this.api.onprev = function() {
            this.nowPlaying -= 1;
            this.clearScrobbleTimers();
            this.startScrobbleTimers();
            this.emit("change");
        }.bind(this);

        this.api.onnext = function() {
            this.nowPlaying += 1;
            this.clearScrobbleTimers();
            this.startScrobbleTimers();
            this.emit("change");
        }.bind(this);

        var currentPositionNode = playerNode.querySelector(".g5position span:nth-child(1)");
        var trackIndexNode = playerNode.querySelector(".g5position span:nth-child(3)");

        var observer = new MutationObserver(function(mutationRecords)
        {
            for(var i = 0; i < mutationRecords.length; i++)
            {
                var mutation = mutationRecords[i];
                if(mutation.target === currentPositionNode)
                {
                    var timeString = mutation.addedNodes[0].textContent.substr(0, 5);
                    var newTrackPosition = timeStringToSeconds(timeString);
                    if(newTrackPosition !== this.currentTrackPosition)
                    {
                        this.currentTrackPosition = newTrackPosition;
                        this.emit("change");
                    }
                }
            }
        }.bind(this));

        observer.observe(currentPositionNode, {
            childList: true,
            subtree: true
        });

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

    onJumpToPlaylistItem: function(index) {
        if(this.api)
        {
            this.nowPlaying = index;
            this.api.gotoTrack(index, true);
            this.api.onplay();
            this.emit("change");
        }
    },

    onJumpToPreviousTrack: function() {
        if(this.api)
        {
            this.api.prevtrack();
            this.emit("change");
        }
    },

    onJumpToNextTrack: function() {
        if(this.api)
        {
            this.api.next();
            this.emit("change");
        }
    },

    startScrobbleTimers: function() {
        if(this.playerState === PlayerState.PLAYING)
        {
            this.clearScrobbleTimers();

            var trackStartedPlaying = Math.floor(Date.now() / 1000);
            var trackToScrobble = this.playlist[this.nowPlaying];

            var nowPlayingDelayMs = 5000;

            if(trackToScrobble.duration * 1000 > nowPlayingDelayMs)
            {
                //submit the now-playing update in 5 seconds if it's still playing.
                this.scrobbleNowPlayingTimer = setTimeout(function()
                {
                    if(trackToScrobble === this.playlist[this.nowPlaying] &&
                        this.playerState !== PlayerState.STOPPED)
                    {
                        var postData = {
                            id: trackToScrobble.id
                        };
                        $.post("/submit-now-playing", postData);
                    }

                    this.scrobbleNowPlayingTimer = null;
                }.bind(this), nowPlayingDelayMs);
            }

            //submit the play in (duration / 2) seconds if it's still playing.
            var playDelayMs = trackToScrobble.duration / 2.0 * 1000;
            this.scrobblePlayTimer = setTimeout(function()
            {
                if(trackToScrobble === this.playlist[this.nowPlaying] &&
                    this.playerState !== PlayerState.STOPPED)
                {
                    var postData = {
                        id: trackToScrobble.id,
                        started_playing: trackStartedPlaying
                    };

                    $.post("/submit-play", postData).done(function()
                    {
                        this.scrobbleState = ScrobbleState.TRACK_SCROBBLED;
                    }.bind(this)).fail(function()
                    {
                        this.scrobbleState = ScrobbleState.SCROBBLE_FAILED;
                    }.bind(this));

                    this.emit("change");
                }

                this.scrobblePlayTimer = null;
            }.bind(this), playDelayMs);

            this.scrobbleState = ScrobbleState.TRACK_QUEUED;
            this.emit("change");
        }
    },

    clearScrobbleTimers: function() {
        this.scrobbleState = ScrobbleState.NO_TRACK;

        if(this.scrobblePlayTimer)
        {
            clearTimeout(this.scrobblePlayTimer);
            this.scrobblePlayTimer = null;
            this.emit("change");
        }

        if(this.scrobbleNowPlayingTimer)
        {
            clearTimeout(this.scrobbleNowPlayingTimer);
            this.scrobbleNowPlayingTimer = null;
            this.emit("change");
        }
    },
});

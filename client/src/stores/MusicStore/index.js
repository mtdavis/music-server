var Fluxxor = require('Fluxxor');
var {PlayerState} = require('../../music-lib');

module.exports = Fluxxor.createStore({

    initialize: function() {
        this.albums = [];
        this.albumsNotRecentlyPlayed = [];
        this.api = null;
        this.playerState = PlayerState.STOPPED;
        this.playlist = [];
        this.previouslyPlayed = 0;
        this.nowPlaying = 0;

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
            this.onSubmitNowPlaying();
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
            this.onSubmitNowPlaying();
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
            this.onSubmitNowPlaying();
            this.emit("change");
        }.bind(this);

        this.api.onnext = function() {
            console.log("gapless5 onnext");
            this.previouslyPlayed = this.nowPlaying;
            this.nowPlaying += 1;
            this.onSubmitNowPlaying();
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

    onSubmitPreviouslyPlayed: function() {
        var playedTrack = this.playlist[this.previouslyPlayed];
        var postData = {
            id: playedTrack.id
        };
        $.post("submit-play", postData);
    },

    onSubmitNowPlaying: function() {
        if(this.playerState === PlayerState.PLAYING)
        {
            var playingTrack = this.playlist[this.nowPlaying];
            var postData = {
                id: playingTrack.id
            };
            $.post("submit-now-playing", postData);
        }
    }

});

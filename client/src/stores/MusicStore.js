import Fluxxor from 'fluxxor';
import weighted from 'weighted';
import PlayerState from '../lib/PlayerState';
import ScrobbleState from '../lib/ScrobbleState';
import {timeStringToSeconds} from '../lib/util';

module.exports = Fluxxor.createStore({

    initialize: function() {
        this.albums = [];
        this.tracks = [];
        this.api = null;
        this.playerState = PlayerState.STOPPED;
        this.playlist = [];
        this.nowPlaying = 0;
        this.currentTrackPosition = 0;
        this.scrobbleState = ScrobbleState.NO_TRACK;
        this.scrobblePlayTimer = null;
        this.scrobbleNowPlayingTimer = null;
        this.willStopAfterCurrent = false;
        this.lyrics = null;

        $.getJSON("/albums", function(albums) {
            this.albums = albums;
            this.emit("change");
        }.bind(this));

        $.getJSON("/tracks", function(tracks) {
            this.tracks = tracks;
            this.emit("change");
        }.bind(this));

        this.bindActions(
            "PLAY_ALBUM", this.onPlayAlbum,
            "ENQUEUE_ALBUM", this.onEnqueueAlbum,
            "PLAY_TRACK", this.onPlayTrack,
            "ENQUEUE_TRACK", this.onEnqueueTrack,
            "PLAY_SHUFFLE", this.onPlayShuffle,
            "INITIALIZE_PLAYER", this.onInitializePlayer,
            "PLAY_OR_PAUSE_PLAYBACK", this.onPlayOrPausePlayback,
            "STOP_PLAYBACK", this.onStopPlayback,
            "TOGGLE_STOP_AFTER_CURRENT", this.onToggleStopAfterCurrent,
            "JUMP_TO_PREVIOUS_TRACK", this.onJumpToPreviousTrack,
            "JUMP_TO_NEXT_TRACK", this.onJumpToNextTrack,
            "JUMP_TO_PLAYLIST_ITEM", this.onJumpToPlaylistItem,
            "SEEK_TO_POSITION", this.onSeekToPosition,
            "SET_VOLUME", this.onSetVolume,
            "SCAN_FOR_CHANGED_METADATA", this.onScanForChangedMetadata,
            "SCAN_FOR_MOVED_FILES", this.onScanForMovedFiles,
            "SCAN_FOR_NEW_FILES", this.onScanForNewFiles,
            "GET_LYRICS", this.onGetLyrics,
        );
    },

    getState: function() {
        return {
            albums: this.albums,
            tracks: this.tracks,
            playerState: this.playerState,
            willStopAfterCurrent: this.willStopAfterCurrent,
            scrobbleState: this.scrobbleState,
            playlist: this.playList,
            nowPlaying: this.nowPlaying,
            currentTrackPosition: this.currentTrackPosition,
            lyrics: this.lyrics,
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
            location.hash = "/";
            this.emit("change");
        }.bind(this));
    },

    onEnqueueAlbum: function(album) {
        var query = {
            album_artist: album.album_artist,
            album: album.album
        };

        $.getJSON("/tracks", query, function(tracks)
        {
            for(var i = 0; i < tracks.length; i++)
            {
                this.playlist.push(tracks[i]);
                var path = tracks[i].path.replace(/#/, "%23");
                this.api.addTrack("/stream/" + path);
            }

            this.emit("change");
        }.bind(this));
    },

    onPlayTrack: function(track) {
        this.onStopPlayback();
        this.setPlaylist([track]);
        this.onPlayOrPausePlayback();
        this.emit("change");
    },

    onEnqueueTrack: function(track) {
        this.playlist.push(track);
        var path = track.path.replace(/#/, "%23");
        this.api.addTrack("/stream/" + path);
        this.emit("change");
    },

    onPlayShuffle: function(minutes) {
        $.getJSON("/shuffle", function(tracks) {
            //tracks are assumed to be ordered by last_play
            var weights = {};
            for(var i = 0; i < tracks.length; i++)
            {
                weights[i] = 1.0 / (i + 1);
            }

            var tracksToEnqueue = [];
            var secondsToFill = minutes * 60;
            var enqueuedSeconds = 0;

            while(enqueuedSeconds < secondsToFill && tracks.length > 0)
            {
                var index = weighted.select(weights);
                if(tracks[index])
                {
                    var track = tracks[index];
                    delete tracks[index];
                    delete weights[index];
                    tracksToEnqueue.push(track);
                    enqueuedSeconds += track.duration;
                }
            }

            this.onStopPlayback();
            this.setPlaylist(tracksToEnqueue);
            this.onPlayOrPausePlayback();
            location.hash = "home";
            this.emit("change");
        }.bind(this));
    },

    onScanForChangedMetadata: function()
    {
        $.post("/tools/scan-for-changed-metadata");
    },

    onScanForMovedFiles: function()
    {
        $.post("/tools/scan-for-moved-files");
    },

    onScanForNewFiles: function()
    {
        $.post("/tools/scan-for-new-files");
    },


    onInitializePlayer: function(playerNode) {
        this.api = new Gapless5(playerNode.id);
        this.onSetVolume(.5);

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
            this.willStopAfterCurrent = false;
            this.clearScrobbleTimers();
            this.emit("change");
        }.bind(this);

        this.api.onfinishedtrack = function() {
            if(this.willStopAfterCurrent)
            {
                this.onStopPlayback();
                this.willStopAfterCurrent = false;
            }
            this.emit("change");
        }.bind(this);

        this.api.onfinishedall = function() {
            this.playerState = PlayerState.STOPPED;
            this.willStopAfterCurrent = false;
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
                var timeString;
                if(mutation.target === currentPositionNode)
                {
                    //Firefox
                    timeString = mutation.addedNodes[0].textContent;
                }
                else if(mutation.target.parentElement === currentPositionNode)
                {
                    //Webkit
                    timeString = mutation.target.textContent;
                }

                if(timeString)
                {
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
            subtree: true,
            characterData: true
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

    onToggleStopAfterCurrent: function() {
        if(this.api)
        {
            this.willStopAfterCurrent = !this.willStopAfterCurrent;
            this.emit("change");
        }
    },

    clearPlaylist: function(tracks)
    {
        this.willStopAfterCurrent = false;
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
                var path = tracks[i].path.replace(/#/, "%23");
                this.api.addTrack("/stream/" + path);
            }

            this.emit("change");
        }
    },

    onJumpToPlaylistItem: function(index) {
        if(this.api)
        {
            this.willStopAfterCurrent = false;
            this.nowPlaying = index;
            this.api.gotoTrack(index, true);
            this.api.onplay();
            this.emit("change");
        }
    },

    onJumpToPreviousTrack: function() {
        if(this.api)
        {
            this.willStopAfterCurrent = false;
            this.api.prevtrack();
            this.emit("change");
        }
    },

    onJumpToNextTrack: function() {
        if(this.api)
        {
            this.willStopAfterCurrent = false;
            this.api.next();
            this.emit("change");
        }
    },

    onSeekToPosition: function(position) {
        if(this.api)
        {
            var duration = this.playlist[this.nowPlaying].duration;

            if(position < 0)
            {
                position = 0;
            }

            if(position > duration)
            {
                position = duration;
            }

            //Gapless5 player has a resolution of 65535 slices.
            var seekTo = Math.floor(position / duration * 65535);

            //But if you seek to the last slice it will instead go to slice 0.
            if(seekTo === 65535)
            {
                seekTo = 65534;
            }
            this.api.scrub(seekTo);
        }
    },

    onSetVolume: function(volume) {
        if(this.api)
        {
            if(volume < 0)
            {
                volume = 0;
            }

            if(volume > 1)
            {
                volume = 1;
            }

            try
            {
                //Gapless5 takes a value between 0 and 65535.
                this.api.setGain(Math.floor(volume * 65535));
            }
            catch(ex)
            {
                //Gapless 5 throws an exception if you set the gain while tracklist is empty;
                //but it will still work.
            }
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
                        this.emit("change");
                    }.bind(this)).fail(function()
                    {
                        this.scrobbleState = ScrobbleState.SCROBBLE_FAILED;
                        this.emit("change");
                    }.bind(this));
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

    onGetLyrics: function() {
        if(this.playlist.length > 0) {
            this.lyrics = 'Loading...';
            this.emit("change");

            let nowPlayingId = this.playlist[this.nowPlaying].id;
            $.ajax("/lyrics", {
                data: {id: nowPlayingId},
                success: function(lyrics) {
                    this.lyrics = lyrics;
                    this.emit("change");
                }.bind(this),
                error: function(error) {
                    this.lyrics = 'There was a problem retrieving the lyrics.';
                    this.emit("change");
                }.bind(this)
            });
        }
        else if(this.lyrics !== null) {
            this.lyrics = null;
            this.emit("change");
        }
    },
});

import {observable} from 'mobx';
import weighted from 'weighted';
import PlayerState from '../lib/PlayerState';
import ScrobbleState from '../lib/ScrobbleState';
import {timeStringToSeconds} from '../lib/util';

export default class MusicStore {
  @observable api = null;
  @observable playerState = PlayerState.STOPPED;
  @observable playlist = [];
  @observable nowPlaying = 0;
  @observable currentTrackPosition = 0;
  @observable trackPositionUpdateTimer = null;
  @observable willStopAfterCurrent = false;

  // scrobble items
  @observable scrobbleState = ScrobbleState.NO_TRACK;
  @observable scrobblePlayTimer = null;
  @observable scrobbleNowPlayingTimer = null;

  playAlbum(album) {
    const query = {
      album_artist: album.album_artist,
      album: album.album
    };

    $.getJSON("/tracks", query, (tracks) => {
      this.stopPlayback();
      this.setPlaylist(tracks);
      this.playOrPausePlayback();
      location.hash = "/";
    });
  }

  enqueueAlbum(album) {
    const query = {
      album_artist: album.album_artist,
      album: album.album
    };

    $.getJSON("/tracks", query, (tracks) => {
      for(let i = 0; i < tracks.length; i++) {
        this.playlist.push(tracks[i]);
        const path = tracks[i].path.replace(/#/, "%23");
        this.api.addTrack("/stream/" + path);
      }

    });
  }

  playPlaylist(playlist) {
    const query = {
      playlist_id: playlist.id
    };

    $.getJSON("/playlist-tracks", query, (tracks) => {
      this.stopPlayback();
      this.setPlaylist(tracks);
      this.playOrPausePlayback();
      location.hash = "/";
    });
  }

  playTrack(track) {
    this.stopPlayback();
    this.setPlaylist([track]);
    this.playOrPausePlayback();
  }

  enqueueTrack(track) {
    this.playlist.push(track);
    const path = track.path.replace(/#/, "%23");
    this.api.addTrack("/stream/" + path);
  }

  playShuffle(minutes) {
    $.getJSON("/shuffle", (tracks) => {
      // tracks are assumed to be ordered by last_play
      const weights = {};
      for(let i = 0; i < tracks.length; i++) {
        weights[i] = 1.0 / (i + 1);
      }

      const tracksToEnqueue = [];
      const secondsToFill = minutes * 60;
      let enqueuedSeconds = 0;

      while(enqueuedSeconds < secondsToFill && tracks.length > 0) {
        const index = weighted.select(weights);
        if(tracks[index]) {
          const track = tracks[index];
          delete tracks[index];
          delete weights[index];
          tracksToEnqueue.push(track);
          enqueuedSeconds += track.duration;
        }
      }

      this.stopPlayback();
      this.setPlaylist(tracksToEnqueue);
      this.playOrPausePlayback();
      location.hash = "home";
    });
  }

  initializePlayer(playerNode) {
    this.api = new Gapless5(playerNode.id);
    this.setVolume(.5);

    this.api.onplay = () => {
      this.playerState = PlayerState.PLAYING;

      // avoid restarting the scrobble timers, in case of player state moving from paused to play
      if(this.scrobbleState === ScrobbleState.NO_TRACK) {
        this.startScrobbleTimers();
      }

      this.startTrackPositionUpdateTimer();

    };

    this.api.onpause = () => {
      this.playerState = PlayerState.PAUSED;
    };

    this.api.onstop = () => {
      this.playerState = PlayerState.STOPPED;
      this.willStopAfterCurrent = false;
      this.clearScrobbleTimers();
      this.clearTrackPositionUpdateTimer();
    };

    this.api.onfinishedtrack = () => {
      if(this.willStopAfterCurrent) {
        this.stopPlayback();
        this.willStopAfterCurrent = false;
      }
    };

    this.api.onfinishedall = () => {
      this.playerState = PlayerState.STOPPED;
      this.willStopAfterCurrent = false;
      this.clearScrobbleTimers();
      this.clearTrackPositionUpdateTimer();
    };

    this.api.onprev = () => {
      this.nowPlaying -= 1;
      this.clearScrobbleTimers();
      this.startScrobbleTimers();
    };

    this.api.onnext = () => {
      this.nowPlaying += 1;
      this.clearScrobbleTimers();
      this.startScrobbleTimers();
    };

    const currentPositionNode = playerNode.querySelector(".g5position span:nth-child(1)");

    this.api.getCurrentTrackPosition = function() {
      const timeString = currentPositionNode.textContent;

      if(timeString) {
        return timeStringToSeconds(timeString);
      }
    };

  }

  playOrPausePlayback() {
    if(this.api) {
      if(this.playerState === PlayerState.PLAYING) {
        this.api.pause();
      }
      else {
        this.api.play();
      }

    }
  }

  stopPlayback() {
    if(this.api) {
      this.api.stop();
      this.clearTrackPositionUpdateTimer();
    }
  }

  toggleStopAfterCurrent() {
    if(this.api) {
      this.willStopAfterCurrent = !this.willStopAfterCurrent;
    }
  }

  clearPlaylist() {
    this.willStopAfterCurrent = false;
    this.nowPlaying = 0;
    this.playlist = [];
    this.api.removeAllTracks();
  }

  setPlaylist(tracks) {
    if(this.api) {
      this.clearPlaylist();

      for(let i = 0; i < tracks.length; i++) {
        this.playlist.push(tracks[i]);
        const path = tracks[i].path.replace(/#/, "%23");
        this.api.addTrack("/stream/" + path);
      }

    }
  }

  jumpToPlaylistItem(index) {
    if(this.api) {
      this.willStopAfterCurrent = false;
      this.nowPlaying = index;
      this.api.gotoTrack(index, true);
      this.api.onplay();
    }
  }

  jumpToPreviousTrack() {
    if(this.api) {
      this.willStopAfterCurrent = false;
      this.api.prevtrack();
    }
  }

  jumpToNextTrack() {
    if(this.api) {
      this.willStopAfterCurrent = false;
      this.api.next();
    }
  }

  seekToPosition(position) {
    if(this.api) {
      const duration = this.playlist[this.nowPlaying].duration;

      if(position < 0) {
        position = 0;
      }

      if(position > duration) {
        position = duration;
      }

      // Gapless5 player has a resolution of 65535 slices.
      let seekTo = Math.floor(position / duration * 65535);

      // But if you seek to the last slice it will instead go to slice 0.
      if(seekTo === 65535) {
        seekTo = 65534;
      }
      this.api.scrub(seekTo);
    }
  }

  setVolume(volume) {
    if(this.api) {
      if(volume < 0) {
        volume = 0;
      }

      if(volume > 1) {
        volume = 1;
      }

      try {
        // Gapless5 takes a value between 0 and 65535.
        this.api.setGain(Math.floor(volume * 65535));
      }
      catch(ex) {
        // Gapless 5 throws an exception if you set the gain while tracklist is empty;
        // but it will still work.
      }
    }
  }

  startTrackPositionUpdateTimer() {
    this.trackPositionUpdateTimer = setInterval(() => {
      const newTrackPosition = this.api.getCurrentTrackPosition();
      if(newTrackPosition !== this.currentTrackPosition) {
        this.currentTrackPosition = newTrackPosition;
      }
    }, 100);
  }

  clearTrackPositionUpdateTimer() {
    if(this.trackPositionUpdateTimer) {
      clearInterval(this.trackPositionUpdateTimer);
      this.trackPositionUpdateTimer = null;
      this.currentTrackPosition = 0;
    }
  }

  startScrobbleTimers() {
    if(this.playerState === PlayerState.PLAYING) {
      this.clearScrobbleTimers();

      const trackStartedPlaying = Math.floor(Date.now() / 1000);
      const trackToScrobble = this.playlist[this.nowPlaying];

      const nowPlayingDelayMs = 5000;

      if(trackToScrobble.duration * 1000 > nowPlayingDelayMs) {
        // submit the now-playing update in 5 seconds if it's still playing.
        this.scrobbleNowPlayingTimer = setTimeout(() => {
          if(trackToScrobble === this.playlist[this.nowPlaying] &&
            this.playerState !== PlayerState.STOPPED) {
            const postData = {
              id: trackToScrobble.id
            };
            $.post("/submit-now-playing", postData);
          }

          this.scrobbleNowPlayingTimer = null;
        }, nowPlayingDelayMs);
      }

      // submit the play in (duration / 2) seconds if it's still playing.
      const playDelayMs = trackToScrobble.duration / 2.0 * 1000;
      this.scrobblePlayTimer = setTimeout(() => {
        if(trackToScrobble === this.playlist[this.nowPlaying] &&
          this.playerState !== PlayerState.STOPPED) {
          const postData = {
            id: trackToScrobble.id,
            started_playing: trackStartedPlaying
          };

          $.post("/submit-play", postData).done(() => {
            this.scrobbleState = ScrobbleState.TRACK_SCROBBLED;
          }).fail(() => {
            this.scrobbleState = ScrobbleState.SCROBBLE_FAILED;
          });
        }

        this.scrobblePlayTimer = null;
      }, playDelayMs);

      this.scrobbleState = ScrobbleState.TRACK_QUEUED;
    }
  }

  clearScrobbleTimers() {
    this.scrobbleState = ScrobbleState.NO_TRACK;

    if(this.scrobblePlayTimer) {
      clearTimeout(this.scrobblePlayTimer);
      this.scrobblePlayTimer = null;
    }

    if(this.scrobbleNowPlayingTimer) {
      clearTimeout(this.scrobbleNowPlayingTimer);
      this.scrobbleNowPlayingTimer = null;
    }
  }
}

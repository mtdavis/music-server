import {action, computed, observable} from 'mobx';
import weighted from 'weighted';
import PlayerState from '../lib/PlayerState';
import {timeStringToSeconds} from '../lib/util';

export default class MusicStore {
  @observable api = null;
  @observable playerState = PlayerState.STOPPED;
  @observable playlist = [];
  @observable currentTrackIndex = 0;
  @observable currentTrackPosition = 0;
  @observable willStopAfterCurrent = false;

  trackPositionUpdateTimer = null;

  @computed get currentTrack() {
    if(this.playlist.length === 0) {
      return null;
    }

    return this.playlist[this.currentTrackIndex];
  }

  @computed get currentTrackId() {
    if(this.playlist.length === 0) {
      return null;
    }

    return this.playlist[this.currentTrackIndex].id;
  }

  @action
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

  @action
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

  @action
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

  @action
  playTrack(track) {
    this.stopPlayback();
    this.setPlaylist([track]);
    this.playOrPausePlayback();
  }

  @action
  enqueueTrack(track) {
    this.playlist.push(track);
    const path = track.path.replace(/#/, "%23");
    this.api.addTrack("/stream/" + path);
  }

  @action
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

  @action
  initializePlayer(playerNode) {
    this.api = new Gapless5(playerNode.id);
    this.setVolume(.5);

    this.api.onplay = () => {
      this.playerState = PlayerState.PLAYING;
      this.startTrackPositionUpdateTimer();

    };

    this.api.onpause = () => {
      this.playerState = PlayerState.PAUSED;
    };

    this.api.onstop = () => {
      this.playerState = PlayerState.STOPPED;
      this.willStopAfterCurrent = false;
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
      this.clearTrackPositionUpdateTimer();
    };

    this.api.onprev = () => {
      this.currentTrackIndex -= 1;
    };

    this.api.onnext = () => {
      this.currentTrackIndex += 1;
    };

    const currentPositionNode = playerNode.querySelector(".g5position span:nth-child(1)");

    this.api.getCurrentTrackPosition = function() {
      const timeString = currentPositionNode.textContent;

      if(timeString) {
        return timeStringToSeconds(timeString);
      }
    };
  }

  @action
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

  @action
  stopPlayback() {
    if(this.api) {
      this.api.stop();
      this.clearTrackPositionUpdateTimer();
    }
  }

  @action
  toggleStopAfterCurrent() {
    if(this.api) {
      this.willStopAfterCurrent = !this.willStopAfterCurrent;
    }
  }

  @action
  clearPlaylist() {
    this.willStopAfterCurrent = false;
    this.currentTrackIndex = 0;
    this.playlist = [];
    this.api.removeAllTracks();
  }

  @action
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

  @action
  jumpToPlaylistItem(index) {
    if(this.api) {
      this.willStopAfterCurrent = false;
      this.currentTrackIndex = index;
      this.api.gotoTrack(index, true);
      this.api.onplay();
    }
  }

  @action
  jumpToPreviousTrack() {
    if(this.api) {
      this.willStopAfterCurrent = false;
      this.api.prevtrack();
    }
  }

  @action
  jumpToNextTrack() {
    if(this.api) {
      this.willStopAfterCurrent = false;
      this.api.next();
    }
  }

  @action
  seekToPosition(position) {
    if(this.api) {
      const duration = this.currentTrack.duration;

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

  @action
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

  @action
  startTrackPositionUpdateTimer() {
    this.trackPositionUpdateTimer = setInterval(() => {
      const newTrackPosition = this.api.getCurrentTrackPosition();
      if(newTrackPosition !== this.currentTrackPosition) {
        this.currentTrackPosition = newTrackPosition;
      }
    }, 100);
  }

  @action
  clearTrackPositionUpdateTimer() {
    if(this.trackPositionUpdateTimer) {
      clearInterval(this.trackPositionUpdateTimer);
      this.trackPositionUpdateTimer = null;
      this.currentTrackPosition = 0;
    }
  }
}

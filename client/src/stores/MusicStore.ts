import {
  action,
  computed,
  makeObservable,
  observable,
} from 'mobx';
import NoSleep from 'nosleep.js';
import weighted from 'weighted';

import PlayerState from 'lib/PlayerState';
import {get, timeStringToSeconds} from 'lib/util';
import DbStore from './DbStore';

export default class MusicStore {
  api: Gapless5 | null = null;
  playerState = PlayerState.STOPPED;
  playlist: Track[] = [];
  currentTrackIndex = 0;
  currentTrackPosition = 0;
  willStopAfterCurrent = false;
  demoMode: boolean = __DEMO_MODE__;
  dbStore: DbStore;

  constructor(dbStore: DbStore) {
    this.dbStore = dbStore;

    makeObservable(this, {
      api: observable,
      playerState: observable,
      playlist: observable,
      currentTrackIndex: observable,
      currentTrackPosition: observable,
      willStopAfterCurrent: observable,
      demoMode: observable,
      currentTrack: computed,
      currentTrackId: computed,
      playAlbum: action,
      enqueueAlbum: action,
      playPlaylist: action,
      playTrack: action,
      enqueueTrack: action,
      playShuffle: action,
      initializePlayer: action,
      playOrPausePlayback: action,
      stopPlayback: action,
      toggleStopAfterCurrent: action,
      clearPlaylist: action,
      setPlaylist: action,
      jumpToPlaylistItem: action,
      jumpToPreviousTrack: action,
      jumpToNextTrack: action,
      seekToPosition: action,
      setVolume: action,
      startTrackPositionUpdateTimer: action,
      clearTrackPositionUpdateTimer: action,
    });
  }

  trackPositionUpdateTimer: number | null = null;
  noSleep = new NoSleep();

  get currentTrack(): Track | null {
    if(this.playlist.length === 0) {
      return null;
    }

    return this.playlist[this.currentTrackIndex];
  }

  get currentTrackId(): number | null {
    if(this.playlist.length === 0) {
      return null;
    }

    return this.playlist[this.currentTrackIndex].id;
  }

  playAlbum(album: Album): void {
    location.hash = "/";
    const tracks = this.dbStore.getAlbumTracks(album.id);
    this.stopPlayback();
    this.setPlaylist(tracks);
    this.playOrPausePlayback();
  }

  enqueueAlbum(album: Album): void {
    if(!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    const tracks = this.dbStore.getAlbumTracks(album.id);

    for(let i = 0; i < tracks.length; i++) {
      this.playlist.push(tracks[i]);
      const path = tracks[i].path.replace(/#/, "%23");
      this.api.addTrack("/stream/" + path);
    }
  }

  playPlaylist(playlist: Playlist): void {
    get({
      url: `/playlist/${playlist.id}/tracks`,
      onSuccess: (tracks: Track[]) => {
        this.stopPlayback();
        this.setPlaylist(tracks);
        this.playOrPausePlayback();
        location.hash = "/";
      },
    });
  }

  playTrack(track: Track): void {
    this.stopPlayback();
    this.setPlaylist([track]);
    this.playOrPausePlayback();
  }

  enqueueTrack(track: Track): void {
    if(!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    this.playlist.push(track);
    const path = track.path.replace(/#/, "%23");
    this.api.addTrack("/stream/" + path);
  }

  playShuffle(minutes: number, genres: string[]): void {
    get({
      url: '/shuffle',
      onSuccess: (tracks: Track[]) => {
        if(!this.api) {
          throw Error('Gapless5 instance is not initialized');
        }

        tracks = tracks.filter(
          track => genres.includes('*') || genres.includes(track.genre)
        );

        // tracks are assumed to be ordered by last_play
        const weights: {[trackId: number]: number} = {};
        for(let i = 0; i < tracks.length; i++) {
          weights[i] = 1.0 / (i + 1);
        }

        const tracksToEnqueue = [];
        const secondsToFill = minutes * 60;
        let enqueuedSeconds = 0;

        while(enqueuedSeconds < secondsToFill && tracks.length > 0) {
          const index: number = weighted.select(weights);
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
        location.hash = "/";
      },
    });
  }

  initializePlayer(playerNode: HTMLDivElement): void {
    this.api = new Gapless5(playerNode.id);
    this.setVolume(.5);

    this.api.onplay = action(() => {
      this.playerState = PlayerState.PLAYING;
      this.startTrackPositionUpdateTimer();

      this.noSleep.enable(); // prevent PC from sleeping during playback
    });

    this.api.onpause = action(() => {
      this.playerState = PlayerState.PAUSED;

      this.noSleep.disable();
    });

    this.api.onstop = action(() => {
      this.playerState = PlayerState.STOPPED;
      this.willStopAfterCurrent = false;
      this.clearTrackPositionUpdateTimer();

      this.noSleep.disable();
    });

    this.api.onfinishedtrack = action(() => {
      if(this.willStopAfterCurrent) {
        this.stopPlayback();
        this.willStopAfterCurrent = false;
      }
    });

    this.api.onfinishedall = action(() => {
      this.playerState = PlayerState.STOPPED;
      this.willStopAfterCurrent = false;
      this.clearTrackPositionUpdateTimer();

      this.noSleep.disable();
    });

    this.api.onprev = action(() => {
      this.currentTrackIndex -= 1;
    });

    this.api.onnext = action(() => {
      this.currentTrackIndex += 1;
    });

    const currentPositionNode = playerNode.querySelector(".g5position span:nth-child(1)");

    if(currentPositionNode === null) {
      throw Error('Could not find gapless5 track position node!');
    }

    this.api.getCurrentTrackPosition = function() {
      const timeString = currentPositionNode.textContent;

      if(timeString) {
        return timeStringToSeconds(timeString);
      }

      return 0;
    };
  }

  playOrPausePlayback(): void {
    if(!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    if(this.playerState === PlayerState.PLAYING) {
      this.api.pause();
    }
    else {
      this.api.play();
    }
  }

  stopPlayback(): void {
    if(!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }
    this.api.stop();
    this.clearTrackPositionUpdateTimer();
  }

  toggleStopAfterCurrent(): void {
    if(!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }
    this.willStopAfterCurrent = !this.willStopAfterCurrent;
  }

  clearPlaylist(): void {
    if(!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    this.willStopAfterCurrent = false;
    this.currentTrackIndex = 0;
    this.playlist = [];
    this.api.removeAllTracks();
  }

  setPlaylist(tracks: Track[]): void {
    if(!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }
    this.clearPlaylist();

    for(let i = 0; i < tracks.length; i++) {
      this.playlist.push(tracks[i]);
      const path = tracks[i].path.replace(/#/, "%23");
      this.api.addTrack("/stream/" + path);
    }
  }

  jumpToPlaylistItem(index: number): void {
    if(!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    this.willStopAfterCurrent = false;
    this.currentTrackIndex = index;
    this.api.gotoTrack(index, true);
    this.api.onplay();
  }

  jumpToPreviousTrack(): void {
    if(!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    this.willStopAfterCurrent = false;
    this.api.prevtrack();
  }

  jumpToNextTrack(): void {
    if(!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    this.willStopAfterCurrent = false;
    this.api.next();
  }

  seekToPosition(position: number): void {
    if(!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    if(this.currentTrack) {
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

  setVolume(volume: number): void {
    if(!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }
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

  startTrackPositionUpdateTimer(): void {
    this.trackPositionUpdateTimer = window.setInterval(action(() => {
      if(!this.api) {
        throw Error('Gapless5 instance is not initialized');
      }

      const newTrackPosition = this.api.getCurrentTrackPosition();
      if(newTrackPosition !== this.currentTrackPosition) {
        this.currentTrackPosition = newTrackPosition;
      }
    }), 100);
  }

  clearTrackPositionUpdateTimer(): void {
    if(this.trackPositionUpdateTimer) {
      window.clearInterval(this.trackPositionUpdateTimer);
      this.trackPositionUpdateTimer = null;
      this.currentTrackPosition = 0;
    }
  }
}

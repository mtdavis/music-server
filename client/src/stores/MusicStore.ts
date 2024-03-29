import type { Router } from '@remix-run/router';
import Gapless5 from 'gapless5';
import PlayerState from 'lib/PlayerState';
import { get } from 'lib/util';
import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import NoSleep from 'nosleep.js';
import weighted from 'weighted';

import DbStore from './DbStore';

export default class MusicStore {
  api: Gapless5 | null = null;

  playerState = PlayerState.STOPPED;

  playlist: Track[] = [];

  currentTrackIndex = 0;

  currentTrackPosition = 0;

  willStopAfterCurrent = false;

  albumArtUrl: string | null = null;

  demoMode: boolean = import.meta.env.VITE_DEMO_MODE === 'true';

  dbStore: DbStore;

  router: Router;

  noSleep = new NoSleep();

  constructor(dbStore: DbStore, router: Router) {
    this.dbStore = dbStore;
    this.router = router;

    makeObservable(this, {
      api: observable,
      playerState: observable,
      playlist: observable,
      currentTrackIndex: observable,
      currentTrackPosition: observable,
      willStopAfterCurrent: observable,
      albumArtUrl: observable,
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
    });

    autorun(() => {
      if (this.currentTrack === null || this.currentTrack.album === null) {
        runInAction(() => {
          this.albumArtUrl = null;
        });

        return;
      }

      const newImgUrl = `/art/${this.currentTrackId}`;

      const img = new Image();
      img.src = newImgUrl;

      img.onload = action(() => {
        this.albumArtUrl = newImgUrl;
      });
    });

    autorun(this.updateMediaSessionMetadata);

    autorun(this.updateMediaSessionPlaybackState);

    this.initializePlayer();
  }

  get currentTrack(): Track | null {
    if (this.playlist.length === 0) {
      return null;
    }

    return this.playlist[this.currentTrackIndex];
  }

  get currentTrackId(): number | null {
    if (this.playlist.length === 0) {
      return null;
    }

    return this.playlist[this.currentTrackIndex].id;
  }

  playAlbum(album: Album): void {
    this.router.navigate('/app');
    const tracks = this.dbStore.getAlbumTracks(album.id);
    this.stopPlayback();
    this.setPlaylist(tracks);
    this.playOrPausePlayback();
  }

  enqueueAlbum(album: Album): void {
    if (!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    const tracks = this.dbStore.getAlbumTracks(album.id);

    for (let i = 0; i < tracks.length; i += 1) {
      this.playlist.push(tracks[i]);
      const path = tracks[i].path.replace(/#/, '%23');
      this.api.addTrack(`/stream/${path}`);
    }
  }

  async playPlaylist(playlist: Playlist): Promise<void> {
    const tracks = await get<Track[]>(`/api/playlists/${playlist.id}/tracks`);
    this.stopPlayback();
    this.setPlaylist(tracks);
    this.playOrPausePlayback();
    this.router.navigate('/app');
  }

  playTrack(track: Track): void {
    this.stopPlayback();
    this.setPlaylist([track]);
    this.playOrPausePlayback();
  }

  enqueueTrack(track: Track): void {
    if (!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    this.playlist.push(track);
    const path = track.path.replace(/#/, '%23');
    this.api.addTrack(`/stream/${path}`);
  }

  async playShuffle(minutes: number, genres: string[]): Promise<void> {
    const allTracks = await get<Track[]>('/api/shuffle/');
    if (!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    const tracks = allTracks.filter(
      (track) => genres.includes('*') || genres.includes(track.genre),
    );

    // tracks are assumed to be ordered by last_play
    const weights: { [trackId: number]: number } = {};
    for (let i = 0; i < tracks.length; i += 1) {
      weights[i] = 1.0 / (i + 1);
    }

    const tracksToEnqueue = [];
    const secondsToFill = minutes * 60;
    let enqueuedSeconds = 0;

    while (enqueuedSeconds < secondsToFill && tracks.length > 0) {
      const index: number = weighted.select(weights);
      if (tracks[index]) {
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
    this.router.navigate('/app');
  }

  initializePlayer(): void {
    this.api = new Gapless5();
    this.api.tickMS = 100;
    this.setVolume(0.5);

    this.api.onplay = action(() => {
      this.playerState = PlayerState.PLAYING;

      this.noSleep.enable(); // prevent PC from sleeping during playback
    });

    this.api.onpause = action(() => {
      this.playerState = PlayerState.PAUSED;

      this.noSleep.disable();
    });

    this.api.onstop = action(() => {
      this.playerState = PlayerState.STOPPED;
      this.willStopAfterCurrent = false;

      this.noSleep.disable();
    });

    this.api.onfinishedtrack = action(() => {
      if (this.willStopAfterCurrent) {
        this.stopPlayback();
        this.willStopAfterCurrent = false;
      }
    });

    this.api.onfinishedall = action(() => {
      this.playerState = PlayerState.STOPPED;
      this.willStopAfterCurrent = false;

      this.noSleep.disable();
    });

    this.api.onprev = action(() => {
      this.currentTrackIndex -= 1;
    });

    this.api.onnext = action(() => {
      this.currentTrackIndex += 1;
    });

    this.api.onpositionupdate = action((newTrackPosition: number) => {
      this.currentTrackPosition = newTrackPosition;
    });

    if (navigator.mediaSession) {
      navigator.mediaSession.setActionHandler('play', this.api.play);
      navigator.mediaSession.setActionHandler('pause', this.api.pause);
      navigator.mediaSession.setActionHandler('stop', this.api.stop);
      navigator.mediaSession.setActionHandler('previoustrack', this.jumpToPreviousTrack);
      navigator.mediaSession.setActionHandler('nexttrack', this.jumpToNextTrack);
    }
  }

  playOrPausePlayback(): void {
    if (!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    if (this.playerState === PlayerState.PLAYING) {
      this.api.pause();
    } else {
      this.api.play();
    }
  }

  stopPlayback(): void {
    if (!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }
    this.api.stop();
  }

  toggleStopAfterCurrent(): void {
    if (!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }
    this.willStopAfterCurrent = !this.willStopAfterCurrent;
  }

  clearPlaylist(): void {
    if (!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    this.willStopAfterCurrent = false;
    this.currentTrackIndex = 0;
    this.playlist = [];
    this.api.removeAllTracks();
  }

  setPlaylist(tracks: Track[]): void {
    if (!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }
    this.clearPlaylist();

    for (let i = 0; i < tracks.length; i += 1) {
      this.playlist.push(tracks[i]);
      const path = tracks[i].path.replace(/#/, '%23');
      this.api.addTrack(`/stream/${path}`);
    }
  }

  jumpToPlaylistItem(index: number): void {
    if (!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    this.willStopAfterCurrent = false;
    this.currentTrackIndex = index;
    this.api.gotoTrack(index, true);
    this.api.onplay();
  }

  jumpToPreviousTrack(): void {
    if (!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    this.willStopAfterCurrent = false;
    this.api.prevtrack();
  }

  jumpToNextTrack(): void {
    if (!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    this.willStopAfterCurrent = false;
    this.api.next();
  }

  seekToPosition(position: number): void {
    if (!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }

    if (this.currentTrack) {
      const { duration } = this.currentTrack;

      let fixedPosition = position;
      if (fixedPosition < 0) {
        fixedPosition = 0;
      }

      if (fixedPosition > duration) {
        fixedPosition = duration;
      }

      // Gapless5 player has a resolution of 65535 slices.
      let seekTo = Math.floor((fixedPosition / duration) * 65535);

      // But if you seek to the last slice it will instead go to slice 0.
      if (seekTo === 65535) {
        seekTo = 65534;
      }
      this.api.scrub(seekTo);
    }
  }

  setVolume(volume: number): void {
    if (!this.api) {
      throw Error('Gapless5 instance is not initialized');
    }
    let fixedVolume = volume;
    if (fixedVolume < 0) {
      fixedVolume = 0;
    }

    if (fixedVolume > 1) {
      fixedVolume = 1;
    }

    try {
      // Gapless5 takes a value between 0 and 65535.
      this.api.setGain(Math.floor(fixedVolume * 65535));
    } catch (ex) {
      // Gapless 5 throws an exception if you set the gain while tracklist is empty;
      // but it will still work.
    }
  }

  updateMediaSessionMetadata = (): void => {
    if (navigator.mediaSession && this.currentTrack) {
      const metadata: {
        title: string,
        artist: string,
        album?: string,
      } = {
        title: this.currentTrack.title,
        artist: this.currentTrack.artist,
        album: undefined,
      };

      if (this.currentTrack.album) {
        metadata.album = this.currentTrack.album;
      }

      navigator.mediaSession.metadata = new window.MediaMetadata(metadata);
    }
  };

  updateMediaSessionPlaybackState = (): void => {
    if (navigator.mediaSession) {
      if (this.playerState === PlayerState.PLAYING) {
        navigator.mediaSession.playbackState = 'playing';
      } else if (this.playerState === PlayerState.PAUSED) {
        navigator.mediaSession.playbackState = 'paused';
      } else {
        navigator.mediaSession.playbackState = 'none';
      }
    }
  };
}

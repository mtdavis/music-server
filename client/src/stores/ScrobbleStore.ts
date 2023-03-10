import PlayerState from 'lib/PlayerState';
import ScrobbleState from 'lib/ScrobbleState';
import { put } from 'lib/util';
import {
  action,
  autorun,
  makeObservable,
  observable,
} from 'mobx';
import pauseable from 'pauseable';

import DbStore from './DbStore';
import MusicStore from './MusicStore';

export default class ScrobbleStore {
  scrobbleState: ScrobbleState = ScrobbleState.NO_TRACK;

  previousPlayerState: PlayerState | null = null;

  previousTrackId: number | null = null;

  playTimer: pauseable.timer | null = null;

  nowPlayingTimer: pauseable.timer | null = null;

  musicStore: MusicStore;

  dbStore: DbStore;

  constructor(musicStore: MusicStore, dbStore: DbStore) {
    this.musicStore = musicStore;
    this.dbStore = dbStore;

    makeObservable(this, {
      scrobbleState: observable,
      startTimers: action,
      clearTimers: action,
    });

    autorun(() => {
      const trackChanged = musicStore.currentTrackId !== this.previousTrackId;

      if (trackChanged && musicStore.playerState === PlayerState.PLAYING) {
        // changed tracks while playing
        this.clearTimers();
        this.startTimers();
      } else if (trackChanged && musicStore.playerState === PlayerState.PAUSED) {
        // changed tracks while paused
        this.clearTimers();
        this.startTimers();
        this.pauseTimers();
      } else if (this.previousPlayerState !== PlayerState.STOPPED
          && musicStore.playerState === PlayerState.STOPPED) {
        // stopped playing
        this.clearTimers();
      } else if (this.previousPlayerState === PlayerState.STOPPED
          && musicStore.playerState === PlayerState.PLAYING) {
        // started playing
        this.startTimers();
      } else if (this.previousPlayerState === PlayerState.PLAYING
          && musicStore.playerState === PlayerState.PAUSED) {
        // paused playback
        this.pauseTimers();
      } else if (this.previousPlayerState === PlayerState.PAUSED
          && musicStore.playerState === PlayerState.PLAYING) {
        // resumed playback
        this.resumeTimers();
      }

      this.previousPlayerState = musicStore.playerState;
      this.previousTrackId = musicStore.currentTrackId;
    });
  }

  startTimers(): void {
    const trackStartedPlaying = Math.floor(Date.now() / 1000);
    const trackToScrobble = this.musicStore.currentTrack;

    if (!trackToScrobble) {
      return;
    }

    const nowPlayingDelayMs = 5000;

    if (trackToScrobble.duration * 1000 > nowPlayingDelayMs) {
      // submit the now-playing update in 5 seconds if it's still playing.
      this.nowPlayingTimer = pauseable.setTimeout(() => {
        if (
          trackToScrobble.id === this.musicStore.currentTrackId
          && this.musicStore.playerState !== PlayerState.STOPPED
        ) {
          put({
            url: `/api/tracks/${trackToScrobble.id}/submit-now-playing`,
          });
        }

        this.nowPlayingTimer = null;
      }, nowPlayingDelayMs);
    }

    // submit the play in (duration / 2) seconds if it's still playing.
    const playDelayMs = (trackToScrobble.duration / 2.0) * 1000;
    this.playTimer = pauseable.setTimeout(() => {
      if (
        trackToScrobble.id === this.musicStore.currentTrackId
        && this.musicStore.playerState !== PlayerState.STOPPED
      ) {
        this.dbStore.incrementPlayCount(trackToScrobble.id, trackStartedPlaying);

        put({
          url: `/api/tracks/${trackToScrobble.id}/submit-play`,
          data: {
            timestamp: trackStartedPlaying,
          },
          onSuccess: action(() => {
            this.scrobbleState = ScrobbleState.TRACK_SCROBBLED;
          }),
          onError: action(() => {
            this.scrobbleState = ScrobbleState.SCROBBLE_FAILED;
          }),
        });
      }

      this.playTimer = null;
    }, playDelayMs);

    this.scrobbleState = ScrobbleState.TRACK_QUEUED;
  }

  pauseTimers(): void {
    if (this.playTimer) {
      this.playTimer.pause();
    }

    if (this.nowPlayingTimer) {
      this.nowPlayingTimer.pause();
    }
  }

  resumeTimers(): void {
    if (this.playTimer) {
      this.playTimer.resume();
    }

    if (this.nowPlayingTimer) {
      this.nowPlayingTimer.resume();
    }
  }

  clearTimers(): void {
    this.scrobbleState = ScrobbleState.NO_TRACK;

    if (this.playTimer) {
      this.playTimer.clear();
      this.playTimer = null;
    }

    if (this.nowPlayingTimer) {
      this.nowPlayingTimer.clear();
      this.nowPlayingTimer = null;
    }
  }
}

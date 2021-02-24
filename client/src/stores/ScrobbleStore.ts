import {action, autorun, observable} from 'mobx';
import PlayerState from '../lib/PlayerState';
import ScrobbleState from '../lib/ScrobbleState';
import pauseable from 'pauseable';
import MusicStore from './MusicStore';
import DbStore from './DbStore';

export default class ScrobbleStore {
  @observable scrobbleState: ScrobbleState = ScrobbleState.NO_TRACK;
  previousPlayerState: PlayerState | null = null;
  previousTrackId: number | null = null;
  playTimer: pauseable.timer | null = null;
  nowPlayingTimer: pauseable.timer | null = null;
  musicStore: MusicStore;
  dbStore: DbStore;

  constructor(musicStore: MusicStore, dbStore: any) {
    this.musicStore = musicStore;
    this.dbStore = dbStore;

    autorun(() => {
      const trackChanged = musicStore.currentTrackId !== this.previousTrackId;

      if(trackChanged && musicStore.playerState === PlayerState.PLAYING) {
        // changed tracks while playing
        this.clearTimers();
        this.startTimers();
      }
      else if(trackChanged && musicStore.playerState === PlayerState.PAUSED) {
        // changed tracks while paused
        this.clearTimers();
        this.startTimers();
        this.pauseTimers();
      }
      else if(this.previousPlayerState !== PlayerState.STOPPED &&
          musicStore.playerState === PlayerState.STOPPED) {
        // stopped playing
        this.clearTimers();
      }
      else if(this.previousPlayerState === PlayerState.STOPPED &&
          musicStore.playerState === PlayerState.PLAYING) {
        // started playing
        this.startTimers();
      }
      else if(this.previousPlayerState === PlayerState.PLAYING &&
          musicStore.playerState === PlayerState.PAUSED) {
        // paused playback
        this.pauseTimers();
      }
      else if(this.previousPlayerState === PlayerState.PAUSED &&
          musicStore.playerState === PlayerState.PLAYING) {
        // resumed playback
        this.resumeTimers();
      }

      this.previousPlayerState = musicStore.playerState;
      this.previousTrackId = musicStore.currentTrackId;
    });
  }

  @action
  startTimers() {
    const trackStartedPlaying = Math.floor(Date.now() / 1000);
    const trackToScrobble = this.musicStore.currentTrack;

    if(!trackToScrobble) {
      return;
    }

    const nowPlayingDelayMs = 5000;

    if(trackToScrobble.duration * 1000 > nowPlayingDelayMs) {
      // submit the now-playing update in 5 seconds if it's still playing.
      this.nowPlayingTimer = pauseable.setTimeout(() => {
        if(trackToScrobble.id === this.musicStore.currentTrackId &&
            this.musicStore.playerState !== PlayerState.STOPPED) {
          const postData = {
            id: trackToScrobble.id
          };
          $.post("/submit-now-playing", postData);
        }

        this.nowPlayingTimer = null;
      }, nowPlayingDelayMs);
    }

    // submit the play in (duration / 2) seconds if it's still playing.
    const playDelayMs = trackToScrobble.duration / 2.0 * 1000;
    this.playTimer = pauseable.setTimeout(() => {
      if(trackToScrobble.id === this.musicStore.currentTrackId &&
          this.musicStore.playerState !== PlayerState.STOPPED) {
        const postData = {
          id: trackToScrobble.id,
          started_playing: trackStartedPlaying
        };

        this.dbStore.incrementPlayCount(trackToScrobble.id, trackStartedPlaying);

        $.post("/submit-play", postData).done(() => {
          this.scrobbleState = ScrobbleState.TRACK_SCROBBLED;
        }).fail(() => {
          this.scrobbleState = ScrobbleState.SCROBBLE_FAILED;
        });
      }

      this.playTimer = null;
    }, playDelayMs);

    this.scrobbleState = ScrobbleState.TRACK_QUEUED;
  }

  pauseTimers() {
    if(this.playTimer) {
      this.playTimer.pause();
    }

    if(this.nowPlayingTimer) {
      this.nowPlayingTimer.pause();
    }
  }

  resumeTimers() {
    if(this.playTimer) {
      this.playTimer.resume();
    }

    if(this.nowPlayingTimer) {
      this.nowPlayingTimer.resume();
    }
  }

  @action
  clearTimers() {
    this.scrobbleState = ScrobbleState.NO_TRACK;

    if(this.playTimer) {
      this.playTimer.clear();
      this.playTimer = null;
    }

    if(this.nowPlayingTimer) {
      this.nowPlayingTimer.clear();
      this.nowPlayingTimer = null;
    }
  }
}

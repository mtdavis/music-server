import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';

import {get} from 'lib/util';
import LyricsState from 'lib/LyricsState';
import MusicStore from './MusicStore';

interface GetResult {
  lyrics: string;
  url: string;
}

export default class LyricsStore {
  lyricsState = LyricsState.NO_TRACK;
  lyricsTrackId: number | null = null;
  lyrics: string | null = null;
  url: string | null = null;
  lyricsVisible = false;
  musicStore: MusicStore;

  constructor(musicStore: MusicStore) {
    this.musicStore = musicStore;

    makeObservable(this, {
      lyricsState: observable,
      lyricsTrackId: observable,
      lyrics: observable,
      url: observable,
      lyricsVisible: observable,
      setLyricsVisible: action,
    });

    autorun(() => {
      if(!this.lyricsVisible) {
        return;
      }

      if(this.musicStore.currentTrack) {
        const nowPlayingId = this.musicStore.currentTrack.id;

        if(nowPlayingId !== this.lyricsTrackId) {
          runInAction(() => {
            this.lyrics = null;
            this.lyricsState = LyricsState.LOADING;
            this.lyricsTrackId = nowPlayingId;
          });

          get({
            url: `/track/${nowPlayingId}/lyrics`,
            onSuccess: action((result: GetResult) => {
              this.lyrics = result.lyrics;
              this.url = result.url;
              this.lyricsState = LyricsState.SUCCESSFUL;
            }),
            onError: action((_error: string) => {
              this.lyrics = null;
              this.url = null;
              this.lyricsState = LyricsState.FAILED;
            }),
          });
        }
      }
      else {
        runInAction(() => {
          this.lyrics = null;
          this.lyricsState = LyricsState.NO_TRACK;
          this.lyricsTrackId = null;
        });
      }
    });
  }

  setLyricsVisible(visible: boolean): void {
    this.lyricsVisible = visible;
  }
}

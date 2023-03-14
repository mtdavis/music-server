import LyricsState from 'lib/LyricsState';
import { get } from 'lib/util';
import {
  action,
  autorun,
  makeObservable,
  observable,
} from 'mobx';

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
      update: action,
    });

    autorun(async () => {
      if (!this.lyricsVisible) {
        return;
      }

      if (this.musicStore.currentTrack) {
        const nowPlayingId = this.musicStore.currentTrack.id;

        if (nowPlayingId !== this.lyricsTrackId) {
          this.update({
            lyricsState: LyricsState.LOADING,
            lyricsTrackId: nowPlayingId,
          });

          try {
            const result = await get<GetResult>(`/api/tracks/${nowPlayingId}/lyrics`);
            this.update({
              ...result,
              lyricsState: LyricsState.SUCCESSFUL,
              lyricsTrackId: nowPlayingId,
            });
          } catch (error) {
            this.update({
              lyricsState: LyricsState.FAILED,
            });
          }
        }
      } else {
        this.update({
          lyricsState: LyricsState.NO_TRACK,
        });
      }
    });
  }

  setLyricsVisible(visible: boolean): void {
    this.lyricsVisible = visible;
  }

  update({
    lyricsState,
    lyrics = null,
    url = null,
    lyricsTrackId = null,
  }: {
    lyricsState: LyricsState,
    lyrics?: string | null,
    url?: string | null,
    lyricsTrackId?: number | null,
  }): void {
    this.lyricsState = lyricsState;
    this.lyrics = lyrics;
    this.url = url;
    this.lyricsTrackId = lyricsTrackId;
  }
}

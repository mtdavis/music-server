import {action, autorun, observable} from 'mobx';
import LyricsState from '../lib/LyricsState';
import MusicStore from './MusicStore';

export default class LyricsStore {
  @observable lyricsState = LyricsState.NO_TRACK;
  @observable lyricsTrackId: number | null = null;
  @observable lyrics: string | null = null;
  @observable url: string | null = null;
  @observable lyricsVisible = false;
  musicStore: MusicStore;

  constructor(musicStore: MusicStore) {
    this.musicStore = musicStore;

    autorun(() => {
      if(!this.lyricsVisible) {
        return;
      }

      if(this.musicStore.currentTrack) {
        const nowPlayingId = this.musicStore.currentTrack.id;

        if(nowPlayingId !== this.lyricsTrackId) {
          this.lyrics = null;
          this.lyricsState = LyricsState.LOADING;
          this.lyricsTrackId = nowPlayingId;

          const url = `/lyrics?id=${nowPlayingId}`;
          fetch(url).then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json();
          }).then(result => {
            this.lyrics = result.lyrics;
            this.url = result.url;
            this.lyricsState = LyricsState.SUCCESSFUL;
          }).catch(() => {
            this.lyrics = null;
            this.url = null;
            this.lyricsState = LyricsState.FAILED;
          });
        }
      }
      else {
        this.lyrics = null;
        this.lyricsState = LyricsState.NO_TRACK;
        this.lyricsTrackId = null;
      }
    });
  }

  @action
  setLyricsVisible(visible: boolean) {
    this.lyricsVisible = visible;
  }
}

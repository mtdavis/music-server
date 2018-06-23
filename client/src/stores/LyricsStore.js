import {action, autorun, observable} from 'mobx';
import LyricsState from '../lib/LyricsState';

export default class LyricsStore {
  @observable lyricsState = LyricsState.NO_TRACK;
  @observable lyricsTrackId = null;
  @observable lyrics = null;
  @observable url = null;
  @observable lyricsVisible = false;

  constructor(musicStore) {
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

          $.ajax("/lyrics", {
            data: {id: nowPlayingId},
            success: (result) => {
              this.lyrics = result.lyrics;
              this.url = result.url;
              this.lyricsState = LyricsState.SUCCESSFUL;
            },
            error: () => {
              this.lyrics = null;
              this.url = null;
              this.lyricsState = LyricsState.FAILED;
            }
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
  setLyricsVisible(visible) {
    this.lyricsVisible = visible;
  }
}

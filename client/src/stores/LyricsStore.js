import {observable} from 'mobx';
import LyricsState from '../lib/LyricsState';

export default class LyricsStore {
  @observable lyricsState = LyricsState.NO_TRACK;
  @observable lyricsTrackId = null;
  @observable lyrics = null;

  getLyrics(musicStore) {
    if(musicStore.playlist.length > 0 ) {
      const nowPlayingId = musicStore.playlist[musicStore.nowPlaying].id;

      if(nowPlayingId !== this.lyricsTrackId) {
        this.lyrics = null;
        this.lyricsState = LyricsState.LOADING;
        this.lyricsTrackId = nowPlayingId;

        $.ajax("/lyrics", {
          data: {id: nowPlayingId},
          success: (lyrics) => {
            this.lyrics = lyrics;
            this.lyricsState = LyricsState.SUCCESSFUL;
          },
          error: () => {
            this.lyrics = null;
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
  }
}

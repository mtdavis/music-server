import Fluxxor from 'fluxxor';
import Actions from './Actions';
import LyricsState from '../lib/LyricsState';

module.exports = Fluxxor.createStore({

  initialize() {
    this.lyricsState = LyricsState.NO_TRACK;
    this.lyricsTrackId = null;
    this.lyrics = null;

    this.bindActions(
      Actions.GET_LYRICS, this.onGetLyrics,
    );
  },

  getState() {
    return {
      lyrics: this.lyrics,
      lyricsState: this.lyricsState,
    };
  },

  onGetLyrics() {
    this.waitFor(['MusicStore'], this.finishOnGetLyrics);
  },

  finishOnGetLyrics(musicStore) {
    if(musicStore.playlist.length > 0 ) {
      let nowPlayingId = musicStore.playlist[musicStore.nowPlaying].id;

      if(nowPlayingId !== this.lyricsTrackId) {
        this.lyrics = null;
        this.lyricsState = LyricsState.LOADING;
        this.lyricsTrackId = nowPlayingId;
        this.emit("change");

        $.ajax("/lyrics", {
          data: {id: nowPlayingId},
          success: function(lyrics) {
            this.lyrics = lyrics;
            this.lyricsState = LyricsState.SUCCESSFUL;
            this.emit("change");
          }.bind(this),
          error: function(error) {
            this.lyrics = null;
            this.lyricsState = LyricsState.FAILED;
            this.emit("change");
          }.bind(this)
        });
      }
    }
  },
});

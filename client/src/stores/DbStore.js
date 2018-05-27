import Fluxxor from 'fluxxor';
import Actions from './Actions';

export default Fluxxor.createStore({

  initialize() {
    this.albums = [];
    this.tracks = [];
    this.playlists = [];

    $.getJSON("/albums", function(albums) {
      this.albums = albums;
      this.emit("change");
    }.bind(this));

    $.getJSON("/tracks", function(tracks) {
      this.tracks = tracks;
      this.emit("change");
    }.bind(this));

    $.getJSON("/playlists", function(playlists) {
      this.playlists = playlists;
      this.emit("change");
    }.bind(this));

    this.bindActions(
      Actions.SCAN_FOR_CHANGED_METADATA, this.onScanForChangedMetadata,
      Actions.SCAN_FOR_MOVED_FILES, this.onScanForMovedFiles,
      Actions.SCAN_FOR_NEW_FILES, this.onScanForNewFiles
    );
  },

  getState() {
    return {
      albums: this.albums,
      tracks: this.tracks,
      playlists: this.playlists,
    };
  },

  onScanForChangedMetadata() {
    $.post("/tools/scan-for-changed-metadata");
  },

  onScanForMovedFiles() {
    $.post("/tools/scan-for-moved-files");
  },

  onScanForNewFiles() {
    $.post("/tools/scan-for-new-files");
  },
});

import {observable} from 'mobx';

export default class DbStore {
  @observable albums = [];
  @observable tracks = [];
  @observable playlists = [];

  constructor() {
    $.getJSON("/albums", (albums) => {
      this.albums = albums;
    });

    $.getJSON("/tracks", (tracks) => {
      this.tracks = tracks;
    });

    $.getJSON("/playlists", (playlists) => {
      this.playlists = playlists;
    });
  }

  scanForChangedMetadata() {
    $.post("/tools/scan-for-changed-metadata");
  }

  scanForMovedFiles() {
    $.post("/tools/scan-for-moved-files");
  }

  scanForNewFiles() {
    $.post("/tools/scan-for-new-files");
  }
}

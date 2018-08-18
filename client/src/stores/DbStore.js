import {action, observable} from 'mobx';

export default class DbStore {
  @observable albums = [];
  @observable tracks = [];
  @observable playlists = [];

  constructor() {
    $.getJSON("/albums", (albums) => {
      this.albums.replace(albums);
    });

    $.getJSON("/tracks", (tracks) => {
      this.tracks.replace(tracks);
    });

    $.getJSON("/playlists", (playlists) => {
      this.playlists.replace(playlists);
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

  @action
  incrementPlayCount(trackId, timestamp) {
    const track = this.tracks.find((t) => t.id === trackId);
    track.play_count += 1;
    track.last_play = timestamp;

    const albumId = track.album_id;
    if(albumId) {
      let albumLastPlay = track.last_play;
      let albumPlayCount = track.play_count;

      this.tracks.filter((t) => t.album_id === albumId).forEach((t) => {
        albumLastPlay = Math.min(t.last_play, albumLastPlay);
        albumPlayCount = Math.min(t.play_count, albumPlayCount);
      });

      const album = this.albums.find((a) => a.id === albumId);
      album.last_play = albumLastPlay;
      album.play_count = albumPlayCount;
    }
  }
}

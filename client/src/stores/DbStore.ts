import {action, IObservableArray, observable} from 'mobx';

export default class DbStore {
  @observable albums: IObservableArray<Album> = observable.array([]);
  @observable tracks: IObservableArray<Track> = observable.array([]);
  @observable playlists: IObservableArray<Playlist> = observable.array([]);

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
  incrementPlayCount(trackId: number, timestamp: number) {
    const track = this.tracks.find((t) => t.id === trackId);

    if(!track) {
      throw Error(`Could not find track with ID ${trackId}`);
    }

    track.play_count += 1;
    track.last_play = timestamp;

    const albumId = track.album_id;
    if(albumId) {
      let albumLastPlay = track.last_play;
      let albumPlayCount = track.play_count;

      this.tracks.filter((t) => t.album_id === albumId).forEach((t) => {
        albumLastPlay = Math.min(t.last_play || 0, albumLastPlay);
        albumPlayCount = Math.min(t.play_count, albumPlayCount);
      });

      const album = this.albums.find((a) => a.id === albumId);

      if(!album) {
        throw Error(`Could not find album with ID ${albumId}`);
      }

      album.last_play = albumLastPlay || null;
      album.play_count = albumPlayCount;
    }
  }

  getAlbumTracks(albumId: number) {
    const result: Array<Track> = this.tracks.filter((t) => t.album_id === albumId);
    result.sort((first, second) => {
      if(first.track_number === null && second.track_number === null) {
        return 0;
      }
      else if(first.track_number === null) {
        return -1;
      }
      else if(second.track_number === null) {
        return 1;
      }

      return first.track_number - second.track_number;
    });
    return result;
  }
}

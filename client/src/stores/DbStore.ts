import {
  action,
  IObservableArray,
  makeObservable,
  observable,
} from 'mobx';
import {get, put} from 'lib/util';

export default class DbStore {
  albumsLoading = true;
  albums: IObservableArray<Album> = observable.array([]);

  tracksLoading = true;
  tracks: IObservableArray<Track> = observable.array([]);

  playlistsLoading = true;
  playlists: IObservableArray<Playlist> = observable.array([]);

  scanning = false;
  scanResult = '';

  constructor() {
    makeObservable(this, {
      albumsLoading: observable,
      albums: observable,
      tracksLoading: observable,
      tracks: observable,
      playlistsLoading: observable,
      playlists: observable,
      scanning: observable,
      scanResult: observable,
      fetchAlbums: observable,
      fetchTracks: observable,
      fetchPlaylists: observable,
      incrementPlayCount: action,
      scan: action,
      editAlbum: action,
    });

    this.fetchAlbums();
    this.fetchTracks();
    this.fetchPlaylists();
  }

  fetchAlbums(): void {
    this.albumsLoading = true;

    get({
      url: '/albums',
      onSuccess: action((albums: Album[]) => {
        this.albums.replace(albums);
        this.albumsLoading = false;
      }),
    });
  }

  fetchTracks(): void {
    this.tracksLoading = true;

    get({
      url: '/tracks',
      onSuccess: action((tracks: Track[]) => {
        this.tracks.replace(tracks);
        this.tracksLoading = false;
      }),
    });
  }

  fetchPlaylists(): void {
    this.playlistsLoading = true;

    get({
      url: '/playlists',
      onSuccess: action((playlists: Playlist[]) => {
        this.playlists.replace(playlists);
        this.playlistsLoading = false;
      }),
    });
  }

  incrementPlayCount(trackId: number, timestamp: number): void {
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

  getAlbumTracks(albumId: number): Array<Track> {
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

  scan({
    dryRun
  }: {
    dryRun: boolean
  }): void {
    this.scanning = true;
    this.scanResult = '';

    put({
      url: '/scan',
      data: {dry_run: dryRun},
      onSuccess: action((result: string) => {
        this.scanning = false;
        this.scanResult = result;

        if(!dryRun) {
          this.fetchAlbums();
          this.fetchTracks();
        }
      }),
    });
  }

  editAlbum(albumId: number, starred: boolean): void {
    put({
      url: `/album/${albumId}`,
      data: {starred},
      onSuccess: action((result: Album) => {
        const albumIndex = this.albums.findIndex((a) => a.id === albumId);
        this.albums[albumIndex].starred = result.starred;
      }),
    });
  }
}

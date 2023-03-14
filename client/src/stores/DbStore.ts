import { get, put } from 'lib/util';
import {
  action,
  IObservableArray,
  makeObservable,
  observable,
} from 'mobx';
import { computedFn } from 'mobx-utils';

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

  async fetchAlbums(): Promise<void> {
    this.albumsLoading = true;
    const albums = await get<Album[]>('/api/albums/');
    this.albums.replace(albums);
    this.albumsLoading = false;
  }

  async fetchTracks(): Promise<void> {
    this.tracksLoading = true;

    const tracks = await get<Track[]>('/api/tracks/');
    this.tracks.replace(tracks);
    this.tracksLoading = false;
  }

  async fetchPlaylists(): Promise<void> {
    this.playlistsLoading = true;

    const playlists = await get<Playlist[]>('/api/playlists/');
    this.playlists.replace(playlists);
    this.playlistsLoading = false;
  }

  incrementPlayCount(trackId: number, timestamp: number): void {
    const track = this.tracks.find((t) => t.id === trackId);

    if (!track) {
      throw Error(`Could not find track with ID ${trackId}`);
    }

    track.play_count += 1;
    track.last_play = timestamp;

    const albumId = track.album_id;
    if (albumId) {
      let albumLastPlay = track.last_play;
      let albumPlayCount = track.play_count;

      this.tracks.filter((t) => t.album_id === albumId).forEach((t) => {
        albumLastPlay = Math.min(t.last_play || 0, albumLastPlay);
        albumPlayCount = Math.min(t.play_count, albumPlayCount);
      });

      const album = this.albums.find((a) => a.id === albumId);

      if (!album) {
        throw Error(`Could not find album with ID ${albumId}`);
      }

      album.last_play = albumLastPlay || null;
      album.play_count = albumPlayCount;
    }
  }

  getAlbumTracks(albumId: number): Array<Track> {
    const result: Array<Track> = this.tracks.filter((t) => t.album_id === albumId);
    result.sort((first, second) => {
      if (first.track_number === null && second.track_number === null) {
        return 0;
      }
      if (first.track_number === null) {
        return -1;
      }
      if (second.track_number === null) {
        return 1;
      }

      return first.track_number - second.track_number;
    });
    return result;
  }

  async scan({
    dryRun,
  }: {
    dryRun: boolean
  }): Promise<void> {
    this.scanning = true;
    this.scanResult = '';

    const result = await put<string>('/api/scan/', { dry_run: dryRun });
    this.scanning = false;
    this.scanResult = result;

    if (!dryRun) {
      this.fetchAlbums();
      this.fetchTracks();
    }
  }

  async editAlbum(albumId: number, starred: boolean): Promise<void> {
    const result = await put<Album>(`/api/albums/${albumId}`, { starred });
    const albumIndex = this.albums.findIndex((a) => a.id === albumId);
    this.albums[albumIndex].starred = result.starred;
  }

  getTrackOneForAlbum = computedFn((albumId: number): Track => (
    this.tracks.filter((track) => track.album_id === albumId && track.track_number === 1)[0]
  ));
}

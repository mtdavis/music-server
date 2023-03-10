import { BumpSerie } from '@nivo/bump';
import { get } from 'lib/util';
import {
  action,
  computed,
  IObservableArray,
  makeObservable,
  observable,
} from 'mobx';

interface Point {
  x: number;
  y: number;
}

type BumpStats = BumpSerie<Point, { hidden: boolean }>;

interface LineStats {
  id: string;
  data: [Point];
}

interface Stats {
  /* eslint-disable camelcase */
  genres_over_time: [BumpStats];
  artists_over_time: [BumpStats];
  albums_over_time: [BumpStats];
  listens_by_year: [LineStats];
  /* eslint-enable camelcase */
}

export enum StatsState {
  NOT_LOADED = 'NOT_LOADED',
  LOADED = 'LOADED',
}

export default class StatsStore {
  genresOverTime: IObservableArray<BumpStats> = observable.array([]);

  artistsOverTime: IObservableArray<BumpStats> = observable.array([]);

  albumsOverTime: IObservableArray<BumpStats> = observable.array([]);

  listensByYear: IObservableArray<LineStats> = observable.array([]);

  albumFilterText = '';

  state = StatsState.NOT_LOADED;

  constructor() {
    makeObservable(this, {
      genresOverTime: observable,
      artistsOverTime: observable,
      albumsOverTime: observable,
      listensByYear: observable,
      albumFilterText: observable,
      state: observable,
      loadStats: action,
      setAlbumFilterText: action,
      filteredAlbumsOverTime: computed,
    });
  }

  loadStats: () => void = () => {
    get({
      url: '/api/stats/',
      onSuccess: action((stats: Stats) => {
        this.genresOverTime.replace(stats.genres_over_time);
        this.artistsOverTime.replace(stats.artists_over_time);
        this.albumsOverTime.replace(stats.albums_over_time);
        this.listensByYear.replace(stats.listens_by_year);

        this.state = StatsState.LOADED;
      }),
    });
  };

  get filteredAlbumsOverTime(): BumpStats[] {
    return this.albumsOverTime.map((album) => ({
      ...album,
      hidden:
        this.albumFilterText !== ''
        && !album.id.toLowerCase().includes(this.albumFilterText.toLowerCase()),
    }));
  }

  setAlbumFilterText(newAlbumFilterText: string): void {
    this.albumFilterText = newAlbumFilterText;
  }
}

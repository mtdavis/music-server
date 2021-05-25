import {
  action,
  IObservableArray,
  makeObservable,
  observable,
} from 'mobx';
import {get} from 'lib/util';

interface Point {
  x: number;
  y: number;
}

interface BumpStats {
  id: string;
  data: [Point];
}

interface Stats {
  /* eslint-disable camelcase */
  genres_over_time: [BumpStats];
  artists_over_time: [BumpStats];
  albums_over_time: [BumpStats];
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
  state = StatsState.NOT_LOADED;

  constructor() {
    makeObservable(this, {
      genresOverTime: observable,
      artistsOverTime: observable,
      state: observable,
      loadStats: action,
    });
  }

  loadStats: () => void = () => {
    get({
      url: '/stats',
      onSuccess: action((stats: Stats) => {
        this.genresOverTime.replace(stats.genres_over_time);
        this.artistsOverTime.replace(stats.artists_over_time);
        this.albumsOverTime.replace(stats.albums_over_time);

        this.state = StatsState.LOADED;
      }),
    });
  }
}

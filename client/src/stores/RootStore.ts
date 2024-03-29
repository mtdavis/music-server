import type { Router } from '@remix-run/router';
import { FilterStoreMap } from 'lib/table/FilterStore';
import { SortStoreMap } from 'lib/table/SortStore';

import DbStore from './DbStore';
import LyricsStore from './LyricsStore';
import MusicStore from './MusicStore';
import ScrobbleStore from './ScrobbleStore';
import StatsStore from './StatsStore';
import UiStore from './UiStore';

export default class RootStore {
  dbStore: DbStore;

  musicStore: MusicStore;

  lyricsStore: LyricsStore;

  scrobbleStore: ScrobbleStore;

  statsStore: StatsStore;

  uiStore: UiStore;

  filterStoreMap: FilterStoreMap;

  sortStoreMap: SortStoreMap;

  constructor(router: Router) {
    this.dbStore = new DbStore();
    this.musicStore = new MusicStore(this.dbStore, router);
    this.lyricsStore = new LyricsStore(this.musicStore);
    this.scrobbleStore = new ScrobbleStore(this.musicStore, this.dbStore);
    this.statsStore = new StatsStore();
    this.uiStore = new UiStore();
    this.filterStoreMap = new FilterStoreMap();
    this.sortStoreMap = new SortStoreMap();
  }
}

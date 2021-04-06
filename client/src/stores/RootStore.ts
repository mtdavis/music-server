import DbStore from './DbStore';
import LyricsStore from './LyricsStore';
import MusicStore from './MusicStore';
import ScrobbleStore from './ScrobbleStore';
import UiStore from './UiStore';

export default class RootStore {
  dbStore: DbStore;
  musicStore: MusicStore;
  lyricsStore: LyricsStore;
  scrobbleStore: ScrobbleStore;
  uiStore: UiStore;

  constructor() {
    this.dbStore = new DbStore();
    this.musicStore = new MusicStore(this.dbStore);
    this.lyricsStore = new LyricsStore(this.musicStore);
    this.scrobbleStore = new ScrobbleStore(this.musicStore, this.dbStore);
    this.uiStore = new UiStore();
  }
}

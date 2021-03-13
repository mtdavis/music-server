declare module 'pauseable' {
  export class timer {
    pause(): void;
    resume(): void;
    clear(): void;
  }
  export function setTimeout(fn: () => any, ms: number): timer
}

declare module 'nosleep.js' {
  export default class NoSleep {
    constructor();
    enable(): void;
    disable(): void;
  }
}

declare class Gapless5 {
  constructor(elemId: string);
  pause(): void;
  play(): void;
  stop(): void;
  addTrack(audioPath: string): void;
  removeAllTracks(): void;
  gotoTrack(newIndex: number, forcePlay: boolean): void;
  prevtrack(): void;
  next(): void;
  scrub(position: number): void;
  setGain(position: number): void;
  getCurrentTrackPosition(): number;

  //callbacks
  onplay(): void;
  onpause(): void;
  onstop(): void;
  onfinishedtrack(): void;
  onfinishedall(): void;
  onprev(): void;
  onnext(): void;
}

// from: https://github.com/loktar00/react-lazy-load/issues/126#issuecomment-715669016
declare module 'react-lazy-load' {
  interface Props {
    className?: string;
    height?: number | string;
    width?: number | string;
    debounce?: boolean;
    elementType?: string;
    offset?: number;
    offsetBottom?: number;
    offsetHorizontal?: number;
    offsetLeft?: number;
    offsetRight?: number;
    offsetTop?: number;
    offsetVertical?: number;
    threshold?: number;
    children?: React.ReactNode;
    throttle?: number | boolean;
    onContentVisible?: () => void;
  }

  const LazyLoad: React.FC<Props>;
  export default LazyLoad;
}

interface RowData {
  id: number;
  [key: string]: any;
}

declare interface Album extends RowData {
  album_artist: string;
  album: string;
  genre: string;
  duration: number;
  tracks: number;
  year: number;
  release_date: number;
  last_play: number | null;
  play_count: number;
}

declare interface Track extends RowData {
  title: string;
  artist: string;
  album: string | null;
  album_id: number | null;
  genre: string;
  track_number: number | null;
  release_date: number | null;
  duration: number;
  path: string;
  last_play: number | null;
  play_count: number;
  last_modified: number;
  year: number;
}

declare interface Playlist extends RowData {
  title: string;
  tracks: number;
  duration: number;
  last_play: number | null;
  play_count: number;
}

declare interface ColumnConfig {
  key: string;
  label?: string;
  align?: 'left' | 'right';
  renderer?: (value: any) => (string | number | React.ReactNode);
  wrap?: boolean;
}

type SortOrder = 1 | -1;

declare interface SortSpec {
  columnKey: string;
  order: SortOrder;
}

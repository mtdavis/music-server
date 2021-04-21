declare const __DEMO_MODE__: boolean;

declare module 'pauseable' {
  export class timer {
    pause(): void;
    resume(): void;
    clear(): void;
  }
  export function setTimeout(fn: () => void, ms: number): timer
}

declare module 'nosleep.js' {
  export default class NoSleep {
    constructor();
    enable(): void;
    disable(): void;
  }
}

declare module 'splitargs' {
  export default function splitargs(input: string, sep?: string, keepQuotes?: boolean): string[];
}

declare module 'gapless5' {
  export default class Gapless5 {
    constructor();
    tickMS: number;

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

    // callbacks
    onplay(): void;
    onpause(): void;
    onstop(): void;
    onfinishedtrack(): void;
    onfinishedall(): void;
    onprev(): void;
    onnext(): void;
    onpositionupdate(position: number): void;
  }
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

type NullableString = string | null;
type NullableNumber = number | null;

type RowDataValue = NullableNumber | NullableString;

interface RowData {
  id: number;
  [key: string]: RowDataValue;
}

declare interface Album extends RowData {
  /* eslint-disable camelcase */
  album_artist: string;
  album: string;
  genre: string;
  duration: number;
  tracks: number;
  year: number;
  release_date: number;
  last_play: NullableNumber;
  play_count: number;
  /* eslint-enable camelcase */
}

declare interface Track extends RowData {
  /* eslint-disable camelcase */
  title: string;
  artist: string;
  album: NullableString;
  album_id: NullableNumber;
  genre: string;
  track_number: NullableNumber;
  release_date: NullableNumber;
  duration: number;
  path: string;
  last_play: NullableNumber;
  play_count: number;
  last_modified: number;
  year: number;
  /* eslint-enable camelcase */
}

declare interface Playlist extends RowData {
  /* eslint-disable camelcase */
  title: string;
  tracks: number;
  duration: number;
  last_play: NullableNumber;
  play_count: number;
  /* eslint-enable camelcase */
}

declare interface ColumnConfig<T extends RowData> {
  key: keyof T;
  label?: string;
  align?: "left" | "right";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderer?: (value: any) => (string | number);
  wrap?: boolean;
}

declare interface SortSpec<R extends RowData> {
  columnKey: keyof R;
  order?: import('lib/table/SortOrder').default;
}

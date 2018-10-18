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

declare interface Album {
  id: number;
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

declare interface Track {
  id: number;
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

declare interface Playlist {
  id: number;
  title: string;
  tracks: number;
  duration: number;
  last_play: number | null;
  play_count: number;
}

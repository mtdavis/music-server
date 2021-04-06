interface GetParams<T> {
  url: string;
  onSuccess: (json: T) => void;
  onError?: (error: string) => void;
}

export function get<T>({
  url,
  onSuccess,
  onError = (error: string) => { console.error(error); },
}: GetParams<T>): void {
  fetch(url).then(response => {
    if(!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.json();
  }).then(onSuccess).catch(onError);
}

interface PutParams<T> {
  url: string;
  data?: {[key: string]: number | string | boolean | null};
  onSuccess?: (json: T) => void;
  onError?: (error: string) => void;
}

export function put<T>({
  url,
  data,
  onSuccess = (_json: T) => {},
  onError = (error: string) => { console.error(error); },
}: PutParams<T>): void {
  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  }).then(response => {
    if(!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.json();
  }).then(onSuccess).catch(onError);
}

export function secondsToTimeString(epochSeconds: number): string {
  const hours = Math.floor(epochSeconds / 3600);
  const minutes = Math.floor((epochSeconds - (hours * 3600)) / 60);
  const seconds = epochSeconds - (hours * 3600) - (minutes * 60);

  const ss = seconds < 10 ? "0" + seconds : String(seconds);

  if(hours > 0) {
    const mm = minutes < 10 ? "0" + minutes : String(minutes);

    return hours + ':' + mm + ':' + ss;
  }


  return minutes + ':' + ss;
}

export function timeStringToSeconds(timeString: string): number {
  const split = timeString.split(":");
  const minutes = parseInt(split[0], 10);
  const seconds = Number(split[1]);
  return (minutes * 60) + seconds;
}

export function unixTimestampToDateString(timestamp: number): string {
  const dateObj = new Date(timestamp * 1000);
  return dateObj.toISOString().substring(0, 10);
}

export function unixTimestampToYear(timestamp: number): number {
  const dateObj = new Date(timestamp * 1000);
  return dateObj.getUTCFullYear();
}

function cleanString(str: string): string {
  str = str.toLowerCase();
  if(str.startsWith('the ')) {
    str = str.substring(4);
  }
  return str;
}

function compareNumbers(valA: number, valB: number): number {
  return valA - valB;
}

function compareStrings(valA: string, valB: string): number {
  valA = cleanString(valA);
  valB = cleanString(valB);

  if(valA < valB) {
    return -1;
  }
  else if(valA === valB) {
    return 0;
  }
  else {
    return 1;
  }
}

export function compare<T extends RowDataValue>(valA: T, valB: T): number {
  if(valA === null) {
    return valB === null ? 0 : -1;
  }
  else if(valB === null) {
    return 1;
  }
  else if(typeof valA === 'number' && typeof valB === 'number') {
    return compareNumbers(valA, valB);
  }
  else {
    return compareStrings(String(valA), String(valB));
  }
}

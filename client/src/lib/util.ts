export async function get<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function put<T>(
  url: string,
  data?: { [key: string]: number | string | boolean | null },
): Promise<T> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function secondsToTimeString(epochSeconds: number): string {
  const hours = Math.floor(epochSeconds / 3600);
  const minutes = Math.floor((epochSeconds - (hours * 3600)) / 60);
  const seconds = epochSeconds - (hours * 3600) - (minutes * 60);

  const ss = seconds < 10 ? `0${seconds}` : String(seconds);

  if (hours > 0) {
    const mm = minutes < 10 ? `0${minutes}` : String(minutes);

    return `${hours}:${mm}:${ss}`;
  }

  return `${minutes}:${ss}`;
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
  let result = str.toLowerCase();
  if (result.startsWith('the ')) {
    result = result.substring(4);
  }
  return result;
}

function compareNumbers(valA: number, valB: number): number {
  return valA - valB;
}

function compareStrings(valA: string, valB: string): number {
  const cleanValA = cleanString(valA);
  const cleanValB = cleanString(valB);

  if (cleanValA < cleanValB) {
    return -1;
  }
  if (cleanValA === cleanValB) {
    return 0;
  }

  return 1;
}

export function compare<T extends RowDataValue>(valA: T, valB: T): number {
  if (valA === null) {
    return valB === null ? 0 : -1;
  }
  if (valB === null) {
    return 1;
  }
  if (typeof valA === 'number' && typeof valB === 'number') {
    return compareNumbers(valA, valB);
  }

  return compareStrings(String(valA), String(valB));
}

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

export function compare<T extends any>(valA: T, valB: T): number {
  if(typeof(valA) === "string") {
    valA = valA.toLowerCase();

    if(valA.startsWith("the ")) {
      valA = valA.substring(4);
    }
  }

  if(typeof(valB) === "string") {
    valB = valB.toLowerCase();

    if(valB.startsWith("the ")) {
      valB = valB.substring(4);
    }
  }

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

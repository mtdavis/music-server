export function secondsToTimeString(seconds) {
  const hh = Math.floor(seconds / 3600);
  let mm = Math.floor((seconds - (hh * 3600)) / 60);
  let ss = seconds - (hh * 3600) - (mm * 60);

  if(ss < 10) {
    ss = "0" + ss;
  }

  if(hh > 0) {
    if(mm < 10) {
      mm = "0" + mm;
    }

    return hh + ':' + mm + ':' + ss;
  }


  return mm + ':' + ss;
}

export function timeStringToSeconds(timeString) {
  const split = timeString.split(":");
  const minutes = parseInt(split[0], 10);
  const seconds = Number(split[1]);
  return (minutes * 60) + seconds;
}

export function unixTimestampToDateString(timestamp) {
  const dateObj = new Date(timestamp * 1000);

  const year = dateObj.getUTCFullYear();

  let month = dateObj.getUTCMonth()+1;
  if(month < 10) {
    month = "0" + month;
  }

  let date = dateObj.getUTCDate();
  if(date < 10) {
    date = "0" + date;
  }

  return year + "-" + month + "-" + date;
}

export function unixTimestampToYear(timestamp) {
  const dateObj = new Date(timestamp * 1000);
  return dateObj.getUTCFullYear();
}

export function compare(valA, valB) {
  if(typeof(valA) === "string" && valA.startsWith("The ")) {
    valA = valA.substring(4);
  }

  if(typeof(valB) === "string" && valB.startsWith("The ")) {
    valB = valB.substring(4);
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

import Fluxxor from 'Fluxxor';
import React from 'react';

export const FluxMixin = Fluxxor.FluxMixin(React);

export function secondsToTimeString(seconds) {
  var minutes = Math.floor(seconds / 60);
  var remainderSeconds = seconds % 60;
  var leadingZero = remainderSeconds < 10 ? "0" : "";
  return minutes + ":" + leadingZero + remainderSeconds;
}

export function timeStringToSeconds(timeString) {
  var split = timeString.split(":");
  var minutes = parseInt(split[0], 10);
  var seconds = Number(split[1]);
  return minutes * 60 + seconds;
}

export function unixTimestampToDateString(timestamp) {
  var dateObj = new Date(timestamp * 1000);

  var year = dateObj.getFullYear();

  var month = dateObj.getMonth()+1;
  if(month < 10) {
    month = "0" + month;
  }

  var date = dateObj.getDate();
  if(date < 10) {
    date = "0" + date;
  }

  return year + "-" + month + "-" + date;
}

export function withFlux(Component) {
  return React.createClass({
    mixins: [FluxMixin],

    render() {
      return <Component {...this.props} />;
    }
  });
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

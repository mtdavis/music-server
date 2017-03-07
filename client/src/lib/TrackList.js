import React from 'react';
import {Snackbar} from 'material-ui';
import {
  FluxMixin,
  secondsToTimeString,
  unixTimestampToDateString,
} from './util';
import MTable from './table/MTable';
import FilteredTable from './table/FilteredTable';

const TrackList = React.createClass({
  mixins: [FluxMixin],

  getDefaultProps() {
    return {
      tracks: []
    };
  },

  getInitialState() {
    return {
      enqueueSnackbarOpen: false
    };
  },

  render() {
    var columns = [
      {key:"artist", header:"Artist"},
      {key:"album", header:"Album"},
      {key:"title", header:"Title"},
      {key:"track_number", header:"#"},
      {key:"year", header:"Year", textAlign:"right"},
      {key:"duration", header:"Duration", renderer:secondsToTimeString, textAlign:"right", wrap:false},
      {key:"play_count", header:"Play Count", textAlign:"right"},
      {key:"last_play", header:"Last Play", renderer:unixTimestampToDateString, textAlign:"right", wrap:false}
    ];

    var table = (
      <MTable
        {...this.props}
        onRowClick={this.onTrackClick}
        onRowCtrlClick={this.onTrackCtrlClick}
        rowLimit={500}
      />
    );

    return (
      <div>
        <FilteredTable
          table={table}
          rows={this.props.tracks}
          columns={columns}
          filterKeys={['genre', 'artist', 'album']} />

        <Snackbar
          message="Track enqueued."
          open={this.state.enqueueSnackbarOpen}
        />
      </div>
    );
  },

  onTrackClick(track) {
    this.getFlux().actions.playTrack(track);
  },

  onTrackCtrlClick(track) {
    this.setState({enqueueSnackbarOpen: true});
    this.getFlux().actions.enqueueTrack(track);

    setTimeout(() => {
      this.setState({enqueueSnackbarOpen: false});
    }, 2000);
  }
});

export default TrackList;

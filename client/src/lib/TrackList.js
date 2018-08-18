import React, {Component, PropTypes} from 'react';
import {inject, observer} from 'mobx-react';
import {Snackbar} from 'material-ui';
import {
  secondsToTimeString,
  unixTimestampToDateString,
} from './util';
import MTable from './table/MTable';
import FilteredTable from './table/FilteredTable';

@inject('musicStore')
@observer
export default class TrackList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      enqueueSnackbarOpen: false
    };
  }

  render() {
    const columns = [
      {key:"artist", header:"Artist"},
      {key:"album", header:"Album"},
      {key:"title", header:"Title"},
      {key:"track_number", header:"#", textAlign:"right"},
      {key:"year", header:"Year", textAlign:"right"},
      {key:"duration", header:"Duration", renderer:secondsToTimeString, textAlign:"right", wrap:false},
      {key:"play_count", header:"Play Count", textAlign:"right"},
      {key:"last_play", header:"Last Play", renderer:unixTimestampToDateString, textAlign:"right", wrap:false}
    ];

    const table = (
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
  }

  onTrackClick = (track) => {
    this.props.musicStore.playTrack(track);
  }

  onTrackCtrlClick = (track) => {
    this.setState({enqueueSnackbarOpen: true});
    this.props.musicStore.enqueueTrack(track);

    setTimeout(() => {
      this.setState({enqueueSnackbarOpen: false});
    }, 2000);
  }
}

TrackList.propTypes = {
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      artist: PropTypes.string.isRequired,
      album: PropTypes.string,
      title: PropTypes.string.isRequired,
      track_number: PropTypes.number,
      year: PropTypes.number,
      duration: PropTypes.number.isRequired,
      play_count: PropTypes.number.isRequired,
      last_play: PropTypes.number
    })
  ),

  ...MTable.propTypes
};

TrackList.defaultProps = {
  tracks: []
};

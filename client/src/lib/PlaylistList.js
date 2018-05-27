import React, {PropTypes} from 'react';
import {Snackbar} from 'material-ui';
import {
  FluxMixin,
  secondsToTimeString,
  unixTimestampToDateString,
} from './util';
import MTable from './table/MTable';
import FilteredTable from './table/FilteredTable';

const PlaylistList = React.createClass({
  mixins: [FluxMixin],

  propTypes: {
    playlists: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        tracks: PropTypes.number.isRequired,
        duration: PropTypes.number.isRequired,
        last_play: PropTypes.number,
        play_count: PropTypes.number.isRequired,
      })
    ),

    ...MTable.propTypes
  },

  getDefaultProps() {
    return {
      playlists: []
    };
  },

  render() {
    const columns = [
      {key:"title", header:"Title"},
      {key:"tracks", header:"Tracks"},
      {key:"duration", header:"Duration", renderer:secondsToTimeString, textAlign:"right", wrap:false},
      {key:"last_play", header:"Last Play", renderer:unixTimestampToDateString, textAlign:"right", wrap:false},
      {key:"play_count", header:"Play Count", textAlign:"right"}
    ];

    const table = (
      <MTable
        {...this.props}
        onRowClick={this.onPlaylistClick}
      />
    );

    return (
      <div>
        <FilteredTable
          table={table}
          rows={this.props.playlists}
          columns={columns}
          filterKeys={[]} />
      </div>
    );
  },

  onPlaylistClick(playlist) {
    this.getFlux().actions.playPlaylist(playlist);
  }
});

export default PlaylistList;

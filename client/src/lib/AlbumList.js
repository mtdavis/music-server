import React, {PropTypes} from 'react';
import {Snackbar} from 'material-ui';
import {
  FluxMixin,
  secondsToTimeString,
  unixTimestampToDateString,
  unixTimestampToYear,
} from './util';
import MTable from './table/MTable';
import FilteredTable from './table/FilteredTable';

const AlbumList = React.createClass({
  mixins: [FluxMixin],

  propTypes: {
    albums: PropTypes.arrayOf(
      PropTypes.shape({
        album_artist: PropTypes.string.isRequired,
        album: PropTypes.string.isRequired,
        year: PropTypes.number,
        release_date: PropTypes.number,
        tracks: PropTypes.number.isRequired,
        duration: PropTypes.number.isRequired,
        play_count: PropTypes.number.isRequired,
        last_play: PropTypes.number
      })
    ),

    ...MTable.propTypes
  },

  getDefaultProps() {
    return {
      albums: []
    };
  },

  getInitialState() {
    return {
      enqueueSnackbarOpen: false
    };
  },

  render() {
    const columns = [
      {key:"album_artist", header:"Album Artist"},
      {key:"album", header:"Album"},
      {key:"release_date", header:"Year", renderer: unixTimestampToYear, textAlign:"right"},
      {key:"tracks", header:"Tracks", textAlign:"right"},
      {key:"duration", header:"Duration", renderer:secondsToTimeString, textAlign:"right", wrap:false},
      {key:"play_count", header:"Play Count", textAlign:"right"},
      {key:"last_play", header:"Last Play", renderer:unixTimestampToDateString, textAlign:"right", wrap:false}
    ];

    const table = (
      <MTable
        {...this.props}
        onRowClick={this.onAlbumClick}
        onRowCtrlClick={this.onAlbumCtrlClick}
      />
    );

    return (
      <div>
        <FilteredTable
          table={table}
          rows={this.props.albums}
          columns={columns}
          filterKeys={['genre', 'album_artist']} />

        <Snackbar
          message="Album enqueued."
          open={this.state.enqueueSnackbarOpen}
        />
      </div>
    );
  },

  onAlbumClick(album) {
    this.getFlux().actions.playAlbum(album);
  },

  onAlbumCtrlClick(album) {
    this.setState({enqueueSnackbarOpen: true});
    this.getFlux().actions.enqueueAlbum(album);

    setTimeout(() => {
      this.setState({enqueueSnackbarOpen: false});
    }, 2000);
  }
});

export default AlbumList;

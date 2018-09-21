import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';
import {Snackbar} from '@material-ui/core';
import {
  secondsToTimeString,
  unixTimestampToDateString,
  unixTimestampToYear,
} from './util';
import MTable from './table/MTable';
import FilteredTable from './table/FilteredTable';

@inject('musicStore')
@observer
export default class AlbumList extends Component {

  constructor(props) {
    super(props);

    this.state = {
      enqueueSnackbarOpen: false
    };
  }

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
  }

  onAlbumClick = (album) => {
    this.props.musicStore.playAlbum(album);
  }

  onAlbumCtrlClick = (album) => {
    this.setState({enqueueSnackbarOpen: true});
    this.props.musicStore.enqueueAlbum(album);

    setTimeout(() => {
      this.setState({enqueueSnackbarOpen: false});
    }, 2000);
  }
}

AlbumList.propTypes = {
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
};

AlbumList.defaultProps = {
  albums: []
};

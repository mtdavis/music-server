import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';
import {
  secondsToTimeString,
  unixTimestampToDateString,
} from './util';
import MTable from './table/MTable';
import FilteredTable from './table/FilteredTable';

@inject('musicStore')
@observer
export default class PlaylistList extends Component {

  render() {
    const columns = [
      {key:"title", header:"Title"},
      {key:"tracks", header:"Tracks", textAlign:"right"},
      {key:"duration", header:"Duration", renderer:secondsToTimeString, textAlign:"right", wrap:false},
      {key:"play_count", header:"Play Count", textAlign:"right"},
      {key:"last_play", header:"Last Play", renderer:unixTimestampToDateString, textAlign:"right", wrap:false},
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
  }

  onPlaylistClick = (playlist) => {
    this.props.musicStore.playPlaylist(playlist);
  }
}

PlaylistList.propTypes = {
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
};

PlaylistList.defaultProps = {
  playlists: []
};

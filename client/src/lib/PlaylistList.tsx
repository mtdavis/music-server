import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';
import {
  secondsToTimeString,
  unixTimestampToDateString,
} from './util';
import VTable, {Props as VTableProps} from './table/VTable';
import FilteredTable from './table/FilteredTable';
import {MusicStore} from '../stores';

interface Props {
  rows: Playlist[];
  loading?: boolean;
  initialSortSpecs?: SortSpec[],
}

interface InjectedProps extends Props {
  musicStore: MusicStore;
}

@inject('musicStore')
@observer
export default class PlaylistList extends Component<Props> {
  get injected() {
    return this.props as InjectedProps;
  }

  render() {
    const columns = [
      {
        key: "title",
        label: "Title"
      },
      {
        key: "tracks",
        label: "Tracks",
        align: 'right' as 'right',
      },
      {
        key: "duration",
        label: "Duration",
        renderer: secondsToTimeString,
        align: 'right' as 'right',
        wrap: false,
      },
      {
        key: "play_count",
        label: "Play Count",
        align: 'right' as 'right',
      },
      {
        key: "last_play",
        label: "Last Play",
        renderer: unixTimestampToDateString,
        align: 'right' as 'right',
        wrap: false,
      },
    ];

    const {rows, ...props} = this.props;

    return (
      <FilteredTable
        rows={rows}
        columns={columns}
        filterKeys={[]}
      >
        {filteredRows =>
          <VTable
            {...props}
            rows={filteredRows}
            columns={columns}
            onRowClick={this.onPlaylistClick as (row: RowData) => void} // FIXME?!
            onRowCtrlClick={undefined} // FIXME?!
            placeholderText='No playlists found for these filters.'
          />
        }
      </FilteredTable>
    );
  }

  onPlaylistClick = (playlist: Playlist) => {
    this.injected.musicStore.playPlaylist(playlist);
  }
}

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';
import {Snackbar} from '@material-ui/core';

import {
  secondsToTimeString,
  unixTimestampToDateString,
  unixTimestampToYear,
} from './util';
import VTable, {Props as VTableProps} from './table/VTable';
import FilteredTable from './table/FilteredTable';
import {MusicStore} from '../stores';

interface Props {
  rows: Album[];
  loading?: boolean;
  initialSortSpecs?: SortSpec[],
}

interface InjectedProps extends Props {
  musicStore: MusicStore;
}

interface State {
  enqueueSnackbarOpen: boolean;
}

@inject('musicStore')
@observer
export default class AlbumList extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      enqueueSnackbarOpen: false
    };
  }

  get injected() {
    return this.props as InjectedProps;
  }

  render() {
    const columns = [
      {
        key: "album_artist",
        label: "Album Artist",
      },
      {
        key: "album",
        label: "Album",
      },
      {
        key: "release_date",
        label: "Year",
        renderer: unixTimestampToYear,
        align: 'right' as 'right',
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
      <>
        <FilteredTable
          rows={rows}
          columns={columns}
          filterKeys={['genre', 'album_artist']}
        >
          {filteredRows =>
            <VTable
              {...props}
              columns={columns}
              rows={filteredRows}
              onRowClick={this.onAlbumClick as (row: RowData) => void} // FIXME?!
              onRowCtrlClick={this.onAlbumCtrlClick as (row: RowData) => void} // FIXME?!
              placeholderText='No albums found for these filters.'
            />
          }
        </FilteredTable>

        <Snackbar
          message="Album enqueued."
          open={this.state.enqueueSnackbarOpen}
        />
      </>
    );
  }

  onAlbumClick = (album: Album) => {
    this.injected.musicStore.playAlbum(album);
  }

  onAlbumCtrlClick = (album: Album) => {
    this.setState({enqueueSnackbarOpen: true});
    this.injected.musicStore.enqueueAlbum(album);

    setTimeout(() => {
      this.setState({enqueueSnackbarOpen: false});
    }, 2000);
  }
}

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';
import {Snackbar} from '@material-ui/core';

import {
  secondsToTimeString,
  unixTimestampToDateString,
} from './util';
import VTable, {Props as VTableProps} from './table/VTable';
import FilteredTable from './table/FilteredTable';
import {MusicStore} from '../stores';

interface Props {
  rows: Track[];
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
export default class TrackList extends Component<Props, State> {
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
        key: "artist",
        label: "Artist",
      },
      {
        key: "album",
        label: "Album",
      },
      {
        key: "title",
        label: "Title",
      },
      {
        key: "track_number",
        label: "#",
        align: 'right' as 'right',
      },
      {
        key: "year",
        label: "Year",
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
      }
    ];

    const {rows, ...props} = this.props;

    return (
      <>
        <FilteredTable
          rows={rows}
          columns={columns}
          filterKeys={['genre', 'artist', 'album']}
        >
          {filteredRows =>
            <VTable
              {...props}
              rows={filteredRows}
              columns={columns}
              onRowClick={this.onTrackClick as (row: RowData) => void} // FIXME?!
              onRowCtrlClick={this.onTrackCtrlClick as (row: RowData) => void} // FIXME?!
              placeholderText='No tracks found for these filters.'
            />
          }
        </FilteredTable>

        <Snackbar
          message="Track enqueued."
          open={this.state.enqueueSnackbarOpen}
        />
      </>
    );
  }

  onTrackClick = (track: Track) => {
    this.injected.musicStore.playTrack(track);
  }

  onTrackCtrlClick = (track: Track) => {
    this.setState({enqueueSnackbarOpen: true});
    this.injected.musicStore.enqueueTrack(track);

    setTimeout(() => {
      this.setState({enqueueSnackbarOpen: false});
    }, 2000);
  }
}

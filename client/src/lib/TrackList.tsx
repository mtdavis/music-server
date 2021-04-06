import React from 'react';
import {observer} from 'mobx-react-lite';
import {Snackbar} from '@material-ui/core';

import {
  secondsToTimeString,
  unixTimestampToDateString,
} from './util';
import VTable from './table/VTable';
import FilteredTable from './table/FilteredTable';
import {useStores} from 'stores';

interface Props {
  rows: Track[];
  loading?: boolean;
  initialSortSpecs?: SortSpec<Track>[],
}

const COLUMNS = [
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
    align: 'right' as const,
  },
  {
    key: "year",
    label: "Year",
    align: 'right' as const,
  },
  {
    key: "duration",
    label: "Duration",
    renderer: secondsToTimeString,
    align: 'right' as const,
    wrap: false,
  },
  {
    key: "play_count",
    label: "Play Count",
    align: 'right' as const,
  },
  {
    key: "last_play",
    label: "Last Play",
    renderer: unixTimestampToDateString,
    align: 'right' as const,
    wrap: false,
  }
];

const TrackList = ({
  rows,
  ...props
}: Props) => {
  const {musicStore} = useStores();
  const [enqueueSnackbarOpen, setEnqueueSnackbarOpen] = React.useState(false);

  const onTrackClick = (track: Track): void => {
    musicStore.playTrack(track);
  };

  const onTrackCtrlClick = (track: Track): void => {
    setEnqueueSnackbarOpen(true);
    musicStore.enqueueTrack(track);

    setTimeout(() => {
      setEnqueueSnackbarOpen(false);
    }, 2000);
  };

  return (
    <>
      <FilteredTable<Track>
        rows={rows}
        columns={COLUMNS}
        filterKeys={['genre', 'artist', 'album']}
      >
        {filteredRows =>
          <VTable<Track>
            {...props}
            rows={filteredRows}
            columns={COLUMNS}
            onRowClick={onTrackClick}
            onRowCtrlClick={onTrackCtrlClick}
            placeholderText='No tracks found for these filters.'
          />
        }
      </FilteredTable>

      <Snackbar
        message="Track enqueued."
        open={enqueueSnackbarOpen}
      />
    </>
  );
};

export default observer(TrackList);

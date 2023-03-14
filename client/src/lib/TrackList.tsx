import React from 'react';

import { Snackbar } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';

import FilteredTable from './table/FilteredTable';

interface Props {
  id: string,
  rows: Track[];
  loading?: boolean;
  initialSortSpecs?: SortSpec<Track>[],
}

const COLUMNS = [
  {
    key: 'artist',
    label: 'Artist',
  },
  {
    key: 'album',
    label: 'Album',
  },
  {
    key: 'title',
    label: 'Title',
  },
  {
    key: 'track_number',
    label: '#',
    align: 'right' as const,
  },
  {
    key: 'year',
    label: 'Year',
    align: 'right' as const,
  },
  {
    key: 'duration',
    label: 'Duration',
    type: 'duration' as const,
    align: 'right' as const,
    wrap: false,
  },
  {
    key: 'play_count',
    label: 'Play Count',
    align: 'right' as const,
  },
  {
    key: 'last_play',
    label: 'Last Play',
    type: 'date' as const,
    align: 'right' as const,
    wrap: false,
  },
];

const TrackList = ({
  id,
  rows,
  ...props
}: Props) => {
  const { musicStore } = useStores();
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
        id={id}
        rows={rows}
        columns={COLUMNS}
        filterKeys={['genre', 'artist', 'album']}
        VTableProps={{
          ...props,
          onRowClick: onTrackClick,
          onRowCtrlClick: onTrackCtrlClick,
          placeholderText: 'No tracks found for these filters.',
        }}
      />

      <Snackbar
        message='Track enqueued.'
        open={enqueueSnackbarOpen}
      />
    </>
  );
};

export default observer(TrackList);

import React from 'react';

import { Snackbar } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';

import FilteredTable from './table/FilteredTable';

interface Props {
  id: string;
  rows: Album[];
  loading?: boolean;
  initialSortSpecs?: SortSpec<Album>[];
}

const COLUMNS = [
  {
    key: 'starred',
    label: '',
    type: 'star' as const,
    fixedWidth: 68,
  },
  {
    key: 'album_artist',
    label: 'Album Artist',
  },
  {
    key: 'album',
    label: 'Album',
  },
  {
    key: 'release_date',
    label: 'Year',
    type: 'year' as const,
    align: 'right' as const,
  },
  {
    key: 'tracks',
    label: 'Tracks',
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

const AlbumList = ({
  id,
  rows,
  ...props
}: Props) => {
  const { musicStore } = useStores();
  const [enqueueSnackbarOpen, setEnqueueSnackbarOpen] = React.useState(false);

  const onAlbumClick = (album: Album) => {
    musicStore.playAlbum(album);
  };

  const onAlbumCtrlClick = (album: Album) => {
    setEnqueueSnackbarOpen(true);
    musicStore.enqueueAlbum(album);

    setTimeout(() => {
      setEnqueueSnackbarOpen(false);
    }, 2000);
  };

  return (
    <>
      <FilteredTable<Album>
        id={id}
        rows={rows}
        columns={COLUMNS}
        filterKeys={['genre', 'album_artist']}
        VTableProps={{
          ...props,
          onRowClick: onAlbumClick,
          onRowCtrlClick: onAlbumCtrlClick,
          placeholderText: 'No albums found for these filters.',
        }}
      />

      <Snackbar
        message='Album enqueued.'
        open={enqueueSnackbarOpen}
      />
    </>
  );
};

export default observer(AlbumList);

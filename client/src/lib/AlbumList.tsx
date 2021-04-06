import React from 'react';
import {observer} from 'mobx-react-lite';
import {Snackbar} from '@material-ui/core';

import {
  secondsToTimeString,
  unixTimestampToDateString,
  unixTimestampToYear,
} from './util';
import VTable from './table/VTable';
import FilteredTable from './table/FilteredTable';
import {useStores} from 'stores';

interface Props {
  rows: Album[];
  loading?: boolean;
  initialSortSpecs?: SortSpec<Album>[],
}

const COLUMNS = [
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
    align: 'right' as const,
  },
  {
    key: "tracks",
    label: "Tracks",
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
  },
];

const AlbumList = ({
  rows,
  ...props
}: Props) => {
  const {musicStore} = useStores();
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
        rows={rows}
        columns={COLUMNS}
        filterKeys={['genre', 'album_artist']}
      >
        {filteredRows =>
          <VTable<Album>
            {...props}
            columns={COLUMNS}
            rows={filteredRows}
            onRowClick={onAlbumClick}
            onRowCtrlClick={onAlbumCtrlClick}
            placeholderText='No albums found for these filters.'
          />
        }
      </FilteredTable>

      <Snackbar
        message="Album enqueued."
        open={enqueueSnackbarOpen}
      />
    </>
  );
};

export default observer(AlbumList);

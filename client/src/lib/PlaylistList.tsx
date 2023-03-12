import React from 'react';

import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';

import FilteredTable from './table/FilteredTable';

interface Props {
  id: string,
  rows: Playlist[];
  loading?: boolean;
  initialSortSpecs?: SortSpec<Playlist>[],
}

const COLUMNS = [
  {
    key: 'title',
    label: 'Title',
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

const PlaylistList = ({
  id,
  rows,
  ...props
}: Props) => {
  const { musicStore } = useStores();

  const onPlaylistClick = (playlist: Playlist): void => {
    musicStore.playPlaylist(playlist);
  };

  return (
    <FilteredTable<Playlist>
      id={id}
      rows={rows}
      columns={COLUMNS}
      filterKeys={[]}
      VTableProps={{
        ...props,
        onRowClick: onPlaylistClick,
        placeholderText: 'No playlists found for these filters.',
      }}
    />
  );
};

export default observer(PlaylistList);

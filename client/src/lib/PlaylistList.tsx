import React from 'react';
import {observer} from 'mobx-react-lite';
import {
  secondsToTimeString,
  unixTimestampToDateString,
} from './util';
import VTable from './table/VTable';
import FilteredTable from './table/FilteredTable';
import {useStores} from 'stores';

interface Props {
  rows: Playlist[];
  loading?: boolean;
  initialSortSpecs?: SortSpec<Playlist>[],
}

const COLUMNS = [
  {
    key: "title",
    label: "Title"
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

const PlaylistList = ({
  rows,
  ...props
}: Props) => {
  const {musicStore} = useStores();

  const onPlaylistClick = (playlist: Playlist): void => {
    musicStore.playPlaylist(playlist);
  };

  return (
    <FilteredTable<Playlist>
      rows={rows}
      columns={COLUMNS}
      filterKeys={[]}
    >
      {filteredRows =>
        <VTable<Playlist>
          {...props}
          rows={filteredRows}
          columns={COLUMNS}
          onRowClick={onPlaylistClick}
          placeholderText='No playlists found for these filters.'
        />
      }
    </FilteredTable>
  );
};

export default observer(PlaylistList);

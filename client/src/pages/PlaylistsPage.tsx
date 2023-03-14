import React from 'react';

import PlaylistList from 'lib/PlaylistList';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';

const PlaylistsPage = () => {
  const { dbStore } = useStores();
  const initialSortSpecs = [
    { columnKey: 'title' },
  ];

  return (
    <PlaylistList
      id='playlists'
      rows={dbStore.playlists}
      loading={dbStore.playlistsLoading}
      initialSortSpecs={initialSortSpecs}
    />
  );
};

export default observer(PlaylistsPage);

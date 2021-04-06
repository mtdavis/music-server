import React from 'react';
import {observer} from 'mobx-react-lite';

import PlaylistList from 'lib/PlaylistList';
import {useStores} from 'stores';

const PlaylistsPage = () => {
  const {dbStore} = useStores();
  const initialSortSpecs = [
    {columnKey: 'title', order: 1 as const}
  ];

  return (
    <PlaylistList
      rows={dbStore.playlists}
      loading={dbStore.playlistsLoading}
      initialSortSpecs={initialSortSpecs}
    />
  );
};

export default observer(PlaylistsPage);

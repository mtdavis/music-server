import React from 'react';

import AlbumList from 'lib/AlbumList';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';

const AlbumsPage = () => {
  const { dbStore } = useStores();

  const initialSortSpecs = [
    { columnKey: 'album' },
    { columnKey: 'album_artist' },
  ];

  return (
    <AlbumList
      id='all-albums'
      rows={dbStore.albums}
      loading={dbStore.albumsLoading}
      initialSortSpecs={initialSortSpecs}
    />
  );
};

export default observer(AlbumsPage);

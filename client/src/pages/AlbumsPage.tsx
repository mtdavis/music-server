import React from 'react';
import {observer} from 'mobx-react-lite';

import AlbumList from 'lib/AlbumList';
import {useStores} from 'stores';

const AlbumsPage = () => {
  const {dbStore} = useStores();

  const initialSortSpecs = [
    {columnKey: 'album', order: 1 as const},
    {columnKey: 'album_artist', order: 1 as const}
  ];

  return (
    <AlbumList
      rows={dbStore.albums}
      loading={dbStore.albumsLoading}
      initialSortSpecs={initialSortSpecs}
    />
  );
};

export default observer(AlbumsPage);

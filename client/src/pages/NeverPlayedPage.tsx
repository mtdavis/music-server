import React from 'react';

import AlbumList from 'lib/AlbumList';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';

const NeverPlayedPage = () => {
  const { dbStore } = useStores();

  const albumsNeverPlayed = dbStore.albums.filter((album) => album.play_count === 0);

  const initialSortSpecs = [
    { columnKey: 'album' },
    { columnKey: 'year' },
    { columnKey: 'album_artist' },
  ];

  return (
    <AlbumList
      id='never-played'
      rows={albumsNeverPlayed}
      loading={dbStore.albumsLoading}
      initialSortSpecs={initialSortSpecs}
    />
  );
};

export default observer(NeverPlayedPage);

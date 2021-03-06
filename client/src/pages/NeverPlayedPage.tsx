import React from 'react';
import {observer} from 'mobx-react-lite';

import AlbumList from 'lib/AlbumList';
import {useStores} from 'stores';

const NeverPlayedPage = () => {
  const {dbStore} = useStores();

  const albumsNeverPlayed = [];

  for(let i = 0; i < dbStore.albums.length; i++) {
    const album = dbStore.albums[i];
    if(album.play_count === 0) {
      albumsNeverPlayed.push(album);
    }
  }

  const initialSortSpecs = [
    {columnKey: 'album'},
    {columnKey: 'year'},
    {columnKey: 'album_artist'}
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

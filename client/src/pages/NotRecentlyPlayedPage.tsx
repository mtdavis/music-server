import React from 'react';
import {observer} from 'mobx-react-lite';

import AlbumList from 'lib/AlbumList';
import {useStores} from 'stores';
import SortOrder from 'lib/table/SortOrder';

const NotRecentlyPlayedPage = () => {
  const {dbStore} = useStores();

  const daysAgo = 120;
  const secondsAgo = daysAgo * 24 * 60 * 60;
  const beforeTimestamp = Math.floor(new Date().getTime() / 1000) - secondsAgo;

  const albumsNotRecentlyPlayed: Album[] = [];

  dbStore.albums.forEach(album => {
    if(album.last_play === null || album.last_play < beforeTimestamp) {
      albumsNotRecentlyPlayed.push(album);
    }
  });

  const initialSortSpecs = [
    {columnKey: 'last_play', order: SortOrder.Descending}
  ];

  return (
    <AlbumList
      id='not-recently-played'
      rows={albumsNotRecentlyPlayed}
      loading={dbStore.albumsLoading}
      initialSortSpecs={initialSortSpecs}
    />
  );
};

export default observer(NotRecentlyPlayedPage);

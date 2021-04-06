import React from 'react';
import {observer} from 'mobx-react-lite';

import TrackList from 'lib/TrackList';
import {useStores} from 'stores';

const AllTracksPage = () => {
  const {dbStore} = useStores();

  const initialSortSpecs = [
    {columnKey: 'title', order: 1 as const},
    {columnKey: 'track_number', order: 1 as const},
    {columnKey: 'album', order: 1 as const},
    {columnKey: 'artist', order: 1 as const},
  ];

  return (
    <TrackList
      rows={dbStore.tracks}
      loading={dbStore.tracksLoading}
      initialSortSpecs={initialSortSpecs}
    />
  );
};

export default observer(AllTracksPage);

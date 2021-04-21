import React from 'react';
import {observer} from 'mobx-react-lite';

import TrackList from 'lib/TrackList';
import {useStores} from 'stores';

const AllTracksPage = () => {
  const {dbStore} = useStores();

  const initialSortSpecs = [
    {columnKey: 'title'},
    {columnKey: 'track_number'},
    {columnKey: 'album'},
    {columnKey: 'artist'},
  ];

  return (
    <TrackList
      id='all-tracks'
      rows={dbStore.tracks}
      loading={dbStore.tracksLoading}
      initialSortSpecs={initialSortSpecs}
    />
  );
};

export default observer(AllTracksPage);

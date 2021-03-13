import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import TrackList from '../lib/TrackList';
import {DbStore} from '../stores';

interface InjectedProps {
  dbStore: DbStore;
}

@inject('dbStore')
@observer
export default class AllTracksPage extends Component {
  get injected() {
    return this.props as InjectedProps
  }

  render() {
    const {dbStore} = this.injected;
    const initialSortSpecs = [
      {columnKey: 'title', order: 1 as 1},
      {columnKey: 'track_number', order: 1 as 1},
      {columnKey: 'album', order: 1 as 1},
      {columnKey: 'artist', order: 1 as 1},
    ];

    return (
      <TrackList
        rows={dbStore.tracks}
        loading={dbStore.tracksLoading}
        initialSortSpecs={initialSortSpecs}
      />
    );
  }
}

import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import PlaylistList from '../lib/PlaylistList';
import {DbStore} from '../stores';

interface InjectedProps {
  dbStore: DbStore;
}

@inject('dbStore')
@observer
export default class PlaylistsPage extends Component {
  get injected() {
    return this.props as InjectedProps
  }

  render() {
    const {dbStore} = this.injected;
    const initialSortSpecs = [
      {columnKey: 'title', order: 1 as 1}
    ];

    return (
      <PlaylistList
        rows={dbStore.playlists}
        loading={dbStore.playlistsLoading}
        initialSortSpecs={initialSortSpecs}
      />
    );
  }
}

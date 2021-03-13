import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import AlbumList from '../lib/AlbumList';
import {DbStore} from '../stores';

interface InjectedProps {
  dbStore: DbStore;
}

@inject('dbStore')
@observer
export default class AlbumsPage extends Component {
  get injected() {
    return this.props as InjectedProps
  }

  render() {
    const {dbStore} = this.injected;
    const initialSortSpecs = [
      {columnKey: 'album', order: 1 as 1},
      {columnKey: 'album_artist', order: 1 as 1}
    ];

    return (
      <AlbumList
        rows={dbStore.albums}
        loading={dbStore.albumsLoading}
        initialSortSpecs={initialSortSpecs}
      />
    );
  }
}

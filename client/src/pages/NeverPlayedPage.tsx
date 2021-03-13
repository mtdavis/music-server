import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import AlbumList from '../lib/AlbumList';
import {DbStore} from '../stores';

interface InjectedProps {
  dbStore: DbStore;
}

@inject('dbStore')
@observer
export default class NeverPlayedPage extends Component {
  get injected() {
    return this.props as InjectedProps
  }

  render() {
    const {dbStore} = this.injected;

    const albumsNeverPlayed = [];

    for(let i = 0; i < dbStore.albums.length; i++) {
      const album = dbStore.albums[i];
      if(album.play_count === 0) {
        albumsNeverPlayed.push(album);
      }
    }

    const initialSortSpecs = [
      {columnKey: 'album', order: 1 as 1},
      {columnKey: 'year', order: 1 as 1},
      {columnKey: 'album_artist', order: 1 as 1}
    ];

    return (
      <AlbumList
        rows={albumsNeverPlayed}
        loading={dbStore.albumsLoading}
        initialSortSpecs={initialSortSpecs}
      />
    );
  }
}

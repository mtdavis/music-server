import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import AlbumList from '../lib/AlbumList';
import {DbStore} from '../stores';

interface InjectedProps {
  dbStore: DbStore;
}

@inject('dbStore')
@observer
export default class NotRecentlyPlayedPage extends Component {
  get injected() {
    return this.props as InjectedProps
  }

  render() {
    const {dbStore} = this.injected;

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
      {columnKey: 'last_play', order: -1 as -1}
    ];

    return (
      <AlbumList
        rows={albumsNotRecentlyPlayed}
        loading={dbStore.albumsLoading}
        initialSortSpecs={initialSortSpecs}
      />
    );
  }
}

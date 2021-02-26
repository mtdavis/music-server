import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import AlbumList from '../lib/AlbumList';

@inject('dbStore')
@observer
export default class NeverPlayedPage extends Component {
  render() {
    const {dbStore} = this.props;

    const albumsNeverPlayed = [];

    for(let i = 0; i < dbStore.albums.length; i++) {
      const album = dbStore.albums[i];
      if(album.play_count === 0) {
        albumsNeverPlayed.push(album);
      }
    }

    const initialSortSpecs = [
      {columnKey: 'album', order: 1},
      {columnKey: 'year', order: 1},
      {columnKey: 'album_artist', order: 1}
    ];

    return (
      <AlbumList albums={albumsNeverPlayed} initialSortSpecs={initialSortSpecs} />
    );
  }
}

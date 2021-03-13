import React from 'react';
import {inject, observer} from 'mobx-react';
import {
  CircularProgress,
  Grid,
} from '@material-ui/core';
import LazyLoad from 'react-lazy-load';

import {compare} from '../lib/util';
import AlbumImage from '../lib/AlbumImage';
import {DbStore} from '../stores';

interface InjectedProps {
  dbStore: DbStore;
}

@inject('dbStore')
@observer
export default class FavoriteAlbumsPage extends React.Component {
  get injected() {
    return this.props as InjectedProps;
  }

  render() {
    const {dbStore} = this.injected;

    let content;

    if(dbStore.albumsLoading || dbStore.tracksLoading) {
      content = <CircularProgress style={{margin: 24}} />;
    }
    else {
      const favoriteAlbums = dbStore.albums.filter(album => album.play_count >= 10);
      favoriteAlbums.sort((a, b) =>
        compare(a.album_artist, b.album_artist) || compare(a.release_date, b.release_date) ||
        compare(a.album, b.album));

      content = favoriteAlbums.map(album => {
        const trackOne = dbStore.tracks.filter(track =>
          track.album_id === album.id && track.track_number === 1)[0];
        return <AlbumImage key={album.id} album={album} trackId={trackOne.id} />;
      });
    }

    return (
      <Grid container spacing={24} alignItems='center' justify='center'>
        {content}
      </Grid>
    );
  }
}

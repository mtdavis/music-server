import React from 'react';
import {observer} from 'mobx-react-lite';
import {
  CircularProgress,
  Grid,
} from '@mui/material';

import {compare} from 'lib/util';
import AlbumImage from 'lib/AlbumImage';
import {useStores} from 'stores';

const FavoriteAlbumsPage = () => {
  const {dbStore} = useStores();

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
    <Grid container spacing={3} alignItems='center' justifyContent='center'>
      {content}
    </Grid>
  );
};

export default observer(FavoriteAlbumsPage);

import React from 'react';
import {observer} from 'mobx-react-lite';
import {
  Grid,
  Paper,
} from '@material-ui/core';

import Playlist from 'lib/Playlist';
import {useStores} from 'stores';

interface AlbumArtProps {
  track: Track;
}

const imageInCache = (path: string): boolean => {
  const img = new Image();
  img.src = path;
  return img.complete;
};

const AlbumArt = ({
  track
}: AlbumArtProps): (React.ReactElement | null) => {
  const imgUrl = `/track/${track.id}/art`;

  const [opacity, setOpacity] = React.useState(imageInCache(imgUrl) ? 1 : 0);

  if(track.album === "") {
    return null;
  }

  const paperStyle = {
    width: '100%',
    lineHeight: 0,
    opacity,
    transition: 'opacity 450ms cubic-bezier(0.23, 1, 0.32, 1)'
  };

  return (
    <Paper square={true} style={paperStyle}>
      <img
        src={imgUrl}
        style={{width: '100%'}}
        onLoad={() => setOpacity(1)}
      />
    </Paper>
  );
};

const HomePage = () => {
  let content;
  const {musicStore} = useStores();
  if(
    musicStore.playlist.length === 0 ||
    musicStore.currentTrack === null ||
    musicStore.currentTrack.album === null
  ) {
    content = (
      <Grid item xs={12}>
        <Playlist />
      </Grid>
    );
  }
  else {
    content = (
      <>
        <Grid item xs={12} sm={12} md={5} lg={6}>
          <Playlist />
        </Grid>

        <Grid item xs={12} sm={12} md={7} lg={6}>
          <AlbumArt key="art" track={musicStore.currentTrack} />
        </Grid>
      </>
    );
  }

  return (
    <Grid container spacing={2} style={{minHeight: '100%'}}>
      {content}
    </Grid>
  );
};

export default observer(HomePage);

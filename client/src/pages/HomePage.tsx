import React from 'react';

import {
  Grid,
  Paper,
} from '@mui/material';
import Playlist from 'lib/Playlist';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';

interface AlbumArtProps {
  url: string;
}

const AlbumArt = ({
  url,
}: AlbumArtProps): (React.ReactElement) => {
  const paperStyle = {
    width: '100%',
    lineHeight: 0,
  };

  return (
    <Paper square style={paperStyle}>
      <img
        src={url}
        style={{ width: '100%' }}
        alt='cover'
      />
    </Paper>
  );
};

const HomePage = () => {
  const { musicStore } = useStores();
  const { albumArtUrl } = musicStore;

  return (
    <Grid container spacing={2} style={{ minHeight: '100%' }}>
      <Grid item xs={12} sm={12} md={albumArtUrl ? 5 : 12} lg={albumArtUrl ? 6 : 12}>
        <Playlist />
      </Grid>

      {albumArtUrl && (
        <Grid item xs={12} sm={12} md={7} lg={6}>
          <AlbumArt url={albumArtUrl} />
        </Grid>
      )}
    </Grid>
  );
};

export default observer(HomePage);

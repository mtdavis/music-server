import React from 'react';
import {observer} from 'mobx-react-lite';
import {
  Grid,
  Paper,
} from '@mui/material';
import LazyLoad from 'react-lazy-load';

import {useStores} from 'stores';

interface Props {
  album: Album;
  trackId: number;
}

const AlbumImage = ({
  album,
  trackId,
}: Props) => {
  const {musicStore} = useStores();

  const [placeholderHeight, setPlaceholderHeight] = React.useState<number | undefined>(250);
  const [opacity, setOpacity] = React.useState(0);
  const [hover, setHover] = React.useState(false);

  const onLoad = () => {
    setPlaceholderHeight(undefined);
    setOpacity(1);
  };

  const onClick = () => {
    musicStore.playAlbum(album);
  };

  const onMouseOver = () => {
    setHover(true);
  };

  const onMouseOut = () => {
    setHover(false);
  };

  return (
    <Grid item xs={6} sm={4} md={3} lg={2}>
      <Paper
        sx={{
          opacity,
          lineHeight: 0,
          transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
        square={true}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        elevation={hover ? 4 : 2}
      >
        <LazyLoad height={placeholderHeight} offset={1000} debounce={false}>
          <img
            src={`/art/${trackId}`}
            style={{
              width: '100%',
              cursor: 'pointer',
            }}
            onClick={onClick} onLoad={onLoad}
          />
        </LazyLoad>
      </Paper>
    </Grid>
  );
};

export default observer(AlbumImage);

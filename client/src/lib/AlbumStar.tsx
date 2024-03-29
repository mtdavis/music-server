import React from 'react';

import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import {
  colors,
  IconButton,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';

interface StarProps {
  albumId: number;
  starred: boolean;
}

const AlbumStar = observer(({
  albumId,
  starred,
}: StarProps) => {
  const { dbStore } = useStores();

  return (
    <IconButton
      style={{
        padding: 6,
        color: starred ? colors.amber[500] : undefined,
      }}
      color={starred ? undefined : 'default'}
      onClick={(event) => {
        dbStore.editAlbum(albumId, !starred);
        event.stopPropagation();
      }}
    >
      {starred
        ? <StarIcon />
        : <StarOutlineIcon />}
    </IconButton>
  );
});

export default AlbumStar;

export const renderAlbumStar = (starred: boolean, albumId: number): React.ReactNode => (
  <AlbumStar albumId={albumId} starred={starred} />
);

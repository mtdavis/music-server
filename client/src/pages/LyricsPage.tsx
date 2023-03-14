import React from 'react';

import {
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import LyricsState from 'lib/LyricsState';
import Notice from 'lib/Notice';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  header: {
    textAlign: 'center' as const,
    borderBottom: '1px solid #eee',
    paddingTop: '12px',
    paddingBottom: '12px',
    marginTop: 0,
  },
  lyrics: {
    fontFamily: theme.typography.fontFamily,
    lineHeight: '1.333',
    textAlign: 'center' as const,
    whiteSpace: 'pre-wrap' as const,
    marginTop: 12,
  },
  paper: {
    paddingBottom: 12,
  },
}));

const LyricsPage = (): React.ReactElement => {
  const classes = useStyles();
  const { lyricsStore, musicStore } = useStores();

  React.useEffect(() => {
    lyricsStore.setLyricsVisible(true);
    return () => {
      lyricsStore.setLyricsVisible(false);
    };
  }, [lyricsStore]);

  if (lyricsStore.lyricsState === LyricsState.NO_TRACK) {
    return (
      <Notice>Nothing to see here!</Notice>
    );
  }

  if (lyricsStore.lyricsState === LyricsState.FAILED) {
    return (
      <Notice>There was a problem loading the lyrics.</Notice>
    );
  }

  const track = musicStore.currentTrack;
  let header = track === null ? null : (
    <>
      {track.artist}
      {' '}
      –
      {' '}
      {track.title}
    </>
  );
  let lyrics;

  if (lyricsStore.lyricsState === LyricsState.LOADING) {
    lyrics = <CircularProgress />;
  } else if (lyricsStore.lyricsState === LyricsState.SUCCESSFUL) {
    if (lyricsStore.url !== null) {
      header = (
        <a href={lyricsStore.url} className={classes.link} target='_blank' rel='noreferrer'>
          {header}
        </a>
      );
    }
    lyrics = lyricsStore.lyrics;
  }

  return (
    <Paper className={classes.paper}>
      <div className={classes.header}>
        <Typography variant='h6' color='inherit'>{header}</Typography>
      </div>
      <div className={classes.lyrics}>
        {lyrics}
      </div>
    </Paper>
  );
};

export default observer(LyricsPage);

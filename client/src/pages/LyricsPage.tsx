import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {
  CircularProgress,
  Paper,
  Typography,
} from '@material-ui/core';
import {
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import LyricsState from '../lib/LyricsState';
import Notice from '../lib/Notice';
import {MusicStore, LyricsStore} from '../stores';

const styles = (theme: Theme) => ({
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  header: {
    textAlign: 'center' as 'center',
    borderBottom: '1px solid #eee',
    paddingTop: '12px',
    paddingBottom: '12px',
    marginTop: 0,
  },
  lyrics: {
    fontFamily: theme.typography.fontFamily,
    lineHeight: '1.333',
    textAlign: 'center' as 'center',
    whiteSpace: 'pre-wrap' as 'pre-wrap',
    marginTop: 12,
  },
  paper: {
    paddingBottom: 12,
  },
});

interface Props extends WithStyles<typeof styles> {}

interface InjectedProps extends Props {
  musicStore: MusicStore;
  lyricsStore: LyricsStore;
}

@inject('musicStore', 'lyricsStore')
@observer
class LyricsPage extends Component<Props> {
  componentDidMount() {
    this.injected.lyricsStore.setLyricsVisible(true);
  }

  componentWillUnmount() {
    this.injected.lyricsStore.setLyricsVisible(false);
  }

  get injected() {
    return this.props as InjectedProps;
  }

  render() {
    const {classes} = this.props;
    const {lyricsStore, musicStore} = this.injected;

    if(lyricsStore.lyricsState === LyricsState.NO_TRACK) {
      return (
        <Notice>Nothing to see here!</Notice>
      );
    }
    
    if(lyricsStore.lyricsState === LyricsState.FAILED) {
      return (
        <Notice>There was a problem loading the lyrics.</Notice>
      );
    }

    const track = musicStore.currentTrack;
    let header = track === null ? null : <>{track.artist} – {track.title}</>;
    let lyrics;

    if(lyricsStore.lyricsState === LyricsState.LOADING) {
      lyrics = <CircularProgress />;
    }
    else if(lyricsStore.lyricsState === LyricsState.SUCCESSFUL) {
      if(lyricsStore.url !== null) {
        header = (
          <a href={lyricsStore.url} className={classes.link} target='_blank'>
            {header}
          </a>
        );
      }
      lyrics = lyricsStore.lyrics;
    }

    return (
      <Paper className={classes.paper}>
        <div className={classes.header}>
          <Typography variant="h6" color="inherit">{header}</Typography>
        </div>
        <div className={classes.lyrics}>
          {lyrics}
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles)(LyricsPage);

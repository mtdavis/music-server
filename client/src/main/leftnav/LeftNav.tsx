import React from 'react';
import {observer} from 'mobx-react-lite';
import {
  Divider,
  Drawer,
  List,
} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {Theme} from '@mui/material/styles';

import AlbumIcon from '@mui/icons-material/Album';
import CancelIcon from '@mui/icons-material/Cancel';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import ShuffleVariantIcon from 'mdi-material-ui/ShuffleVariant';
import HeartCircleIcon from 'mdi-material-ui/HeartCircle';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import SearchIcon from '@mui/icons-material/Search';
import TimelineIcon from '@mui/icons-material/Timeline';

import {useStores} from 'stores';
import LinkMenuItem from './LinkMenuItem';

const useStyles = makeStyles((theme: Theme) => ({
  list: {
    width: 250,
    marginTop: 64,
  },
  open: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    width: 250,
    overflowX: 'hidden' as const,
  },
  closed: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    width: 56,
    overflowX: 'hidden' as const,
  },
}));

const LeftNav = () => {
  const classes = useStyles();
  const {musicStore, uiStore} = useStores();

  return (
    <Drawer
      variant='permanent'
      className={uiStore.drawerOpen ? classes.open : classes.closed}
      classes={{
        paper: uiStore.drawerOpen ? classes.open : classes.closed
      }}
    >
      <List className={classes.list}>
        <LinkMenuItem to='/' Icon={PlaylistPlayIcon}>
          Now Playing
        </LinkMenuItem>
        <LinkMenuItem to='/lyrics' Icon={MessageOutlinedIcon}>
          Lyrics
        </LinkMenuItem>
        <Divider />
        <LinkMenuItem to='/albums' Icon={AlbumIcon}>
          All Albums
        </LinkMenuItem>
        <LinkMenuItem to='/not-recently-played' Icon={WatchLaterIcon}>
          Not Recently Played
        </LinkMenuItem>
        <LinkMenuItem to='/never-played' Icon={CancelIcon}>
          Never Played
        </LinkMenuItem>
        <LinkMenuItem to='/favorite-albums' Icon={HeartCircleIcon}>
          Favorite Albums
        </LinkMenuItem>
        {
          musicStore.demoMode ? null : <Divider />
        }
        <LinkMenuItem to='/tracks' Icon={MusicNoteIcon}>
          All Tracks
        </LinkMenuItem>
        {
          musicStore.demoMode ? null :
            <>
              <LinkMenuItem to='/playlists' Icon={QueueMusicIcon}>
                Playlists
              </LinkMenuItem>
              <LinkMenuItem to='/shuffle' Icon={ShuffleVariantIcon}>
                Shuffle
              </LinkMenuItem>
              <Divider />
              <LinkMenuItem to='/scan' Icon={SearchIcon}>
                Scan
              </LinkMenuItem>
              <LinkMenuItem to='/statistics' Icon={TimelineIcon}>
                Statistics
              </LinkMenuItem>
            </>
        }
      </List>
    </Drawer>
  );
};

export default observer(LeftNav);

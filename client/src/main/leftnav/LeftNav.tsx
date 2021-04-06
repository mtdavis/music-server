import React from 'react';
import {observer} from 'mobx-react-lite';
import {
  Divider,
  Drawer,
  List,
} from '@material-ui/core';
import {makeStyles} from '@material-ui/styles';
import {Theme} from '@material-ui/core/styles';

import AlbumIcon from '@material-ui/icons/Album';
import CancelIcon from '@material-ui/icons/Cancel';
import MessageOutlinedIcon from '@material-ui/icons/MessageOutlined';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import ShuffleVariantIcon from 'mdi-material-ui/ShuffleVariant';
import HeartCircleIcon from 'mdi-material-ui/HeartCircle';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import SearchIcon from '@material-ui/icons/Search';

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
            <div>
              <LinkMenuItem to='/playlists' Icon={QueueMusicIcon}>
                Playlists
              </LinkMenuItem>
              <LinkMenuItem to='/shuffle' Icon={ShuffleVariantIcon}>
                Shuffle
              </LinkMenuItem>
              <LinkMenuItem to='/scan' Icon={SearchIcon}>
                Scan
              </LinkMenuItem>
            </div>
        }
      </List>
    </Drawer>
  );
};

export default observer(LeftNav);

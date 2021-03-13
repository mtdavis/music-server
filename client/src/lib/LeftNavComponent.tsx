import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {
  Divider,
  Drawer,
  List,
} from '@material-ui/core';
import {
  Theme,
  withStyles,
  WithStyles,
 } from '@material-ui/core/styles';

import AlbumIcon from '@material-ui/icons/Album';
import CancelIcon from '@material-ui/icons/Cancel';
import FormatAlignCenterIcon from '@material-ui/icons/FormatAlignCenter';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import StarsIcon from '@material-ui/icons/Stars';
import WatchLaterIcon from '@material-ui/icons/WatchLater';

import {MusicStore, UiStore} from '../stores';
import LinkMenuItem from './LinkMenuItem';

const styles = (theme: Theme) => ({
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
    overflowX: 'hidden' as 'hidden',
  },
  closed: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    width: 56,
    overflowX: 'hidden' as 'hidden',
  },
});

interface Props extends WithStyles<typeof styles> {
}

interface InjectedProps extends Props {
  musicStore: MusicStore;
  uiStore: UiStore;
}

@inject('musicStore', 'uiStore')
@observer
class LeftNavComponent extends Component<Props> {
  get injected() {
    return this.props as InjectedProps;
  }

  render() {
    const {classes} = this.props;
    const {musicStore, uiStore} = this.injected;

    return (
      <Drawer
        variant='permanent'
        className={uiStore.drawerOpen ? classes.open : classes.closed}
        classes={{
          paper: uiStore.drawerOpen ? classes.open : classes.closed
        }}
      >
        <List className={classes.list}>
          <LinkMenuItem to='/' icon={<PlaylistPlayIcon />}>
            Now Playing
          </LinkMenuItem>
          <LinkMenuItem to='/lyrics' icon={<FormatAlignCenterIcon />}>
            Lyrics
          </LinkMenuItem>
          <Divider />
          <LinkMenuItem to='/albums' icon={<AlbumIcon />}>
            All Albums
          </LinkMenuItem>
          <LinkMenuItem to='/not-recently-played' icon={<WatchLaterIcon />}>
            Not Recently Played
          </LinkMenuItem>
          <LinkMenuItem to='/never-played' icon={<CancelIcon />}>
            Never Played
          </LinkMenuItem>
          <LinkMenuItem to='/favorite-albums' icon={<StarsIcon />}>
            Favorite Albums
          </LinkMenuItem>
          {
            musicStore.demoMode ? null : <Divider />
          }
          <LinkMenuItem to='/tracks' icon={<MusicNoteIcon />}>
            All Tracks
          </LinkMenuItem>
          {
            musicStore.demoMode ? null :
              <div>
                <LinkMenuItem to='/playlists' icon={<QueueMusicIcon />}>
                  Playlists
                </LinkMenuItem>
                <LinkMenuItem to='/shuffle' icon={<ShuffleIcon />}>
                  Shuffle
                </LinkMenuItem>
              </div>
          }
        </List>
      </Drawer>
    );
  }
}

export default withStyles(styles)(LeftNavComponent);

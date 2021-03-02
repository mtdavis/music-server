import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {
  AppBar,
  Divider,
  Drawer,
  IconButton,
  List,
  Toolbar,
  Typography,
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

import AlbumIcon from '@material-ui/icons/Album';
import CancelIcon from '@material-ui/icons/Cancel';
import CloseIcon from '@material-ui/icons/Close';
import FormatAlignCenterIcon from '@material-ui/icons/FormatAlignCenter';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import StarsIcon from '@material-ui/icons/Stars';
import WatchLaterIcon from '@material-ui/icons/WatchLater';

import LinkMenuItem from './LinkMenuItem';

const leftNavStyles = {
  list: {
    width: 320,
    marginTop: 64
  },
  appBar: {
    maxWidth: 320,
    left: 0,
    right: 'auto',
  },
  toolbar: {
    paddingLeft: 12,
  },
};

@withStyles(leftNavStyles)
@inject('musicStore', 'uiStore')
@observer
class LeftNavComponent extends Component {
  render() {
    const {classes, musicStore, uiStore} = this.props;

    return (
      <Drawer open={uiStore.drawerOpen} onClose={uiStore.closeDrawer}>
        <AppBar title="Mike's Music Player" className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            <IconButton color="inherit" onClick={uiStore.closeDrawer}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" color="inherit">
              Mike's Music Player
            </Typography>
          </Toolbar>
        </AppBar>
        <List className={classes.list}>
          <LinkMenuItem to='/' icon={<PlaylistPlayIcon />} onClick={uiStore.closeDrawer}>
            Now Playing
          </LinkMenuItem>
          <LinkMenuItem to='/lyrics' icon={<FormatAlignCenterIcon />} onClick={uiStore.closeDrawer}>
            Lyrics
          </LinkMenuItem>
          <Divider />
          <LinkMenuItem to='/albums' icon={<AlbumIcon />} onClick={uiStore.closeDrawer}>
            All Albums
          </LinkMenuItem>
          <LinkMenuItem to='/not-recently-played' icon={<WatchLaterIcon />} onClick={uiStore.closeDrawer}>
            Not Recently Played
          </LinkMenuItem>
          <LinkMenuItem to='/never-played' icon={<CancelIcon />} onClick={uiStore.closeDrawer}>
            Never Played
          </LinkMenuItem>
          <LinkMenuItem to='/favorite-albums' icon={<StarsIcon />} onClick={uiStore.closeDrawer}>
            Favorite Albums
          </LinkMenuItem>
          {
            musicStore.demoMode ? null : <Divider />
          }
          <LinkMenuItem to='/tracks' icon={<MusicNoteIcon />} onClick={uiStore.closeDrawer}>
            All Tracks
          </LinkMenuItem>
          {
            musicStore.demoMode ? null :
              <div>
                <LinkMenuItem to='/playlists' icon={<QueueMusicIcon />} onClick={uiStore.closeDrawer}>
                  Playlists
                </LinkMenuItem>
                <LinkMenuItem to='/shuffle' icon={<ShuffleIcon />} onClick={uiStore.closeDrawer}>
                  Shuffle
                </LinkMenuItem>
              </div>
          }
        </List>
      </Drawer>
    );
  }
}

export default LeftNavComponent;

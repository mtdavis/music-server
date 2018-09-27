import React, {Component} from 'react';
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
import FormatAlignCenterIcon from '@material-ui/icons/FormatAlignCenter';
import MenuIcon from '@material-ui/icons/Menu';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import SearchIcon from '@material-ui/icons/Search';
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
  toolBar: {
    paddingLeft: 10
  }
};

@withStyles(leftNavStyles)
class LeftNavComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: props.open
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.open !== this.state.open) {
      this.setState({
        open: nextProps.open
      });
    }
  }

  render() {
    const {classes} = this.props;

    return (
      <Drawer open={this.state.open} onClose={this.close}>
        <AppBar title="Mike's Music Player" className={classes.appBar}>
          <Toolbar className={classes.toolBar}>
            <IconButton color="inherit" onClick={this.close}>
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit">
              Mike's Music Player
            </Typography>
          </Toolbar>
        </AppBar>
        <List className={classes.list}>
          <LinkMenuItem to='/' icon={<PlaylistPlayIcon />} onClick={this.close}>
            Now Playing
          </LinkMenuItem>
          <LinkMenuItem to='/lyrics' icon={<FormatAlignCenterIcon />} onClick={this.close}>
            Lyrics
          </LinkMenuItem>
          <Divider />
          <LinkMenuItem to='/albums' icon={<AlbumIcon />} onClick={this.close}>
            All Albums
          </LinkMenuItem>
          <LinkMenuItem to='/not-recently-played' icon={<WatchLaterIcon />} onClick={this.close}>
            Not Recently Played
          </LinkMenuItem>
          <LinkMenuItem to='/never-played' icon={<CancelIcon />} onClick={this.close}>
            Never Played
          </LinkMenuItem>
          <LinkMenuItem to='/favorite-albums' icon={<StarsIcon />} onClick={this.close}>
            Favorite Albums
          </LinkMenuItem>
          <Divider />
          <LinkMenuItem to='/tracks' icon={<MusicNoteIcon />} onClick={this.close}>
            All Tracks
          </LinkMenuItem>
          <LinkMenuItem to='/playlists' icon={<QueueMusicIcon />} onClick={this.close}>
            Playlists
          </LinkMenuItem>
          <LinkMenuItem to='/shuffle' icon={<ShuffleIcon />} onClick={this.close}>
            Shuffle
          </LinkMenuItem>
          <Divider />
          <LinkMenuItem to='/scan' icon={<SearchIcon />} onClick={this.close}>
            Scan
          </LinkMenuItem>
        </List>
      </Drawer>
    );
  }

  close = () => {
    this.setState({
      open: false
    });

    if(this.props.onClose) {
      this.props.onClose();
    }
  }
}

export default LeftNavComponent;

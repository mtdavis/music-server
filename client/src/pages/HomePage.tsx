import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';
import {
  Grid,
  Paper,
} from '@material-ui/core';

import Playlist from '../lib/Playlist';
import {MusicStore} from '../stores';

interface AlbumArtProps {
  track: Track;
}

interface AlbumArtState {
  opacity: number;
}

class AlbumArt extends Component<AlbumArtProps, AlbumArtState> {
  constructor(props: AlbumArtProps) {
    super(props);

    // check if the image is already in the cache
    const img = new Image();
    img.src = this.getImgUrl();

    this.state = {
      opacity: img.complete ? 1 : 0
    };
  }

  getImgUrl() {
    return `/album-art?id=${this.props.track.id}`;
  }

  render() {
    if(this.props.track.album === "") {
      return null;
    }

    const paperStyle = {
      width: '100%',
      lineHeight: 0,
      opacity: this.state.opacity,
      transition: 'opacity 450ms cubic-bezier(0.23, 1, 0.32, 1)'
    };

    return (
      <Paper square={true} style={paperStyle}>
        <img
          src={this.getImgUrl()}
          style={{width: '100%'}}
          onLoad={() => this.setState({opacity: 1})}
        />
      </Paper>
    );
  }
}

interface InjectedProps {
  musicStore: MusicStore;
}

@inject('musicStore')
@observer
export default class HomePage extends Component {
  get injected() {
    return this.props as InjectedProps
  }

  render() {
    let content;
    const {musicStore} = this.injected;
    if(musicStore.playlist.length === 0 || musicStore.playlist[0].album === null) {
      content = (
        <Grid item xs={12}>
          <Playlist />
        </Grid>
      );
    }
    else {
      content = (
        <>
          <Grid item xs={12} sm={12} md={5} lg={6}>
            <Playlist />
          </Grid>

          <Grid item xs={12} sm={12} md={7} lg={6}>
            <AlbumArt key="art" track={musicStore.playlist[0]} />
          </Grid>
        </>
      );
    }

    return (
      <Grid container spacing={16} style={{minHeight: '100%'}}>
        {content}
      </Grid>
    );
  }
}

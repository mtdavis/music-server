import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';
import Playlist from '../lib/Playlist';
import {
  Paper,
} from '@material-ui/core';

class AlbumArt extends Component {
  constructor(props) {
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

AlbumArt.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.number.isRequired,
    album: PropTypes.string
  })
};

@inject('musicStore')
@observer
export default class HomePage extends Component {
  render() {
    let content;
    const {musicStore} = this.props;
    if(musicStore.playlist.length === 0 || musicStore.playlist[0].album === null) {
      content = (
        <div className="row">
          <div className="col-xs-12">
            <Playlist />
          </div>
        </div>
      );
    }
    else {
      content = (
        <div className="row">
          <div className="col-xs-12 col-sm-7 col-md-6">
            <AlbumArt key="art" track={musicStore.playlist[0]} />
          </div>

          <div className="col-xs-12 col-sm-5 col-md-6">
            <Playlist />
          </div>
        </div>
      );
    }

    return (
      <div className='home-page container-fluid'>
        {content}
      </div>
    );
  }
}

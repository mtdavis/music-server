import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';
import {compare} from '../lib/util';
import {
  CircularProgress,
  Paper,
} from '@material-ui/core';
import LazyLoad from 'react-lazy-load';

@inject('musicStore')
class AlbumImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      placeholderHeight: 250,
      opacity: 0,
    };
  }

  render() {

    const paperStyle = {
      margin: '12px',
      width: 250,
      lineHeight: 0,
      opacity: this.state.opacity,
      transition: 'opacity 450ms cubic-bezier(0.23, 1, 0.32, 1)',
    };

    return (
      <Paper style={paperStyle} square={true}>
        <LazyLoad height={this.state.placeholderHeight} offset={1000} debounce={false}>
          <img src={'/album-art?id=' + this.props.trackId}
            style={{
              width: '100%',
              cursor: 'pointer',
            }}
            onClick={this.onClick} onLoad={this.onLoad}/>
        </LazyLoad>
      </Paper>
    );
  }

  onLoad = () => {
    this.setState({
      placeholderHeight: null,
      opacity: 1,
    });
  }

  onClick = () => {
    this.props.musicStore.playAlbum(this.props.album);
  }
}

AlbumImage.propTypes = {
  album: PropTypes.shape({
    id: PropTypes.number.isRequired
  })
};

@inject('dbStore')
@observer
export default class FavoriteAlbumsPage extends Component {
  render() {
    const {dbStore} = this.props;

    let content;

    if(dbStore.albums.length === 0 || dbStore.tracks.length === 0) {
      content = <CircularProgress style={{margin: 24}} />;
    }
    else {
      const favoriteAlbums = dbStore.albums.filter(album => album.play_count >= 10);
      favoriteAlbums.sort((a, b) =>
        compare(a.album_artist, b.album_artist) || compare(a.release_date, b.release_date) ||
        compare(a.album, b.album));

      content = favoriteAlbums.map(album => {
        const trackOne = dbStore.tracks.filter(track =>
          track.album_id === album.id && track.track_number === 1)[0];
        return <AlbumImage key={album.id} album={album} trackId={trackOne.id} />;
      });
    }

    const divStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
    };

    return (
      <div style={divStyle}>
        {content}
      </div>
    );
  }
}

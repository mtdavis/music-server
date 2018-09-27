import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';
import {compare} from '../lib/util';
import {
  CircularProgress,
  Paper,
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import LazyLoad from 'react-lazy-load';

const styles = {
  albumPaper: {
    margin: '12px',
    width: 250,
    lineHeight: 0,
    transition: 'opacity 450ms cubic-bezier(0.23, 1, 0.32, 1)',
  },
  albumImage: {
    width: '100%',
    cursor: 'pointer',
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

@withStyles(styles)
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
    const {classes} = this.props;

    return (
      <Paper style={{opacity: this.state.opacity}} square={true} className={classes.albumPaper}>
        <LazyLoad height={this.state.placeholderHeight} offset={1000} debounce={false}>
          <img src={'/album-art?id=' + this.props.trackId}
            className={classes.albumImage}
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

@withStyles(styles)
@inject('dbStore')
@observer
export default class FavoriteAlbumsPage extends Component {
  render() {
    const {classes, dbStore} = this.props;

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

    return (
      <div className={classes.wrapper}>
        {content}
      </div>
    );
  }
}

import React, {Component, PropTypes} from 'react';
import {inject, observer} from 'mobx-react';
import {compare} from '../lib/util';
import {
  Paper,
} from 'material-ui';
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
      <Paper key={this.props.album.id} style={paperStyle} rounded={false}>
        <LazyLoad height={this.state.placeholderHeight} offset={1000} debounce={false}>
          <img src={'/album-art?id=' + this.props.album.id}
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

    const favoriteAlbums = dbStore.albums.filter(album => album.play_count >= 10);
    favoriteAlbums.sort((a, b) =>
      compare(a.album_artist, b.album_artist) || compare(a.release_date, b.release_date) ||
      compare(a.album, b.album));

    const gridTiles = favoriteAlbums.map(album =>
      <AlbumImage key={album.id} album={album} />
    );

    const divStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
    };

    return (
      <div style={divStyle}>
        {gridTiles}
      </div>
    );
  }
}

import React from 'react';
import AlbumList from '../lib/AlbumList';
import {FluxMixin} from '../lib/util';
import {
  Paper,
} from 'material-ui';
import LazyLoad from 'react-lazy-load';

var AlbumImage = React.createClass({
  mixins: [FluxMixin],

  getInitialState() {
    return {
      placeholderHeight: 250,
      opacity: 0,
    };
  },

  render() {

    let paperStyle = {
      margin: '12px',
      width: 250,
      lineHeight: 0,
      opacity: this.state.opacity,
      transition: 'opacity 450ms',
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
  },

  onLoad() {
    this.setState({
      placeholderHeight: null,
      opacity: 1,
    });
  },

  onClick() {
    this.getFlux().actions.playAlbum(this.props.album);
  }
});

module.exports = React.createClass({
  mixins: [FluxMixin],

  render() {
    var dbStore = this.getFlux().store("DbStore");

    var favoriteAlbums = dbStore.albums.filter(album => album.play_count >= 10);
    var gridTiles = favoriteAlbums.map(album => 
      <AlbumImage key={album.id} album={album} />
    );

    let divStyle = {
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

});

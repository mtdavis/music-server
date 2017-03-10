import React from 'react';
import AlbumList from '../lib/AlbumList';
import {FluxMixin} from '../lib/util';

module.exports = React.createClass({
  mixins: [FluxMixin],

  render() {
    var dbStore = this.getFlux().store("DbStore");

    var albumsNeverPlayed = [];

    for(var i = 0; i < dbStore.albums.length; i++) {
        var album = dbStore.albums[i];
        if(album.play_count === 0) {
            albumsNeverPlayed.push(album);
        }
    }

    return (
      <div className='never-played-page container-fluid'>
        <div className="row">
          <div className="col-xs-12">
            <AlbumList albums={albumsNeverPlayed}  initialSortColumnKey="album_artist" />
          </div>
        </div>
      </div>
    );
  }

});

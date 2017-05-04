import React from 'react';
import AlbumList from '../lib/AlbumList';
import {FluxMixin} from '../lib/util';

export default React.createClass({
  mixins: [FluxMixin],

  render() {
    const dbStore = this.getFlux().store("DbStore");

    const daysAgo = 42; // default == 6 weeks
    const secondsAgo = daysAgo * 24 * 60 * 60;
    const beforeTimestamp = Math.floor(new Date().getTime() / 1000) - secondsAgo;

    const albumsNotRecentlyPlayed = [];

    for(let i = 0; i < dbStore.albums.length; i++) {
      const album = dbStore.albums[i];
      if(album.play_count === 0 || album.last_play < beforeTimestamp) {
        albumsNotRecentlyPlayed.push(album);
      }
    }
    const initialSortSpecs = [
      {columnKey: 'last_play', order: -1}
    ];

    return (
      <div className='not-recently-played-page container-fluid'>
        <div className="row">
          <div className="col-xs-12">
            <AlbumList albums={albumsNotRecentlyPlayed} initialSortSpecs={initialSortSpecs} />
          </div>
        </div>
      </div>
    );
  }

});

import React from 'react';
import AlbumList from '../lib/AlbumList';
import {FluxMixin} from '../lib/util';

module.exports = React.createClass({
  mixins: [FluxMixin],

  render() {
    var dbStore = this.getFlux().store("DbStore");

    var daysAgo = 42; //default == 6 weeks
    var secondsAgo = daysAgo * 24 * 60 * 60;
    var beforeTimestamp = Math.floor(new Date().getTime() / 1000) - secondsAgo;

    var albumsNotRecentlyPlayed = [];

    for(var i = 0; i < dbStore.albums.length; i++) {
        var album = dbStore.albums[i];
        if(album.play_count === 0 || album.last_play < beforeTimestamp) {
          albumsNotRecentlyPlayed.push(album);
        }
    }
    var initialSortSpecs = [
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

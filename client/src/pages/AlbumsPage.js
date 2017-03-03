import React from 'react';
import AlbumList from '../lib/AlbumList';
import {FluxMixin} from '../lib/util';

module.exports = React.createClass({
  mixins: [FluxMixin],

  render: function () {
    var musicStore = this.getFlux().store("MusicStore");

    return (
      <div className='albums-page container-fluid'>
        <div className="row">
          <div className="col-xs-12">
            <AlbumList albums={musicStore.albums} initialSortColumnKey="album_artist" />
          </div>
        </div>
      </div>
    );
  }

});

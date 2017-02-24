import React from 'react';
import TrackList from '../lib/TrackList';
import {FluxMixin} from '../lib/util';

module.exports = React.createClass({
  mixins: [FluxMixin],

  render: function () {
    var musicStore = this.getFlux().store("MusicStore");

    return (
      <div className='tracks-page container-fluid'>
        <div className="row">
          <div className="col-xs-12">
            <TrackList tracks={musicStore.tracks} initialSortColumnKey="artist" />
          </div>
        </div>
      </div>
    );
  }
});

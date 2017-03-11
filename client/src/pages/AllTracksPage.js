import React from 'react';
import TrackList from '../lib/TrackList';
import {FluxMixin} from '../lib/util';

module.exports = React.createClass({
  mixins: [FluxMixin],

  render() {
    var dbStore = this.getFlux().store("DbStore");
    var initialSortSpecs = [
      {columnKey: 'track', order: 1},
      {columnKey: 'album', order: 1},
      {columnKey: 'album_artist', order: 1}
    ];

    return (
      <div className='tracks-page container-fluid'>
        <div className="row">
          <div className="col-xs-12">
            <TrackList tracks={dbStore.tracks} initialSortSpecs={initialSortSpecs} />
          </div>
        </div>
      </div>
    );
  }
});

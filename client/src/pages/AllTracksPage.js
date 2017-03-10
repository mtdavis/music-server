import React from 'react';
import TrackList from '../lib/TrackList';
import {FluxMixin} from '../lib/util';

module.exports = React.createClass({
  mixins: [FluxMixin],

  render() {
    var dbStore = this.getFlux().store("DbStore");

    return (
      <div className='tracks-page container-fluid'>
        <div className="row">
          <div className="col-xs-12">
            <TrackList tracks={dbStore.tracks} initialSortColumnKey="artist" />
          </div>
        </div>
      </div>
    );
  }
});

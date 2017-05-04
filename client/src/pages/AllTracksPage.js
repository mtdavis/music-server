import React from 'react';
import TrackList from '../lib/TrackList';
import {FluxMixin} from '../lib/util';

export default React.createClass({
  mixins: [FluxMixin],

  render() {
    const dbStore = this.getFlux().store("DbStore");
    const initialSortSpecs = [
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

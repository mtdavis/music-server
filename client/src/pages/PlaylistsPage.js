import React from 'react';
import PlaylistList from '../lib/PlaylistList';
import {FluxMixin} from '../lib/util';

export default React.createClass({
  mixins: [FluxMixin],

  render() {
    const dbStore = this.getFlux().store("DbStore");
    const initialSortSpecs = [
      {columnKey: 'title', order: 1}
    ];

    return (
      <div className='tracks-page container-fluid'>
        <div className="row">
          <div className="col-xs-12">
            <PlaylistList playlists={dbStore.playlists} initialSortSpecs={initialSortSpecs} />
          </div>
        </div>
      </div>
    );
  }
});

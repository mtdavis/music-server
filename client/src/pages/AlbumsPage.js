import React from 'react';
import AlbumList from '../lib/AlbumList';
import {FluxMixin} from '../lib/util';

export default React.createClass({
  mixins: [FluxMixin],

  render() {
    const dbStore = this.getFlux().store("DbStore");
    const initialSortSpecs = [
      {columnKey: 'album', order: 1},
      {columnKey: 'album_artist', order: 1}
    ];

    return (
      <div className='albums-page container-fluid'>
        <div className="row">
          <div className="col-xs-12">
            <AlbumList albums={dbStore.albums} initialSortSpecs={initialSortSpecs} />
          </div>
        </div>
      </div>
    );
  }

});

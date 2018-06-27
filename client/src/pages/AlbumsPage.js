import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import AlbumList from '../lib/AlbumList';

@inject('dbStore')
@observer
export default class AlbumsPage extends Component {
  render() {
    const {dbStore} = this.props;
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
}

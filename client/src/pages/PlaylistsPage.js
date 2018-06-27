import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import PlaylistList from '../lib/PlaylistList';

@inject('dbStore')
@observer
export default class PlaylistsPage extends Component {
  render() {
    const {dbStore} = this.props;
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
}

import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import TrackList from '../lib/TrackList';

@inject('dbStore')
@observer
export default class AllTracksPage extends Component {
  render() {
    const {dbStore} = this.props;
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
}

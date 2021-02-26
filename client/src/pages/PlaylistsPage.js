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
      <PlaylistList playlists={dbStore.playlists} initialSortSpecs={initialSortSpecs} />
    );
  }
}

import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {Paper} from 'material-ui';
import MTable from './table/MTable';
import renderIcon from './table/renderIcon';
import PlayerState from './PlayerState';
import {secondsToTimeString} from './util';

@inject('musicStore')
@observer
export default class Playlist extends Component {

  render() {
    const {musicStore} = this.props;

    // check whether all artists are equal.
    let allArtistsEqual = true;
    let artist = null;
    for(let i = 0; i < musicStore.playlist.length; i++) {
      if(artist === null) {
        artist = musicStore.playlist[i].artist;
      }
      else if(artist !== musicStore.playlist[i].artist) {
        allArtistsEqual = false;
      }
    }

    const playlistItems = musicStore.playlist.map(function(track, index) {
      let icon = "icon-music";

      if(track === musicStore.currentTrack) {
        if(musicStore.playerState === PlayerState.PLAYING) {
          icon = "icon-play2";
        }
        else if(musicStore.playerState === PlayerState.PAUSED) {
          icon = "icon-pause2";
        }
        else if(musicStore.playerState === PlayerState.STOPPED) {
          icon = "icon-stop2";
        }
      }

      const text = allArtistsEqual ?
        (index + 1) + ". " + track.title :
        (index + 1) + ". " + track.artist + " - " + track.title;

      return {
        id: index,
        icon: icon,
        text: text,
        duration: track.duration
      };
    });

    const columns = [
      {key:"icon", renderer: renderIcon},
      {key:"text"},
      {key:"duration", renderer:secondsToTimeString, textAlign:"right"}
    ];

    return (
      <Paper>
        <MTable
          rows={playlistItems}
          showHeader={false}
          showFilter={false}
          responsive={false}
          condensed={true}
          columns={columns}
          onRowClick={this.onTrackClick}
          placeholderText={"The playlist is empty!"}
        />
      </Paper>
    );
  }

  onTrackClick = (item) => {
    this.props.musicStore.jumpToPlaylistItem(item.id);
  }
}

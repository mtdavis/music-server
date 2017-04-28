import React from 'react';
import {Paper} from 'material-ui';
import MTable from './table/MTable';
import renderIcon from './table/renderIcon';
import PlayerState from './PlayerState';
import {
  FluxMixin,
  secondsToTimeString
} from './util';

const Playlist = React.createClass({
  mixins: [FluxMixin],

  render() {
    var musicStore = this.getFlux().store("MusicStore");

    //check whether all artists are equal.
    var allArtistsEqual = true;
    var artist = null;
    for(var i = 0; i < musicStore.playlist.length; i++) {
      if(artist === null) {
        artist = musicStore.playlist[i].artist;
      }
      else if(artist !== musicStore.playlist[i].artist) {
        allArtistsEqual = false;
      }
    }

    var playlistItems = musicStore.playlist.map(function(track, index) {
      var icon = "icon-music";

      if(track === musicStore.playlist[musicStore.nowPlaying]) {
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

      var text = allArtistsEqual ?
        (index + 1) + ". " + track.title :
        (index + 1) + ". " + track.artist + " - " + track.title;

      return {
        id: index,
        icon: icon,
        text: text,
        duration: track.duration
      };
    });

    var columns = [
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
  },

  onTrackClick(item) {
    this.getFlux().actions.jumpToPlaylistItem(item.id);
  }
});

export default Playlist;

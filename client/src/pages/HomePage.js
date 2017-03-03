import React from 'react';
import Playlist from '../lib/Playlist';
import {FluxMixin} from '../lib/util';
import {
  Menu,
  Paper,
} from 'material-ui';

var AlbumArt = React.createClass({
  render: function() {
    var result;
    if(this.props.track.album === "")
    {
      result = null;
    }
    else {
      result = (
        <Paper rounded={false} style={{width:"100%", lineHeight:"0"}}>
          <img src={"/album-art?id=" + this.props.track.id} style={{width:"100%"}} />
        </Paper>
      );
    }

    return result;
  }
});

module.exports = React.createClass({
  mixins: [FluxMixin],

  contextTypes: {
    flux: React.PropTypes.object.isRequired
  },

  render: function () {

    var content;
    var musicStore = this.getFlux().store("MusicStore");
    if(musicStore.playlist.length === 0 || musicStore.playlist[0].album === '') {
      content = (
        <div className="row">
          <div className="col-xs-12">
            <Playlist />
          </div>
        </div>
      );
    }
    else {
        content = (
          <div className="row">
            <div className="col-xs-12 col-sm-7 col-md-6">
              <AlbumArt key="art" track={musicStore.playlist[0]} />
            </div>

            <div className="col-xs-12 col-sm-5 col-md-6">
              <Playlist />
            </div>
          </div>
        );
    }

    return (
      <div className='home-page container-fluid'>
        {content}
      </div>
    );
  }

});

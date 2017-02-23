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
      var menuItems = [
        {
          text: "No album art!",
          iconClassName: "icon-album"
        }
      ]

      result = (
        <div key="album-art" className="hidden-xs col-sm-5">
          <Menu menuItems={menuItems} autoWidth={false} />
        </div>
      );
    }
    else
    {
      result = (
        <div key="album-art" className="col-xs-12 col-sm-5">
          <Paper rounded={false} style={{width:"100%", lineHeight:"0"}}>
            <img src={"/album-art?id=" + this.props.track.id} style={{width:"100%"}} />
          </Paper>
        </div>
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
    if(musicStore.playlist.length !== 0)
    {
        content = [
          <AlbumArt key="art" track={musicStore.playlist[0]} />,

          <div key="playlist" className="col-xs-12 col-sm-7">
            <Playlist />
          </div>
        ];
    }
    else
    {
      content = (
        <div className="col-xs-12">
          <Playlist />
        </div>
      );
    }

    return (
      <div className='home-page container-fluid'>
        <div className="row">
          {content}
        </div>
      </div>
    );
  }

});

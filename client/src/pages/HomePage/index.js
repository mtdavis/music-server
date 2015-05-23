var React = require('react');

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);

var {Playlist} = require('../../music-lib');

var mui = require("material-ui");
var {Paper, Menu} = mui;

module.exports = React.createClass({
  mixins: [FluxMixin],

  render: function () {

    var content;
    var musicStore = this.getFlux().store("MusicStore");
    if(musicStore.playlist.length !== 0)
    {
        var currentTrack = musicStore.playlist[musicStore.nowPlaying];
        var albumArt;
        if(currentTrack.album === "")
        {
            var menuItems = [
                {
                    text: "No album art!",
                    iconClassName: "icon-album"
                }
            ]

            albumArt = (
              <div key="album-art" className="hidden-xs col-sm-5">
                <Menu menuItems={menuItems} autoWidth={false} />
              </div>
            );
        }
        else
        {
            albumArt = (
              <div key="album-art" className="col-xs-12 col-sm-5">
                <Paper rounded={false} style={{width:"100%", lineHeight:"0"}}>
                  <img src={"/album-art?id=" + currentTrack.id} style={{width:"100%"}} />
                </Paper>
              </div>
            );
        }

        content = [
          {albumArt},

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

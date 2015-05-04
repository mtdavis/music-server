var React = require('react');

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);

var {Playlist} = require('../../music-lib');

module.exports = React.createClass({
  mixins: [FluxMixin],

  render: function () {

    var content;
    var musicStore = this.getFlux().store("MusicStore");
    if(musicStore.playlist.length !== 0)
    {
        var currentTrack = musicStore.playlist[musicStore.nowPlaying];
        content = [
          <img key="album-art" src={"/album-art?id=" + currentTrack.id} className="col-xs-12 col-sm-5" />,

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

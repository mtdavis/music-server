var React = require('react');

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);

var {Playlist} = require('../../music-lib');

module.exports = React.createClass({
  mixins: [FluxMixin],

  render: function () {

    var nowPlayingImage;
    var musicStore = this.getFlux().store("MusicStore");
    if(musicStore.playlist.length !== 0)
    {
        var currentTrack = musicStore.playlist[musicStore.nowPlaying];
        nowPlayingImage = <img src={"/album-art?id=" + currentTrack.id} />;
    }

    return (
      <div className='home-page'>
        <Playlist />

        {nowPlayingImage}
      </div>
    );
  }

});

var React = require('react');

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);

var {AlbumList} = require('../../music-lib');

module.exports = React.createClass({
  mixins: [FluxMixin],

  render: function () {
    var musicStore = this.getFlux().store("MusicStore");

    var albumsNeverPlayed = [];

    for(var i = 0; i < musicStore.albums.length; i++)
    {
        var album = musicStore.albums[i];
        if(album.play_count === 0)
        {
            albumsNeverPlayed.push(album);
        }
    }

    return (
      <div className='never-played-page container-fluid'>
        <div className="row">
          <div className="col-xs-12">
            <AlbumList albums={albumsNeverPlayed} />
          </div>
        </div>
      </div>
    );
  }

});

var React = require('react');

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);

var {AlbumList} = require('../../music-lib');

module.exports = React.createClass({
  mixins: [FluxMixin],

  render: function () {
    var musicStore = this.getFlux().store("MusicStore");

    var daysAgo = 42; //default == 6 weeks
    var secondsAgo = daysAgo * 24 * 60 * 60;
    var beforeTimestamp = Math.floor(new Date().getTime() / 1000) - secondsAgo;

    var albumsNotRecentlyPlayed = [];

    for(var i = 0; i < musicStore.albums.length; i++)
    {
        var album = musicStore.albums[i];
        if(album.play_count === 0 || album.last_play < beforeTimestamp)
        {
            albumsNotRecentlyPlayed.push(album);
        }
    }

    return (
      <div className='not-recently-played-page container-fluid'>
        <div className="row">
          <div className="col-xs-12">
            <AlbumList albums={albumsNotRecentlyPlayed} initialSortColumnKey="last_play" initialSortOrder={-1} />
          </div>
        </div>
      </div>
    );
  }

});

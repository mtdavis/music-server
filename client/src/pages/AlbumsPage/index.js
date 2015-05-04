var React = require('react');

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);

var {AlbumList} = require('../../music-lib');

module.exports = React.createClass({
  mixins: [FluxMixin],

  render: function () {
    var musicStore = this.getFlux().store("MusicStore");

    return (
      <div className='albums-page container-fluid'>
        <div className="row">
          <div className="col-xs-12">
            <AlbumList albums={musicStore.albums} />
          </div>
        </div>
      </div>
    );
  }

});

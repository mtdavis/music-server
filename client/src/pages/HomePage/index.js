var React = require('react');

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);

var {Playlist} = require('../../music-lib');

module.exports = React.createClass({
  mixins: [FluxMixin],

  render: function () {
    return (
      <div className='home-page'>
        <Playlist />
      </div>
    );
  }

});

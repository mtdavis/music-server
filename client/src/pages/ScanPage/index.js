var React = require("react");

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);

var mui = require("material-ui");
var {RaisedButton, FontIcon} = mui;

module.exports = React.createClass({
  mixins: [FluxMixin],

  render: function () {
    return (
      <div className='scan-page container-fluid'>
        <div className="row">
          <div className="col-xs-12" style={{textAlign:"center"}}>
            <RaisedButton label="Scan for New Files" onClick={this.getFlux().actions.scanForNewFiles} />
            <br />
            <br />
            <RaisedButton label="Scan for Changed Metadata" onClick={this.getFlux().actions.scanForChangedMetadata} />
            <br />
            <br />
            <RaisedButton label="Scan for Moved Files" onClick={this.getFlux().actions.scanForMovedFiles} />
          </div>
        </div>
      </div>
    );
  }

});

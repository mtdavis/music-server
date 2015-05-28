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
            <RaisedButton onClick={this.getFlux().actions.scanForNewFiles}>
              <FontIcon className="icon-search"/>
              <span className="mui-raised-button-label">Scan for New Files</span>
            </RaisedButton>
            <br />
            <br />
            <RaisedButton onClick={this.getFlux().actions.scanForChangedMetadata}>
              <FontIcon className="icon-search"/>
              <span className="mui-raised-button-label">Scan for Changed Metadata</span>
            </RaisedButton>
            <br />
            <br />
            <RaisedButton onClick={this.getFlux().actions.scanForMovedFiles}>
              <FontIcon className="icon-search"/>
              <span className="mui-raised-button-label">Scan for Moved Files</span>
            </RaisedButton>
          </div>
        </div>
      </div>
    );
  }

});

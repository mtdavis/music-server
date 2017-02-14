var React = require("react");

var Fluxxor = require('fluxxor');
var FluxMixin = Fluxxor.FluxMixin(React);

var mui = require("material-ui");
var {RaisedButton, FontIcon} = mui;

var ShuffleButton = React.createClass({
  mixins: [FluxMixin],

  render: function() {
    return (
      <RaisedButton
        primary={true}
        onClick={this.onClick} 
        label={this.props.minutes + ' Minutes'}
        icon={<FontIcon className="icon-shuffle"/>} />
    );
  },

  onClick: function() {
    this.getFlux().actions.playShuffle(this.props.minutes);
  }
})

module.exports = React.createClass({
  render: function () {
    return (
      <div className='shuffle-page container-fluid'>
        <div className="row">
          <div className="col-xs-12" style={{textAlign:"center"}}>
            <ShuffleButton minutes={30} />
            <br />
            <br />
            <ShuffleButton minutes={60} />
            <br />
            <br />
            <ShuffleButton minutes={90} />
          </div>
        </div>
      </div>
    );
  }
});

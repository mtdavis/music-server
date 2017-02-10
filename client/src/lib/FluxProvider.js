var React = require('react');

module.exports = React.createClass({
  childContextTypes: {
    flux: React.PropTypes.object
  },

  getChildContext() {
    return {flux: this.props.flux};
  },

  render() {
    return this.props.children;
  }
});

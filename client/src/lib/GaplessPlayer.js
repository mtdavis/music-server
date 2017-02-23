var React = require('react');
var ReactDOM = require('react-dom');
import {FluxMixin} from './util';

const GaplessPlayer = React.createClass({
    mixins: [FluxMixin],

    getDefaultProps() {
        return {
            id: "player"
        };
    },

    componentDidMount() {
        this.getFlux().actions.initializePlayer(ReactDOM.findDOMNode(this));
    },

    componentWillUnmount() {
        console.log("GaplessPlayer unmounting!");
    },

    render() {
        var musicStore = this.getFlux().store("MusicStore");

        return (
            <p id={this.props.id} style={{display:"none"}}></p>
            // <p id={this.props.id} style={{ position:"absolute", right:20, top:120 }}></p>
        );
    }
});

export default GaplessPlayer;

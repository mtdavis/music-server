import React from 'react';
import {Snackbar} from 'material-ui';
import {
    FluxMixin,
    secondsToTimeString,
    unixTimestampToDateString,
} from './util';
import MTable from './table/MTable';
import FilteredTable from './table/FilteredTable';

const AlbumList = React.createClass({
    mixins: [FluxMixin],

    getDefaultProps() {
        return {
            albums: []
        };
    },

    getInitialState() {
        return {
            enqueueSnackbarOpen: false
        };
    },

    render() {
        var columns = [
            {key:"album_artist", header:"Album Artist"},
            {key:"album", header:"Album"},
            {key:"year", header:"Year", textAlign:"right"},
            {key:"tracks", header:"Tracks", textAlign:"right"},
            {key:"duration", header:"Duration", renderer:secondsToTimeString, textAlign:"right", wrap:false},
            {key:"play_count", header:"Play Count", textAlign:"right"},
            {key:"last_play", header:"Last Play", renderer:unixTimestampToDateString, textAlign:"right", wrap:false}
        ];

        var table = (
            <MTable
                {...this.props}
                onRowClick={this.onAlbumClick}
                onRowCtrlClick={this.onAlbumCtrlClick}
            />
        );

        return (
            <div>
                <FilteredTable table={table} rows={this.props.albums} columns={columns}/>

                <Snackbar
                    message="Album enqueued."
                    open={this.state.enqueueSnackbarOpen}
                />
            </div>
        );
    },

    onAlbumClick(album)
    {
        this.getFlux().actions.playAlbum(album);
    },

    onAlbumCtrlClick(album)
    {
        this.setState({enqueueSnackbarOpen: true});
        this.getFlux().actions.enqueueAlbum(album);

        setTimeout(() => {
            this.setState({enqueueSnackbarOpen: false});
        }, 2000);
    }
});

export default AlbumList;

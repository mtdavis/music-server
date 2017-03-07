import React from 'react';
import MTable from '../lib/table/MTable';
import {FluxMixin} from '../lib/util';
import {
  Paper
} from 'material-ui';
import {muiThemeable} from 'material-ui/styles';

const LyricsPage = React.createClass({
  mixins: [FluxMixin],

  componentWillMount() {
    this.getFlux().actions.getLyrics();
  },

  render() {
    let musicStore = this.getFlux().store("MusicStore");

    if(!musicStore.lyrics) {
      return (
        <div className='container-fluid'>
          <div className="row">
            <div className="col-xs-12">
              <Paper>
                  <MTable
                      rows={[]}
                      showHeader={false}
                      columns={[]}
                      placeholderText={"Nothing to see here!"}
                  />
              </Paper>
            </div>
          </div>
        </div>
      );
    }

    let track = musicStore.playlist[musicStore.nowPlaying];
    let header = track.artist + ' – ' + track.title;
    let lyrics = musicStore.lyrics;

    let headerStyle = {
      textAlign: 'center',
      fontSize: '24px',
      fontWeight: this.props.muiTheme.appBar.titleFontWeight,
      borderBottom: '1px solid #eee',
      paddingBottom: '12px',
    }

    let lyricsStyle = {
      fontFamily: this.props.muiTheme.fontFamily,
      lineHeight: '1.333',
      textAlign: 'center'
    };

    return (
      <div className='container-fluid'>
        <div className="row">
          <div className="col-xs-12">
            <Paper style={{overflowX: 'hidden'}}>
              <h1 style={headerStyle}>{header}</h1>
              <pre style={lyricsStyle}>
                {lyrics}
              </pre>
            </Paper>
          </div>
        </div>
      </div>
    );
  }
});

export default muiThemeable()(LyricsPage);

import React from 'react';
import deepEqual from 'deep-equal';
import MTable from '../lib/table/MTable';
import {FluxMixin} from '../lib/util';
import {StoreWatchMixin} from 'fluxxor';
import {
  CircularProgress,
  Paper
} from 'material-ui';
import {muiThemeable} from 'material-ui/styles';
import LyricsState from '../lib/LyricsState';

const LyricsPage = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("MusicStore", "LyricsStore")],

  componentDidMount() {
    this.getFlux().actions.getLyrics();
  },

  componentWillUpdate(nextProps, nextState) {
    if(this.state.nowPlaying !== nextState.nowPlaying ||
        !deepEqual(this.state.playList, nextState.playList)) {
      this.getFlux().actions.getLyrics();
    }
  },

  getStateFromFlux() {
    const musicStore = this.getFlux().store("MusicStore");
    const lyricsStore = this.getFlux().store("LyricsStore");
    return {
      lyricsState: lyricsStore.lyricsState,
      lyrics: lyricsStore.lyrics,
      playlist: musicStore.playlist,
      nowPlaying: musicStore.nowPlaying,
    };
  },

  render() {
    let content;

    if(this.state.lyricsState === LyricsState.NO_TRACK) {
      content = (
        <Paper>
          <MTable
            rows={[]}
            showHeader={false}
            columns={[]}
            placeholderText={"Nothing to see here!"}
          />
        </Paper>
      );
    }
    else if(this.state.lyricsState === LyricsState.FAILED) {
      content = (
        <Paper>
          <MTable
            rows={[]}
            showHeader={false}
            columns={[]}
            placeholderText={"There was a problem loading the lyrics."}
          />
        </Paper>
      );
    }
    else {
      const track = this.state.playlist[this.state.nowPlaying];
      const header = track.artist + ' – ' + track.title;
      let lyrics;

      if(this.state.lyricsState === LyricsState.LOADING) {
        lyrics = <CircularProgress />;
      }
      else if(this.state.lyricsState === LyricsState.SUCCESSFUL) {
        lyrics = this.state.lyrics;
      }

      const headerStyle = {
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: this.props.muiTheme.appBar.titleFontWeight,
        borderBottom: '1px solid #eee',
        paddingTop: '12px',
        paddingBottom: '12px',
        marginTop: 0,
      };

      const lyricsStyle = {
        fontFamily: this.props.muiTheme.fontFamily,
        lineHeight: '1.333',
        textAlign: 'center',
        whiteSpace: 'pre-wrap',
      };

      content = (
        <Paper style={{paddingBottom:'12px'}}>
          <h1 style={headerStyle}>{header}</h1>
          <div style={lyricsStyle}>
            {lyrics}
          </div>
        </Paper>
      );
    }

    return (
      <div className='container-fluid'>
        <div className="row">
          <div className="col-xs-12">
            {content}
          </div>
        </div>
      </div>
    );
  }
});

export default muiThemeable()(LyricsPage);

import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import MTable from '../lib/table/MTable';
import {
  CircularProgress,
  Paper
} from 'material-ui';
import {muiThemeable} from 'material-ui/styles';
import LyricsState from '../lib/LyricsState';

@muiThemeable()
@inject('musicStore', 'lyricsStore')
@observer
export default class LyricsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayingTrackId: null
    };
  }

  componentDidMount() {
    const {musicStore, lyricsStore} = this.props;
    lyricsStore.getLyrics(musicStore);

    this.setState({
      displayingTrackId: lyricsStore.lyricsTrackId
    });
  }

  componentWillUpdate(nextProps) {
    const {musicStore, lyricsStore} = nextProps;
    if(musicStore.playlist.length > 0 &&
        musicStore.playlist[musicStore.nowPlaying].id !== this.state.displayingTrackId) {

      lyricsStore.getLyrics(musicStore);

      this.setState({
        displayingTrackId: this.props.lyricsStore.lyricsTrackId
      });
    }
  }

  render() {
    let content;
    const {lyricsStore, musicStore} = this.props;

    if(lyricsStore.lyricsState === LyricsState.NO_TRACK) {
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
    else if(lyricsStore.lyricsState === LyricsState.FAILED) {
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
      const track = musicStore.playlist[musicStore.nowPlaying];
      const header = track.artist + ' – ' + track.title;
      let lyrics;

      if(lyricsStore.lyricsState === LyricsState.LOADING) {
        lyrics = <CircularProgress />;
      }
      else if(lyricsStore.lyricsState === LyricsState.SUCCESSFUL) {
        lyrics = lyricsStore.lyrics;
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
}

import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import MTable from '../lib/table/MTable';
import {
  CircularProgress,
  Paper,
  Typography,
} from '@material-ui/core';
import {withTheme} from '@material-ui/core/styles';
import LyricsState from '../lib/LyricsState';

@withTheme()
@inject('musicStore', 'lyricsStore')
@observer
export default class LyricsPage extends Component {
  componentDidMount() {
    this.props.lyricsStore.setLyricsVisible(true);
  }

  componentWillUnmount() {
    this.props.lyricsStore.setLyricsVisible(false);
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
      const track = musicStore.currentTrack;
      let header = track.artist + ' – ' + track.title;
      let lyrics;

      if(lyricsStore.lyricsState === LyricsState.LOADING) {
        lyrics = <CircularProgress />;
      }
      else if(lyricsStore.lyricsState === LyricsState.SUCCESSFUL) {
        header = (
          <a href={lyricsStore.url} style={{textDecoration: 'none'}} target='_blank'>
            {header}
          </a>
        );
        lyrics = lyricsStore.lyrics;
      }

      const headerStyle = {
        textAlign: 'center',
        borderBottom: '1px solid #eee',
        paddingTop: '12px',
        paddingBottom: '12px',
        marginTop: 0,
      };

      const lyricsStyle = {
        fontFamily: this.props.theme.typography.fontFamily,
        lineHeight: '1.333',
        textAlign: 'center',
        whiteSpace: 'pre-wrap',
        marginTop: 12,
      };

      content = (
        <Paper style={{paddingBottom:'12px'}}>
          <div style={headerStyle}>
            <Typography variant="title" color="inherit">{header}</Typography>
          </div>
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

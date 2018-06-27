import React, {Component, PropTypes} from 'react';
import {inject, observer} from 'mobx-react';
import Playlist from '../lib/Playlist';
import {
  Paper,
} from 'material-ui';

class AlbumArt extends Component {
  constructor(props) {
    super(props);

    this.state = {
      opacity: 0,
    };
  }

  render() {
    let result;
    if(this.props.track.album === "") {
      result = null;
    }
    else {
      const paperStyle = {
        width: '100%',
        lineHeight: '0',
        opacity: this.state.opacity,
        transition: 'opacity 450ms cubic-bezier(0.23, 1, 0.32, 1)'
      };

      result = (
        <Paper rounded={false} style={paperStyle}>
          <img
            src={'/album-art?id=' + this.props.track.id}
            style={{width: '100%'}}
            onLoad={() => this.setState({opacity: 1})}
          />
        </Paper>
      );
    }

    return result;
  }
}

AlbumArt.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.number.isRequired,
    album: PropTypes.string
  })
};

@inject('musicStore')
@observer
export default class HomePage extends Component {
  render() {
    let content;
    const {musicStore} = this.props;
    if(musicStore.playlist.length === 0 || musicStore.playlist[0].album === '') {
      content = (
        <div className="row">
          <div className="col-xs-12">
            <Playlist />
          </div>
        </div>
      );
    }
    else {
      content = (
        <div className="row">
          <div className="col-xs-12 col-sm-7 col-md-6">
            <AlbumArt key="art" track={musicStore.playlist[0]} />
          </div>

          <div className="col-xs-12 col-sm-5 col-md-6">
            <Playlist />
          </div>
        </div>
      );
    }

    return (
      <div className='home-page container-fluid'>
        {content}
      </div>
    );
  }
}

import React from 'react';
import {inject, observer} from 'mobx-react';
import {
  Grid,
  Paper,
} from '@material-ui/core';
import {
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import LazyLoad from 'react-lazy-load';

import {MusicStore} from '../stores';

const styles = {
  albumPaper: {
    lineHeight: 0,
    transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1)',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  albumImage: {
    width: '100%',
    cursor: 'pointer',
  },
};

interface Props extends WithStyles<typeof styles> {
  album: Album;
  trackId: number;
}

interface InjectedProps extends Props {
  musicStore: MusicStore;
}

interface State {
  placeholderHeight: number | undefined;
  opacity: number;
  hover: boolean;
}

@inject('musicStore')
@observer
class AlbumImage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      placeholderHeight: 250,
      opacity: 0,
      hover: false,
    };
  }

  get injected() {
    return this.props as InjectedProps;
  }

  render() {
    const {classes} = this.props;

    return (
      <Grid item xs={6} sm={4} md={3} lg={2}>
        <Paper
          style={{opacity: this.state.opacity}}
          square={true}
          className={classes.albumPaper}
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          elevation={this.state.hover ? 4 : 2}
        >
          <LazyLoad height={this.state.placeholderHeight} offset={1000} debounce={false}>
            <img src={'/album-art?id=' + this.props.trackId}
              className={classes.albumImage}
              onClick={this.onClick} onLoad={this.onLoad}/>
          </LazyLoad>
        </Paper>
      </Grid>
    );
  }

  onLoad = () => {
    this.setState({
      placeholderHeight: undefined,
      opacity: 1,
    });
  }

  onClick = () => {
    this.injected.musicStore.playAlbum(this.props.album);
  }

  onMouseOver = () => {
    this.setState({hover: true});
  };

  onMouseOut = () => {
    this.setState({hover: false});
  }
}

export default withStyles(styles)(AlbumImage);

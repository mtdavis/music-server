import React, {Component} from 'react';
import {Typography} from '@material-ui/core';
import {RouteComponentProps, withRouter} from 'react-router';

const titles: {[path: string]: string} = {
  '/': "Now Playing",
  '/lyrics': "Lyrics",
  '/albums': "All Albums",
  '/not-recently-played': "Not Recently Played",
  '/never-played': "Never Played",
  '/favorite-albums': "Favorite Albums",
  '/tracks': "All Tracks",
  '/shuffle': "Shuffle",
  '/scan': "Scan",
  '/playlists': "Playlists",
};

class Title extends Component<RouteComponentProps> {
  render() {
    const title = this.props.location && this.props.location.pathname ?
      titles[this.props.location.pathname] :
      'Now Playing';

    return (
      <Typography variant="title" color="inherit">
        {title}
      </Typography>
    );
  }
}

export default withRouter(Title);

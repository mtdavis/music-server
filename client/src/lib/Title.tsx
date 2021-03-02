import React, {Component} from 'react';
import {Typography} from '@material-ui/core';
import {Route, Switch} from 'react-router';
import {HashRouter} from 'react-router-dom';

export default class Title extends Component {
  render() {
    return (
      <HashRouter>
        <Switch>
          <Route exact path='/' component={this.renderTitle('Now Playing')} />
          <Route path='/lyrics' component={this.renderTitle('Lyrics')} />
          <Route path='/albums' component={this.renderTitle('All Albums')} />
          <Route path='/not-recently-played' component={this.renderTitle('Not Recently Played')} />
          <Route path='/never-played' component={this.renderTitle('Never Played')} />
          <Route path='/favorite-albums' component={this.renderTitle('Favorite Albums')} />
          <Route path='/tracks' component={this.renderTitle('All Tracks')} />
          <Route path='/shuffle' component={this.renderTitle('Shuffle')} />
          <Route path='/scan' component={this.renderTitle('Scan')} />
          <Route path='/playlists' component={this.renderTitle('Playlists')} />
          <Route path='*' component={this.renderTitle('Now Playing')} />
        </Switch>
      </HashRouter>
    );
  }

  renderTitle(title: string) {
    return () => (
      <Typography variant="h6" color="inherit">
        {title}
      </Typography>
    );
  }
}

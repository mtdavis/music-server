import React from 'react';
import {Typography} from '@material-ui/core';
import {Route, Switch} from 'react-router';
import {HashRouter} from 'react-router-dom';

const renderTitle = (title: string) => (
  () => (
    <Typography variant="h6" color="inherit">
      {title}
    </Typography>
  )
);

const Title = (): React.ReactElement => (
  <HashRouter>
    <Switch>
      <Route exact path='/' component={renderTitle('Now Playing')} />
      <Route path='/lyrics' component={renderTitle('Lyrics')} />
      <Route path='/albums' component={renderTitle('All Albums')} />
      <Route path='/not-recently-played' component={renderTitle('Not Recently Played')} />
      <Route path='/never-played' component={renderTitle('Never Played')} />
      <Route path='/favorite-albums' component={renderTitle('Favorite Albums')} />
      <Route path='/tracks' component={renderTitle('All Tracks')} />
      <Route path='/shuffle' component={renderTitle('Shuffle')} />
      <Route path='/scan' component={renderTitle('Scan')} />
      <Route path='/playlists' component={renderTitle('Playlists')} />
      <Route path='*' component={renderTitle('Now Playing')} />
    </Switch>
  </HashRouter>
);

export default Title;

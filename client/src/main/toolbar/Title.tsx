import React from 'react';
import {Typography} from '@material-ui/core';
import {Route, Routes} from 'react-router';
import {HashRouter} from 'react-router-dom';

const Title = (): React.ReactElement => {
  const renderTitle = React.useCallback((title: string) => (
    <Typography variant="h6" color="inherit">
      {title}
    </Typography>
  ), []);

  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={renderTitle('Now Playing')} />
        <Route path='/lyrics' element={renderTitle('Lyrics')} />
        <Route path='/albums' element={renderTitle('All Albums')} />
        <Route path='/not-recently-played' element={renderTitle('Not Recently Played')} />
        <Route path='/never-played' element={renderTitle('Never Played')} />
        <Route path='/favorite-albums' element={renderTitle('Favorite Albums')} />
        <Route path='/tracks' element={renderTitle('All Tracks')} />
        <Route path='/shuffle' element={renderTitle('Shuffle')} />
        <Route path='/scan' element={renderTitle('Scan')} />
        <Route path='/playlists' element={renderTitle('Playlists')} />
        <Route path='/statistics' element={renderTitle('Statistics')} />
        <Route path='*' element={renderTitle('Now Playing')} />
      </Routes>
    </HashRouter>
  );
};

export default Title;

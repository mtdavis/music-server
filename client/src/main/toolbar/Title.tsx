import React from 'react';
import {Typography} from '@mui/material';
import {Route, Routes} from 'react-router';

const Title = (): React.ReactElement => {
  const renderTitle = React.useCallback((title: string) => (
    <Typography variant="h6" color="inherit" sx={{whiteSpace: 'nowrap'}}>
      {title}
    </Typography>
  ), []);

  return (
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
    </Routes>
  );
};

export default Title;

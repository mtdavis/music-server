import React from 'react';
import {Route, Routes} from 'react-router';
import {HashRouter} from 'react-router-dom';
import {observer} from 'mobx-react-lite';
import {
  AppBar,
  Snackbar,
} from '@material-ui/core';
import {makeStyles} from '@material-ui/styles';
import {Theme} from '@material-ui/core/styles';

import {useStores} from 'stores';
import ScrobbleState from 'lib/ScrobbleState';
import Wrap from './Wrap';
const toolbarPromise = import('./toolbar/Toolbar');

const homePagePromise = import('pages/HomePage');
const lyricsPagePromise = import('pages/LyricsPage');
const albumsPagePromise = import('pages/AlbumsPage');
const notRecentlyPlayedPagePromise = import('pages/NotRecentlyPlayedPage');
const neverPlayedPagePromise = import('pages/NeverPlayedPage');
const favoriteAlbumsPagePromise = import('pages/FavoriteAlbumsPage');
const allTracksPagePromise = import('pages/AllTracksPage');
const shufflePagePromise = import('pages/ShufflePage');
const playlistsPagePromise = import('pages/PlaylistsPage');
const scanPagePromise = import('pages/ScanPage');
const statsPagePromise = import('pages/StatsPage');

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const Master = () => {
  const Toolbar = React.lazy(() => toolbarPromise);
  const classes = useStyles();
  const {musicStore, scrobbleStore} = useStores();
  const [demoSnackbarClosed, setDemoSnackbarClosed] = React.useState(false);

  const onDemoSnackbarClose = () => {
    setDemoSnackbarClosed(true);
  };

  return (
    <>
      <AppBar className={classes.appBar}>
        <React.Suspense fallback={<div style={{height: 64}} />}>
          <Toolbar />
        </React.Suspense>
      </AppBar>

      <HashRouter>
        <Routes>
          <Route path='/' element={<Wrap>{homePagePromise}</Wrap>} />
          <Route path='/lyrics' element={<Wrap>{lyricsPagePromise}</Wrap>} />
          <Route path='/albums' element={<Wrap>{albumsPagePromise}</Wrap>} />
          <Route path='/not-recently-played' element={<Wrap>{notRecentlyPlayedPagePromise}</Wrap>} />
          <Route path='/never-played' element={<Wrap>{neverPlayedPagePromise}</Wrap>} />
          <Route path='/favorite-albums' element={<Wrap>{favoriteAlbumsPagePromise}</Wrap>} />
          <Route path='/tracks' element={<Wrap>{allTracksPagePromise}</Wrap>} />
          <Route path='/shuffle' element={<Wrap>{shufflePagePromise}</Wrap>} />
          <Route path='/playlists' element={<Wrap>{playlistsPagePromise}</Wrap>} />
          <Route path='/scan' element={<Wrap>{scanPagePromise}</Wrap>} />
          <Route path='/statistics' element={<Wrap>{statsPagePromise}</Wrap>} />
          <Route path='*' element={<Wrap>{homePagePromise}</Wrap>} />
        </Routes>
      </HashRouter>

      <Snackbar open={scrobbleStore.scrobbleState === ScrobbleState.SCROBBLE_FAILED}
        message='Scrobble failed.' />

      <Snackbar
        open={musicStore.demoMode && !demoSnackbarClosed}
        autoHideDuration={10000}
        onClose={onDemoSnackbarClose}
        message={
          <span>
            This is a demo instance that uses public-domain music.<br/>
            A few features are disabled, e.g., scrobbling to last.fm.
          </span>
        }
      />
    </>
  );
};

export default observer(Master);

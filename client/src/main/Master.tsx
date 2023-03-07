import React from 'react';
import {Route, Routes} from 'react-router';
import {observer} from 'mobx-react-lite';
import {
  AppBar,
  Snackbar,
} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {Theme} from '@mui/material/styles';

import {useStores} from 'stores';
import ScrobbleState from 'lib/ScrobbleState';
import Wrap from './Wrap';
const Toolbar = React.lazy(() => import('./toolbar/Toolbar'));

const HomePage = React.lazy(() => import('pages/HomePage'));
const LyricsPage = React.lazy(() => import('pages/LyricsPage'));
const AlbumsPage = React.lazy(() => import('pages/AlbumsPage'));
const NotRecentlyPlayedPage = React.lazy(() => import('pages/NotRecentlyPlayedPage'));
const NeverPlayedPage = React.lazy(() => import('pages/NeverPlayedPage'));
const FavoriteAlbumsPage = React.lazy(() => import('pages/FavoriteAlbumsPage'));
const AllTracksPage = React.lazy(() => import('pages/AllTracksPage'));
const ShufflePage = React.lazy(() => import('pages/ShufflePage'));
const PlaylistsPage = React.lazy(() => import('pages/PlaylistsPage'));
const ScanPage = React.lazy(() => import('pages/ScanPage'));
const StatsPage = React.lazy(() => import('pages/StatsPage'));

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const Master = () => {
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

      <Routes>
        <Route path='/' element={<Wrap><HomePage /></Wrap>} />
        <Route path='/lyrics' element={<Wrap><LyricsPage /></Wrap>} />
        <Route path='/albums' element={<Wrap><AlbumsPage /></Wrap>} />
        <Route path='/not-recently-played' element={<Wrap><NotRecentlyPlayedPage /></Wrap>} />
        <Route path='/never-played' element={<Wrap><NeverPlayedPage /></Wrap>} />
        <Route path='/favorite-albums' element={<Wrap><FavoriteAlbumsPage /></Wrap>} />
        <Route path='/tracks' element={<Wrap><AllTracksPage /></Wrap>} />
        <Route path='/shuffle' element={<Wrap><ShufflePage /></Wrap>} />
        <Route path='/playlists' element={<Wrap><PlaylistsPage /></Wrap>} />
        <Route path='/scan' element={<Wrap><ScanPage /></Wrap>} />
        <Route path='/statistics' element={<Wrap><StatsPage /></Wrap>} />
      </Routes>

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

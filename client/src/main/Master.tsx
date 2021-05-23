import React from 'react';
import {Route, Switch} from 'react-router';
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
        <Switch>
          <Route exact path='/'><Wrap>{homePagePromise}</Wrap></Route>
          <Route path='/lyrics'><Wrap>{lyricsPagePromise}</Wrap></Route>
          <Route path='/albums'><Wrap>{albumsPagePromise}</Wrap></Route>
          <Route path='/not-recently-played'><Wrap>{notRecentlyPlayedPagePromise}</Wrap></Route>
          <Route path='/never-played'><Wrap>{neverPlayedPagePromise}</Wrap></Route>
          <Route path='/favorite-albums'><Wrap>{favoriteAlbumsPagePromise}</Wrap></Route>
          <Route path='/tracks'><Wrap>{allTracksPagePromise}</Wrap></Route>
          <Route path='/shuffle'><Wrap>{shufflePagePromise}</Wrap></Route>
          <Route path='/playlists'><Wrap>{playlistsPagePromise}</Wrap></Route>
          <Route path='/scan'><Wrap>{scanPagePromise}</Wrap></Route>
          <Route path='/statistics'><Wrap>{statsPagePromise}</Wrap></Route>
          <Route path='*'><Wrap>{homePagePromise}</Wrap></Route>
        </Switch>
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

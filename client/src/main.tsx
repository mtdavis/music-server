import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'mobx-react';
import {colors} from '@material-ui/core';
import {
  createMuiTheme,
  MuiThemeProvider,
} from '@material-ui/core/styles';

import {DbStore, LyricsStore, MusicStore, ScrobbleStore, UiStore} from './stores';
import Master from './Master';

import 'react-virtualized/styles.css';
import './style/main.css';

const dbStore = new DbStore();
const musicStore = new MusicStore(dbStore);
const lyricsStore = new LyricsStore(musicStore);
const scrobbleStore = new ScrobbleStore(musicStore, dbStore);
const uiStore = new UiStore();

const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: colors.lightBlue['600'],
    },
    secondary: {
      main: colors.deepOrange['200'],
    },
    contrastThreshold: 3,
  },
  typography: {
    useNextVariants: true,
  },
});

const router = (
  <MuiThemeProvider theme={muiTheme}>
    <Provider
      musicStore={musicStore}
      dbStore={dbStore}
      lyricsStore={lyricsStore}
      scrobbleStore={scrobbleStore}
      uiStore={uiStore}
    >
      <Master />
    </Provider>
  </MuiThemeProvider>
);

render(router, document.getElementById('app'));

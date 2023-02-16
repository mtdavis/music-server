import React from 'react';
import ReactDOM from 'react-dom/client';
import {colors} from '@material-ui/core';
import {
  createMuiTheme,
  MuiThemeProvider,
} from '@material-ui/core/styles';

import {StoreProvider} from './stores';
import Master from './main/Master';

import 'react-virtualized/styles.css';
import './style/main.css';

const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: colors.lightBlue['600'],
    },
    secondary: {
      main: colors.deepOrange['400'],
    },
    contrastThreshold: 3,
  },
});

const router = (
  <React.StrictMode>
    <MuiThemeProvider theme={muiTheme}>
      <StoreProvider>
        <Master />
      </StoreProvider>
    </MuiThemeProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(router)

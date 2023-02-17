import React from 'react';
import ReactDOM from 'react-dom/client';
import {colors} from '@mui/material';
import {
  createTheme,
  ThemeProvider,
} from '@mui/material/styles';

import {StoreProvider} from './stores';
import Master from './main/Master';

import 'react-virtualized/styles.css';
import './style/main.css';

const muiTheme = createTheme({
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
    <ThemeProvider theme={muiTheme}>
      <StoreProvider>
        <Master />
      </StoreProvider>
    </ThemeProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(router);

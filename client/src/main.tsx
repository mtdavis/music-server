import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {colors} from '@mui/material';
import {
  createTheme,
  StyledEngineProvider,
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

const browserRouter = createBrowserRouter([
  {
    path: '*',
    element: <Master />,
  },
], {
  basename: '/app',
});

const router = (
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiTheme}>
        <StoreProvider router={browserRouter}>
          <RouterProvider router={browserRouter} />
        </StoreProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(router);

import React from 'react';
import {CircularProgress} from '@mui/material';

import LeftNav from './leftnav/LeftNav';

interface Props {
  children: React.ReactNode;
}

const Loader = () => (
  <div
    style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <CircularProgress disableShrink />
  </div>
);

const Wrap = ({
  children
}: Props): React.ReactElement => (
  <div
    style={{
      display: 'flex',
      width: '100vw',
      paddingTop: 64,
      minHeight: 'calc(100vh - 64px)',
    }}
  >
    <LeftNav />

    <main
      style={{
        flex: 1,
        padding: 16,
        minWidth: 0,
      }}
    >
      <React.Suspense fallback={<Loader />}>
        {children}
      </React.Suspense>
    </main>
  </div>
);

export default Wrap;

import React from 'react';
import {makeStyles} from '@material-ui/styles';
import {CircularProgress} from '@material-ui/core';

import LeftNav from './leftnav/LeftNav';

const useStyles = makeStyles(() => ({
  loader: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    display: 'flex',
    width: '100vw',
    paddingTop: 64,
    minHeight: 'calc(100vh - 64px)',
  },
  main: {
    flex: 1,
    padding: 16,
    minWidth: 0,
  },
}));

interface Props {
  children: Promise<{default: React.ComponentType}>;
}

const Loader = () => {
  const classes = useStyles();

  return (
    <div className={classes.loader}>
      <CircularProgress disableShrink />
    </div>
  );
};

const Wrap = ({
  children
}: Props): React.ReactElement => {
  const ChildComponent = React.lazy(() => children);
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <LeftNav />

      <main className={classes.main}>
        <React.Suspense fallback={<Loader />}>
          <ChildComponent />
        </React.Suspense>
      </main>
    </div>
  );
};

export default Wrap;

import * as React from 'react';

import type { Router } from '@remix-run/router';

import RootStore from './RootStore';
import StoreContext from './StoreContext';

interface Props {
  children: React.ReactNode;
  router: Router;
}

const StoreProvider = ({
  children,
  router,
}: Props): React.ReactElement => {
  const rootStore = React.useMemo(() => new RootStore(router), []);

  return (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
  );
};

export default StoreProvider;

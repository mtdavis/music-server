import * as React from 'react';
import type {Router} from '@remix-run/router';
import StoreContext from './StoreContext';
import RootStore from './RootStore';

interface Props {
  children: React.ReactNode;
  router: Router;
}

const StoreProvider = ({
  children,
  router,
}: Props): React.ReactElement => {
  const rootStore = new RootStore(router);

  return (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
  );
};

export default StoreProvider;

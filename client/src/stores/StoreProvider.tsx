import * as React from 'react';
import StoreContext from './StoreContext';
import RootStore from './RootStore';

interface Props {
  children: React.ReactNode;
}

const StoreProvider = ({
  children,
}: Props): React.ReactElement => {
  const rootStore = new RootStore();

  return (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
  );
};

export default StoreProvider;

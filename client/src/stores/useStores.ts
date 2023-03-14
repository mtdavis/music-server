import React from 'react';

import RootStore from './RootStore';
import StoreContext from './StoreContext';

const useStores = (): RootStore => React.useContext(StoreContext) as RootStore;
export default useStores;

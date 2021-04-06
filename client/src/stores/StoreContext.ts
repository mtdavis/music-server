import * as React from 'react';
import RootStore from './RootStore';

const StoreContext = React.createContext<RootStore>({} as RootStore);
export default StoreContext;

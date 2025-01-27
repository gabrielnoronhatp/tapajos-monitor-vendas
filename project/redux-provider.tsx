// redux-provider.tsx
'use client'; 

import { Provider } from 'react-redux';
import store from './hooks/store';


interface ReduxProviderProps {
  children: React.ReactNode;
}

const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;

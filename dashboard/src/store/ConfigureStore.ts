import { createStore } from 'redux';
import IStoreState from './IStoreState';
import RootReducer from '../reducers/RootReducer';
import thunkMiddleware from 'redux-thunk';
import { applyMiddleware } from 'redux';

export function configureStore() {
  // @ts-ignore
  return createStore<IStoreState>(
    RootReducer,
    applyMiddleware(thunkMiddleware),
  );
}
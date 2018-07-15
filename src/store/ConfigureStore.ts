import { createStore } from 'redux';
import IStoreState from './IStoreState';
import RootReducer from '../reducers/RootReducer';
import thunkMiddleware from 'redux-thunk';
import { applyMiddleware } from 'redux';

export default function configureStore() {
    return createStore<IStoreState>(
      RootReducer,
      applyMiddleware(thunkMiddleware),
    );
}
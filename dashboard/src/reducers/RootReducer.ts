import { combineReducers } from 'redux';
import IStoreState from '../store/IStoreState';

import {
  filtersChangedReducer as currentFilters,
} from './FilterReducers';

import {
  pageChangedReducer as currentPage,
} from './NavReducers';

import {
  authStateChangedReducer as auth,
} from './AuthReducers';

const RootReducer = combineReducers<IStoreState>({
  // NOTE: The reducer names in this list MUST match the state member names

  // //
  // // Filters state
  // //

  currentFilters,

  // //
  // // Nav state
  // //

  currentPage,

  // //
  // // Auth state
  // //
  auth,
});

export default RootReducer;
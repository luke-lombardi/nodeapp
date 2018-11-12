import { IFiltersChanged } from './FilterActions';
import { IPageChangedAction } from './NavActions';
import { IAuthChanged } from './AuthActions';

type ActionTypes =
  //
  // Nav actions
  //
  | IPageChangedAction

  //
  // Nav actions
  //
  | IFiltersChanged

  //
  // Auth actions
  //

  | IAuthChanged
  ;

export default ActionTypes;
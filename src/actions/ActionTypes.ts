import { IUserLoggedIn } from './AuthActions';
import { INodeListUpdated } from './NodeActions';
import { IUserPositionChanged } from './MapActions';

type ActionTypes =

  // User Actions
  | IUserLoggedIn

  | INodeListUpdated

  | IUserPositionChanged
  
  ;

export default ActionTypes;
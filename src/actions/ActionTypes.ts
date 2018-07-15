import { IUserLoggedIn } from './AuthActions';
import { INodeListUpdated, IVisitedNodeListUpdated } from './NodeActions';
import { IUserPositionChanged } from './MapActions';
import { IChallengeSettingsUpdated } from './ChallengeActions';

type ActionTypes =

  // User Actions
  | IUserLoggedIn

  | INodeListUpdated

  | IVisitedNodeListUpdated

  | IUserPositionChanged
  
  | IChallengeSettingsUpdated

  ;

export default ActionTypes;
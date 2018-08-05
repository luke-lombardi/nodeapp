import { IUserLoggedIn } from './AuthActions';

import { IPublicPersonListUpdated } from './NodeActions';
import { IPublicPlaceListUpdated } from './NodeActions';
import { IPrivatePersonListUpdated } from './NodeActions';
import { IPrivatePlaceListUpdated } from './NodeActions';

import { IGroupListUpdated } from './GroupActions';

import { IUserPositionChanged } from './MapActions';

type ActionTypes =

  // User Actions
  | IUserLoggedIn

  | IPublicPersonListUpdated

  | IPublicPlaceListUpdated

  | IPrivatePersonListUpdated

  | IPrivatePlaceListUpdated

  | IUserPositionChanged

  | IGroupListUpdated
  ;

export default ActionTypes;
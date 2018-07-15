import ActionTypes from '../actions/ActionTypes';
import InitialState from './InitialState';
import ActionTypeKeys from '../actions/ActionTypeKeys';


export function challengeSettingsUpdatedReducer(
  state: any = InitialState.challengeSettings, action: ActionTypes,
): any {
  if (action.type === ActionTypeKeys.CHALLENGE_SETTINGS_UPDATED) {
    return action.challengeSettings;
  }
  return state;
}
import IStoreState from '../store/IStoreState';
import { Dispatch } from 'redux';
import keys from './ActionTypeKeys';

// Challenge settings changed

export interface IChallengeSettingsUpdated {
  readonly type: keys.CHALLENGE_SETTINGS_UPDATED;
  readonly challengeSettings: any;
}

function ChallengeSettingsUpdatedAction(challengeSettings: any): IChallengeSettingsUpdated {
  return {
    type: keys.CHALLENGE_SETTINGS_UPDATED,
    challengeSettings: challengeSettings
  };
}

export function ChallengeSettingsUpdatedActionCreator(challengeSettings: any): (dispatch: Dispatch<IStoreState>) => Promise<void> {
  return async (dispatch: Dispatch<IStoreState>) => {
    dispatch(ChallengeSettingsUpdatedAction(challengeSettings));
  };
}
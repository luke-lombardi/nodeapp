import Logger from './Logger';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

import { AsyncStorage } from 'react-native';
import uuid from 'react-native-uuid';

// @ts-ignore
interface IProps {
  readonly currentGroupList?: () => any;
}

export default class AuthService {
    // @ts-ignore
    private readonly props: IProps;
    // @ts-ignore
    private readonly configGlobal = ConfigGlobalLoader.config;

    constructor(props: IProps) {
        this.props = props;
        Logger.trace(`AuthService.constructor -  Initialized auth service`);
    }

    // Setting the UUID serves as a simple 'account' for each user.
    // It does not contain any real information, but it temporarily bound to the phone
    public async getUUID() {
        let currentUUID = await AsyncStorage.getItem('user_uuid');
        if (currentUUID === null) {
          let newUUID = uuid.v4();
          await AsyncStorage.setItem('user_uuid', newUUID);
          currentUUID = await AsyncStorage.getItem('user_uuid');
        }
        return currentUUID;
    }
}
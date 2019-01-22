import Logger from './Logger';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

import { AsyncStorage } from 'react-native';
import uuid from 'react-native-uuid';
import Permissions from 'react-native-permissions';

// @ts-ignore
interface IProps {
  readonly currentGroupList?: () => any;
}

export default class AuthService {
    // @ts-ignore
    private readonly props: IProps;
    // @ts-ignore
    private readonly configGlobal = ConfigGlobalLoader.config;

    // Setting the UUID serves as a simple 'account' for each user.
    // It does not contain any real information, but is temporarily bound to the phone
    public static async getUUID() {
        let currentUUID = await AsyncStorage.getItem('user_uuid');
        if (currentUUID === null) {
          let newUUID = 'private:' + uuid.v4();
          await AsyncStorage.setItem('user_uuid', newUUID);
          currentUUID = await AsyncStorage.getItem('user_uuid');
        }
        return currentUUID;
    }

    public static async permissionsGranted() {
      let permissions: any = await AsyncStorage.getItem('permissions');
      if (permissions === null) {
        return undefined;
      } else  {
        permissions = JSON.parse(permissions);
      }

      let locationsPermission = await Permissions.check('location', { type: 'always'} );
      let pushPermissions = await Permissions.check('location', { type: 'always'} );
      let motionPermissions = await Permissions.check('location', { type: 'always'} );

      permissions.locations = locationsPermission;
      permissions.push = pushPermissions;
      permissions.motion = motionPermissions;

      await AsyncStorage.setItem('permissions', JSON.stringify(permissions));

      return permissions;
    }

    constructor(props: IProps) {
      this.props = props;
      Logger.trace(`AuthService.constructor -  Initialized auth service`);
  }
}
import Logger from './Logger';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

import { AsyncStorage } from 'react-native';
import uuid from 'react-native-uuid';
import Permissions from 'react-native-permissions';
// @ts-ignore
import NavigationService from './NavigationService';
import Snackbar from 'react-native-snackbar';

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

    public static async checkPermissions(showSnackbar: boolean) {
      if (! (await AuthService.hasPermissions()) ) {
        Logger.info(`AuthService.checkPermissions() - user does not have required permissions`);
        if (showSnackbar) {
          Snackbar.show({
            title: 'You must enable all services to use the app.',
            duration: Snackbar.LENGTH_SHORT,
          });
        }

      } else {
        Logger.info(`AuthService.checkPermissions() - permissions set`);
      }
    }

    public static async permissionsGranted() {
      let permissions: any = await AsyncStorage.getItem('permissions');

      if (permissions !== null) {
        permissions = JSON.parse(permissions);
      } else  {
        permissions = {};
      }

      let locationPermissions = await Permissions.check('location', { type: 'always'} );
      let notificationPermissions = await Permissions.check('notification');
      let motionPermissions = await Permissions.check('motion');

      permissions.location = locationPermissions;
      permissions.notification = notificationPermissions;
      permissions.motion = motionPermissions;

      // Set a flag to say that at some point we have set permissions
      // This is not set on first run
      await AsyncStorage.setItem('permissionsSet', 'true');
      await AsyncStorage.setItem('permissions', JSON.stringify(permissions));

      Logger.info(`AuthService.permissionsGranted() - Current permissions ${JSON.stringify(permissions)} `);

      await AuthService.hasPermissions();

      return permissions;
    }

    public static async hasPermissions() {
      let locationPermissions = await Permissions.check('location', { type: 'always'} );
      let notificationPermissions = await Permissions.check('notification');
      // @ts-ignore
      let motionPermissions = await Permissions.check('motion');

      if (locationPermissions !== 'authorized') {
        return false;
      }

      if (notificationPermissions !== 'authorized') {
        return false;
      }

      // if (motionPermissions !== 'authorized') {
      //   return false;
      // }

      Logger.info(`AuthService.hasPermissions() - permissions are set`);

      return true;
    }

    public static async permissionsSet() {
      let set: any = await AsyncStorage.getItem('permissionsSet');

      Logger.info(`AuthService.permissionsSet() - value: ${set}`);

      if (set === null) {
        return true;
      }

      return false;
    }

    constructor(props: IProps) {
      this.props = props;
      Logger.trace(`AuthService.constructor -  Initialized auth service`);
  }
}
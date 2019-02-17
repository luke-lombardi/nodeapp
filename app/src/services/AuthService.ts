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

      if (motionPermissions !== 'authorized') {
        return false;
      }

      Logger.info(`AuthService.hasPermissions() - permissions are set`);

      return true;
    }

    public static async permissionsRequested() {
      let requested: any = await AsyncStorage.getItem('permissionsRequested');
      Logger.info(`AuthService.permissionsRequested() - value: ${requested}`);

      if (requested !== null) {
        requested = JSON.parse(requested);
      } else  {
        requested = {};
      }

      return requested;
    }

    public static async setPermissionsRequested(type: string) {
      let requested: any = await AsyncStorage.getItem('permissionsRequested');
      Logger.info(`AuthService.setPermissionsRequested() - value: ${requested}`);

      if (requested !== null) {
        requested = JSON.parse(requested);
      } else  {
        requested = {};
      }
      requested[type] = true;

      await AsyncStorage.setItem('permissionsRequested', JSON.stringify(requested));

      return requested;
    }

    //  ETH DENVER

    // Stores a new wallet's private key -- called from camera
    public static async storeWallet(privateKey: string) {
      let walletPrivateKey: any = await AsyncStorage.getItem('walletPrivateKey');
      Logger.trace(`AuthService.storeWallet() - current private key: ${walletPrivateKey}`);

      await AsyncStorage.setItem('walletPrivateKey', privateKey);
      Logger.trace(`AuthService.storeWallet() - new private key: ${privateKey}`);
      return true;
    }

    // Gets a new wallet's private key
    public static async getWallet() {
      let walletPrivateKey: any = await AsyncStorage.getItem('walletPrivateKey');
      Logger.trace(`AuthService.storeWallet() - current private key: ${walletPrivateKey}`);

      if (walletPrivateKey === null) {
        return undefined;
      }
      return walletPrivateKey;
    }

    // Gets a list of currently tracked transactions
    public static async getTransactions() {
      let trackedTransactions = await AsyncStorage.getItem('trackedTransactions');
      if (trackedTransactions !== null) {
        trackedTransactions = JSON.parse(trackedTransactions);
      } else {
        // @ts-ignore
        trackedTransactions = [];
      }

      return trackedTransactions;
    }

    // Store a new tx hash in async for polling /getTransactions
    public static async storeTransaction(txHash: string) {
      let trackedTransactions = await AsyncStorage.getItem('trackedTransactions');
      if (trackedTransactions !== null) {
        trackedTransactions = JSON.parse(trackedTransactions);
      } else {
        // @ts-ignore
        trackedTransactions = [];
      }

      let index = trackedTransactions.indexOf(txHash);

      if (index < 0) {
          // @ts-ignore
          trackedTransactions.push(txHash);
          Logger.info(`AuthService.storeTransaction: now tracking ${trackedTransactions}`);

          await AsyncStorage.setItem('trackedTransactions', JSON.stringify(trackedTransactions));

          return true;
      } else {
          Logger.trace(`AuthService.storeTransaction: you already are tracking this tx.`);
          return false;
      }
    }

    constructor(props: IProps) {
      this.props = props;
      Logger.trace(`AuthService.constructor -  Initialized auth service`);
  }
}
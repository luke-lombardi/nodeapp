import React, {Component} from 'react';
import { Icon } from 'react-native-elements';
import { NavigationActions, createStackNavigator, createDrawerNavigator, createAppContainer, DrawerActions } from 'react-navigation';
import NavigationService from '../services/NavigationService';

import { View, StatusBar, PushNotificationIOS, AppState, AsyncStorage } from 'react-native';

// Location services, and user notifications
import Pushy from 'pushy-react-native';
import BackgroundGeolocation from 'react-native-background-geolocation';
import RNSimpleCompass from 'react-native-simple-compass';
import 'react-native-gesture-handler';

import Logger from '../services/Logger';

// Screen imports
import Finder from '../screens/Finder';
import MainMap from '../screens/MainMap';
import NodeList from '../screens/NodeList';
import FriendList from '../screens/FriendList';
import SideBar from '../components/SideBar';
import Camera from '../screens/Camera';
import CreateNode from '../screens/CreateNode';
import Chat from '../screens/Chat';
import Notifications from '../screens/Notifications';
import Transactions from '../screens/Transactions';
import TransactionDetail from '../screens/TransactionDetail';
import GetPermissions from '../screens/GetPermissions';
import ActiveChats from './ActiveChats';

// Redux imports
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';

// Redux action imports
import { PublicPersonListUpdatedActionCreator } from '../actions/NodeActions';
import { PublicPlaceListUpdatedActionCreator } from '../actions/NodeActions';
import { PrivatePersonListUpdatedActionCreator } from '../actions/NodeActions';
import { PrivatePlaceListUpdatedActionCreator } from '../actions/NodeActions';
import { TrackedNodeListUpdatedActionCreator } from '../actions/TrackedNodeActions';
import { UserPositionChangedActionCreator } from '../actions/MapActions';
import { TrackedFriendListUpdatedActionCreator } from '../actions/TrackedFriendActions';
import { RelationListUpdatedActionCreator } from '../actions/RelationActions';
import { NotificationListUpdatedActionCreator } from '../actions/NotificationActions';
import { TransactionListUpdatedActionCreator, ITransactionListUpdated } from '../actions/TransactionActions';

// Services
import NodeService,
  {
    IPublicPersonListUpdated,
    IPublicPlaceListUpdated,
    IPrivatePersonListUpdated,
    IPrivatePlaceListUpdated,
    ITrackedNodeListUpdated,
    IFriendListUpdated,
    IRelationListUpdated,
  }
  from '../services/NodeService';

import AuthService from '../services/AuthService';
import NotificationService from '../services/NotificationService';

// SET GLOBAL PROPS //
import { setCustomText } from 'react-native-global-props';
import SleepUtil from '../services/SleepUtil';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

const customTextProps = {
  style: {
    fontFamily: 'Avenir',
  },
};

setCustomText(customTextProps);
// END SET GLOBAL PROPS //

const InternalStack = createStackNavigator({
  Finder: { screen: Finder,
    navigationOptions: ({navigation}) => ({
      headerStyle: { backgroundColor: 'rgba(44,55,71,1.0)' },
      headerTitleStyle: {color: 'white'},
      title: 'Node Finder',
      headerLeft: <Icon name='arrow-left' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
        navigation.dispatch(NavigationActions.reset(
        {
          index: 0,
          actions: [ NavigationActions.navigate({ routeName: 'Map', key: 'Map' }) ],
        },
        )) } />,
      }),
  },
  Map: { screen: MainMap,
    navigationOptions: () => ({
      // @ts-ignore
      header: null,
      }),
  },
  GetPermissions: { screen: GetPermissions,
    navigationOptions: () => ({
      headerStyle: {backgroundColor: 'black' },
      headerTitleStyle: {color: 'white'},
      title: 'permissions',
      headerLeft: <View></View>,
      }),
  },
  Nodes: { screen: NodeList,
    navigationOptions: () => ({
      // @ts-ignore
      header: null,
      }),
  },
  CreateNode: { screen: CreateNode,
    // @ts-ignore
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'black', height: 70, borderBottomWidth: 5, borderBottomColor: 'black'},
      headerTitleStyle: { color: 'white', fontSize: 22, fontWeight: 'bold'},
      title: 'drop node',
      headerLeft: <Icon name='x' containerStyle={{padding: 5}} type='feather' size={30} underlayColor={'black'}
      color={'#ffffff'} onPress={ () =>
        NavigationService.reset('Map', {}) }
      />,
      }),
  },
  Transactions: { screen: Transactions },
  TransactionDetail: { screen: TransactionDetail },
  Camera: { screen: Camera,
    // @ts-ignore
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'black', height: 70, borderBottomWidth: 5, borderBottomColor: 'black'},
      headerTitleStyle: { color: 'white', fontSize: 22, fontWeight: 'bold'},
      headerLeft: <Icon name='x' containerStyle={{padding: 5}} type='feather' size={30} underlayColor={'black'}
      color={'#ffffff'} onPress={ () =>
        NavigationService.reset('Map', {}) }
      />,
      }),
  },
  FriendList: { screen: FriendList },
  Chat: { screen: Chat },
  Notifications: { screen: Notifications },
  },
  {
  initialRouteName: 'Map',
  navigationOptions: ({navigation}) => ({
    title: navigation.indexs,
    // headerLeft: <Icon name='menu' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () => navigation.navigate('DrawerToggle') } />,
    }),
  },
);

  const SideBarDrawer = createDrawerNavigator({
      Main: {
        screen: InternalStack,
        drawerPosition: 'left',
      },
    },
    {
      initialRouteName: 'Main',
      // @ts-ignore
      getCustomActionCreators: (route, stateKey) => { return { toggleLeftDrawer: () => DrawerActions.toggleDrawer({ key: stateKey }) }; },
      contentComponent: props => <SideBar {...props} />,
    },
  );

  const MainDrawer = createDrawerNavigator(
    {
        Drawer: SideBarDrawer,
    },
    {
        drawerPosition: 'right',
        // @ts-ignore
        getCustomActionCreators: (route, stateKey) => { return { toggleRightDrawer: () => DrawerActions.toggleDrawer({ key: stateKey }) }; },
        contentComponent: props => <ActiveChats {...props} />,
    },
    );

// Manifest of possible screens
export const RootStack = createStackNavigator({
    Home: MainDrawer,
  }, {
    // Default config for all screens
    headerMode: 'none',
    title: 'Main',
    initialRouteName: 'Home',
  });

const AppContainer = createAppContainer(RootStack);

interface IProps {
  navigation: any;

  PublicPersonListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  PublicPlaceListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  PrivatePersonListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  PrivatePlaceListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  TrackedNodeListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  FriendListUpdated: (friendList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  RelationListUpdated: (friendList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  UserPositionChanged: (userRegion: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  NotificationListUpdated: (notificationList: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  TransactionListUpdated: (transactionList: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;

  publicPersonList: Array<any>;
  publicPlaceList: Array<any>;
  privatePersonList: Array<any>;
  privatePlaceList: Array<any>;
  trackedNodeList:  Array<any>;
  friendList: Array<any>;
  relationList: Array<any>;
  userRegion: any;
  notificationList: any;
  transactionList: any;
}

interface IState {
  onPage: boolean;
}

export class App extends Component<IProps, IState> {

    // Private services
    private nodeService: NodeService;
    private monitoringLocation: boolean = false;

    private bearing;

    private readonly configGlobal = ConfigGlobalLoader.config;

    constructor(props: IProps) {
      super(props);

      // Location tracking methods
      this.onLocation = this.onLocation.bind(this);
      this.getPostParams = this.getPostParams.bind(this);
      this.setupLocationTracking = this.setupLocationTracking.bind(this);
      this.monitorLocation = this.monitorLocation.bind(this);
      this.setupPushNotifications = this.setupPushNotifications.bind(this);
      this.updateBearing = this.updateBearing.bind(this);

      // Redux helper functions for node service
      this.gotNewPublicPersonList = this.gotNewPublicPersonList.bind(this);
      this.gotNewPublicPlaceList = this.gotNewPublicPlaceList.bind(this);
      this.gotNewPrivatePersonList = this.gotNewPrivatePersonList.bind(this);
      this.gotNewPrivatePlaceList = this.gotNewPrivatePlaceList.bind(this);
      this.gotNewTrackedNodeList =  this.gotNewTrackedNodeList.bind(this);

      this.gotNewFriendList = this.gotNewFriendList.bind(this);
      this.gotNewRelationList =  this.gotNewRelationList.bind(this);

      this.gotNewTransactionList =  this.gotNewTransactionList.bind(this);

      this.getUserRegion = this.getUserRegion.bind(this);

      // Component methods
      this.componentDidMount = this.componentDidMount.bind(this);
      this.componentWillMount = this.componentWillMount.bind(this);
      this.componentWillUnmount = this.componentWillUnmount.bind(this);

      // App state change
      this.handleAppStateChange = this.handleAppStateChange.bind(this);

      // Link & Notification handling
      this.processNotification =  this.processNotification.bind(this);
      this.processDeliveredNotifications =  this.processDeliveredNotifications.bind(this);

      this.registerPushy = this.registerPushy.bind(this);
      this.handleLink = this.handleLink.bind(this);
      this.checkPermissions = this.checkPermissions.bind(this);
      this.loadNotifications = this.loadNotifications.bind(this);

      // The node service monitors all tracked and public nodes, this is an async loop that runs forever, so do not await it

      this.nodeService = new NodeService(
        {
          publicPersonListUpdated: this.gotNewPublicPersonList,
          publicPlaceListUpdated: this.gotNewPublicPlaceList,
          privatePersonListUpdated: this.gotNewPrivatePersonList,
          privatePlaceListUpdated: this.gotNewPrivatePlaceList,
          trackedNodeListUpdated: this.gotNewTrackedNodeList,
          friendListUpdated: this.gotNewFriendList,
          relationListUpdated: this.gotNewRelationList,
          currentUserRegion: this.getUserRegion,
          transactionListUpdated: this.gotNewTransactionList,
      });

      this.state = {
        onPage: true,
      };

    }

    componentDidMount() {
      // Set up push notification handling for iOS
      this.processNotification(true);
      PushNotificationIOS.setApplicationIconBadgeNumber(0);

      PushNotificationIOS.getDeliveredNotifications(this.processDeliveredNotifications);
      // Load all stored notifications in redux store
      this.loadNotifications();
    }

    // Begin: Push notification handling logic
    ////////////////////////////////////////////////////////////////////////////////////////////////
    // We have a few things to do here:
    //    - Subscribe to push notifications w/ pushy
    //    - Handle the case where the app is opened from a push notification
    //    - Clear the notification area of existing notifications and clear the 'badge'
    //    - Store notifications in async storage so they are persistent until checked by the user

    async processDeliveredNotifications(notifications) {
      for (let i = 0; i < notifications.length; i++) {

        if (notifications[i].action !== 'undefined') {

          // got_message type notifications are only processed as initialNotifications
          if (notifications[i].action === 'got_message') {
            continue;
          }

          await NotificationService.storeNotification(notifications[i]);

          let storedNotifications = NotificationService.loadNotifications();
          await this.props.NotificationListUpdated(storedNotifications);
        }
      }

      // Clear the notification badges
      PushNotificationIOS.setApplicationIconBadgeNumber(0);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // End: Push notification handling logic

    async processNotification(initialNotification: boolean = true, notification: any = undefined) {
      if (notification === undefined || notification === null) {
        notification = await PushNotificationIOS.getInitialNotification();
      }

      PushNotificationIOS.getApplicationIconBadgeNumber( (badgeNumber: number) => {
        PushNotificationIOS.setApplicationIconBadgeNumber(badgeNumber - 1);
      });

      if (notification === undefined || notification === null) {
        return;
      }

      // If the notification is being handled by PushNotificationIOS.getInitialNotification
      // then we need to extract the data from the object
      // If the app is in the foreground, the pushy listener is called
      // the Pushy listener takes notification._data as a parameter
      if (notification._data !== undefined) {
        notification = notification._data;
      }

      if (notification.action !== undefined) {

        if (notification.action === 'got_message') {
          if (initialNotification) {
            await NotificationService.handleAction(notification);
          } else {
            await NotificationService.notifyUser(notification);
          }
          return;
        } else {
          await NotificationService.storeNotification(notification);

          let notificationList = await NotificationService.loadNotifications();
          await this.props.NotificationListUpdated(notificationList);
        }

      } else {
        await NotificationService.handleNotification(notification);
      }

      // Navigate to the notifications panel if app was opened from a notification
      if (initialNotification) {
        NavigationService.reset('Notifications', {});
      }
    }

    // TODO: figure out a better way to do this (move to permissions page)
    async checkPermissions() {
      let currentPermissions = await AuthService.permissionsGranted();

      // Check the permissions and see if theres anything else we need, if so
      await AuthService.checkPermissions(false);

      // First, check if the user has allowed background location tracking
      // If location tracking is enabled, start the services that use it
      if (currentPermissions.location === 'authorized') {
        await this.setupLocationTracking();

      // If notifications are enabled, start the services that use it
      if (currentPermissions.notification === 'authorized') {
        this.registerPushy();
      }

      // If motion tracking is enabled, start the services that use it
      if (currentPermissions.motion === 'authorized') {
        RNSimpleCompass.start(3, this.updateBearing);
      }

      // If they haven't, request access on the permissions page
      } else {
        // We have no location permission, the app is useless
        // Take them to the location disabled screen
        NavigationService.reset('GetPermissions', { hasNavigation:  true} );
      }

    }

    registerPushy() {
      // Handle push notifications
      Pushy.listen();

      // Subscribe to push notifications
      Pushy.setNotificationListener(async (notification) => {
        Logger.info(`Received push notification: ${JSON.stringify(notification)}`);
        await this.processNotification(false, notification);
      });
    }

    // Handle a link clicked from a text message
    async handleLink(event) {
      let linkData = undefined;

      try {
        // Parse the user_uuid as a string from the URL
        linkData = event.url.replace(/.*?:\/\//g, '');
      } catch (error) {
        linkData = event.replace(/.*?:\/\//g, '');
      }

      if (linkData !== undefined) {
        NavigationService.reset('Map', { showConfirmModal: true, linkData: linkData});
      }
    }

    // Before the component mounts, we have to set up:
    // 1. Background location tracking
    // 2. Deep link handling

    componentWillMount() {
      this.checkPermissions();
      // Listen for incoming URL
      // Linking.addEventListener('url', this.handleLink);
      AppState.addEventListener('change', this.handleAppStateChange);
    }

    componentWillUnmount() {
      // Stop listening for URL
      // Linking.removeEventListener('url', this.handleLink);

      // Stop background location tracking
      RNSimpleCompass.stop();
      BackgroundGeolocation.removeListeners();

      // Stop listening to background app state
      AppState.removeEventListener('change', this.handleAppStateChange);
    }

    // Location listeners and helper methods

    async handleAppStateChange() {
      this.checkPermissions();
      this.loadNotifications();
    }

    async loadNotifications() {
      // Pull notifications from async storage
      let notifications: any = await AsyncStorage.getItem('notifications');
      if (notifications !== null) {
        notifications = JSON.parse(notifications);
      } else {
        // @ts-ignore
        notifications = [];
      }

      // Parse out notifications that are actual requests
      let parsedNotifications = [];

      for (let i = 0; i < notifications.length; i++) {
        if (notifications[i].action !== undefined) {
          parsedNotifications.push(notifications[i]);
        }
      }

      await this.props.NotificationListUpdated(parsedNotifications);
    }

    async setupLocationTracking() {
      // If we already set up location tracking, definitely do not do it again
      if (this.monitoringLocation) {
        Logger.trace('App.setupLocationTracking - we already set up location tracking, returning');
        return;
      }

      Logger.info('App.setupLocationTracking - setting up location tracking.');

      // Create request object for postNode API endpoint
      let params = await this.getPostParams();

      // URL to post user node to
      let postUrl = this.configGlobal.apiServicesUrlBase + this.configGlobal.apiStage + '/postNode';

      BackgroundGeolocation.ready({
        // Geolocation Config
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        distanceFilter: 0,
        locationUpdateInterval: 1000,
        reset: true,
        // Activity Recognition
        stopTimeout: 1,
        // Application config
        debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
        stopOnTerminate: false,   // <-- Allow the background-service to continue tracking when user closes the app.
        stopOnStationary: false,   // <-- Allow the background-service to stop tracking when user stops moving
        startOnBoot: true,        // <-- Auto start tracking when device is powered-up.
        allowIdenticalLocations: true,
        url: postUrl,
        batchSync: false,       // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
        autoSync: true,         // <-- [Default: true] Set true to sync each location to server as it arrives.
        headers: {},
        params: params,
      }, (state) => {
        Logger.info(`BackgroundGeolocation is configured and ready: ${state.enabled}`);

        this.monitorLocation();

        // This handler fires whenever bgGeo receives a location update.
        BackgroundGeolocation.on('location', this.onLocation, this.onError);

        // This handler fires when movement states changes (stationary->moving; moving->stationary)
        BackgroundGeolocation.on('motionchange', this.onMotionChange);

        // This event fires when a change in motion activity is detected
        BackgroundGeolocation.on('activitychange', this.onActivityChange);

        // This event fires when the user toggles location-services authorization
        BackgroundGeolocation.on('providerchange', this.onProviderChange);

        // Promise API
        // should call this function to track your location
        BackgroundGeolocation.getCurrentPosition({samples: 1, persist: false});

        if (!state.enabled) {
          // Start tracking location
          BackgroundGeolocation.start(function() {
            Logger.info(`BackgroundGeolocation - started`);
          });
        }
      });

    }

    async monitorLocation() {
      this.monitoringLocation = true;

      while (true) {
        // Promise API
        // should call this function to track your location
        BackgroundGeolocation.getCurrentPosition({samples: 1, persist: false});
        await SleepUtil.SleepAsync(5000);

        try {
          await this.setState({onPage: true});
        } catch (error) {
          // If we got here, we unmounted, return
          return;
        }
      }
    }

    async setupPushNotifications() {
      let deviceToken = await Pushy.register();
      return deviceToken;
    }

    async updateBearing(degree) {
      let userRegion = {
        latitude:       this.props.userRegion.latitude,
        longitude:      this.props.userRegion.longitude,
        speed:          this.props.userRegion.speed,
        latitudeDelta:  0.00122 * 1.5,
        longitudeDelta: 0.00121 * 1.5,
        bearing: degree,
    };

      this.bearing = degree;
      this.props.UserPositionChanged(userRegion);
    }

    async onLocation(location) {
      // console.log('- [event] location: ', location);

      let userRegion = {
            latitude:       location.coords.latitude,
            longitude:      location.coords.longitude,
            speed:          location.coords.speed,
            latitudeDelta:  0.00122 * 1.5,
            longitudeDelta: 0.00121 * 1.5,
            bearing: this.bearing,
      };

      await this.props.UserPositionChanged(userRegion);

     let params = await this.getPostParams();

      BackgroundGeolocation.setConfig({
        params: params,
      });

      if (!this.nodeService.monitoring) {
        Logger.info('App.onLocation - got first location, starting to monitor nodes');
        this.nodeService.StartMonitoring();
      }

    }

    async getPostParams() {
      // await AsyncStorage.clear();

      let currentUUID = undefined;
      try {
        currentUUID = await AuthService.getUUID();
        Logger.trace(`App.getPostParams - User has a UUID of: ${currentUUID}`);
      } catch (err) {
        Logger.debug(`App.getPostParams - error getting UUID: ${JSON.stringify(err)}`);
      }

      // Get pushy device token
      let deviceToken = undefined;
      try {
        deviceToken = await this.setupPushNotifications();
        Logger.trace(`App.getPostParams - User has a pushy token of: ${deviceToken}`);
      } catch (err) {
        // Do nothing w/ this, usually only happens in the simulator
      }

      let params = {
        'node_id': currentUUID,
        'node_data': {
          'lat': undefined,
          'lng': undefined,
          'public': false,
          'type': 'person',
          'device_token': deviceToken,
        },
      };

      return params;
    }

    onError(error) {
      // to get more information about error code
      // visit to https://github.com/transistorsoft/react-native-background-geolocation/wiki/Error-Codes
      console.warn('- [event] location error ', error);
    }

    // @ts-ignore
    onActivityChange(activity) {
      // console.log('- [event] activitychange: ', activity);  // eg: 'on_foot', 'still', 'in_vehicle'
    }

    // @ts-ignore
    onProviderChange(provider) {
      // console.log('- [event] providerchange: ', provider);
    }

    // @ts-ignore
    onMotionChange(location) {
      // console.log('- [event] motionchange: ', location.isMoving, location);
    }

    render() {
      return (
        <View style={{flex: 1}}>
          <StatusBar barStyle='light-content'/>
          <AppContainer ref={navigatorRef => {
                NavigationService.setTopLevelNavigator(navigatorRef);
             }} />
           />
        </View>
      );
    }

    public getUserRegion(): any {
      return this.props.userRegion;
    }

    // Private implementation functions

    private async gotNewPublicPersonList(props: IPublicPersonListUpdated) {
      await this.props.PublicPersonListUpdated(props.nodeList);
    }

    private async gotNewPublicPlaceList(props: IPublicPlaceListUpdated) {
      await this.props.PublicPlaceListUpdated(props.nodeList);
    }

    private async gotNewPrivatePersonList(props: IPrivatePersonListUpdated) {
      await this.props.PrivatePersonListUpdated(props.nodeList);
    }

    private async gotNewTrackedNodeList(props: ITrackedNodeListUpdated) {
      await this.props.TrackedNodeListUpdated(props.nodeList);
    }

    private async gotNewPrivatePlaceList(props: IPrivatePlaceListUpdated) {
      await this.props.PrivatePlaceListUpdated(props.nodeList);
    }

    private async gotNewRelationList(props: IRelationListUpdated) {
      await this.props.RelationListUpdated(props.relationList);
    }

    private async gotNewFriendList(props: IFriendListUpdated) {
      await this.props.FriendListUpdated(props.friendList);
    }

    private async gotNewTransactionList(props: ITransactionListUpdated) {
      await this.props.TransactionListUpdated(props.transactionList);
    }
}

// @ts-ignore
function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    publicPersonList: state.publicPersonList,
    publicPlaceList: state.publicPlaceList,
    privatePersonList: state.privatePersonList,
    privatePlaceList: state.privatePlaceList,
    trackedNodeList: state.trackedNodeList,
    friendList: state.friendList,
    relationList: state.relationList,
    userRegion: state.userRegion,
    notificationList: state.notificationList,
    transactionList: state.transactionList,
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    PublicPersonListUpdated: bindActionCreators(PublicPersonListUpdatedActionCreator, dispatch),
    PublicPlaceListUpdated: bindActionCreators(PublicPlaceListUpdatedActionCreator, dispatch),
    PrivatePersonListUpdated: bindActionCreators(PrivatePersonListUpdatedActionCreator, dispatch),
    PrivatePlaceListUpdated: bindActionCreators(PrivatePlaceListUpdatedActionCreator, dispatch),
    TrackedNodeListUpdated: bindActionCreators(TrackedNodeListUpdatedActionCreator, dispatch),
    UserPositionChanged: bindActionCreators(UserPositionChangedActionCreator, dispatch),
    FriendListUpdated: bindActionCreators(TrackedFriendListUpdatedActionCreator, dispatch),
    RelationListUpdated: bindActionCreators(RelationListUpdatedActionCreator, dispatch),
    NotificationListUpdated: bindActionCreators(NotificationListUpdatedActionCreator, dispatch),
    TransactionListUpdated: bindActionCreators(TransactionListUpdatedActionCreator, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
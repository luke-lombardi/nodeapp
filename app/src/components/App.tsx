import React, {Component} from 'react';
import { Icon } from 'react-native-elements';
import { StackNavigator, DrawerNavigator, NavigationActions } from 'react-navigation';
import NavigationService from '../services/NavigationService';
import { View, StatusBar, AsyncStorage, Linking } from 'react-native';
// @ts-ignore
import Permissions from 'react-native-permissions';

// Location services, and user notifications
import Pushy from 'pushy-react-native';
import BackgroundGeolocation from 'react-native-background-geolocation';
import RNSimpleCompass from 'react-native-simple-compass';

// @ts-ignore
import Logger from '../services/Logger';

// Screen imports
import Finder from '../screens/Finder';
import MainMap from '../screens/MainMap';
import NodeList from '../screens/NodeList';
import GroupList from '../screens/GroupList';
import FriendList from '../screens/FriendList';
import SideBar from '../components/SideBar';
import ContactList from '../screens/ContactList';
import CreateNode from '../screens/CreateNode';
import GroupEditor from '../screens/GroupEditor';
import Settings from '../screens/Settings';
import Chat from '../screens/Chat';
import CreateMessage from '../components/CreateMessage';

// Redux imports
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';

// Redux action imports
import { PublicPersonListUpdatedActionCreator } from '../actions/NodeActions';
import { PublicPlaceListUpdatedActionCreator } from '../actions/NodeActions';
import { PrivatePersonListUpdatedActionCreator } from '../actions/NodeActions';
import { PrivatePlaceListUpdatedActionCreator } from '../actions/NodeActions';
import { UserPositionChangedActionCreator } from '../actions/MapActions';
import { GroupListUpdatedActionCreator } from '../actions/GroupActions';
import { FriendListUpdatedActionCreator } from '../actions/FriendActions';

// Services
import NodeService,
  {
    IPublicPersonListUpdated,
    IPublicPlaceListUpdated,
    IPrivatePersonListUpdated,
    IPrivatePlaceListUpdated,
    IGroupListUpdated,
    IFriendListUpdated,
  }
  from '../services/NodeService';

// import ApiService from '../services/ApiService';

import LocationService from '../services/LocationService';
import AuthService from '../services/AuthService';

// SET GLOBAL PROPS //
import { setCustomText } from 'react-native-global-props';
import SleepUtil from '../services/SleepUtil';

const customTextProps = {
  style: {
    fontFamily: 'Avenir',
  },
};

setCustomText(customTextProps);
// END SET GLOBAL PROPS //

const InternalStack = StackNavigator({
  Finder: { screen: Finder,
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
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
  Map: { screen: MainMap },
  Nodes: { screen: NodeList,
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
      headerTitleStyle: {color: 'white'},
      title: 'Nodes',
      headerLeft: <Icon name='arrow-left' containerStyle={{padding: 5}} type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
        navigation.dispatch(NavigationActions.reset(
        {
          index: 0,
          actions: [ NavigationActions.navigate({ routeName: 'Map', key: 'Map' }) ],
        },
        )) } />,
      }),
    },
  Groups: { screen: GroupList,
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
      headerTitleStyle: {color: 'white'},
      title: 'Groups',
      headerLeft: <Icon name='arrow-left' containerStyle={{padding: 5}} type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
        navigation.dispatch(NavigationActions.reset(
        {
          index: 0,
          actions: [ NavigationActions.navigate({ routeName: 'Map', key: 'Map' }) ],
        },
      )) } />,
      }),
    },
  CreateNode: { screen: CreateNode,
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
      headerTitleStyle: { color: 'white'},
      title: 'Drop Node',
      headerLeft: <Icon name='arrow-left' containerStyle={{padding: 5}} type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
        navigation.dispatch(NavigationActions.reset(
        {
          index: 0,
          actions: [ NavigationActions.navigate({ routeName: 'Map', key: 'Map' }) ],
        },
        )) } />,
      }),
  },
  Friends: { screen: FriendList,
      navigationOptions: ({navigation}) => ({
        headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
        headerTitleStyle: { color: 'white'},
        title: 'Friends',
        headerLeft: <Icon name='x' type='feather' containerStyle={{padding: 5}} size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
          navigation.dispatch(NavigationActions.reset(
          {
            index: 0,
            actions: [ NavigationActions.navigate({ routeName: 'Map', key: 'Map' }) ],
          },
          )) } />,
        }),
      },
  GroupEditor: { screen: GroupEditor,
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
      headerTitleStyle: {color: 'white'},
      title: 'Group Editor',
      headerLeft: <Icon name='arrow-left' type='feather' containerStyle={{padding: 5}} size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
        navigation.dispatch(NavigationActions.reset(
        {
          index: 0,
          actions: [ NavigationActions.navigate({ routeName: 'Map', key: 'Map' }) ],
        },
        )) } />,
      }),
    },
  Settings: { screen: Settings,
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
      headerTitleStyle: {color: 'white'},
      title: 'Settings',
      headerLeft: <Icon name='arrow-left' type='feather' containerStyle={{padding: 5}} size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
        navigation.dispatch(NavigationActions.reset(
        {
          index: 0,
          actions: [ NavigationActions.navigate({ routeName: 'Map', key: 'Map' }) ],
        },
        )) } />,
      }),
    },
  ContactList: { screen: ContactList,
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
      headerTitleStyle: {color: 'white'},
      title: 'Contact List',
      headerLeft: <Icon name='arrow-left' type='feather' containerStyle={{padding: 5}} size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
        navigation.dispatch(NavigationActions.reset(
        {
          index: 0,
          actions: [ NavigationActions.navigate({ routeName: 'Map', key: 'Map' }) ],
        },
        )) } />,
      }),
    },
  Chat: { screen: Chat },
  CreateMessage : { screen: CreateMessage,
        navigationOptions: ({navigation}) => ({
          headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
          headerTitleStyle: {color: 'white'},
          title: 'Compose Message',
          headerLeft: <Icon name='x' type='feather' containerStyle={{padding: 5}} size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
            navigation.dispatch(NavigationActions.reset(
              {
                index: 0,
                actions: [ NavigationActions.navigate({ routeName: 'Chat', key: 'Chat' }) ],
              },
            )) } />,
        }),
    },
  },
  {
  initialRouteName: 'Map',
  navigationOptions: ({navigation}) => ({
    headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
    title: navigation.indexs,
    headerLeft: <Icon name='menu' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () => navigation.navigate('DrawerToggle') } />,
    }),
  },
);

  const DrawerStack = DrawerNavigator({
      Main: {
        screen: InternalStack,
      },
    },
    {
      initialRouteName: 'Main',
      contentComponent: props => <SideBar {...props} />,
    },
  );

  const DrawerNavigation = StackNavigator({
    DrawerStack: { screen: DrawerStack },
    }, {
      headerMode: 'none',
  });

// Manifest of possible screens
export const RootStack = StackNavigator({
    drawerStack: { screen: DrawerNavigation },
  }, {
    // Default config for all screens
    headerMode: 'none',
    title: 'Main',
    initialRouteName: 'drawerStack',
  });

interface IProps {
  navigation: any;

  PublicPersonListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  PublicPlaceListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  PrivatePersonListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  PrivatePlaceListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  GroupListUpdated: (groupList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  FriendListUpdated: (friendList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;

  UserPositionChanged: (userRegion: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;

  publicPersonList: Array<any>;
  publicPlaceList: Array<any>;
  privatePersonList: Array<any>;
  privatePlaceList: Array<any>;
  groupList: Array<any>;
  friendList: Array<any>;

  challengeSettings: any;
  userRegion: any;
}

interface IState {
}

export class App extends Component<IProps, IState> {

    // Private services
    private nodeService: NodeService;
    // private apiService: ApiService;
    // @ts-ignore
    private locationService: LocationService;
    private authService: AuthService;
    private bearing;

    constructor(props: IProps) {
      super(props);

      // Location tracking methods
      this.onLocation = this.onLocation.bind(this);
      this.getPostParams = this.getPostParams.bind(this);
      this.setupLocationTracking = this.setupLocationTracking.bind(this);
      this.setupPushNotifications = this.setupPushNotifications.bind(this);
      this.updateBearing = this.updateBearing.bind(this);

      // Redux helper functions for node service
      this.gotNewPublicPersonList = this.gotNewPublicPersonList.bind(this);
      this.gotNewPublicPlaceList = this.gotNewPublicPlaceList.bind(this);
      this.gotNewPrivatePersonList = this.gotNewPrivatePersonList.bind(this);
      this.gotNewPrivatePlaceList = this.gotNewPrivatePlaceList.bind(this);

      this.gotNewFriendList = this.gotNewFriendList.bind(this);
      this.gotNewGroupList = this.gotNewGroupList.bind(this);

      this.getUserRegion = this.getUserRegion.bind(this);
      this.getGroupList = this.getGroupList.bind(this);

      // Component methods
      this.componentDidMount = this.componentDidMount.bind(this);
      this.componentWillMount = this.componentWillMount.bind(this);
      this.componentWillUnmount = this.componentWillUnmount.bind(this);

      // Link handling
      this.handleLink = this.handleLink.bind(this);
      this.checkPermissions = this.checkPermissions.bind(this);

      // The node service monitors all tracked and public nodes, this is an async loop that runs forever, so do not await it
      this.nodeService = new NodeService(
        {
          publicPersonListUpdated: this.gotNewPublicPersonList,
          publicPlaceListUpdated: this.gotNewPublicPlaceList,
          privatePersonListUpdated: this.gotNewPrivatePersonList,
          privatePlaceListUpdated: this.gotNewPrivatePlaceList,
          groupListUpdated: this.gotNewGroupList,
          friendListUpdated: this.gotNewFriendList,
          currentUserRegion: this.getUserRegion,
          currentGroupList: this.getGroupList,
      });

      this.authService = new AuthService({});
      this.locationService = new LocationService({});

    }

    componentDidMount() {
      this.checkPermissions();

      Pushy.listen();

      // This handles the case where a user clicked a link and the app was closed
      Linking.getInitialURL().then((url) => {
        if (url) {
            this.handleLink({ url });
        }
       });

       RNSimpleCompass.start(3, this.updateBearing);

       this.registerPushy();
    }

    async checkPermissions() {
      let permission = await Permissions.check('location', { type: 'always'} );

      if (permission === 'authorized') {
        this.setupLocationTracking();
      } else {
        permission = await Permissions.request('location', { type: 'always'} );
        if (permission === 'authorized') {
          this.setupLocationTracking();
        }
    }

      // Set up background location tracking
      // let permission = await Permissions.checkMultiple(['camera', 'location', 'contacts', 'notification']);

      // if (permission !== 'authorized') {

      //   await Permissions.request('camera');
      //   await Permissions.request('location');
      //   await Permissions.request('contacts');
      //   await Permissions.request('notification');
      // }
    }

    registerPushy() {
      // Handle push notifications
      Pushy.setNotificationListener(async (data) => {
        // Print notification payload data
        console.log('Received notification: ' + JSON.stringify(data));
        // Notification title
        let notificationTitle = 'Smartshare';
        // Attempt to extract the "message" property from the payload: {"message":"Hello World!"}
        let notificationText = data.message || 'Test notification';
        // Display basic system notification
        Pushy.notify(notificationTitle, notificationText);
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
        NavigationService.navigate('Map', { showConfirmModal: true, linkData: linkData});
      }
    }

    // Before the component mounts, we have to set up:
    // 1. Background location tracking
    // 2. Deep link handling

    componentWillMount() {
      // Listen for incoming URL
      Linking.addEventListener('url', this.handleLink);

      // This handler fires whenever bgGeo receives a location update.
      BackgroundGeolocation.on('location', this.onLocation, this.onError);

      // This handler fires when movement states changes (stationary->moving; moving->stationary)
      BackgroundGeolocation.on('motionchange', this.onMotionChange);

      // This event fires when a change in motion activity is detected
      BackgroundGeolocation.on('activitychange', this.onActivityChange);

      // This event fires when the user toggles location-services authorization
      BackgroundGeolocation.on('providerchange', this.onProviderChange);
    }

    componentWillUnmount() {
      // Stop listening for URL
      Linking.removeEventListener('url', this.handleLink);

      // Stop background location tracking
      RNSimpleCompass.stop();
      BackgroundGeolocation.removeListeners();
    }

    // Location listeners and helper methods

    async setupLocationTracking() {

      // Create request object for postNode API endpoint
      let params = await this.getPostParams();

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
        url: 'https://api.smartshare.io/dev/postNode',
        batchSync: false,       // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
        autoSync: true,         // <-- [Default: true] Set true to sync each location to server as it arrives.
        headers: {},
        params: params,
      }, (state) => {
        Logger.info(`BackgroundGeolocation is configured and ready: ${state.enabled}`);

        this.monitorLocation();

        if (!state.enabled) {
          // Start tracking location
          BackgroundGeolocation.start(function() {
            Logger.info(`BackgroundGeolocation - started`);
          });
        }
      });

    }

    async monitorLocation() {
      while (true) {
        // Promise API
        // should call this function to track your location
        BackgroundGeolocation.getCurrentPosition({samples: 1, persist: false});
        await SleepUtil.SleepAsync(5000);
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
      console.log('- [event] location: ', location);

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
      let storedSettings = await AsyncStorage.getItem('userSettings');
      storedSettings = JSON.parse(storedSettings);

      let savedTitle = 'Anonymous';
      let savedDescription = '';

      if (storedSettings !== null) {
        // @ts-ignore
        savedTitle = storedSettings.savedTitle;
        // @ts-ignore
        savedDescription = storedSettings.savedDescription;
      }

      let currentUUID = undefined;
      try {
        currentUUID = await this.authService.getUUID();
        Logger.info(`App.getPostParams - User has a UUID of: ${currentUUID}`);
      } catch (err) {
        Logger.info(`App.getPostParams - error getting UUID: ${JSON.stringify(err)}`);
      }

      // Get pushy device token
      let deviceToken = undefined;
      try {
        deviceToken = await this.setupPushNotifications();
        Logger.info(`App.getPostParams - User has a pushy token of: ${deviceToken}`);
      } catch (err) {
        // Do nothing w/ this, usually only happens in the simulator
      }

      let params = {
        'node_id': currentUUID,
        'node_data': {
          'lat': undefined,
          'lng': undefined,
          'title': savedTitle,
          'description': savedDescription,
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
          <RootStack
            ref={navigatorRef => {
                NavigationService.setTopLevelNavigator(navigatorRef);
             }}
           />
        </View>
      );
    }

    public getUserRegion(): any {
      return this.props.userRegion;
    }

    public getGroupList(): any {
      return this.props.groupList;
    }

    // Private implementation functions

    // Either get or set the users UUID (creates it on first run)

    private async gotNewPublicPersonList(props: IPublicPersonListUpdated) {
      await this.props.PublicPersonListUpdated(props.nodeList);
    }

    private async gotNewPublicPlaceList(props: IPublicPlaceListUpdated) {
      await this.props.PublicPlaceListUpdated(props.nodeList);
    }

    private async gotNewPrivatePersonList(props: IPrivatePersonListUpdated) {
      await this.props.PrivatePersonListUpdated(props.nodeList);
    }

    private async gotNewPrivatePlaceList(props: IPrivatePlaceListUpdated) {
      await this.props.PrivatePlaceListUpdated(props.nodeList);
    }

    private async gotNewGroupList(props: IGroupListUpdated) {
      await this.props.GroupListUpdated(props.groupList);
    }

    private async gotNewFriendList(props: IFriendListUpdated) {
      await this.props.FriendListUpdated(props.friendList);
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
    groupList: state.groupList,
    friendList: state.friendList,
    userRegion: state.userRegion,
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    PublicPersonListUpdated: bindActionCreators(PublicPersonListUpdatedActionCreator, dispatch),
    PublicPlaceListUpdated: bindActionCreators(PublicPlaceListUpdatedActionCreator, dispatch),
    PrivatePersonListUpdated: bindActionCreators(PrivatePersonListUpdatedActionCreator, dispatch),
    PrivatePlaceListUpdated: bindActionCreators(PrivatePlaceListUpdatedActionCreator, dispatch),
    UserPositionChanged: bindActionCreators(UserPositionChangedActionCreator, dispatch),
    GroupListUpdated: bindActionCreators(GroupListUpdatedActionCreator, dispatch),
    FriendListUpdated: bindActionCreators(FriendListUpdatedActionCreator, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
import React, {Component} from 'react';
import { Icon } from 'react-native-elements';
import { StackNavigator, DrawerNavigator, NavigationActions } from 'react-navigation';
import NavigationService from '../services/NavigationService';
import { View, StatusBar, AsyncStorage, Linking, Button } from 'react-native';
import uuid from 'react-native-uuid';
import Pushy from 'pushy-react-native';

// @ts-ignore
import Logger from '../services/Logger';

import Finder from '../screens/Finder';
import MainMap from '../screens/MainMap';
import NodeList from '../screens/NodeList';
import GroupList from '../screens/GroupList';
import FriendList from '../screens/FriendList';
import SideBar from '../components/SideBar';
import ContactList from '../screens/ContactList';
import CreateNode from '../screens/CreateNode';
import GroupEditor from '../screens/GroupEditor';
import Profile from '../screens/Profile';
import Tour from '../screens/Tour';
import Chat from '../screens/Chat';
import CreateMessage from '../components/CreateMessage';

// Redux imports
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';

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

import LocationService, { IUserPositionChanged } from '../services/LocationService';

// SET GLOBAL PROPS //
import { setCustomText } from 'react-native-global-props';

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
          actions: [ NavigationActions.navigate({ routeName: 'Map' }) ],
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
      headerLeft: <Icon name='arrow-left' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
        navigation.dispatch(NavigationActions.reset(
        {
          index: 0,
          actions: [ NavigationActions.navigate({ routeName: 'Map' }) ],
        },
        )) } />,
      }),
    },
  Groups: { screen: GroupList,
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
      headerTitleStyle: {color: 'white'},
      title: 'Groups',
      headerLeft: <Icon name='arrow-left' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
        navigation.dispatch(NavigationActions.reset(
        {
          index: 0,
          actions: [ NavigationActions.navigate({ routeName: 'Map' }) ],
        },
      )) } />,
      }),
    },
  CreateNode: { screen: CreateNode,
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
      headerTitleStyle: { color: 'white'},
      title: 'Create Node',
      headerLeft: <Icon name='arrow-left' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
        navigation.dispatch(NavigationActions.reset(
        {
          index: 0,
          actions: [ NavigationActions.navigate({ routeName: 'Map' }) ],
        },
        )) } />,
      }),
  },
  Tour: { screen: Tour,
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
      headerTitleStyle: {color: 'white'},
      headerLeft: <Icon name='arrow-left' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
        navigation.dispatch(NavigationActions.reset(
        {
          index: 0,
          actions: [ NavigationActions.navigate({ routeName: 'Map' }) ],
        },
        )) } />,
      }),
    },
  Friends: { screen: FriendList,
      navigationOptions: ({navigation}) => ({
        headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
        headerTitleStyle: { color: 'white'},
        title: 'Friends',
        headerLeft: <Icon name='x' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
          navigation.dispatch(NavigationActions.reset(
          {
            index: 0,
            actions: [ NavigationActions.navigate({ routeName: 'Map' }) ],
          },
          )) } />,
        }),
      },
  GroupEditor: { screen: GroupEditor,
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
      headerTitleStyle: {color: 'white'},
      title: 'Group Editor',
      headerLeft: <Icon name='arrow-left' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
        navigation.dispatch(NavigationActions.reset(
        {
          index: 0,
          actions: [ NavigationActions.navigate({ routeName: 'Map' }) ],
        },
        )) } />,
      }),
    },
  Profile: { screen: Profile,
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
      headerTitleStyle: {color: 'white'},
      title: 'Profile',
      headerLeft: <Icon name='arrow-left' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
        navigation.dispatch(NavigationActions.reset(
        {
          index: 0,
          actions: [ NavigationActions.navigate({ routeName: 'Map' }) ],
        },
        )) } />,
      }),
    },
  ContactList: { screen: ContactList,
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
      headerTitleStyle: {color: 'white'},
      title: 'Contact List',
      headerLeft: <Icon name='arrow-left' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () => { navigation.goBack(undefined); } } />,
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

  const ChatStack = StackNavigator({
    Chat: { screen: Chat,
      navigationOptions: ({navigation}) => ({
        headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
        headerTitleStyle: { color: 'white'},
        title: 'Chat',
        headerLeft: <Icon name='x' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
          navigation.dispatch(
          {
            type: 'Navigation/BACK',
          },
          ) } />,
          headerRight: <Icon name='edit' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
            navigation.dispatch(NavigationActions.reset(
              {
                index: 0,
                actions: [ NavigationActions.navigate({ routeName: 'CreateMessage' }) ],
              },
              )) } />,
        }),
      },
      CreateMessage: { screen: CreateMessage,
        navigationOptions: ({navigation}) => ({
          headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
          headerTitleStyle: {color: 'white'},
          title: 'Compose Message',
          headerLeft: <Icon name='arrow-left' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
            navigation.dispatch(NavigationActions.reset(
              {
                index: 0,
                actions: [ NavigationActions.navigate({ routeName: 'Chat' }) ],
              },
              )) } />,
          headerRight: <Button color={'white'}
          onPress={() => navigation.getParam('messageBody') && navigation.navigate('Chat')}
          title='Submit'
        />,
        }),
      },
  });

  const DrawerStack = DrawerNavigator({
      Main: {
        screen: InternalStack,
      },
      Chat: {
        screen: ChatStack,
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
    ChatStack: { screen: ChatStack},
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

    // monitoring services
    private nodeService: NodeService;
    // private apiService: ApiService;

    private locationService: LocationService;

    constructor(props: IProps) {
      super(props);

      // Setting the UUID serves as a simple 'account' for each user.
      // It does not contain any real information, but it temporarily bound to the phone
      this.setUUID();

      this.gotNewPublicPersonList = this.gotNewPublicPersonList.bind(this);
      this.gotNewPublicPlaceList = this.gotNewPublicPlaceList.bind(this);
      this.gotNewPrivatePersonList = this.gotNewPrivatePersonList.bind(this);
      this.gotNewPrivatePlaceList = this.gotNewPrivatePlaceList.bind(this);

      this.gotNewFriendList = this.gotNewFriendList.bind(this);
      this.gotNewGroupList = this.gotNewGroupList.bind(this);

      this.gotNewUserPosition = this.gotNewUserPosition.bind(this);
      this.getUserRegion = this.getUserRegion.bind(this);
      this.getGroupList = this.getGroupList.bind(this);

      this.componentDidMount = this.componentDidMount.bind(this);
      this.componentWillMount = this.componentWillMount.bind(this);
      this.componentWillUnmount = this.componentWillUnmount.bind(this);
      this.handleLink = this.handleLink.bind(this);

      this.registerPushy = this.registerPushy.bind(this);

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

      this.nodeService.StartMonitoring();

      // The location service monitors the users location and calculates distance to nodes
      // This is an async loop that runs forever, so do not await it
      this.locationService = new LocationService({userPositionChanged: this.gotNewUserPosition});
      this.locationService.StartMonitoring();

      // this.registerPushy();
    }

    componentDidMount() {
      // listen for incoming URL
      Pushy.listen();
      // Register the device for push notifications
      Pushy.register().then(async (deviceToken) => {
        // Display an alert with device token
        console.log('got device token', deviceToken);
        // alert('Pushy device token: ' + deviceToken);

        // Send the token to your backend server via an HTTP GET request
        // await fetch('https://your.api.hostname/register/device?token=' + deviceToken);
        // Succeeded, optionally do something to alert the user
        }).catch((err) => {
        // Handle registration errors
        console.error(err);
      });

      // This handles the case where a user clicked a link and the app was closed
      Linking.getInitialURL().then((url) => {
        if (url) {
            this.handleLink({ url });
        }
       });
    }

    registerPushy() {
      console.log('register pushy....');
      // Handle push notifications
      Pushy.setNotificationListener(async (data) => {
        // Print notification payload data
        console.log('Received notification: ' + JSON.stringify(data));

        // Notification title
        let notificationTitle = 'MyApp';

        // Attempt to extract the "message" property from the payload: {"message":"Hello World!"}
        let notificationText = data.message || 'Test notification';

        // Display basic system notification
        Pushy.notify(notificationTitle, notificationText);
      });
    }

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

    componentWillMount() {
      // listen for incoming URL
      Linking.addEventListener('url', this.handleLink);
    }

    componentWillUnmount() {
      // stop listening for URL
      Linking.removeEventListener('url', this.handleLink);
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
    private async setUUID() {
      let currentUUID = await AsyncStorage.getItem('user_uuid');
      if (currentUUID === null) {
        let newUUID = uuid.v4();
        await AsyncStorage.setItem('user_uuid', newUUID);
      }
    }

    private async gotNewUserPosition(props: IUserPositionChanged) {
      await this.props.UserPositionChanged(props.userRegion);
    }

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
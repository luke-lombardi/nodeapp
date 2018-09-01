import React, {Component} from 'react';
import { Icon } from 'react-native-elements';
import { StackNavigator, DrawerNavigator, NavigationActions } from 'react-navigation';
import { View, StatusBar, AsyncStorage, Linking } from 'react-native';

import uuid from 'react-native-uuid';

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
import Settings from '../screens/Settings';

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

import ApiService from '../services/ApiService';

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
    Friends: { screen: FriendList,
        navigationOptions: ({navigation}) => ({
          headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
          headerTitleStyle: {color: 'white'},
          title: 'Friends',
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
        headerTitleStyle: {color: 'white'},
        title: 'Drop Pin',
        headerLeft: <Icon name='arrow-left' type='feather' size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () =>
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
      Settings: { screen: Settings,
        navigationOptions: ({navigation}) => ({
          headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
          headerTitleStyle: {color: 'white'},
          title: 'Settings',
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
    private apiService: ApiService;

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
      this.componentWillUnmount = this.componentWillUnmount.bind(this);
      this.handleLink = this.handleLink.bind(this);

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

      this.apiService = new ApiService({
        currentGroupList: this.getGroupList,
      });

      // The location service monitors the users location and calculates distance to nodes
      // This is an async loop that runs forever, so do not await it
      this.locationService = new LocationService({userPositionChanged: this.gotNewUserPosition});
      this.locationService.StartMonitoring();
    }

    componentDidMount() {
      // listen for incoming URL
      Linking.addEventListener('url', this.handleLink);
    }

    async handleLink(event) {
      console.log('EVENT');
      console.log(event);
      // parse the user_uuid as a string from the URL
      let linkData = event.url.replace(/.*?:\/\//g, '');
      let splitLinkData = linkData.split('/');

      let action = splitLinkData[0];

      if (action === 'join_group') {
        console.log(splitLinkData);
        let groupId = splitLinkData[1];
        let memberId = splitLinkData[2];

        let currentUUID = await AsyncStorage.getItem('user_uuid');

        let groupData = {
          'user_uuid': currentUUID,
          'group_id': groupId,
          'member_id': memberId,
        };

        let newGroupId = await this.apiService.JoinGroupAsync(groupData);

        if (newGroupId !== undefined) {
          await this.nodeService.storeGroup(newGroupId);
        } else {
          Logger.info('App.handleLink - invalid response from JoinGroupAsync.');
        }

      } else if (action === 'add_friend') {
        let relationId = splitLinkData[1];
        let memberId = splitLinkData[2];

        let currentUUID = await AsyncStorage.getItem('user_uuid');

        let groupData = {
          'user_uuid': currentUUID,
          'relation_id': relationId,
          'your_id': memberId,
        };

        let newRelation = await this.apiService.AcceptFriendAsync(groupData);

        if (newRelation !== undefined) {
          let newFriendId = newRelation.their_id;
          Logger.info(`App.handleLink -  response from AcceptFriendAsync: ${JSON.stringify(newRelation)}`);

          let exists = await this.nodeService.storeFriend(newFriendId);
          if (!exists) {
            Logger.info(`ContactList.selectContact - Got response ${JSON.stringify(newRelation)}`);
            await this.nodeService.storeNode(newFriendId);
          }

        } else {
          Logger.info('App.handleLink - invalid response from AcceptFriendAsync.');
        }
      }

    }

    componentWillUnmount() {
      // stop listening for URL
      Linking.removeEventListener('url', this.handleLink);
    }

    render() {
      return (
        <View style={{flex: 1}}>
           <StatusBar barStyle='light-content'/>
          <RootStack />
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
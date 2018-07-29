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
import SideBar from '../components/SideBar';
import ContactList from '../screens/ContactList';
import CreateNode from '../screens/CreateNode';

// Redux imports
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NodeListUpdatedActionCreator } from '../actions/NodeActions';
import { UserPositionChangedActionCreator } from '../actions/MapActions';

// Services
import LocationService, { IUserPositionChanged } from '../services/LocationService';
import NodeService, { INodeListUpdated } from '../services/NodeService';

// SET GLOBAL PROPS //
import { setCustomText} from 'react-native-global-props';

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
      title: navigation.indexs,
      headerLeft: <Icon name='keyboard-arrow-left' size={30} color={'#ffffff'} onPress={ () =>
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
      title: navigation.indexs,
      headerLeft: <Icon name='keyboard-arrow-left' size={30} color={'#ffffff'} onPress={ () =>
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
      title: navigation.indexs,
      headerLeft: <Icon name='keyboard-arrow-left' size={30} color={'#ffffff'} onPress={ () =>
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
      title: navigation.indexs,
      headerLeft: <Icon name='keyboard-arrow-left' size={30} color={'#ffffff'} onPress={ () =>
        navigation.dispatch(NavigationActions.reset(
        {
          index: 0,
          actions: [ NavigationActions.navigate({ routeName: 'Map' }) ],
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
    headerLeft: <Icon name='menu' size={35} color={'#ffffff'} onPress={ () => navigation.navigate('DrawerToggle') } />,
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
  NodeListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  VisitedNodeListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  ChallengeSettingsUpdated: (challengeSettings: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  UserPositionChanged: (userRegion: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;

  nodeList: Array<any>;
  challengeSettings: any;
  userRegion: any;
}

export class App extends Component<IProps> {

    // monitoring services
    private nodeService: NodeService;
    private locationService: LocationService;

    constructor(props: IProps) {
      super(props);

      // Setting the UUID serves as a simple 'account' for each user.
      // It does not contain any real information, but it temporarily bound to the phone
      this.setUUID();

      this.gotNewNodeList = this.gotNewNodeList.bind(this);
      this.gotNewUserPosition = this.gotNewUserPosition.bind(this);
      this.getUserRegion = this.getUserRegion.bind(this);

      this.componentDidMount = this.componentDidMount.bind(this);
      this.componentWillUnmount = this.componentWillUnmount.bind(this);
      this.handleLink = this.handleLink.bind(this);

      // The node service monitors all tracked and public nodes, this is an async loop that runs forever, so do not await it
      this.nodeService = new NodeService({nodeListUpdated: this.gotNewNodeList, currentUserRegion: this.getUserRegion});
      this.nodeService.StartMonitoring();

      // The location service monitors the users location and calculates distance to nodes
      // This is an async loop that runs forever, so do not await it
      this.locationService = new LocationService({userPositionChanged: this.gotNewUserPosition});
      this.locationService.StartMonitoring();
    }

    componentDidMount() {
        // listen for incoming URL
          Linking.addEventListener('url', this.handleLink);
      }
  
      handleLink(event) {
        // parse the user_uuid as a string from the URL
        let user_uuid = event.url.replace(/.*?:\/\//g, '');
        // TODO: set user_uuid in redis cache for session
        console.log('got user_uuid from url.......', user_uuid);
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

    private async gotNewNodeList(props: INodeListUpdated) {
      await this.props.NodeListUpdated(props.nodeList);
    }
}

// @ts-ignore
function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    nodeList: state.nodeList,
    userRegion: state.userRegion,
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    NodeListUpdated: bindActionCreators(NodeListUpdatedActionCreator, dispatch),
    UserPositionChanged: bindActionCreators(UserPositionChangedActionCreator, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
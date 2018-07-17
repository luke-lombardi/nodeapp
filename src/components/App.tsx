import React, {Component} from 'react';
import { Icon } from 'react-native-elements';
import { StackNavigator, DrawerNavigator } from 'react-navigation';
import { View, StatusBar } from 'react-native';
import Logger from '../services/Logger';

import Finder from '../screens/Finder';
import MainMap from '../screens/MainMap';
import NodeList from '../screens/NodeList';
import SideBar from '../components/SideBar';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NodeListUpdatedActionCreator } from '../actions/NodeActions';

import LocationService, { IUserPositionChanged } from '../services/LocationService';
import NodeService, { INodeListUpdated } from '../services/NodeService';
import ChallengeService, { IChallengeSettingsUpdated } from '../services/ChallengeService';

// @ts-ignore
import { ChallengeSettingsUpdatedActionCreator } from '../actions/ChallengeActions';

// SET GLOBAL PROPS //
import { setCustomText} from 'react-native-global-props';
import { UserPositionChangedActionCreator } from '../actions/MapActions';

const customTextProps = {
  style: {
    fontFamily: 'Avenir'
  }
}

setCustomText(customTextProps);
// END SET GLOBAL PROPS //
const InternalStack = StackNavigator({
  Finder: { screen: Finder,
    navigationOptions: ({navigation}) => ({
      headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
      title: navigation.indexs,
      headerLeft: <Icon name="keyboard-arrow-left" size={30} color={'#ffffff'} onPress={ () => navigation.navigate('Map') } />
    })
  },
  Map: { screen: MainMap },
  Nodes: {screen: NodeList },
},
{
  initialRouteName: 'Map',
  navigationOptions: ({navigation}) => ({
    headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10},
    title: navigation.indexs,
    headerLeft: <Icon name="menu" size={35} color={'#ffffff'} onPress={ () => navigation.navigate('DrawerToggle') } />
  })
}
)

const DrawerStack = DrawerNavigator({
    Main: {
      screen: InternalStack,
    },
  },
  {
    initialRouteName: 'Main',
    contentComponent: props => <SideBar {...props} />,
  }
)

const DrawerNavigation = StackNavigator({
  DrawerStack: { screen: DrawerStack },
}, {
  headerMode: 'none'
})

// Manifest of possible screens
export const RootStack = StackNavigator({
  drawerStack: { screen: DrawerNavigation }, 
}, {
  // Default config for all screens
  headerMode: 'none',
  title: 'Main',
  initialRouteName: 'drawerStack'
})


interface IProps{
  NodeListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>
  VisitedNodeListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>
  ChallengeSettingsUpdated: (challengeSettings: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>
  UserPositionChanged: (userRegion: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>

  nodeList: Array<any>
  challengeSettings: any
  userRegion: any
}


export class App extends Component<IProps> {
    // monitoring services
    private nodeService: NodeService;
    private challengeService: ChallengeService;
    private locationService: LocationService;

    constructor(props: IProps){
      super(props);

      this.gotNewNodeList = this.gotNewNodeList.bind(this);

      this.gotNewChallengeSettings = this.gotNewChallengeSettings.bind(this);

      this.gotNewUserPosition = this.gotNewUserPosition.bind(this);


      this.getUserRegion = this.getUserRegion.bind(this);

      this.challengeService = new ChallengeService({challengeSettingsUpdated: this.gotNewChallengeSettings});
      this.challengeService.StartMonitoring();

      this.nodeService = new NodeService({nodeListUpdated: this.gotNewNodeList, currentUserRegion: this.getUserRegion});
      this.nodeService.StartMonitoring();

      this.locationService = new LocationService({userPositionChanged: this.gotNewUserPosition});
      this.locationService.StartMonitoring();

    }

    private async gotNewUserPosition(props: IUserPositionChanged) {
      Logger.info(`Updated User position to: ${JSON.stringify(props.userRegion)}`);
      await this.props.UserPositionChanged(props.userRegion);
    }

    
    private async gotNewNodeList(props: INodeListUpdated) {
      await this.props.NodeListUpdated(props.nodeList);
    }

    private async gotNewChallengeSettings(props: IChallengeSettingsUpdated){
      await this.props.ChallengeSettingsUpdated(props.challengeSettings);
    }
    
    render() {
        return (
          <View style={{flex: 1}}>
             <StatusBar barStyle="light-content"/>
            <RootStack />
          </View>
        )
    }

    getUserRegion(): any {
      return this.props.userRegion;
    }
}

// @ts-ignore
function mapStateToProps(state: IStoreState): IProps { 
  // @ts-ignore
  return {
    nodeList: state.nodeList,
    userRegion: state.userRegion,
    challengeSettings: state.challengeSettings
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    NodeListUpdated: bindActionCreators(NodeListUpdatedActionCreator, dispatch),
    UserPositionChanged: bindActionCreators(UserPositionChangedActionCreator, dispatch),
    ChallengeSettingsUpdated: bindActionCreators(ChallengeSettingsUpdatedActionCreator, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

/*
const styles = StyleSheet.create({
  statusBar: {
    backgroundColor: 'blue'
  }
})
*/

//# sourceMappingURL=App.js.map
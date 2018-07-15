import React, { Component } from 'react';

// @ts-ignore
import { View } from 'react-native';

import {
  ViroARSceneNavigator,
} from 'react-viro';

// @ts-ignore
import DemoScene from './scenes/DemoScene';
import NodeFinder from './scenes/NodeFinder';


// import Logger from '../services/Logger';
// import ApiService from '../services/ApiService';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';

// actions
import { UserPositionChangedActionCreator } from '../actions/MapActions';
import { NodeListUpdatedActionCreator } from '../actions/NodeActions';

interface IProps {
  navigation: any,
  nodeList: Array<any>,
  userRegion: any,

  // Redux actions
  NodeListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>,
  UserPositionChanged: (userRegion: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>,
}

interface IState {
  isLoading: boolean,
  sceneProps: any
}

export class Finder extends Component<IProps, IState> {
  private action: string;
  
  /*
  private nextRoute: string;
  private apiService: ApiService;
  private nodeId: number;
  */

  constructor(props: IProps){
    super(props);

    this.state = {
      isLoading: false,
      sceneProps: {
        nodeList: this.props.nodeList,
        userRegion: this.props.userRegion
      }
    }

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);

    // this.apiService = new ApiService({});
    }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  componentDidMount(){
    this.action = this.props.navigation.getParam('action', null);

    if(this.action === "create_node"){
      // this.nextRoute = "Confirmation";
    }
  }


  render() {    
    return (
      <ViroARSceneNavigator
        initialScene={{
          scene: NodeFinder,
        }}
        viroAppProps={this.state.sceneProps}
        apiKey={"BC90C6E8-8E0F-4632-872D-DC67526A39E6"}
      />
    );
  }
}


// Redux setup functions
function mapStateToProps(state: IStoreState): IProps { 
  console.log(state.userRegion);
  // @ts-ignore
  return {
    nodeList: state.nodeList,
    userRegion: state.userRegion,
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    NodeListUpdated: bindActionCreators(NodeListUpdatedActionCreator, dispatch),
    UserPositionChanged: bindActionCreators(UserPositionChangedActionCreator, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Finder);

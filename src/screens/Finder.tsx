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
  sceneProps: any,
  nodeId: string
}

export class Finder extends Component<IProps, IState> {
  private action: string;

  constructor(props: IProps){
    super(props);

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);

    let nodeId = this.props.navigation.getParam('nodeId', '');
    

    let selectedNode = this.props.nodeList.find(
      n => n.data.node_id === nodeId
    );

    this.updateSelectedNode = this.updateSelectedNode.bind(this);
    
    this.state = {
      isLoading: false,
      sceneProps: {
        userRegion: this.props.userRegion,
        selectedNode: selectedNode,
        updateSelectedNode: this.updateSelectedNode
      },
      nodeId: nodeId
    }

    }

    
  private async updateSelectedNode(){
    let nodeId = this.state.nodeId;

    let selectedNode = this.props.nodeList.find(
      n => n.data.node_id === nodeId
    );
    
    // console.log(selectedNode);

    return selectedNode;
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

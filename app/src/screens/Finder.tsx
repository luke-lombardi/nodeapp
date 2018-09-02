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

import { PublicPersonListUpdatedActionCreator } from '../actions/NodeActions';
import { PublicPlaceListUpdatedActionCreator } from '../actions/NodeActions';
import { PrivatePersonListUpdatedActionCreator } from '../actions/NodeActions';
import { PrivatePlaceListUpdatedActionCreator } from '../actions/NodeActions';

interface IProps {
  navigation: any;
  publicPersonList: Array<any>;
  publicPlaceList: Array<any>;
  privatePersonList: Array<any>;
  privatePlaceList: Array<any>;

  userRegion: any;

  // Redux actions
  PublicPersonListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  PublicPlaceListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  PrivatePersonListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
  PrivatePlaceListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;

  UserPositionChanged: (userRegion: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
}

interface IState {
  isLoading: boolean;
  sceneProps: any;
  nodeId: string;
  nodeType: string;
}

export class Finder extends Component<IProps, IState> {
  private action: string;
  // @ts-ignore
  private _isMounted: boolean;
  private nodeListToSearch: any;

  constructor(props: IProps) {
    super(props);

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.updateSelectedNode = this.updateSelectedNode.bind(this);

    let nodeId = this.props.navigation.getParam('nodeId', '');
    let nodeType = this.props.navigation.getParam('nodeType', '');

    let nodeListToSearch = undefined;

    // Choose which node list to search
    switch (nodeType) {
      case 'publicPerson':
        nodeListToSearch = this.props.publicPersonList;
        break;
      case 'publicPlace':
        nodeListToSearch = this.props.publicPlaceList;
        break;
      case 'privatePerson':
        nodeListToSearch = this.props.privatePersonList;
        break;
      case 'privatePlace':
        nodeListToSearch = this.props.privatePlaceList;
        break;
      default:
        break;
    }

    this.nodeListToSearch = nodeListToSearch;

    // TODO: search for selected node in type list
    let selectedNode = nodeListToSearch.find(
      n => n.data.node_id === nodeId,
    );

    this.state = {
      isLoading: false,
      sceneProps: {
        userRegion: this.props.userRegion,
        selectedNode: selectedNode,
        updateSelectedNode: this.updateSelectedNode,
      },
      nodeId: nodeId,
      nodeType: nodeType,
    };

  }

  componentWillMount() {
    console.log('FINDER component about to mount');
  }

  componentWillUnmount() {
    console.log('FINDER component about to unmount');
    this._isMounted = false;
  }

  componentDidMount() {
    this.action = this.props.navigation.getParam('action', undefined);
    if (this.action === 'create_node') {
      console.log('Called from create node');
    }
    this._isMounted = true;
  }

  render() {
    return (
      <ViroARSceneNavigator
        initialScene={{
          scene: NodeFinder,
        }}
        viroAppProps={this.state.sceneProps}
        apiKey={'BC90C6E8-8E0F-4632-872D-DC67526A39E6'}
      />
    );
  }

  private async updateSelectedNode() {
    let nodeId = this.state.nodeId;

    let selectedNode = this.nodeListToSearch.find(
      n => n.data.node_id === nodeId,
    );

    return selectedNode;
  }

}

// Redux setup functions
function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    publicPersonList: state.publicPersonList,
    publicPlaceList: state.publicPlaceList,
    privatePersonList: state.privatePersonList,
    privatePlaceList: state.privatePlaceList,
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Finder);

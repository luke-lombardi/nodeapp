import React, { Component } from 'react';

// @ts-ignore
import { View } from 'react-native';

/*
import Loading from '../components/Loading';
*/

import {
  ViroARSceneNavigator,
} from 'react-viro';


import Scene from './Scene';

// import Logger from '../services/Logger';
// import ApiService from '../services/ApiService';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

// import { List, ListItem } from 'react-native-elements';
interface IProps {
  navigation: any,
  visitedNodeList: any
}

interface IState {
  isLoading: boolean
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
          scene: Scene,
        }}
        apiKey={"BC90C6E8-8E0F-4632-872D-DC67526A39E6"}
      />
    );
  }
}

 // @ts-ignore
 function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Finder);

import React, { Component } from 'react';
// @ts-ignore
import { View, StyleSheet, Switch, Text, TextInput, Dimensions, TouchableOpacity  } from 'react-native';
// @ts-ignore
import MapView, { Marker}   from 'react-native-maps';
import Snackbar from 'react-native-snackbar';

import Logger from '../services/Logger';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

import ApiService from '../services/ApiService';
import NodeService from '../services/NodeService';
import NavigationService from '../services/NavigationService';

import { ConfigGlobalLoader } from '../config/ConfigGlobal';
import { bindActionCreators } from 'redux';
import { UserPositionChangedActionCreator } from '../actions/MapActions';

interface IProps {
  navigation: any;
  userRegion: any;
  UserPositionChanged: (userRegion: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;

  // We need access to the node lists to prevent overlapping nodes
  privatePlaceList: Array<any>;
  publicPlaceList: Array<any>;
}

interface IState {
  topic: string;
  userRegion: any;
  isLoading: boolean;
  uuid: string;
  private: boolean;
  ttl: number;
}

export class TransactionDetail extends Component<IProps, IState> {
  _textInput: any;
  _map: any;
  private readonly configGlobal = ConfigGlobalLoader.config;

  constructor(props: IProps) {
    super(props);

    this.state = {
      topic: '',
      userRegion: {},
      isLoading: false,
      uuid: '',
      private: false,
      ttl: 12.0,
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.submitCreateNode = this.submitCreateNode.bind(this);
    this.checkForOverlaps = this.checkForOverlaps.bind(this);
  }

  componentWillMount() {
    let userRegion = this.props.userRegion;
    let uuid = this.props.navigation.getParam('uuid', '');
    this.setState({userRegion: userRegion});
    this.setState({uuid: uuid});
  }

  render() {
    return (
      <View>
        </View>
    );
  }

  // Checks if any nodes are <= minimumNodeDistance meters away
  // If so, display a snackbar to user
  private checkForOverlaps() {

    let overlaps: boolean = false;
    if (this.props.privatePlaceList.length > 0) {
      if (this.props.privatePlaceList[0].data.distance_in_meters <= this.configGlobal.minimumNodeDistance) {
        overlaps = true;
        return overlaps;
      }
    }

    if (this.props.publicPlaceList.length > 0) {
      if (this.props.publicPlaceList[0].data.distance_in_meters <= this.configGlobal.minimumNodeDistance) {
        overlaps = true;
        return overlaps;
      }
    }
    return overlaps;
  }

  private async submitCreateNode() {
    let nodeData = {
      'topic': this.state.topic,
      'lat': this.state.userRegion.latitude,
      'lng': this.state.userRegion.longitude,
      'private': this.state.private,
      'type': 'place',
      'ttl': this.state.ttl,
    };

    await this.setState({isLoading: true});

    // If the node topic is empty, don't post the node
    if (this.state.topic.length < 5) {
      Snackbar.show({
        title: 'topic must be at least 5 characters.',
        duration: Snackbar.LENGTH_SHORT,
      });

      await this.setState({
        isLoading: false,
      });

      return;
    }

    let overlappingNodes: boolean = this.checkForOverlaps();
    // If there is another node right on top of the user, don't allow overlapping nodes
    if (overlappingNodes) {
      Snackbar.show({
        title: 'You are too close to another node.',
        duration: Snackbar.LENGTH_LONG,
      });

      await this.setState({
        isLoading: false,
      });

      NavigationService.reset('Map', {updateNodes: true});
      return;
    }

    let newUuid = await ApiService.CreateNodeAsync(nodeData);

    if (newUuid !== undefined) {
      await NodeService.storeNode(newUuid);
      Logger.info('CreateNode.submitCreateNode - successfully created new private node.');
    } else if (newUuid !== undefined && nodeData.private === false) {
      Logger.info('CreateNode.submitCreateNode - successfully created new public node.');
    } else {
      Logger.info('CreateNode.submitCreateNode - invalid response from create node.');
    }

    await this.setState({isLoading: false});
    NavigationService.reset('Map', {updateNodes: true});
  }

}

 // @ts-ignore
 function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    userRegion: state.userRegion,
    publicPlaceList: state.publicPlaceList,
    privatePlaceList: state.privatePlaceList,
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    UserPositionChanged: bindActionCreators(UserPositionChangedActionCreator, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionDetail);

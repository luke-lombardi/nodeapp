import React, { Component } from 'react';
import { View, StyleSheet, Switch, Text, TextInput, Dimensions, TouchableOpacity  } from 'react-native';
// @ts-ignore
import MapView, { Marker}   from 'react-native-maps';
import Snackbar from 'react-native-snackbar';
import { scale, verticalScale, ScaledSheet } from 'react-native-size-matters';

import Logger from '../services/Logger';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { Button, Slider } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

import ApiService from '../services/ApiService';
import NodeService from '../services/NodeService';
import NavigationService from '../services/NavigationService';

import { ConfigGlobalLoader } from '../config/ConfigGlobal';
import { bindActionCreators } from 'redux';
import { UserPositionChangedActionCreator } from '../actions/MapActions';
import { mapStyle } from '../config/map';

const WINDOW_WIDTH = Dimensions.get('window').width;

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
      <View style={styles.container}>
        <View style={styles.nodeForm}>
            <View style={styles.switchView}>
              <Text style={styles.switchText}>{this.state.private ? 'private (toggle for public)' : 'public (toggle for private)'}</Text>
          { /* Horizontal line break */ }
          <View style={{borderTopWidth: 1, borderTopColor: 'rgba(220,220,220,1)', width: '100%', paddingVertical: 10, top: 25}}>

          </View>
          </View>
          <Button
            style={styles.fullWidthButton} buttonStyle={{width: '100%', height: '100%', backgroundColor: 'black'}}
            onPress={this.submitCreateNode}
            loading={this.state.isLoading}
            disabled={this.state.isLoading}
            loadingStyle={styles.loading}
            icon={
              <Icon
                name='arrow-right'
                size={30}
                underlayColor={'transparent'}
                color='white'
              />
            }
            title=''
          />
          </View>
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

const styles = ScaledSheet.create({
  container: {
    padding: 0,
    flex: 1,
    backgroundColor: '#ffffff',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  miniMapView: {
    flex: 1,
    padding: '20@s',
    // marginBottom: 10,
  },
  map: {
  },
  inputView: {
    width: '100%',
    flex: 1,
    // top: 20,
    // marginBottom: 20,
  },
  nodeForm: {
    flex: 6,
    alignSelf: 'stretch',
    backgroundColor: '#ffffff',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  fullWidthButton: {
    backgroundColor: 'black',
    height: '70@vs',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  loading: {
    alignSelf: 'center',
    width: '300@s',
    height: '50@vs',
  },
  characterCount: {
    color: 'gray',
    position: 'absolute',
    alignSelf: 'flex-end',
    bottom: '-2@vs',
    padding: '10@s',
  },
  switchView: {
    borderTopWidth: .5,
    borderTopColor: 'rgba(220,220,220,1)',
    paddingTop: '20@vs',
    flex: 2,
    alignItems: 'flex-start',
  },
  switch: {
    marginLeft: '20@s',
    top: '5@vs',
    alignSelf: 'flex-start',
  },
  switchText: {
    marginLeft: '20@s',
    bottom: '5@vs',
    fontSize: '24@vs',
    color: 'black',
    alignSelf: 'flex-start',
  },
  sliderContainer: {
    marginLeft: '20@s',
    alignItems: 'flex-start',
    top: '10@vs',
  },
  sliderText: {
    alignSelf: 'center',
    fontSize: '24@vs',
    color: 'gray',
  },
  hourText: {
    fontSize: '24@vs',
    alignSelf: 'center',
    color: 'black',
  },
  switchIcon: {
  },
  slider: {
    top: '-5@vs',
    alignSelf: 'center',
    width: '90%@vs',
  },
  sliderTextContainer: {
    paddingVertical: '10@vs',
  },
  privateText: {
    position: 'absolute',
    alignContent: 'flex-start',
    marginLeft: '65@s',
    fontSize: '24@s',
    color: 'gray',
  },
  input: {
    fontSize: '24@s',
    // bottom: 30,
    padding: '10@vs',
    paddingTop: '10@vs',
    color: 'black',
  },
});

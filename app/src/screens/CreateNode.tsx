import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInput, Dimensions, TouchableOpacity  } from 'react-native';
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
import AuthService from '../services/AuthService';

const WINDOW_WIDTH = Dimensions.get('window').width;

interface IProps {
  navigation: any;
  userRegion: any;
  UserPositionChanged: (userRegion: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;

  // We need access to the node lists to prevent overlapping nodes
  privatePlaceList: Array<any>;
  publicPlaceList: Array<any>;
  wallet: any;
}

interface IState {
  topic: string;
  userRegion: any;
  isLoading: boolean;
  uuid: string;
  private: boolean;
  ttl: number;
}

export class CreateNode extends Component<IProps, IState> {
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
    // in case user region is undefined
    const defaultRegion = {
      latitude: 40.71150601477085,
      longitude: -73.96408881229375,
      latitudeDelta: 0.00183,
      longitudeDelta: 0.0018149999999999998,
    };
    return (
      <View style={styles.container}>
        <View style={styles.nodeForm}>
          <View style={styles.miniMapView}>
           {
            // Main map view
              <MapView
                provider='google'
                ref={component => { this._map = component; } }
                style={[StyleSheet.absoluteFillObject, styles.map]}
                showsUserLocation={true}
                followsUserLocation={true}
                customMapStyle={mapStyle}
                initialRegion={this.state.userRegion !== {} ? this.state.userRegion : defaultRegion}
              >
              </MapView>
           }
          </View>
          <TouchableOpacity
            onPress={() => { this._textInput.focus(); }}
            style={styles.inputView}
            activeOpacity={0.9}
          >
          <TextInput
                onChangeText={(topic) => this.setState({topic: topic})}
                value={this.state.topic}
                blurOnSubmit
                autoCapitalize='none'
                multiline
                ref={ component => { this._textInput = component; } }
                style={styles.input}
                maxLength={200}
                returnKeyType='done'
                underlineColorAndroid='transparent'
                placeholder='what&apos;s here?'
            />
            </TouchableOpacity>
            <View style={styles.switchView}>
            <Text style={styles.characterCount}>{this.state.topic.length}/200</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderTextContainer}>
              <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.sliderText}>share for </Text>
              <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.hourText}>{this.state.ttl.toFixed(0)} {this.state.ttl < 1.1 ? 'hour' : 'hours'}</Text>
            </Text>
            <Slider
              style={[styles.slider, { width: WINDOW_WIDTH * .9 }]}
              value={this.state.ttl}
              // step value for slider
              step={1}
              thumbTouchSize={{width: scale(50), height: verticalScale(50)}}
              onValueChange={(ttl) => this.setState({ttl: ttl})}
              minimumValue={1}
              maximumValue={24}
              minimumTrackTintColor={'rgba(51, 51, 51, 0.9)'}
              maximumTrackTintColor={'rgba(51, 51, 51, 0.3)'}
              thumbTintColor={'#F03A47'}
            />
            </View>
          </View>
          <Button
            containerStyle={{position: 'absolute', bottom: 0, width: '100%', height: 60, borderRadius: 0}}
            buttonStyle={{width: '100%', height: '100%', backgroundColor: '#006494', bottom: -5, borderBottomColor: '#006494'}}
            onPress={this.submitCreateNode}
            loading={this.state.isLoading}
            disabled={this.state.isLoading}
            loadingStyle={styles.loading}
            icon={
              <Icon
                name='arrow-right'
                size={30}
                underlayColor={'transparent'}
                color='#F6F4F3'
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
    let currentUUID = await AuthService.getUUID();
    let nodeData = {
      'topic': this.state.topic,
      'lat': this.state.userRegion.latitude,
      'lng': this.state.userRegion.longitude,
      'private': this.state.private,
      'type': 'place',
      'ttl': this.state.ttl,
      'wallet': this.props.wallet.address,
      'creator': currentUUID,
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
    wallet: state.wallet,
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    UserPositionChanged: bindActionCreators(UserPositionChangedActionCreator, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateNode);

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#006494',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  miniMapView: {
    flex: 1,
    // padding: '10@s',
    // marginBottom: 10,
  },
  map: {
    height: '100%',
  },
  inputView: {
    width: '100%',
    flex: 1,
    paddingVertical: 5,
  },
  nodeForm: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: '#F6F4F3',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  fullWidthButton: {
    backgroundColor: '#006494',
    // height: '65@vs',
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
    // bottom: '-5@vs',
    paddingHorizontal: '15@s',
  },
  switchView: {
    // paddingTop: '20@vs',
    flex: 1,
    alignItems: 'flex-start',
  },
  switch: {
    marginLeft: '20@s',
    top: '5@vs',
    alignSelf: 'flex-start',
  },
  switchText: {
    marginLeft: '20@s',
    fontSize: '24@vs',
    color: 'black',
    alignSelf: 'flex-start',
  },
  sliderContainer: {
    borderTopWidth: .5,
    borderTopColor: 'rgba(220,220,220,1)',
    alignContent: 'center',
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    top: '35@vs',
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
    width: '90%@vs',
  },
  sliderTextContainer: {
    top: 10,
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
    flex: 1,
    fontSize: '24@s',
    padding: '10@vs',
    color: 'black',
  },
});

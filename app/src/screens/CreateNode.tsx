import React, { Component } from 'react';
import { View, StyleSheet, Switch, Text, TextInput, Dimensions  } from 'react-native';
// @ts-ignore
import MapView, { Marker}   from 'react-native-maps';
import Snackbar from 'react-native-snackbar';
import LinearGradient from 'react-native-linear-gradient';

import Logger from '../services/Logger';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { Button, Slider } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

import ApiService from '../services/ApiService';
import NodeService from '../services/NodeService';

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

export class CreateNode extends Component<IProps, IState> {
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
          <View style={styles.inputView}>
            <TextInput
                  onChangeText={(topic) => this.setState({topic: topic})}
                  value={this.state.topic}
                  blurOnSubmit
                  multiline
                  style={styles.input}
                  maxLength={280}
                  underlineColorAndroid='transparent'
                  placeholder='Add a topic...'
              />
            <Text style={styles.characterCount}>{this.state.topic.length}/280</Text>
            </View>
            <View style={styles.switchView}>
              <Text style={styles.switchText}>{this.state.private ? 'Private (toggle for public)' : 'Public (toggle for private)'}</Text>
            <Switch
              style={styles.switch}
              value={this.state.private}
              onValueChange={ () => {this.setState({private: !this.state.private});
            }}
            />
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderTextContainer}>
              <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.sliderText}>Share for </Text>
              <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.hourText}>{this.state.ttl.toFixed(1)} {this.state.ttl < 1.1 ? 'hour' : 'hours'}</Text>
            </Text>
            <Slider
              style={[styles.slider, { width: WINDOW_WIDTH * .9 }]}
              value={this.state.ttl}
              thumbTouchSize={{width: 50, height: 50}}
              onValueChange={(ttl) => this.setState({ttl: ttl})}
              minimumValue={1}
              maximumValue={24}
              minimumTrackTintColor={'rgba(51, 51, 51, 0.9)'}
              maximumTrackTintColor={'rgba(51, 51, 51, 0.3)'}
              thumbTintColor={'red'}
            />
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
    if (this.state.topic.length < 10) {
      Snackbar.show({
        title: 'Enter a topic for the node.',
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

      this.props.navigation.navigate({Key: 'Map', routeName: 'Map', params: {updateNodes: true}});
      return;
    }

    let newUuid = await ApiService.CreateNodeAsync(nodeData);

    if (newUuid !== undefined && nodeData.private === true) {
      await NodeService.storeNode(newUuid);
      Logger.info('CreateNode.submitCreateNode - successfully created new private node.');
    } else if (newUuid !== undefined && nodeData.private === false) {
      Logger.info('CreateNode.submitCreateNode - successfully created new public node.');
    } else {
      Logger.info('CreateNode.submitCreateNode - invalid response from create node.');
    }

    await this.setState({isLoading: false});
    this.props.navigation.navigate({Key: 'Map', routeName: 'Map', params: {updateNodes: true}});
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateNode);

const styles = StyleSheet.create({
  container: {
    padding: 0,
    flex: 1,
    backgroundColor: '#ffffff',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  miniMapView: {
    flex: 1,
    padding: 20,
    marginBottom: 10,
  },
  map: {
  },
  inputView: {
    width: '100%',
    flex: 1,
    top: 20,
    marginBottom: 20,
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
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    padding: 0,
  },
  loading: {
    alignSelf: 'center',
    width: 300,
    height: 50,
  },
  characterCount: {
    color: 'gray',
    position: 'absolute',
    alignSelf: 'flex-end',
    bottom: -2,
    padding: 10,
  },
  switchView: {
    borderTopWidth: .5,
    borderTopColor: 'rgba(220,220,220,0.8)',
    paddingTop: '10%',
    flex: 2,
    alignItems: 'flex-start',
  },
  switch: {
    marginLeft: 20,
    top: 5,
    alignSelf: 'flex-start',
  },
  switchText: {
    marginLeft: 20,
    bottom: 10,
    fontSize: 24,
    color: 'black',
    alignSelf: 'flex-start',
  },
  sliderContainer: {
    marginLeft: 20,
    alignItems: 'flex-start',
    top: 25,
  },
  sliderText: {
    alignSelf: 'center',
    fontSize: 24,
    color: 'gray',
  },
  hourText: {
    fontSize: 24,
    alignSelf: 'center',
    color: 'black',
  },
  switchIcon: {
  },
  slider: {
    alignSelf: 'center',
    width: '90%',
  },
  sliderTextContainer: {
    paddingVertical: 10,
  },
  privateText: {
    position: 'absolute',
    alignContent: 'flex-start',
    marginLeft: 65,
    fontSize: 24,
    color: 'gray',
  },
  input: {
    fontSize: 24,
    bottom: 30,
    padding: 10,
    paddingTop: 10,
    color: 'black',
  },
});

import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
// @ts-ignore
import MapView, { Marker}   from 'react-native-maps';
import { Switch } from 'react-native-switch';
import Logger from '../services/Logger';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { Input, Button, Slider} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import ApiService from '../services/ApiService';
import NodeService from '../services/NodeService';
import { bindActionCreators } from 'redux';
import { UserPositionChangedActionCreator } from '../actions/MapActions';

interface IProps {
  navigation: any;
  userRegion: any;
  UserPositionChanged: (userRegion: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
}

interface IState {
  title: string;
  description: string;
  userRegion: any;
  isLoading: boolean;
  uuid: string;
  private: boolean;
  ttl: number;
}

export class CreateNode extends Component<IProps, IState> {
  _map: any;
  private apiService: ApiService;
  private nodeService: NodeService;

  constructor(props: IProps) {
    super(props);

    this.state = {
      title: '',
      description: '',
      userRegion: {},
      isLoading: false,
      uuid: '',
      private: true,
      ttl: 12.0,
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.submitCreateNode = this.submitCreateNode.bind(this);
    this.apiService = new ApiService({});
    this.nodeService = new NodeService({});
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
                initialRegion={this.state.userRegion !== {} ? this.state.userRegion : defaultRegion}
              >
              </MapView>
           }
          </View>
          <View style={styles.inputView}>
            <Input
              placeholder='Title'
              leftIcon={
                <Icon
                  name='question-circle'
                  size={20}
                  color='rgba(44,55,71,0.3)'
                />
              }
                containerStyle={styles.inputPadding}
                onChangeText={(title) => this.setState({title: title})}
                value={this.state.title}
            />

            <Input
              placeholder='Description'
              leftIcon={
                <Icon
                  name='question-circle'
                  size={20}
                  color='rgba(44,55,71,0.3)'
                />
              }
              containerStyle={styles.inputPadding}
              inputStyle={styles.descriptionInput}
              onChangeText={(description) => this.setState({description: description})}
              // enablesReturnKeyAutomatically={true}
              // onSubmitEditing={this.submitCreateNode}
              value={this.state.description}
            />
            </View>
            <View style={styles.switchView}>
              <Text style={styles.switchText}>Pin Visibility</Text>
              <Text style={this.state.private ? styles.publicText : styles.publicTextInactive}>Public</Text>
              <Text style={this.state.private ? styles.privateText : styles.privateTextInactive}>Private</Text>
            <Switch
              circleBorderWidth={1}
              backgroundActive={'green'}
              backgroundInactive={'gray'}
              circleSize={30}
              style={styles.switch}
              value={this.state.private}
              onValueChange={ () => {this.setState({private: !this.state.private});
            }
          }
            />
          <Slider
            style={styles.slider}
            value={this.state.ttl}
            thumbTouchSize={{width: 40, height: 40}}
            onValueChange={(ttl) => this.setState({ttl: ttl})}
            minimumValue={1}
            maximumValue={24}
            minimumTrackTintColor={'rgba(51, 51, 51, 0.9)'}
            maximumTrackTintColor={'rgba(51, 51, 51, 0.3)'}
            thumbTintColor={'red'}
            />
            <Text>
              <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.sliderText}>Share for </Text>
              <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.hourText}>{this.state.ttl.toFixed(1)} Hours</Text>
            </Text>
          </View>

          <Button
            style={styles.fullWidthButton} buttonStyle={{width: '100%', height: '100%'}}
            onPress={this.submitCreateNode}
            loading={this.state.isLoading}
            disabled={this.state.isLoading}
            loadingStyle={styles.loading}
            icon={
              <Icon
                name='arrow-right'
                size={30}
                color='white'
              />
            }
            title=''
          />
          </View>
          </View>
    );
  }

  private async submitCreateNode() {
    let nodeData = {
      'title': this.state.title,
      'description': this.state.description,
      'lat': this.state.userRegion.latitude,
      'lng': this.state.userRegion.longitude,
      'private': this.state.private,
      'type': 'place',
      'ttl': this.state.ttl,
    };

    console.log('Submitted node request');

    await this.setState({isLoading: true});
    let newUuid = await this.apiService.CreateNodeAsync(nodeData);

    if (newUuid !== undefined && nodeData.private === true) {
      await this.nodeService.storeNode(newUuid);
      console.log('successfully created node', newUuid);
    } else {
      Logger.info('CreateNode.submitCreateNode - invalid response from create node.');
    }

    await this.setState({isLoading: false});
    this.props.navigation.navigate('Map', {updateNodes: true});
  }

}

 // @ts-ignore
 function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    userRegion: state.userRegion,
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
  },
  miniMapView: {
    flex: 1,
    padding: 10,
  },
  map: {
  },
  inputView: {
    flex: 1,
  },
  nodeForm: {
    flex: 6,
    alignSelf: 'stretch',
  },
  inputPadding: {
    marginTop: 20,
    marginLeft: 15,
  },
  descriptionInput: {
    height: 50,
  },
  fullWidthButton: {
    backgroundColor: 'blue',
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
  switchView: {
    flex: 2,
    alignItems: 'center',
  },
  switch: {
    fontSize: 18,
    alignSelf: 'center',
  },
  switchText: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingLeft: 10,
    fontSize: 20,
    color: 'gray',
    alignSelf: 'center',
  },
  sliderText: {
    fontSize: 20,
    alignSelf: 'center',
    color: 'gray',
  },
  hourText: {
    fontSize: 20,
    alignSelf: 'center',
    color: 'black',
  },
  switchIcon: {
  },
  slider: {
    top: 70,
    width: 300,
  },
  publicText: {
    position: 'absolute',
    alignContent: 'flex-end',
    fontSize: 14,
    top: 65,
    left: 105,
    color: 'gray',
  },
  publicTextInactive: {
    position: 'absolute',
    alignContent: 'flex-end',
    fontSize: 14,
    top: 65,
    left: 105,
  },
  privateText: {
    position: 'absolute',
    alignContent: 'flex-start',
    fontSize: 14,
    top: 65,
    right: 105,
  },
  privateTextInactive: {
    position: 'absolute',
    alignContent: 'flex-start',
    fontSize: 14,
    top: 65,
    right: 105,
    color: 'gray',
  },
});

import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

// @ts-ignore
import MapView, { Marker}   from 'react-native-maps';

import Logger from '../services/Logger';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

import { Input, Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

import ApiService from '../services/ApiService';
import NodeService from '../services/NodeService';

interface IProps {
  navigation: any;
}

interface IState {
  title: string;
  description: string;
  userRegion: any;
  isLoading: boolean;
  uuid: string;
  public: boolean;
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
      public: false,
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);

    this.submitCreateNode = this.submitCreateNode.bind(this);

    this.apiService = new ApiService({});
    this.nodeService = new NodeService({});
  }

  componentWillMount() {
    console.log('component will mount');

    let userRegion = this.props.navigation.getParam('userRegion', {});
    let uuid = this.props.navigation.getParam('uuid', '');

    this.setState({userRegion: userRegion});
    this.setState({uuid: uuid});
  }

  componentWillUnmount() {
    console.log('component will unmount');
  }

  componentDidMount() {
    console.log('component mounted');
  }

  render() {
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
                initialRegion={this.state.userRegion}
              >
              </MapView>
           }
          </View>
          <View style={styles.inputView}>
            <Input
              placeholder='Whats here?'
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
              placeholder='Why should I go here?'
              containerStyle={styles.inputPadding}
              inputStyle={styles.descriptionInput}
              onChangeText={(description) => this.setState({description: description})}
              enablesReturnKeyAutomatically={true}
              onSubmitEditing={this.submitCreateNode}
              value={this.state.description}
              multiline={true}
              numberOfLines={6}
            />

          </View>

          <Button style={styles.fullWidthButton} buttonStyle={{width:"100%", height:"100%"}}
            onPress={this.submitCreateNode}
            loading={this.state.isLoading}
            disabled={this.state.isLoading}
            loadingStyle={styles.loading}
            title="Create new node"

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
      'public': this.state.public,
      'type': 'place',
    };

    console.log('Submitted node request');

    await this.setState({isLoading: true});
    let newUuid = await this.apiService.CreateNodeAsync(nodeData);

    if (newUuid !== undefined) {
      await this.nodeService.storeNode(newUuid);
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
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
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
    borderRadius: 10,
  },
  inputView: {
    flex: 2,
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
    padding: 10,
    height: 100,
  },
  fullWidthButton: {
    backgroundColor: 'blue',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    padding: 0
  },
  loading: {
    alignSelf: 'center',
    width: 300,
    height: 50,
  },
});

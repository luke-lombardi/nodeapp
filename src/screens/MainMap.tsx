import React, { Component } from 'react';
import { View, Alert, TouchableOpacity } from 'react-native';
import {
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import MapView   from 'react-native-maps';
import Pulse from 'react-native-pulse';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { UserPositionChangedActionCreator } from '../actions/MapActions';

import { PublicPersonListUpdatedActionCreator } from '../actions/NodeActions';
import { PublicPlaceListUpdatedActionCreator } from '../actions/NodeActions';
import { PrivatePersonListUpdatedActionCreator } from '../actions/NodeActions';
import { PrivatePlaceListUpdatedActionCreator } from '../actions/NodeActions';

import NodeService,
  {
    IPublicPersonListUpdated,
    IPublicPlaceListUpdated,
    IPrivatePersonListUpdated,
    IPrivatePlaceListUpdated }
  from '../services/NodeService';

// @ts-ignore
import Logger from '../services/Logger';
import MapToolbar from '../components/MapToolbar';
import Node from '../components/Node';

// Import various types of map markers
import PublicPlaces from './markers/PublicPlaces';
import PrivatePlaces from './markers/PrivatePlaces';
import PublicPeople from './markers/PublicPeople';
import PrivatePeople from './markers/PrivatePeople';
import SleepUtil from '../services/SleepUtil';

// import mapStyle from '../config/mapStyle.json';

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
  mapRegion: any;
  lastLat: string;
  lastLong: string;
  walletVisible: boolean;
  nodeSelected: boolean;
  selectedNode: any;
  publicNodesVisible: boolean;
}

export class MainMap extends Component<IProps, IState> {
  timerID: number;
  _map: any;
  currentMarkerRegion: any;
  selectedNodeType: string;

  // @ts-ignore
  private nodeService: NodeService;

  constructor(props: IProps) {
    super(props);
    this.state = {
      lastLat: '0.0',
      lastLong: '0.0',
      mapRegion: {},
      walletVisible: false,
      nodeSelected: false,
      selectedNode: {},
      publicNodesVisible: true,
    };

    this.zoomToUserLocation = this.zoomToUserLocation.bind(this);
    this.viewNodeList = this.viewNodeList.bind(this);
    this.togglePublicVisible = this.togglePublicVisible.bind(this);
    this.createNode = this.createNode.bind(this);

    this.onNodeSelected = this.onNodeSelected.bind(this);
    this.clearSelectedNode = this.clearSelectedNode.bind(this);

    this.gotNewPublicPersonList = this.gotNewPublicPersonList.bind(this);
    this.gotNewPublicPlaceList = this.gotNewPublicPlaceList.bind(this);
    this.gotNewPrivatePersonList = this.gotNewPrivatePersonList.bind(this);
    this.gotNewPrivatePlaceList = this.gotNewPrivatePlaceList.bind(this);

    this.goToContactList = this.goToContactList.bind(this);
    this.goToCreateNode = this.goToCreateNode.bind(this);
    this.goToNodeFinder = this.goToNodeFinder.bind(this);
    this.getNodeListToSearch = this.getNodeListToSearch.bind(this);

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

    this.nodeService = new NodeService(
      {
        publicPersonListUpdated: this.gotNewPublicPersonList,
        publicPlaceListUpdated: this.gotNewPublicPlaceList,
        privatePersonListUpdated: this.gotNewPrivatePersonList,
        privatePlaceListUpdated: this.gotNewPrivatePlaceList,
        currentUserRegion: this.props.userRegion,
    });

    let markerRegion = this.props.navigation.getParam('region', undefined);
    this.selectedNodeType = this.props.navigation.getParam('nodeType', '');

    this.currentMarkerRegion = markerRegion;
    this.waitForUserPosition = this.waitForUserPosition.bind(this);

  }

  componentDidMount() {
    if (this.currentMarkerRegion !== undefined) {
      let nodeListToSearch = this.getNodeListToSearch();

      let selectedNode = nodeListToSearch.find(
        m => parseFloat(m.data.latitude) === this.currentMarkerRegion.latitude && parseFloat(m.data.longitude) === this.currentMarkerRegion.longitude,
      );

      if (selectedNode) {
        this.currentMarkerRegion.latitudeDelta =  0.00122 * 1.5;
        this.currentMarkerRegion.longitudeDelta =  0.00121 * 1.5;
        selectedNode.nodeType = this.selectedNodeType;

        this.setState({selectedNode: selectedNode});
        this.setState({nodeSelected: true});

        setTimeout(() => {
          this._map.animateToRegion(this.currentMarkerRegion, 10);
        }, 5);

        return;
      }
    }

    if (this.props.userRegion.latitude === undefined) {
      this.waitForUserPosition();
    } else {
      setTimeout(() => {
        this._map.animateToRegion(this.props.userRegion, 10);
      }, 5);
    }

  }

  componentWillMount() {
    let shouldUpdate = this.props.navigation.getParam('updateNodes', false);

    if (shouldUpdate) {
      this.nodeService.CheckNow();
    }
  }

  async waitForUserPosition() {
    while (this.props.userRegion.latitude === undefined) {
      await SleepUtil.SleepAsync(1);
    }
    this._map.animateToRegion(this.props.userRegion, 100);
  }

  zoomToUserLocation() {
    this._map.animateToRegion(this.props.userRegion, 100);
    this.clearSelectedNode({nativeEvent: {action: ''}});
  }

  viewNodeList() {
    this.props.navigation.navigate('Nodes');
  }

  onNodeSelected(e, nodeType) {
    const coordinate = e.nativeEvent.coordinate;
    this.selectedNodeType = nodeType;
    let nodeListToSearch = this.getNodeListToSearch();

    const marker = nodeListToSearch.find(
      m => parseFloat(m.data.latitude) === coordinate.latitude && parseFloat(m.data.longitude) === coordinate.longitude,
    );

    if (marker) {
      console.log('Found marker');
      marker.nodeType = nodeType;
      this.setState({selectedNode: marker});
      this.setState({nodeSelected: true});
    }
  }

  clearSelectedNode(e) {
    if (e.nativeEvent.action !== 'marker-press') {
      this.setState({nodeSelected: false});
      return;
    }
  }

  togglePublicVisible() {
    this.setState({ publicNodesVisible: !this.state.publicNodesVisible });
  }

  getNodeListToSearch() {
    let nodeListToSearch = undefined;

    switch (this.selectedNodeType) {
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
    return nodeListToSearch;
  }

  createNode() {
    Alert.alert(
      'Track something',
      'Enter a pin or create a new node',
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Drop Pin', onPress: this.goToCreateNode},
        {text: 'Create Group', onPress: this.goToContactList},
        {text: 'Plan Meetup', onPress: this.goToContactList},
        {text: 'Add Friend', onPress: this.goToContactList},
      ],
      { cancelable: false },
    );
  }

  render() {
    return (
      // Map screen view (exported component)
      <View style={styles.mainView}>

          {
          // Main map toolbar
          <View style={styles.headerView}>
            <MapToolbar functions={{
              zoomToUserLocation: this.zoomToUserLocation,
              viewNodeList: this.viewNodeList,
              updateNodeList: this.nodeService.CheckNow,
              toggleSwitch: this.togglePublicVisible,
            }}
            publicNodesVisible={this.state.publicNodesVisible}
            />
          </View>
          // End main map toolbar
          }

          {
            // Main map view
            <View style={styles.mapView}>

              <MapView
                provider='google'
                ref={ component => { this._map = component; } }
                style={StyleSheet.absoluteFillObject}
                showsUserLocation={true}
                followsUserLocation={true}
                showsIndoorLevelPicker={false}
                onPress={this.clearSelectedNode}
                // customMapStyle={mapStyle}
              >

              {/* Map markers  */}
              <PublicPlaces publicPlaceList={this.props.publicPlaceList} functions={ {'onNodeSelected': this.onNodeSelected} } visible={this.state.publicNodesVisible} />
              <PublicPeople publicPersonList={this.props.publicPersonList} functions={ {'onNodeSelected': this.onNodeSelected} } visible={this.state.publicNodesVisible} />
              <PrivatePlaces privatePlaceList={this.props.privatePlaceList} functions={ {'onNodeSelected': this.onNodeSelected} } />
              <PrivatePeople privatePersonList={this.props.privatePersonList} functions={ {'onNodeSelected': this.onNodeSelected} } />

              </MapView>

              <TouchableOpacity
                style={{
                    borderWidth: 1,
                    borderColor: 'rgba(44,55,71,0.3)',
                    alignItems: 'center',
                    alignSelf: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: 100,
                    position: 'absolute',
                    bottom: '5%',
                  }}
                onPress={this.createNode}
              >
              <Pulse color='white' numPulses={2} diameter={210} speed={20} duration={2000} />

              <Icon
                name='plus-circle'
                size={35}
                color='rgba(44,55,71,1.0)'
              />
              </TouchableOpacity>

            </View>
          // End map view
        }

        {
          // Node selected view
          this.state.nodeSelected &&
          <View style={styles.nodeSelectedView}>
            <Node nodeId={this.state.selectedNode.data.node_id} nodeType={ this.state.selectedNode.nodeType }
            title={this.state.selectedNode.data.title} description={this.state.selectedNode.data.description}  navigation={this.props.navigation} />
          </View>
          // End node selected view
        }

     </View>
     // End map screen view (exported component)
    );
  }

  private async gotNewPublicPersonList(props: IPublicPersonListUpdated) {
    await this.props.PublicPersonListUpdated(props.nodeList);
  }

  private async gotNewPublicPlaceList(props: IPublicPlaceListUpdated) {
    await this.props.PublicPersonListUpdated(props.nodeList);
  }

  private async gotNewPrivatePersonList(props: IPrivatePersonListUpdated) {
    await this.props.PublicPersonListUpdated(props.nodeList);
  }

  private async gotNewPrivatePlaceList(props: IPrivatePlaceListUpdated) {
    await this.props.PublicPersonListUpdated(props.nodeList);
  }

  private goToContactList() {
    this.props.navigation.navigate('ContactList', {action: 'create_node', userRegion: this.props.userRegion});
  }

  private goToCreateNode() {
    this.props.navigation.navigate('CreateNode', {action: 'create_node', userRegion: this.props.userRegion});
  }

  private goToNodeFinder() {
    this.props.navigation.navigate('Finder', {
      action: 'create_node', userRegion: this.props.userRegion,
      nodeId: this.state.selectedNode.data.node_id,
      nodeType: this.state.selectedNode.nodeType,
    });
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

export default connect(mapStateToProps, mapDispatchToProps)(MainMap);
// End Redux setup functions
// Local styles
const styles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  headerView: {
    flex: 1,
    position: 'relative',
    zIndex: 2,
  },
  walletView: {
    backgroundColor: '#rgba(255, 255, 255, 0.9)',
    padding: 0,
    flexDirection: 'column',
    borderBottomColor: 'rgba(44,55,71,0.3)',
    borderBottomWidth: 1,
    marginTop: 5,
    position: 'relative',
    top: 0,
    left: 0,
    height: '35%',
    width: '100%',
    zIndex: 1,
  },
  nodeSelectedView: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 0,
    flexDirection: 'column',
    borderTopColor: 'rgba(44,55,71,0.3)',
    borderTopWidth: 1,
    marginTop: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '35%',
    width: '100%',
    zIndex: 1,
  },
  mapView: {
    flex: 14,
  },
  createNodeButton: {

  },
});
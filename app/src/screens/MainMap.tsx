import React, { Component } from 'react';
// @ts-ignore
import { View, AsyncStorage, Switch, Dimensions, Animated, ScrollView } from 'react-native';
// @ts-ignore
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';

import {
  StyleSheet,
} from 'react-native';
import MapView from 'react-native-maps';
import Snackbar from 'react-native-snackbar';
import { Button } from 'react-native-elements';

// Redux imports
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';

// Redux actions
import { UserPositionChangedActionCreator } from '../actions/MapActions';
import { TrackedFriendListUpdatedActionCreator } from '../actions/TrackedFriendActions';
import { PublicPersonListUpdatedActionCreator } from '../actions/NodeActions';
import { PublicPlaceListUpdatedActionCreator } from '../actions/NodeActions';
import { PrivatePersonListUpdatedActionCreator } from '../actions/NodeActions';
import { PrivatePlaceListUpdatedActionCreator } from '../actions/NodeActions';

// Services
import NodeService,
  {
    IPublicPersonListUpdated,
    IPublicPlaceListUpdated,
    IPrivatePersonListUpdated,
    IPrivatePlaceListUpdated,
    IFriendListUpdated,
  }
  from '../services/NodeService';

import NavigationService from '../services/NavigationService';

import SleepUtil from '../services/SleepUtil';
// @ts-ignore
import ApiService from '../services/ApiService';

// @ts-ignore
import Logger from '../services/Logger';
import Node from '../components/Node';
import Person from '../components/Person';

// Import various types of map markers
import PublicPlaces from './markers/PublicPlaces';
import PrivatePlaces from './markers/PrivatePlaces';
import PublicPeople from './markers/PublicPeople';
import PrivatePeople from './markers/PrivatePeople';
import Friends from './markers/Friends';

import { mapStyle } from '../config/map';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT - 50;

interface IProps {
    navigation: any;
    publicNodesVisible: boolean;
    publicPersonList: Array<any>;
    publicPlaceList: Array<any>;
    privatePersonList: Array<any>;
    privatePlaceList: Array<any>;
    friendList: Array<any>;

    userRegion: any;

    // Redux actions
    PublicPersonListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
    PublicPlaceListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
    PrivatePersonListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
    PrivatePlaceListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
    FriendListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
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
  createModalVisible: boolean;
  confirmModalVisible: boolean;
  destination: any;
  pushData: string;
}

export class MainMap extends Component<IProps, IState> {
  timerID: number;
  _map: any;
  currentMarkerRegion: any;
  selectedNodeType: string;
  selectedNode: string;
  index: number;
  animation: any;

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
      createModalVisible: false,
      confirmModalVisible: false,
      destination: {
        latitude: '',
        longitude: '',
      },
      pushData: undefined,
    };

    this.zoomToUserLocation = this.zoomToUserLocation.bind(this);
    this.togglePublicVisible = this.togglePublicVisible.bind(this);
    this.refreshNodes = this.refreshNodes.bind(this);

    this.onNodeSelected = this.onNodeSelected.bind(this);
    this.clearSelectedNode = this.clearSelectedNode.bind(this);

    this.gotNewPublicPersonList = this.gotNewPublicPersonList.bind(this);
    this.gotNewPublicPlaceList = this.gotNewPublicPlaceList.bind(this);
    this.gotNewPrivatePersonList = this.gotNewPrivatePersonList.bind(this);
    this.gotNewPrivatePlaceList = this.gotNewPrivatePlaceList.bind(this);
    this.gotNewFriendList = this.gotNewFriendList.bind(this);

    this.navigateToPage = this.navigateToPage.bind(this);
    this.getNodeListToSearch = this.getNodeListToSearch.bind(this);

    this.scrollToNode = this.scrollToNode.bind(this);

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

    this.nodeService = new NodeService(
      {
        publicPersonListUpdated: this.gotNewPublicPersonList,
        publicPlaceListUpdated: this.gotNewPublicPlaceList,
        privatePersonListUpdated: this.gotNewPrivatePersonList,
        privatePlaceListUpdated: this.gotNewPrivatePlaceList,
        friendListUpdated: this.gotNewFriendList,
        currentUserRegion: this.props.userRegion,
    });

    let markerRegion = this.props.navigation.getParam('region', undefined);
    this.selectedNodeType = this.props.navigation.getParam('nodeType', '');

    this.currentMarkerRegion = markerRegion;
    this.waitForUserPosition = this.waitForUserPosition.bind(this);

  }

  componentDidMount() {
    // If there is any message to display, then show a snackbar at the bottom of the map
    let showMessage = this.props.navigation.getParam('showMessage', true);
    if (showMessage) {
      let messageText = this.props.navigation.getParam('messageText', undefined);
      if (messageText !== undefined) {
          // Show success message
          Snackbar.show({
            title: messageText,
            duration: Snackbar.LENGTH_SHORT,
          });
      }
    }

    // If we are coming from any of the node lists, a current marker region will have been passed in, so open the Node
    if (this.currentMarkerRegion !== undefined) {
      let nodeListToSearch = this.getNodeListToSearch();

      let selectedNode = nodeListToSearch.find(
        m => parseFloat(m.data.latitude) === this.currentMarkerRegion.latitude && parseFloat(m.data.longitude) === this.currentMarkerRegion.longitude,
      );

      // If we found the node in the list, move the map location to the node location
      if (selectedNode) {
        try {
          this.currentMarkerRegion.latitudeDelta =  0.00122 * 1.5;
          this.currentMarkerRegion.longitudeDelta =  0.00121 * 1.5;
          selectedNode.nodeType = this.selectedNodeType;

          this.setState({
            selectedNode: selectedNode,
            nodeSelected: true,
          } );
        } catch (error) {
          // If we got here, we unmounted
          console.log(error);
        }

        setTimeout(() => {
          try {
            this._map.animateToRegion(this.currentMarkerRegion, 10);
          } catch (error) {
            // If we got here, we unmounted
            console.log(error);
          }
        }, 5);

        return;
      }
    }

    // If we are unable to find the user region, wait until we get it
    if (this.props.userRegion.latitude === undefined) {
      this.waitForUserPosition();
    } else {
      setTimeout(() => {
        try {
          this._map.animateToRegion(this.props.userRegion, 10);
        } catch (error) {
          // If we got here, we unmounted
          console.log(error);
        }
      }, 5);
    }

  }

  componentWillMount() {
    // set the default index for the horizontal node list
    this.index = 0;
    this.animation = new Animated.Value(0);

    let shouldUpdate = this.props.navigation.getParam('updateNodes', false);

    if (shouldUpdate) {
      this.nodeService.CheckNow();
    }
  }

  async waitForUserPosition() {

    while (this.props.userRegion.latitude === undefined) {
      await SleepUtil.SleepAsync(1);
    }

    try {
      this._map.animateToRegion(this.props.userRegion, 100);
    } catch (error) {
      // If we get this, we unmounted
      console.log(error);
    }
  }

  zoomToUserLocation() {
    try {
      this._map.animateToRegion(this.props.userRegion, 100);
      this.clearSelectedNode({nativeEvent: {action: ''}});
    } catch (error) {
      // If we get this, we unmounted
      console.log(error);
    }
  }

  viewNodeList() {
    NavigationService.reset('Nodes', {});
  }

  onNodeSelected(e, nodeType) {
    const coordinate = e.nativeEvent.coordinate;
    this.selectedNodeType = nodeType;
    let nodeListToSearch = this.getNodeListToSearch();

    const marker = nodeListToSearch.find(
      m => parseFloat(m.data.latitude) === coordinate.latitude && parseFloat(m.data.longitude) === coordinate.longitude,
    );

    if (marker) {
      marker.nodeType = nodeType;
      this.setState({
        selectedNode: marker,
        nodeSelected: true,
        destination: {
            latitude: marker.data.latitude,
            longitude: marker.data.longitude,
        },
      });
    }
  }

  clearSelectedNode(e) {
    if (e.nativeEvent.action !== 'marker-press') {
      this.setState({nodeSelected: false});
      return;
    }
  }

  // Sets public node visibility
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
      case 'friend':
        nodeListToSearch = this.props.friendList;
        break;
      default:
        break;
    }

    return nodeListToSearch;
  }

  async scrollToNode(e, node) {
    console.log('current node', node);
    console.log('event', e);
    console.log('public place list', this.props.publicPlaceList);

    let thisNode = this.props.publicPlaceList.findIndex(
      n => n.data.node_id === node.node_id,
    );
    console.log('got this node', thisNode);

    let nearbyNode = this.props.publicPlaceList[thisNode + 1];
    console.log('got nearby node', nearbyNode);
    return nearbyNode;
  }
    // const coordinate = e.nativeEvent.coordinate;
    // this.selectedNode = node;
    // let nodeListToSearch = this.getNodeListToSearch();

    // const marker = nodeListToSearch.find(
    //   m => parseFloat(m.data.latitude) === coordinate.latitude && parseFloat(m.data.longitude) === coordinate.longitude,
    // );

    // if (marker) {
    //   marker.node = node;
    //   this.setState({
    //     selectedNode: marker,
    //     nodeSelected: true,
    //     destination: {
    //         latitude: marker.data.latitude,
    //         longitude: marker.data.longitude,
    //     },
    //   });
    // }

  onSwipeRight(state) {
    console.log('SWIPED RIGHT');
    console.log(state);
  }

  render() {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };

    // console.log('MAP IS BEING RENDERED!');
    return (
      // Map screen view (exported component)
      <GestureRecognizer
      // onSwipe={(direction, state) => this.onSwipe(direction, state)}
      // onSwipeUp={(state) => this.onSwipeUp(state)}
      // onSwipeDown={(state) => this.onSwipeDown(state)}
      // onSwipeLeft={(state) => this.onSwipeLeft(state)}
      onSwipeRight={(state) => this.onSwipeRight(state)}
      config={config}
      style={styles.mainView}
      >
          {
            // Main map view
            <View style={styles.mapView}>

              <MapView
                provider='google'
                ref={ component => { this._map = component; } }
                style={ StyleSheet.absoluteFillObject }
                showsUserLocation={true}
                followsUserLocation={true}
                showsIndoorLevelPicker={false}
                onPress={this.clearSelectedNode}
                // zoomEnabled={false}
                // scrollEnabled={false}
                // pitchEnabled={false}
                // rotateEnabled={false}
                // @ts-ignore
                customMapStyle={mapStyle}
              >

              {/* Map markers  */}
              {this.props.publicPlaceList.map((marker, index) => {
                return (
                <PublicPlaces
                  index={index}
                  coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                  publicPlaceList={this.props.publicPlaceList}
                  functions={ {'onNodeSelected': this.onNodeSelected} }
                  visible={this.state.publicNodesVisible}
                  nodeId={this.state.selectedNode}
                />
                );
            })}
              <PublicPeople publicPersonList={this.props.publicPersonList} functions={ {'onNodeSelected': this.onNodeSelected} }
              visible={this.state.publicNodesVisible} />
              <PrivatePlaces privatePlaceList={this.props.privatePlaceList} functions={ {'onNodeSelected': this.onNodeSelected} } />
              <PrivatePeople privatePersonList={this.props.privatePersonList} functions={ {'onNodeSelected': this.onNodeSelected} } />
              <Friends friendList={this.props.friendList} functions={ {'onNodeSelected': this.onNodeSelected} } />

      </MapView>
      <View style={styles.mapBuffer} />
      <View style={{top: '10%', width: '90%', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'center', flexDirection: 'row'}}>
        <View style={{padding: 10}}>
          <Button
            icon={{
              name: 'menu',
              type: 'feather',
              size: 30,
              underlayColor: 'rgba(44,55,71, 0.7)',
              color: '#ffffff',
            }}
            onPress={() => { this.props.navigation.navigate('DrawerToggle'); } }
            style={styles.refreshButton}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.transparentButton}
            title=''
            />
          {/* <Switch
            style={styles.center}
            value={!this.props.publicNodesVisible}
            onValueChange={ () => { this.togglePublicVisible(); } }
          /> */}
        </View>
          <View style={{padding: 10}}>
          <Button
            icon={{
              name: 'search',
              size: 30,
              color: '#ffffff',
            }}
            style={styles.nodeButton}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.transparentButton}
            title=''
            onPress={() => { this.navigateToPage('Nodes'); }
            }
          />
          </View>
        </View>
        {
        !this.state.nodeSelected &&
        <View style={{flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', padding: 30, alignSelf: 'flex-end', bottom: 0, position: 'absolute'}}>
        <Button
            icon={{
              name: 'refresh',
              size: 35,
              color: '#ffffff',
            }}
            style={styles.nodeButton}
            containerStyle={styles.bottomButtonContainer}
            buttonStyle={styles.transparentButton}
            title=''
            onPress={this.refreshNodes}
          />
          <Button
            icon={{
              name: 'location-searching',
              size: 35,
              color: '#ffffff',
            }}
            style={styles.nodeButton}
            containerStyle={styles.bottomButtonContainer}
            buttonStyle={styles.transparentButton}
            title=''
            onPress={this.zoomToUserLocation}
          />
          <Button
            icon={{
              name: 'add',
              size: 35,
              color: '#ffffff',
            }}
            style={styles.nodeButton}
            containerStyle={styles.bottomButtonContainer}
            buttonStyle={styles.transparentButton}
            title=''
            onPress={() => { this.navigateToPage('CreateNode');
            }}
          />
          {/* <Button
            icon={{
              name: 'message-circle',
              type: 'feather',
              size: 30,
              color: '#ffffff',
            }}
            style={styles.nodeButton}
            containerStyle={styles.bottomButtonContainer}
            buttonStyle={styles.transparentButton}
            title=''
            onPress={() => { this.props.navigation.navigate('Chat', {action: 'general_chat'}); } }
          /> */}
          </View>
        }

        </View>
          // End map view
        }

        {
          // Node selected view
          this.state.nodeSelected &&
          <View>
          {
            this.state.selectedNode.nodeType === 'friend' ?
            <Person
              nodeId={this.state.selectedNode.data.node_id}
              nodeType={ this.state.selectedNode.nodeType }
              topic={this.state.selectedNode.data.topic}
              ttl={this.state.selectedNode.data.ttl}
              origin={this.props.userRegion}
              destination={this.state.selectedNode.data}
              navigation={this.props.navigation}
            />
            :
            <Animated.ScrollView
              horizontal
              scrollEventThrottle={1}
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH}
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {
                        x: this.animation,
                      },
                    },
                  },
                ],
                { useNativeDriver: true },
              )}
              style={styles.scrollView}
              contentContainerStyle={styles.endPadding}
            >
            {this.props.publicPlaceList.map((marker, index) => (
            <Node
              key={index}
              nodeId={marker.data.node_id}
              nodeType={ marker.nodeType }
              topic={marker.data.topic}
              ttl={marker.data.ttl}
              origin={marker.userRegion}
              destination={marker.data}
              navigation={this.props.navigation}
              likes={marker.data.likes}
            />
            ))}
            </Animated.ScrollView>
          }
          </View>
          // End node selected view
        }

      </GestureRecognizer>
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

  private async gotNewFriendList(props: IFriendListUpdated) {
    await this.props.FriendListUpdated(props.friendList);
  }

  private async refreshNodes() {
    this.nodeService.CheckNow();

    Snackbar.show({
      title: 'Updating node list.',
      duration: Snackbar.LENGTH_SHORT,
    });
  }

  private navigateToPage(pageName: string) {
    let params = undefined;

    switch (pageName) {
      case 'Nodes':
        params = {};
        break;
      case 'CreateNode':
        params = {action: 'create_node', userRegion: this.props.userRegion};
        break;
      case 'ContactList':
        params = {action: 'add_friend', userRegion: this.props.userRegion};
        break;
      case 'Finder':
        params = {
          action: 'find_node', userRegion: this.props.userRegion,
          nodeId: this.state.selectedNode.data.node_id,
          nodeType: this.state.selectedNode.nodeType,
        };
        break;
      default:
        console.log('Page not found');
    }

    this.props.navigation.navigate({key: pageName, routeName: pageName, params: params});
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
    friendList: state.friendList,
    userRegion: state.userRegion,
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    PublicPersonListUpdated: bindActionCreators(PublicPersonListUpdatedActionCreator, dispatch),
    PublicPlaceListUpdated: bindActionCreators(PublicPlaceListUpdatedActionCreator, dispatch),
    PrivatePersonListUpdated: bindActionCreators(PrivatePersonListUpdatedActionCreator, dispatch),
    PrivatePlaceListUpdated: bindActionCreators(PrivatePlaceListUpdatedActionCreator, dispatch),
    FriendListUpdated: bindActionCreators(TrackedFriendListUpdatedActionCreator, dispatch),
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
  mapView: {
    flex: 14,
  },
  headerView: {
    flex: 1,
    zIndex: 3,
    padding: 10,
  },
  mapBuffer: {
    position: 'absolute',
    backgroundColor: 'black',
    left: 0,
    top: 0,
    opacity: 0.0,
    height: Dimensions.get('window').height,
    width: 20,
  },
  nodeSelectedView: {
    padding: 0,
    flexDirection: 'column',
    marginTop: 0,
    position: 'absolute',
    bottom: 10,
    left: 0,
    height: 300,
    width: '100%',
    zIndex: 1,
  },
  personSelectedView: {
    flexDirection: 'column',
    position: 'absolute',
    bottom: 0,
    height: 100,
    width: '100%',
    zIndex: 1,
  },
  actionButtonIcon: {
    fontSize: 22,
    height: 22,
    color: 'white',
  },
  buttonItem: {
    width: 100,
  },
  absolute: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0, right: 0,
  },
  refreshButton: {
    width: '100%',
    height: '100%',
    alignSelf: 'flex-start',
    padding: 0,
  },
  locationButton: {
    width: '100%',
    height: '100%',
    alignSelf: 'flex-start',
    padding: 0,
  },
  createNodeButton: {
    width: '100%',
    height: '100%',
    alignSelf: 'flex-start',
    padding: 0,
  },
  nodeButton: {
    width: '100%',
    height: '100%',
    padding: 0,
  },
  buttonContainer: {
    backgroundColor: 'rgba(44,55,71,.5)',
    width: 50,
    height: 50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'gray',
  },
  bottomButtonContainer: {
    backgroundColor: 'rgba(44,55,71,.5)',
    width: 50,
    height: 50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'gray',
    marginVertical: 10,
  },
  floatRight: {
    backgroundColor: 'rgba(44,55,71,0.0)',
    padding: 0,
    width: '15%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'gray',
    position: 'absolute',
    right: 70,
  },
  center: {
    marginTop: 20,
    backgroundColor: 'rgba(44,55,71,0.0)',
    padding: 0,
    width: '10%',
    height: '100%',
    borderRightWidth: 0,
    borderRightColor: 'rgba(44,55,71,0.3)',
    position: 'absolute',
    borderRadius: 20,
    right: 25,
  },
  transparentButton: {
    backgroundColor: 'rgba(44,55,71,0.0)',
    paddingTop: 8,
  },
  switch: {
    backgroundColor: 'white',
    paddingTop: 20,
    margin: 10,
    // marginLeft: '20%',
    alignSelf: 'center',
  },
  scrollView: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  endPadding: {
    paddingRight: width - CARD_WIDTH,
  },
});
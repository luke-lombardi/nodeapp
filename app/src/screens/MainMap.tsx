import React, { Component } from 'react';
import { View, Dimensions, Animated, Alert, AsyncStorage } from 'react-native';
// @ts-ignore
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';

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
import PaymentModal from '../components/PaymentModal';
import Tour from '../components/Tour';

const { width, height } = Dimensions.get('window');
// @ts-ignore
const CARD_HEIGHT = height / 4;
// @ts-ignore
const CARD_WIDTH = width;

interface IProps {
    functions: any;
    navigation: any;
    publicNodesVisible: boolean;
    publicPersonList: Array<any>;
    publicPlaceList: Array<any>;
    privatePersonList: Array<any>;
    privatePlaceList: Array<any>;
    friendList: Array<any>;
    userRegion: any;
    wallet: any;

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
  nodeSelected: boolean;
  selectedNode: any;
  confirmModalVisible: boolean;
  tourModalVisible: boolean;
  destination: any;
  selectedNodeIndex: number;
  direction: number;
  paymentModalVisible: boolean;
  tourViewed: boolean;
  blacklist: any;
}

export class MainMap extends Component<IProps, IState> {
  timerID: number;
  _map: any;
  _scrollView: any;
  currentMarkerRegion: any;
  selectedNodeType: string;
  selectedNode: string;
  selectedNodeIndex: number;
  index: number;
  animation: any;
  regionTimeout: any;

  // @ts-ignore
  private nodeService: NodeService;

  constructor(props: IProps) {
    super(props);

    this.zoomToUserLocation = this.zoomToUserLocation.bind(this);
    this.animateToNodeLocation = this.animateToNodeLocation.bind(this);
    this.refreshNodes = this.refreshNodes.bind(this);

    this.onNodeSelected = this.onNodeSelected.bind(this);
    this.clearSelectedNode = this.clearSelectedNode.bind(this);

    this.gotNewPublicPersonList = this.gotNewPublicPersonList.bind(this);
    this.gotNewPublicPlaceList = this.gotNewPublicPlaceList.bind(this);
    this.gotNewPrivatePersonList = this.gotNewPrivatePersonList.bind(this);
    this.gotNewPrivatePlaceList = this.gotNewPrivatePlaceList.bind(this);
    this.gotNewFriendList = this.gotNewFriendList.bind(this);
    this.showPaymentModal = this.showPaymentModal.bind(this);
    this.closePaymentModal = this.closePaymentModal.bind(this);
    this.showTourModal = this.showTourModal.bind(this);
    this.closeTourModal = this.closeTourModal.bind(this);
    this.checkTour = this.checkTour.bind(this);
    this.navigateToPage = this.navigateToPage.bind(this);
    this.getNodeListToSearch = this.getNodeListToSearch.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.getBlacklist = this.getBlacklist.bind(this);

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
    this.selectedNodeIndex = this.props.navigation.getParam('nodeIndex', undefined);

    this.currentMarkerRegion = markerRegion;
    this.waitForUserPosition = this.waitForUserPosition.bind(this);

    this.setSelectedNode = this.setSelectedNode.bind(this);
    this.onSwipeLeft = this.onSwipeLeft.bind(this);
    this.onSwipeRight = this.onSwipeRight.bind(this);

    this.state = {
      lastLat: '0.0',
      lastLong: '0.0',
      mapRegion: {},
      nodeSelected: false,
      selectedNode: {},
      selectedNodeIndex: this.selectedNodeIndex === undefined ? 0 : this.selectedNodeIndex,
      confirmModalVisible: false,
      tourModalVisible: false,
      paymentModalVisible: false,
      tourViewed: true,
      blacklist: [],
      destination: {
        latitude: '',
        longitude: '',
      },
      direction: -1 * CARD_WIDTH,
    };
  }

  componentDidMount() {
    this.getBlacklist();
    // start listening for scrollview events
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

    let didAnimate: boolean = this.animateToNodeLocation();
    if (didAnimate) {
      return;
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
          // console.log(error);
        }
      }, 5);
    }
  }

  async getBlacklist() {
    let blacklist: any = await AsyncStorage.getItem('blacklist');

    if (blacklist !== null) {
      blacklist = JSON.parse(blacklist);
    } else  {
      blacklist = [];
    }

    await this.setState({blacklist: blacklist});
    console.log('this.state.blacklist', this.state.blacklist);
  }

 animateToNodeLocation() {
    // If we are coming from any of the node lists, a current marker region will have been passed in, so open the Node
    if (this.selectedNodeIndex !== undefined) {
      let nodeListToSearch = this.getNodeListToSearch();
      let selectedNode = undefined;

      try {
        selectedNode = nodeListToSearch[this.selectedNodeIndex];
      } catch (error) {
        return false;
      }

      // If we found the node in the list, move the map location to the node location
      if (selectedNode) {

        this.setState({
          selectedNode: selectedNode,
          nodeSelected: true,
          selectedNodeIndex: this.selectedNodeIndex,
        });

        try {
          selectedNode.nodeType = this.selectedNodeType;
        } catch (error) {
          // If we got here, we unmounted
          // console.log(error);
        }

        setTimeout(() => {
          try {
            this._map.animateToRegion({
              latitude: selectedNode.data.latitude,
              longitude: selectedNode.data.longitude,
              latitudeDelta: 0.00122 * 1.5,
              longitudeDelta: 0.00121 * 1.5,
            }, 300);
          } catch (error) {
            // If we got here, we unmounted
            // console.log(error);
          }
        }, 5);

        return true;
      }
    }

    return false;
  }

  async setSelectedNode(index: number) {
    await this.setState({ selectedNodeIndex: index });
  }

  async animateToNode() {
    try {
      this.setSelectedNode(this.state.selectedNodeIndex);
    } catch (error) {
      // Component unmounted, do nothing
      return;
    }

    try {
      clearTimeout(this.regionTimeout);

      this.regionTimeout = setTimeout(() => {
        if (this.selectedNodeIndex !== this.state.selectedNodeIndex) {
          this.selectedNodeIndex = this.state.selectedNodeIndex;

          let node = this.props.publicPlaceList[this.state.selectedNodeIndex];

          this._map.animateToRegion(
            {
              latitudeDelta: 0.00122 * 1.5,
              longitudeDelta: 0.00121 * 1.5,
              latitude: node.data.latitude,
              longitude: node.data.longitude,
            },
            100,
          );
        }
      }, 10);
    } catch (error) {
      // Component unmounted, do nothing
      return;
    }

}

  componentWillMount() {
    this.checkTour();
    // set the index for the horizontal node list
    this.index = 0;
    this.animation = new Animated.Value(0);

    let shouldUpdate = this.props.navigation.getParam('updateNodes', false);

    if (shouldUpdate) {
      this.nodeService.CheckNow();
    }
  }

  componentWillUnmount() {
    //
  }

  async waitForUserPosition() {

    while (this.props.userRegion.latitude === undefined) {
      await SleepUtil.SleepAsync(1);
    }

    try {
      this._map.animateToRegion(this.props.userRegion, 100);
    } catch (error) {
      // If we get this, we unmounted
      // console.log(error);
    }
  }

  zoomToUserLocation() {
    try {
      this._map.animateToRegion(this.props.userRegion, 100);
      this.clearSelectedNode({nativeEvent: {action: ''}});
    } catch (error) {
      // If we get this, we unmounted
      // console.log(error);
    }
  }

   async onNodeSelected(e, nodeType) {
    const coordinate = e.nativeEvent.coordinate;
    this.selectedNodeType = nodeType;
    let nodeListToSearch = this.getNodeListToSearch();

    const marker = nodeListToSearch.find(
      m => parseFloat(m.data.latitude) === coordinate.latitude && parseFloat(m.data.longitude) === coordinate.longitude,
    );

    const nodeIndex = nodeListToSearch.findIndex(
      m => parseFloat(m.data.latitude) === coordinate.latitude && parseFloat(m.data.longitude) === coordinate.longitude,
    );

    if (marker) {
      marker.nodeType = nodeType;

      this.selectedNodeIndex = nodeIndex;

      await this.setState({
        selectedNode: marker,
        selectedNodeIndex: nodeIndex,
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
      this.setState({nodeSelected: false, selectedNode: undefined});
      return;
    }
  }

  getNodeListToSearch() {
    let nodeListToSearch = undefined;

    switch (this.selectedNodeType) {
      case 'publicPerson':
        nodeListToSearch = this.props.publicPersonList;
        break;
      case 'publicPlace':
        nodeListToSearch = this.props.publicPlaceList.filter(node => !this.state.blacklist.includes(node.data.node_id));
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

  async checkTour() {
    let tourViewed = await AsyncStorage.getItem('tourViewed');
    if (tourViewed !== 'true') {
      this.setState({tourViewed: false});
    }
  }

  async showTourModal() {
    await this.setState({tourModalVisible: true});
  }

  async closeTourModal() {
    await AsyncStorage.setItem('tourViewed', 'true');
    await this.setState({
      tourModalVisible: false,
      tourViewed: true,
    });
  }

  async showPaymentModal() {
    if (this.props.wallet.address !== undefined && this.state.selectedNode.data.wallet !== undefined
      && (this.state.selectedNode.data.wallet !== this.props.wallet.address)) {
      await this.setState({
        paymentModalVisible: true,
        nodeSelected: false,
      });
    } else if (this.props.wallet.address === undefined) {
      Alert.alert(`You need a wallet hooked up to send funds.`);
    } else if (this.state.selectedNode.data.wallet === undefined) {
      Alert.alert(`This node has no wallet attached to it.`);
    } else if (this.state.selectedNode.data.wallet === this.props.wallet.address) {
      Alert.alert(`You can't send funds to yourself.`);
    }
  }

  async closePaymentModal() {
    await this.setState({
      paymentModalVisible: false,
      nodeSelected: true,
    });
  }

  // @ts-ignore
  async onSwipeRight(state) {
    await this.setState({ direction: 1 * CARD_WIDTH} );
    this.selectedNodeIndex = this.state.selectedNodeIndex + 1;

    if (this.selectedNodeIndex >= this.props.publicPlaceList.length) {
      this.selectedNodeIndex = this.props.publicPlaceList.length - 1;
    }

    this.animateToNodeLocation();
  }

  // @ts-ignore
  async onSwipeLeft(state) {
    await this.setState({ direction: -1 * CARD_WIDTH} );
    this.selectedNodeIndex = this.state.selectedNodeIndex - 1;

    if (this.selectedNodeIndex <= 0) {
      this.selectedNodeIndex = 0;
    }

    this.animateToNodeLocation();
  }

  render() {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };

    return (
      // Map screen view (exported component)
      <View style={styles.mainView} >
      {
        this.state.paymentModalVisible &&
        <PaymentModal
          functions={{
            'showPaymentModal': this.showPaymentModal,
            'closePaymentModal': this.closePaymentModal,
          }}
          wallet={this.state.selectedNode.data.wallet}
          toUser={this.state.selectedNode.data.creator}
          balanceUSD={this.props.wallet.balance_usd}
        />
      }
      {
        this.state.tourModalVisible &&
        <Tour
          functions={{
            'showTourModal': this.showTourModal,
            'closeTourModal': this.closeTourModal,
          }}
        />
      }
          {
            // Main map view
            <View style={styles.mapView}>
              <MapView
                provider='google'
                ref={ component => { this._map = component; } }
                style={ StyleSheet.absoluteFillObject }
                showsUserLocation={true}
                followsUserLocation={false}
                showsIndoorLevelPicker={false}
                onPress={this.clearSelectedNode}
                // zoomEnabled={false}
                // scrollEnabled={false}
                // pitchEnabled={false}
                // rotateEnabled={false}
                customMapStyle={mapStyle}
              >
              {/* swipe buffer to let user open sidebar menus */}
              <View style={{ zIndex: 10, position: 'absolute', top: 0, bottom: 0, right: 0, left: width - 20, backgroundColor: 'transparent' }}></View>
              <View style={{ zIndex: 10, position: 'absolute', top: 0, bottom: 0, right: width - 20, left: 0, backgroundColor: 'transparent' }}></View>

              {/* Map markers  */}
              <PublicPlaces publicPlaceList={this.props.publicPlaceList} functions={ {'onNodeSelected': this.onNodeSelected} } nodeId={this.state.selectedNode} />
              <PublicPeople publicPersonList={this.props.publicPersonList} functions={ {'onNodeSelected': this.onNodeSelected} } />
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
            onPress={() => { this.props.navigation.toggleLeftDrawer(); } }
            style={styles.refreshButton}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.transparentButton}
            title=''
            />
        </View>
        {
          !this.state.tourViewed &&
          <View style={{padding: 10}}>
            <Button
              style={styles.nodeButton}
              containerStyle={styles.helpButtonContainer}
              buttonStyle={styles.helpTransparentButton}
              title='about'
              onPress={async () => { await this.showTourModal(); }
              }
            />
          </View>
        }
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
        (!this.state.nodeSelected) &&
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
              name: 'message-circle',
              type: 'feather',
              size: 30,
              color: '#ffffff',
            }}
            style={styles.nodeButton}
            containerStyle={styles.bottomButtonContainer}
            buttonStyle={styles.transparentButton}
            title=''
            onPress={() => {  this.props.navigation.toggleRightDrawer(); } }
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
        </View>
        }
      {/* */}
        </View>
          // End map view
        }

        {
          // Node selected view
          this.state.nodeSelected &&
          <View>
          {
            this.state.selectedNode.nodeType === 'friend' ?
            <View style={styles.personSelectedView}>
              <Person
                functions={{
                  'showPaymentModal': this.showPaymentModal,
                }}
                nodeId={this.state.selectedNode.data.node_id}
                nodeType={ this.state.selectedNode.nodeType }
                topic={this.state.selectedNode.data.topic}
                ttl={this.state.selectedNode.data.ttl}
                origin={this.props.userRegion}
                destination={this.state.selectedNode.data}
                navigation={this.props.navigation}
                data={this.state.selectedNode}
              />
            </View>
            :
            <GestureRecognizer
            onSwipeLeft={async (state) => { await this.onSwipeLeft(state); } }
            onSwipeRight={async (state) => { await this.onSwipeRight(state); } }
            config={config}
            style={styles.nodeSelectedView}
            >
              <Node
                functions={{
                  'showPaymentModal': this.showPaymentModal,
                }}
                data={this.props}
                index={this.state.selectedNodeIndex}
                nodeId={this.state.selectedNode.data.node_id}
                nodeType={this.state.selectedNode.nodeType}
                topic={this.state.selectedNode.data.topic}
                ttl={this.state.selectedNode.data.ttl}
                origin={this.props.userRegion}
                destination={this.state.selectedNode.data}
                navigation={this.props.navigation}
                likes={this.state.selectedNode.data.likes}
                direction={this.state.direction}
              />
            </GestureRecognizer>
          }
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

  private async gotNewFriendList(props: IFriendListUpdated) {
    await this.props.FriendListUpdated(props.friendList);
  }

  private async refreshNodes() {
    this.nodeService.CheckNow();

    Snackbar.show({
      title: 'updating node list.',
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
        // console.log('Page not found');
    }

    NavigationService.reset(pageName, params);
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
    wallet: state.wallet,
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
    flexDirection: 'column',
    marginTop: 0,
    position: 'absolute',
    bottom: 20,
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
  helpButtonContainer: {
    backgroundColor: 'rgba(44,55,71,.5)',
    paddingHorizontal: 10,
    height: 50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'gray',
  },
  helpTransparentButton: {
    backgroundColor: 'rgba(44,55,71,0.0)',
    paddingTop: 5,
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
});
import React, { Component } from 'react';
// @ts-ignore
import { View, AsyncStorage, Switch } from 'react-native';

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
import { FriendListUpdatedActionCreator } from '../actions/FriendActions';
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
import ApiService from '../services/ApiService';

// @ts-ignore
import Logger from '../services/Logger';
// import MapToolbar from '../components/MapToolbar';
import Node from '../components/Node';
import ConfirmModal from '../components/ConfirmModal';

// Import various types of map markers
import PublicPlaces from './markers/PublicPlaces';
import PrivatePlaces from './markers/PrivatePlaces';
import PublicPeople from './markers/PublicPeople';
import PrivatePeople from './markers/PrivatePeople';
import Friends from './markers/Friends';

import { mapStyle } from '../config/map';

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
  linkData: string;
}

export class MainMap extends Component<IProps, IState> {
  timerID: number;
  _map: any;
  currentMarkerRegion: any;
  selectedNodeType: string;

  // @ts-ignore
  private nodeService: NodeService;
  private apiService: ApiService;

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
      linkData: undefined,
    };

    this.zoomToUserLocation = this.zoomToUserLocation.bind(this);
    this.togglePublicVisible = this.togglePublicVisible.bind(this);
    this.closeCreateModal = this.closeCreateModal.bind(this);
    this.closeConfirmModal = this.closeConfirmModal.bind(this);
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

    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.confirmLink = this.confirmLink.bind(this);
    this.handleLink = this.handleLink.bind(this);
    this.openCreateModal = this.openCreateModal.bind(this);

    this.nodeService = new NodeService(
      {
        publicPersonListUpdated: this.gotNewPublicPersonList,
        publicPlaceListUpdated: this.gotNewPublicPlaceList,
        privatePersonListUpdated: this.gotNewPrivatePersonList,
        privatePlaceListUpdated: this.gotNewPrivatePlaceList,
        friendListUpdated: this.gotNewFriendList,
        currentUserRegion: this.props.userRegion,
    });

    this.apiService = new ApiService({});

    let markerRegion = this.props.navigation.getParam('region', undefined);
    this.selectedNodeType = this.props.navigation.getParam('nodeType', '');

    this.currentMarkerRegion = markerRegion;
    this.waitForUserPosition = this.waitForUserPosition.bind(this);

  }

  componentDidMount() {

    // If I've been invited to join a group, add a friend, or track a new node, show confirmation modal
    let showConfirmModal = this.props.navigation.getParam('showConfirmModal', false);
    if (showConfirmModal) {
      // Grab the data from the text message containing the type of action (join group, add friend, track node)
      let linkData = this.props.navigation.getParam('linkData', undefined);
      if (linkData !== undefined) {
        this.confirmLink(linkData);
      }
    }

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
    let shouldUpdate = this.props.navigation.getParam('updateNodes', false);

    if (shouldUpdate) {
      this.nodeService.CheckNow();
    }
  }

  async openCreateModal() {
    this.state.createModalVisible ?
    await this.setState({createModalVisible: false}) :
    await this.setState({createModalVisible: true});
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

  async closeCreateModal() {
    await this.setState({
      createModalVisible: false,
      linkData: undefined,
    });
  }

  async closeConfirmModal(userConfirmation: boolean, linkData: string) {
    await this.setState({confirmModalVisible: false});

    if (userConfirmation) {
      Logger.info(`MainMap.closeConfirmModal: User accepted link: ${linkData}`);
      this.handleLink(linkData);
    } else {
      Logger.info(`MainMap.closeConfirmModal: User rejected link: ${linkData}`);
    }
  }

  async confirmLink(linkData: string) {
    // Wait briefly so the animation shows properly
    await SleepUtil.SleepAsync(1000);

    await this.setState({
      confirmModalVisible: true,
      linkData: linkData,
    });
  }

  async handleLink(linkData: string) {
    Logger.info(`MainMap.handleLink: handling the following link data: ${linkData}`);

    let splitLinkData = linkData.split('/');

      let action = splitLinkData[0];

      if (action === 'join_group') {
        let groupId = splitLinkData[1];
        let memberId = splitLinkData[2];

        let currentUUID = await AsyncStorage.getItem('user_uuid');

        let groupData = {
          'user_uuid': currentUUID,
          'group_id': groupId,
          'member_id': memberId,
        };

        let newGroupId = await this.apiService.JoinGroupAsync(groupData);

        if (newGroupId !== undefined) {
          await this.nodeService.storeGroup(newGroupId);

          // Show success message
          Snackbar.show({
            title: 'Joined new group',
            duration: Snackbar.LENGTH_SHORT,
          });

        } else {

          // Show failure message
          Snackbar.show({
            title: 'Problem joining group',
            duration: Snackbar.LENGTH_SHORT,
          });
          Logger.info('MainMap.handleLink - invalid response from JoinGroupAsync.');
        }

      } else if (action === 'add_friend') {
        let relationId = splitLinkData[1];
        let memberId = splitLinkData[2];

        let currentUUID = await AsyncStorage.getItem('user_uuid');

        let groupData = {
          'user_uuid': currentUUID,
          'relation_id': relationId,
          'your_id': memberId,
        };

        let newRelation = await this.apiService.AcceptFriendAsync(groupData);

        if (newRelation !== undefined) {
          let newFriendId = newRelation.their_id;
          Logger.info(`MainMap.handleLink - response from AcceptFriendAsync: ${JSON.stringify(newRelation)}`);

          let exists = await this.nodeService.storeFriend(newFriendId);
          if (!exists) {
            Logger.info(`MainMap.handleLink - this is a new relation, storing: ${JSON.stringify(newRelation)}`);
            await this.nodeService.storeNode(newFriendId);

            // Show 'added new friend' message
            Snackbar.show({
              title: 'Added new friend',
              duration: Snackbar.LENGTH_SHORT,
            });
            return;
          }

            // Show 'already exists' message
            Snackbar.show({
              title: 'You have already added this friend',
              duration: Snackbar.LENGTH_SHORT,
            });

        } else {
          // Show success message
          Snackbar.show({
            title: 'Problem adding new friend',
            duration: Snackbar.LENGTH_SHORT,
          });

          Logger.info('MainMap.handleLink - invalid response from AcceptFriendAsync.');
        }
      // If we are adding a new node to tracked node list
      } else if (action === 'add_node') {
          let nodeId = splitLinkData[1];

          Logger.info('MainMap.handleLink - Adding a tracked node.');

          let exists = await this.nodeService.storeNode(nodeId);
          if (!exists) {

            // Show success message
            Snackbar.show({
              title: 'Added new node',
              duration: Snackbar.LENGTH_SHORT,
            });

            Logger.info(`MainMap.handleLink - this is a new node, storing: ${JSON.stringify(nodeId)}`);

            return;
          }

          // Show 'already exists' message
          Snackbar.show({
            title: 'You have already added this node',
            duration: Snackbar.LENGTH_SHORT,
          });
      }
    }

  render() {
    return (
      // Map screen view (exported component)
      <View style={styles.mainView}>
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
                // @ts-ignore
                customMapStyle={mapStyle}
              >

              {/* Map markers  */}
              <PublicPlaces publicPlaceList={this.props.publicPlaceList} functions={ {'onNodeSelected': this.onNodeSelected} }
              visible={this.state.publicNodesVisible} nodeId={this.state.selectedNode} />
              <PublicPeople publicPersonList={this.props.publicPersonList} functions={ {'onNodeSelected': this.onNodeSelected} }
              visible={this.state.publicNodesVisible} />
              <PrivatePlaces privatePlaceList={this.props.privatePlaceList} functions={ {'onNodeSelected': this.onNodeSelected} } />
              <PrivatePeople privatePersonList={this.props.privatePersonList} functions={ {'onNodeSelected': this.onNodeSelected} } />
              <Friends friendList={this.props.friendList} functions={ {'onNodeSelected': this.onNodeSelected} } />

              </MapView>
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
              name: 'home',
              size: 30,
              color: '#ffffff',
            }}
            style={styles.nodeButton}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.transparentButton}
            title=''
            onPress={() => { this.navigateToPage('Nodes');
            }}
          />
          </View>
        </View>
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
          </View>

              {/* <ActionButton
                  backdrop={<BlurView
                    // @ts-ignore
                    style={styles.absolute}
                    blurType='dark'
                    blurAmount={5}
                  />}
                  onPress={this.openCreateModal}
                  size={64}
                  spacing={40}
                  degrees={90}
                  buttonColor='rgba(153,51,255,0.7)'
                >
                <ActionButton.Item
                  style={styles.buttonItem}
                  buttonColor='gray'
                  textStyle={{fontSize: 22, color: 'white'}}
                  textContainerStyle={{top: 20, height: 50, backgroundColor: 'transparent', borderWidth: 0}}
                  title='Create Node'
                  onPress={() =>
                    this.navigateToPage('CreateNode')
                  }>
                  <Icon name='ios-pin' style={styles.actionButtonIcon} />
                </ActionButton.Item>
              </ActionButton> */}
            </View>
          // End map view
        }

        {
          // Node selected view
          this.state.nodeSelected &&
          <View style={styles.nodeSelectedView}>
            <Node
              nodeId={this.state.selectedNode.data.node_id}
              nodeType={ this.state.selectedNode.nodeType }
              topic={this.state.selectedNode.data.topic}
              ttl={this.state.selectedNode.data.ttl}
              origin={this.props.userRegion}
              destination={this.state.selectedNode.data}
              navigation={this.props.navigation}
              likes={this.state.selectedNode.data.likes}
            />
          </View>
          // End node selected view
        }

        {
          this.state.confirmModalVisible &&
          <ConfirmModal functions={{
            'closeConfirmModal': this.closeConfirmModal,
            'navigateToPage': this.navigateToPage,
          }}
          linkData={this.state.linkData}
          />
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
      case 'GroupEditor':
        params = {action: 'create_group', userRegion: this.props.userRegion};
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
    FriendListUpdated: bindActionCreators(FriendListUpdatedActionCreator, dispatch),
    UserPositionChanged: bindActionCreators(UserPositionChangedActionCreator, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainMap);
// End Redux setup functions
// Local styles
const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    zIndex: 2,
  },
  mapView: {
    zIndex: 1,
    flex: 14,
  },
  headerView: {
    flex: 1,
    zIndex: 2,
    padding: 10,
  },
  nodeSelectedView: {
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 0,
    flexDirection: 'column',
    // borderTopColor: 'rgba(44,55,71,0.3)',
    // borderTopWidth: 1,
    marginTop: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '35%',
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
});
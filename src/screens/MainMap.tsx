import React, { Component } from 'react';
import { View, Alert, TouchableOpacity } from 'react-native';
import {
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import MapView, { Marker}   from 'react-native-maps';
import Pulse from 'react-native-pulse';


import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { UserPositionChangedActionCreator } from '../actions/MapActions';

import { NodeListUpdatedActionCreator, VisitedNodeListUpdatedActionCreator } from '../actions/NodeActions';
import NodeService, { INodeListUpdated } from '../services/NodeService';

// custom components
import MapToolbar from '../components/MapToolbar';
import Node from '../components/Node';

// import mapStyle from '../config/mapStyle.json';

interface IProps {
    navigation: any,
    nodeList: Array<any>,
    visitedNodeList: Array<any>,
    userRegion: any,

    // Redux actions
    NodeListUpdated: (nodeList: Array<any>) => (dispatch: Dispatch<IStoreState>) => Promise<void>,
    UserPositionChanged: (userRegion: any) => (dispatch: Dispatch<IStoreState>) => Promise<void>,
}

interface IState {
  mapRegion: any,
  lastLat: string,
  lastLong: string,
  walletVisible: boolean,
  nodeSelected: boolean,
  selectedNode: any
}

export class MainMap extends Component<IProps, IState> {
  watchID : number;
  _map: any;
  currentMarkerRegion: any;

  // @ts-ignore
  private nodeService: NodeService;

  constructor(props: IProps){
    super(props);
    this.state = {
      lastLat: "0.0",
      lastLong: "0.0",
      mapRegion: {},
      walletVisible: false,
      nodeSelected: false,
      selectedNode: {}
    }

    this.zoomToUserLocation = this.zoomToUserLocation.bind(this);
    this.viewNodeList = this.viewNodeList.bind(this);
    this.toggleWallet = this.toggleWallet.bind(this);
    this.createNode = this.createNode.bind(this);
    this.goToCreateNode = this.goToCreateNode.bind(this);

    this.onNodeSelected = this.onNodeSelected.bind(this);
    this.clearSelectedNode = this.clearSelectedNode.bind(this);

    this.gotNewNodeList = this.gotNewNodeList.bind(this);

    this.componentWillMount = this.componentWillMount.bind(this);

    this.nodeService = new NodeService({nodeListUpdated: this.gotNewNodeList, currentUserRegion: this.props.userRegion});

    let markerRegion = this.props.navigation.getParam('region', {});
    this.currentMarkerRegion = markerRegion;
  }


  private async gotNewNodeList(props: INodeListUpdated) {
    await this.props.NodeListUpdated(props.nodeList);
  }

  componentDidMount(){
    this.watchID = navigator.geolocation.watchPosition((position) => {
        // Create the object to update this.state.mapRegion through the onRegionChange function
        let userRegion = {
          latitude:       position.coords.latitude,
          longitude:      position.coords.longitude,
          latitudeDelta:  0.00122*1.5,
          longitudeDelta: 0.00121*1.5
        }
        this.userPositionChanged(userRegion);
        this._map.animateToRegion(this.props.userRegion, 100);
    });

    if(this.currentMarkerRegion){
      let selectedNode = this.props.nodeList.find(
        m => parseFloat(m.data.latitude) === this.currentMarkerRegion.latitude && parseFloat(m.data.longitude) === this.currentMarkerRegion.longitude
      );
      
      if(selectedNode){
        this.currentMarkerRegion.latitudeDelta =  0.00122*1.5;
        this.currentMarkerRegion.longitudeDelta =  0.00121*1.5;
        this.setState({selectedNode: selectedNode});

        setTimeout(() => {
          this._map.animateToRegion(this.currentMarkerRegion, 100);
        }, 10)

        this.setState({nodeSelected: true});
        return;
      }
    }
    
    setTimeout(() => {
      // this.mapView && this.mapView.animateToRegion(this.region, 500)
      this._map.animateToRegion(this.props.userRegion, 100);
    }, 10);
    
  }

  async userPositionChanged(userRegion:any){
    await this.props.UserPositionChanged(userRegion);
  }


  componentWillMount(){
    let shouldUpdate = this.props.navigation.getParam('updateNodes', false);
  
    if(shouldUpdate){
      this.nodeService.CheckNow();
    }
  }

  // do not monitor the users current location when they are outside the map, for now
  componentWillUnmount(){
    navigator.geolocation.clearWatch(this.watchID);
    // stop monitoring the node list because other screens will initialize the same method
  }

  zoomToUserLocation(){    
    this._map.animateToRegion(this.props.userRegion, 100);
    this.clearSelectedNode({nativeEvent: {action: ''}});
  }

  viewNodeList(){
    this.props.navigation.navigate('Nodes');
  }

  onNodeSelected(e){
    const coordinate = e.nativeEvent.coordinate;
    const marker = this.props.nodeList.find(
      m => parseFloat(m.data.latitude) === coordinate.latitude && parseFloat(m.data.longitude) === coordinate.longitude
    );
    if (marker) {
      console.log('Found marker');
      this.setState({selectedNode: marker});
      this.setState({nodeSelected: true});
    }
  }

  clearSelectedNode(e){
    if(e.nativeEvent.action !== 'marker-press'){
      this.setState({nodeSelected: false});
      return;
    }
  }

  toggleWallet(){
    this.setState({walletVisible: !this.state.walletVisible});
  }

  createNode(){
    Alert.alert(
      'Create a new node',
      'Keep in mind that this is linked to your reputation.',
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Continue', onPress: this.goToCreateNode},
      ],
      { cancelable: false }
    )
  }

  private goToCreateNode(){
    this.props.navigation.navigate('Finder', {action: "create_node", userRegion: this.props.userRegion});
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
              toggleWallet: this.toggleWallet,
              viewNodeList: this.viewNodeList,
              updateNodeList: this.nodeService.CheckNow
            }} />
          </View> 
          // End main map toolbar
          }
          
        
          {
            // Main map view
            <View style={styles.mapView}>
              <MapView
                provider="google"
                ref={component => {this._map = component;}}
                style={StyleSheet.absoluteFillObject}
                showsUserLocation={true}
                followsUserLocation={true}
                showsIndoorLevelPicker={false}
                onMarkerPress={this.onNodeSelected}
                onPress={this.clearSelectedNode}
                // customMapStyle={mapStyle}
              >

              {
                this.props.nodeList.length != 0 && 
                this.props.nodeList.map(marker => (
                // TODO: have the API return the proper values, e.g. have the API do the parseFloat, not client side
                <Marker
                  coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                  title={marker.data.title}
                  pinColor={'purple'}
                  //pinColor={this.state.inactive  ? 'red' : 'purple'} TODO: DIFFERENT MARKER COLOR FOR NODE STATE
                  description={marker.data.description}
                  key={marker.id.toString()} // TODO: replace this with marker.id, which will be the same as node.id in the SQL table
                />
              ))}
              </MapView>

              <TouchableOpacity
                style={{
                    borderWidth:1,
                    borderColor:'rgba(44,55,71,0.3)',
                    alignItems:'center',
                    alignSelf: 'center',
                    justifyContent:'center',
                    width:80,
                    height:80,
                    backgroundColor:'rgba(255,255,255,0.9)',
                    borderRadius:100,
                    position:'absolute',
                    bottom: '5%'
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
              <Node title={this.state.selectedNode.data.title} description={this.state.selectedNode.data.description} navigation={this.props.navigation} />
          </View>
          // End node selected view
        }

     </View>
     // End map screen view (exported component)
    )
  }
};


// Redux setup functions
function mapStateToProps(state: IStoreState): IProps { 
  // @ts-ignore
  return {
    nodeList: state.nodeList,
    userRegion: state.userRegion,
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
    NodeListUpdated: bindActionCreators(NodeListUpdatedActionCreator, dispatch),
    VisitedNodeListUpdated: bindActionCreators(VisitedNodeListUpdatedActionCreator, dispatch),
    UserPositionChanged: bindActionCreators(UserPositionChangedActionCreator, dispatch)
  };
}



export default connect(mapStateToProps, mapDispatchToProps)(MainMap);
// End Redux setup functions
// Local styles
const styles = StyleSheet.create({
  mainView: {
    flex:1,
  },
  headerView: {
    flex:1,
    position: 'relative',
    zIndex: 2
  },
  walletView: {
    backgroundColor: '#rgba(255, 255, 255, 0.9)',
    padding: 0,
    flexDirection: 'column',
    borderBottomColor: 'rgba(44,55,71,0.3)',
    borderBottomWidth: 1,
    marginTop:5,
    position:'relative',
    top: 0,
    left: 0,
    height: '35%',
    width: '100%',
    zIndex: 1
  },
  nodeSelectedView: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 0,
    flexDirection: 'column',
    borderTopColor: 'rgba(44,55,71,0.3)',
    borderTopWidth: 1,
    marginTop:0,
    position:'absolute',
    bottom: 0,
    left: 0,
    height: '35%',
    width: '100%',
    zIndex: 1
  },
  mapView: {
    flex:14
  },
  createNodeButton: {

  }

});
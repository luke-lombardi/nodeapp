import React, { Component } from 'react';
// @ts-ignore
import {StyleSheet} from 'react-native';
import ResourceContainer from '../../resources/resources'


import {
    ViroARScene,
    // @ts-ignore
    ViroText, ViroBox, Viro3DObject, ViroARPlaneSelector, ViroAmbientLight, ViroSpotLight, ViroNode, ViroPolygon, ViroARPlane,

    ViroConstants,
    ViroMaterials,
  } from 'react-viro';
import SleepUtil from '../../services/SleepUtil';


// import Icon from 'react-native-vector-icons/FontAwesome';
interface IProps{
  sceneProps: any;
  
}

interface IState{
    isLoading: boolean;
    nodeDirection: number;
    pauseUpdates: boolean;
}

export default class NodeFinder extends Component<IProps, IState> {
  // @ts-ignore
  private resourceContainer: ResourceContainer;

  constructor(props: IProps){
    super(props);
    this.state = {
        isLoading: true,
        nodeDirection: 0.0,
        pauseUpdates: false
    };

    this.resourceContainer = new ResourceContainer();
    this._onInitialized = this._onInitialized.bind(this);

    this.createMaterials = this.createMaterials.bind(this);

    this.followUserPosition = this.followUserPosition.bind(this);

    // @ts-ignore
    this.createMaterials();
  }


  
  // @ts-ignore
  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        isLoading : false,
        pauseUpdates: false,
        // @ts-ignore
        nodeDirection: this.props.arSceneNavigator.viroAppProps.selectedNode.data.bearing
      });

      this.followUserPosition();

    } else if (state == ViroConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }


  private async followUserPosition(){
    while(true){
      // @ts-ignore
      let selectedNode = await this.props.arSceneNavigator.viroAppProps.updateSelectedNode();
      console.log(selectedNode.data.bearing);
      await this.setState({nodeDirection: selectedNode.data.bearing})
      await SleepUtil.SleepAsync(100);
    }
  }

  render() {
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized} >

         <ViroText text={this.state.nodeDirection.toString()} scale={[.5, .5, .5]} position={[0, 0, -1]} />
          
         <ViroAmbientLight color={"#aaaaaa"} />
         <ViroSpotLight innerAngle={5} outerAngle={90} direction={[0,-1,-.2]}
          position={[0, 3, 1]} color="#ffffff" castsShadow={true} />

          {/* <ViroARPlane minHeight={.4} minWidth={.4} alignment={"Horizontal"} pauseUpdates={this.state.pauseUpdates}> */}
            <Viro3DObject
              source={this.resourceContainer.getModel("arrow")}
              resources={[this.resourceContainer.getTexture("arrow")]}
              highAccuracyGaze={true}
              position={[0, -0.1, -1.0]}
              scale={[0.2, 0.2, 0.2]}
              rotation={[90, this.state.nodeDirection + 90, 0]}
              type="OBJ"
              />

          {/* </ViroARPlane>  */}
       
      </ViroARScene>
    )
  }


  private createMaterials(){
    ViroMaterials.createMaterials({
        grid: {
            diffuseTexture: this.resourceContainer.getImage('grid_bg')
        }
    });
  }

};

// @ts-ignore
var styles = StyleSheet.create({
  
});
   



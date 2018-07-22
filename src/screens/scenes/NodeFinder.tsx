import React, { Component } from 'react';
// @ts-ignore
import {StyleSheet} from 'react-native';
import ResourceContainer from '../../resources/resources'


import {
    ViroARScene,
    // @ts-ignore
    ViroText, ViroBox, Viro3DObject, ViroARPlaneSelector, ViroAmbientLight, ViroSpotLight, ViroNode, ViroPolygon, ViroARPlane, ViroSpinner,
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
    inView: boolean;
}

export default class NodeFinder extends Component<IProps, IState> {
  // @ts-ignore
  private resourceContainer: ResourceContainer;
  // @ts-ignore
  private scene: any;

  constructor(props: IProps){
    super(props);
    this.state = {
        isLoading: true,
        nodeDirection: 0.0,
        pauseUpdates: false,
        inView: false
    };

    this.resourceContainer = new ResourceContainer();
    this._onInitialized = this._onInitialized.bind(this);
    this._setScene = this._setScene.bind(this);

    this.createMaterials = this.createMaterials.bind(this);

    this.followUserPosition = this.followUserPosition.bind(this);

    this.scene = null;

    // @ts-ignore
    this.createMaterials();
  }

  _setScene(ref) {
    this.scene = ref;
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
      // console.log(selectedNode.data.bearing);
      await this.setState({nodeDirection: selectedNode.data.bearing});
      
      if((selectedNode.data.bearing < 20 && selectedNode.data.bearing > -20) || (selectedNode.data.bearing > 340 && selectedNode.data.bearing < 360)){
        await this.setState({inView: true});
      }
      else{
        await this.setState({inView: false});
      }

      // await this.scene.getCameraOrientationAsync();
      await SleepUtil.SleepAsync(100);
    }
  }

  render() {
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized} ref={this._setScene}>

         <ViroText text={this.state.nodeDirection.toString()} scale={[.5, .5, .5]} position={[0, 0, -1]} />
        
        { this.state.isLoading && 
         <ViroSpinner 
            type='light'
            position={[0, 0, -2]}
        />
        }
          
         <ViroAmbientLight color={"#aaaaaa"} />
         <ViroSpotLight innerAngle={5} outerAngle={90} direction={[0,-1,-.2]}
          position={[0, 3, 1]} color="#ffffff" castsShadow={true} />

          { !this.state.inView &&
            <Viro3DObject
              source={this.resourceContainer.getModel("arrow")}
              resources={[this.resourceContainer.getTexture("arrow")]}
              highAccuracyGaze={true}
              position={[0, -0.1, -0.75]}
              scale={[0.2, 0.2, 0.2]}
              rotation={[-180, this.state.nodeDirection + 90, 0]}
              type="OBJ"
              />
          }

             {/* <ViroARPlane minHeight={.4} minWidth={.4} alignment={"Horizontal"} pauseUpdates={this.state.pauseUpdates}> */}
              {/* <Viro3DObject
              source={this.resourceContainer.getModel("beam")}
              resources={[]}
              highAccuracyGaze={false}
              position={[0.0, -10.0, -10.0]}
              scale={[0.05, 0.05, 0.005]}
              rotation={[-90, 0, 0]}
              type="OBJ"
              opacity={0.3}
              /> */}
            {/* </ViroARPlane> */}

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
   



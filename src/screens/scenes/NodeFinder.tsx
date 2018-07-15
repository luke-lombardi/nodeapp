import React, { Component } from 'react';
// @ts-ignore
import {StyleSheet} from 'react-native';
import ResourceContainer from '../../resources/resources'


import {
    ViroARScene,
    // @ts-ignore
    ViroText, ViroBox, Viro3DObject, ViroARPlaneSelector, ViroAmbientLight, ViroSpotLight, ViroNode, ViroPolygon,
    ViroConstants,
    ViroARPlane,
    ViroMaterials,
  } from 'react-viro';


// import Icon from 'react-native-vector-icons/FontAwesome';
interface IProps{
  sceneProps: any;
  
}

interface IState{
    isLoading: boolean;
}

export default class NodeFinder extends Component<IProps, IState> {
  // @ts-ignore
  private resourceContainer: ResourceContainer;
  
  constructor(props: IProps){
    super(props);
    this.state = {
        isLoading: true,
    };

    console.log('Passing in these props...');
    // @ts-ignore
    console.log(this.props.arSceneNavigator.viroAppProps);

    this.resourceContainer = new ResourceContainer();
    this._onInitialized = this._onInitialized.bind(this);
    this.createMaterials = this.createMaterials.bind(this);
    this.calculateRotation = this.calculateRotation.bind(this);

    this.createMaterials();
  }


  
  // @ts-ignore
  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        isLoading : false
      });
    } else if (state == ViroConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }

  private calculateRotation(){
    
  }

  render() {
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized} >

        <ViroARPlane minHeight={.5} minWidth={.5} alignment={"Horizontal"}>
            <ViroPolygon rotation={[-90, 45, 0]}
                position={[0,0,0]}
                vertices={[[-1,0], [0,1], [1,0]]}
                scale={[.2, .2, .2]}
                materials={"grid"}/>
        </ViroARPlane>
       
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
   



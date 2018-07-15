import React, { Component } from 'react';
import {StyleSheet} from 'react-native';
import ResourceContainer from '../../resources/resources'


import {
    ViroARScene,
    // @ts-ignore
    ViroText, ViroBox, Viro3DObject, ViroARPlaneSelector,
    ViroAmbientLight,
    ViroSpotLight,
    ViroConstants,
    ViroMaterials,
    ViroNode
  } from 'react-viro';


// import Icon from 'react-native-vector-icons/FontAwesome';
interface IProps{
  functions: any;
}

interface IState{
    text: string;
}

export default class DemoScene extends Component<IProps, IState> {
    
  private resourceContainer: ResourceContainer;
  
  constructor(props: IProps){
    super(props);
    this.state = {
        text: ""
    };

    this.resourceContainer = new ResourceContainer();
    this._onInitialized = this._onInitialized.bind(this);
    this.createMaterials = this.createMaterials.bind(this);

  }

  
  // @ts-ignore
  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        text : "Hello World!"
      });
    } else if (state == ViroConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }

  render() {
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized} >
    
        { /* <ViroText text={this.state.text} scale={[.5, .5, .5]} position={[0, 0, -1]} style={styles.helloWorldTextStyle} /> */ }
         {/* <ViroBox position={[0, -.5, -1]} scale={[.3, .3, .1]} materials={["emoji_smile_diffuse"]} /> */}

        <ViroAmbientLight color={"#aaaaaa"} />
        <ViroSpotLight innerAngle={5} outerAngle={90} direction={[0,-1,-.2]}
          position={[0, 3, 1]} color="#ffffff" castsShadow={true} />
        
        {/* <ViroARPlaneSelector> */}
        <ViroNode position={[0,-1,0]} dragType="FixedToWorld" onDrag={()=>{}} >
          <Viro3DObject
              source={this.resourceContainer.getModel('emoji_smile')}
              resources={[
                  this.resourceContainer.getTexture('emoji_smile_diffuse'),
                  this.resourceContainer.getTexture('emoji_smile_normal'),
                  this.resourceContainer.getTexture('emoji_smile_specular')
              ]}
              position={[0.0, .5, 0.0]}
              scale={[.2, .2, .2]}
              type="VRX" />
        </ViroNode>

        {/* </ViroARPlaneSelector> */}

        {/* <ViroARPlaneSelector /> */}
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
    helloWorldTextStyle: {
       fontFamily: 'Arial',
       fontSize: 30,
       color: '#ffffff',
       textAlignVertical: 'center',
       textAlign: 'center',
     },
   });
   



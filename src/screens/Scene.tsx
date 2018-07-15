import React, { Component } from 'react';
import {StyleSheet} from 'react-native';
import ImageContainer from '../images/images'


import {
    ViroARScene,
    // @ts-ignore
    ViroText,
    ViroBox,
    ViroConstants,
    ViroMaterials,
  } from 'react-viro';


// import Icon from 'react-native-vector-icons/FontAwesome';
interface IProps{
  functions: any;
}

interface IState{
    text: string;
}

export default class Scene extends Component<IProps, IState> {
    
  private imageContainer: ImageContainer;
  
  constructor(props: IProps){
    super(props);
    this.state = {
        text: ""
    };

    this.imageContainer = new ImageContainer();
    this._onInitialized = this._onInitialized.bind(this);
    this.createMaterials = this.createMaterials.bind(this);

    this.createMaterials();
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
        
        <ViroText text={this.state.text} scale={[.5, .5, .5]} position={[0, 0, -1]} style={styles.helloWorldTextStyle} />
        

        <ViroBox position={[0, -.5, -1]} scale={[.3, .3, .1]} materials={["grid"]} />

      </ViroARScene>
    )
  }

  private createMaterials(){
    ViroMaterials.createMaterials({
        grid: {
            diffuseTexture: this.imageContainer.getImage('grid_bg')
        },
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
   



import React, { Component } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Overlay } from 'react-native-elements'

// import { BlurView } from 'react-native-blur';

interface IProps{
}

export default class Loading extends Component<IProps> {
  
  render() {
    return (
      <View style={styles.mainView}>
        <Overlay
        overlayStyle={styles.overlay}
        isVisible={true}
        windowBackgroundColor="rgba(255, 255, 255, 0.1)" 
        overlayBackgroundColor="white"
        width="auto"
        height="auto"
        >
        <ActivityIndicator style={styles.indicator} size="large" color="#0000ff" animating={true}/>
        <Text style={styles.loadingText}>Loading...</Text>
        </Overlay>
        
    </View>
    )
  }
};

// render() {
//   return (
//     <View style={styles.mainView}>
//       <BlurView
//         style={styles.absolute}
//         blurType="light"
//         blurAmount={100}
//       />
//     <ActivityIndicator style={styles.indicator} size="large" color="#0000ff" animating={true}/>
//     </View>
//     )
//   }
// };

const styles = StyleSheet.create({
  mainView: {
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 5,
  },
  overlay: {
    marginBottom: 500,
    position: 'relative',
    borderRadius: 10,
    borderColor: 'rgba(44,55,71,0.1)',
    borderWidth: 1,
    width: '100%',
    height: '100%',
  },
  indicator: {
    marginTop: 150,
    padding: 75,
  },
  loadingText: {
    fontSize: 14,
    paddingBottom: 50,
    alignSelf: 'center',
  },
  // container: {
  //   zIndex: 5,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // absolute: {
  //   height: '100%',
  //   width: '100%',
  //   position: "absolute",
  //   top: 0, left: 0, bottom: 0, right: 0,
  // },
});
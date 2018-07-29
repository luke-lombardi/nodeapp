import React, { Component } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { Button } from 'react-native-elements';
// import Icon from 'react-native-vector-icons/FontAwesome';
interface IProps {
  functions: any;
}

interface IState{
  switchValue: boolean;
}

export default class MapToolbar extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      switchValue: false,
    };

    this.toggleSwitch = this.toggleSwitch.bind(this);

  }

  toggleSwitch() {
    if(this.state.switchValue) {
      this.setState({ switchValue: false });
      //this.props.functions.updateNodeList;
    }
    else {
      this.setState({ switchValue: true });
  }
}

  render() {
    return (
    <View style={styles.toolbarView}>
          <Button
            icon={{
              name: 'refresh',
              size: 35,
              color: 'rgba(44,55,71,1.0)'
            }}
            style={styles.refreshButton}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.transparentButton}
            title=''
            onPress={this.props.functions.updateNodeList}
          />
          <Button
            icon={{
              name: 'location-searching',
              size: 35,
              color: 'rgba(44,55,71,1.0)'
            }}
            style={styles.locationButton}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.transparentButton}
            title=''
            // @ts-ignore
            onPress={this.props.functions.zoomToUserLocation}
          />
          <Switch 
            style={styles.switch}
            value={this.state.switchValue}
            onValueChange={this.toggleSwitch}
          />

          <Button
            icon={{
              name: 'list',
              size: 35,
              color: 'rgba(44,55,71,1.0)'
            }}
            style={styles.nodeButton}
            containerStyle={styles.floatRight}
            buttonStyle={styles.transparentButton}
            title=''
            onPress={this.props.functions.viewNodeList}
          />

      </View>
    )
  }


};

// @ts-ignore
const styles = StyleSheet.create({
  toolbarView: {
    height: 50,
    backgroundColor: '#ffffff',
    padding: 0,
    flexDirection: 'row',
    borderBottomColor: 'rgba(44,55,71,0.3)',
    borderBottomWidth: 1,
  },
  refreshButton: {
    width:'100%',
    height:'100%',
    alignSelf:'flex-start',
    padding:0,
  },
  locationButton: {
    width:'100%',
    height:'100%',
    alignSelf:'flex-start',
    padding:0
  },
  createNodeButton: {
    width:'100%',
    height:'100%',
    alignSelf:'flex-start',
    padding:0
  },
  nodeButton: {
    width:'100%',
    height:'100%',
    padding:0
  },
  walletButton: {
    width:'100%',
    height:'100%',
    left: 20,
    marginTop: 5,
    padding:0
  },
  buttonContainer: {
    backgroundColor: 'rgba(44,55,71,0.0)',
    padding:0,
    width:'15%',
    height:'100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(44,55,71,0.3)',
  },
  floatRight: {
    backgroundColor: 'rgba(44,55,71,0.0)',
    padding:0,
    width:'15%',
    height:'100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(44,55,71,0.3)',
    position: 'absolute',
    right: 0,
  },
  center: {
    backgroundColor: 'rgba(44,55,71,0.0)',
    padding:0,
    width:'10%',
    height:'100%',
    borderRightWidth: 0,
    borderRightColor: 'rgba(44,55,71,0.3)',
    position:'absolute',
    right: '45%'
  },
  transparentButton: {
    backgroundColor: 'rgba(44,55,71,0.0)',
    paddingTop: 8,
  },
  switch: {
    paddingTop: 20,
    margin: 10,
    alignSelf: 'center',
  },
});
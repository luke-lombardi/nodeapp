import React, { Component } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { Button } from 'react-native-elements';

// import Icon from 'react-native-vector-icons/FontAwesome';
interface IProps {
  functions: any;
  publicNodesVisible: boolean;
}

interface IState {
}

export default class MapToolbar extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    return (
    <View style={styles.toolbarView}>

          <Switch
            style={styles.center}
            value={!this.props.publicNodesVisible}
            onValueChange={ () => { this.props.functions.toggleSwitch(); } }
          />
          <Button
            icon={{
              name: 'refresh',
              size: 35,
              color: 'rgba(44,55,71,1.0)',
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
              color: 'rgba(44,55,71,1.0)',
            }}
            style={styles.locationButton}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.transparentButton}
            title=''
            // @ts-ignore
            onPress={this.props.functions.zoomToUserLocation}
          />
          <Button
            icon={{
              name: 'list',
              size: 35,
              color: 'rgba(44,55,71,1.0)',
            }}
            style={styles.nodeButton}
            containerStyle={styles.floatRight}
            buttonStyle={styles.transparentButton}
            title=''
            onPress={() => { this.props.functions.navigateToPage('Nodes'); }}
          />

      </View>
    );
  }
}

// @ts-ignore
const styles = StyleSheet.create({
  toolbarView: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,1.0)',
    padding: 0,
    flexDirection: 'row',
    borderBottomColor: 'rgba(44,55,71,0.3)',
    borderBottomWidth: 1,
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
    backgroundColor: 'rgba(44,55,71,0.0)',
    padding: 0,
    width: '15%',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(44,55,71,0.3)',
  },
  floatRight: {
    backgroundColor: 'rgba(44,55,71,0.0)',
    padding: 0,
    width: '15%',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(44,55,71,0.3)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(44,55,71,0.3)',
    position: 'absolute',
    right: 70,
  },
  center: {
    marginTop: 10,
    backgroundColor: 'rgba(44,55,71,0.0)',
    padding: 0,
    width: '10%',
    height: '100%',
    borderRightWidth: 0,
    borderRightColor: 'rgba(44,55,71,0.3)',
    position: 'absolute',
    right: 25,
  },
  transparentButton: {
    backgroundColor: 'rgba(44,55,71,0.0)',
    paddingTop: 8,
  },
  switch: {
    paddingTop: 20,
    margin: 10,
    // marginLeft: '20%',
    alignSelf: 'center',
  },
});
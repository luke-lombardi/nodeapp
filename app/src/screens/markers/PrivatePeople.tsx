import React, { Component } from 'react';
import { Marker } from 'react-native-maps';

// @ts-ignore
import { Text, StyleSheet, View } from 'react-native';

// @ts-ignore
import Pulse from 'react-native-pulse';

interface IProps {
    privatePersonList: any;
    functions: any;
}

interface IState {
}

export default class PrivatePeople extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
        };
    }

    render() {
      return (
          this.props.privatePersonList.map(marker => (
            marker.node_id !== undefined ?
            <View key={marker.node_id}>
              <Marker
                  coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                  title={marker.data.topic}
                  // description={}
                  anchor={{ x: .5, y: .6 }}
                  onPress={(event) => {this.props.functions.onNodeSelected(event, 'privatePerson'); }}
                  key={marker.node_id}
              >
              </ Marker>
            </View>
            :
            undefined
          ))
      );
  }

}

// @ts-ignore
const styles = StyleSheet.create({
  callout: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: '#000',
    fontSize: 25,
    alignSelf: 'center',
  },
  description: {
    color: '#000',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 3,
    marginTop: 10,
  },
});
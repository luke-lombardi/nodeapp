import React, { Component } from 'react';
import { Marker } from 'react-native-maps';

// @ts-ignore
import { Text, StyleSheet, View } from 'react-native';
import Pulse from 'react-native-pulse';

interface IProps {
    friendList: any;
    functions: any;
}

interface IState {
}

export default class Friends extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
        };
    }

    render() {
      return (
          this.props.friendList.map(marker => (
          <Marker
              coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
              title={marker.data.title}
              pinColor={'purple'}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={(event) => {this.props.functions.onNodeSelected(event, 'friend'); }}
              // pinColor={this.state.inactive  ? 'red' : 'purple'} TODO: DIFFERENT MARKER COLOR FOR NODE STATE
              description={marker.data.description}
              key={marker.node_id}
          >
          <View style={styles.callout}>
            <Pulse color='orange' numPulses={1} diameter={60} speed={25} duration={3000} />
            {/* <Text style={styles.title}>{marker.data.topic}</Text> */}
          </View>
      </ Marker>

          ))
      );
  }
}

const styles = StyleSheet.create({
    callout: {
        position: 'relative',
        flex: 1,
        alignItems: 'center',
        height: 60,
        width: 60,
      },
      card: {
        backgroundColor: '#fff',
        borderRadius: 6,
        borderColor: 'black',
        borderWidth: 1,
        padding: 10,
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
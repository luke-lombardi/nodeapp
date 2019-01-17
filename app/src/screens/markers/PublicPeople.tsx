import React, { Component } from 'react';
import { Marker }   from 'react-native-maps';
import { View, StyleSheet, Text }   from 'react-native';
import Pulse from 'react-native-pulse';

interface IProps {
    publicPersonList: any;
    functions: any;
    visible: boolean;
}

interface IState {
}

export default class PublicPeople extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            this.props.visible &&
            this.props.publicPersonList.map(marker => (
            <Marker
                coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                title={marker.data.title}
                pinColor={'purple'}
                anchor={{ x: 0.5, y: 0.5 }}
                onPress={(event) => {this.props.functions.onNodeSelected(event, 'publicPerson'); }}
                // pinColor={this.state.inactive  ? 'red' : 'purple'} TODO: DIFFERENT MARKER COLOR FOR NODE STATE
                description={marker.data.description}
                key={marker.node_id}
            >
            <View style={styles.callout}>

            <Pulse color='orange' numPulses={1} diameter={400} speed={100} duration={200} />

            <Text style={styles.title}>{marker.data.title}</Text>
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
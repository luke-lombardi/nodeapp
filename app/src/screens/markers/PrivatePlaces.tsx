import React, { Component } from 'react';
import { Marker }   from 'react-native-maps';
import { Text, StyleSheet, View }   from 'react-native';

interface IProps {
    privatePlaceList: any;
    functions: any;
}

interface IState {
}

export default class PrivatePlaces extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            this.props.privatePlaceList.map(marker => (
              marker.node_id !== undefined ?
              <View key={marker.node_id}>
                <Marker
                    coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                    title={marker.data.title}
                    // description={}
                    anchor={{ x: .5, y: .6 }}
                    onPress={(event) => {this.props.functions.onNodeSelected(event, 'privatePlace'); }}
                    key={marker.node_id}
                >
                <View style={marker.data.total_messages === undefined ? styles.nullMarker : styles.markerText}>
                  <Text style={styles.markerTitle}>{marker.data.total_messages}</Text>
                </View>
                </ Marker>
              </View>
              :
              undefined
            ))
        );
    }
}

const styles = StyleSheet.create({
    markerText: {
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,153,51,0.4)',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'grey',
        width: 45,
        height: 45,
      },
      markerTitle: {
        alignSelf: 'center',
        justifyContent: 'center',
        padding: '10%',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
      },
      nullMarker: {
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,153,51,0.4)',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'grey',
        width: 45,
        height: 45,
      },
    callout: {
        position: 'relative',
        flex: 1,
        alignItems: 'center',
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
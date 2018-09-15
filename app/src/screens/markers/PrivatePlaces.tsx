import React, { Component } from 'react';
import { Marker, Callout }   from 'react-native-maps';
import { Image, Text, StyleSheet }   from 'react-native';

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
            // <View style={{overflow: 'hidden' }}>
            <Marker
                title={marker.data.title}
                coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                pinColor={'red'}
                anchor={{ x: 0.5, y: 0.5 }}
                onPress={(event) => {this.props.functions.onNodeSelected(event, 'privatePlace'); }}
                // pinColor={this.state.inactive  ? 'red' : 'purple'} TODO: DIFFERENT MARKER COLOR FOR NODE STATE
                key={marker.node_id}
            >

            <Image source={require('../../../assets/images/private_place.png')} style={{ width: 50, height: 50 }} />

            <Callout tooltip={false} style={styles.callout}>
            <Text style={styles.title}>{marker.data.title}</Text>
            </Callout>
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
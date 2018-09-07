import React, { Component } from 'react';
import { Marker, Callout }   from 'react-native-maps';
import { Image, StyleSheet, Text, View }   from 'react-native';

interface IProps {
    publicPlaceList: any;
    functions: any;
    visible: boolean;
}

interface IState {
}

export default class PublicPlaces extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            this.props.visible &&
            this.props.publicPlaceList.map(marker => (
            <Marker
                coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                title={marker.data.title}
                anchor={{ x: 0.5, y: 0.5 }}
                onPress={(event) => {this.props.functions.onNodeSelected(event, 'publicPlace'); }}
                key={marker.node_id}
            >

            <Image source={require('../../../assets/images/public_place.png')} style={{ width: 35, height: 35 }} />
            <Callout tooltip={true} style={styles.callout}>
            <View style={styles.card}>
            <Text style={styles.title}>{marker.data.title}</Text>
            </View>
            </Callout>
        </ Marker>

            ))
        );
    }
}

const styles = StyleSheet.create({
    callout: {
        alignItems: 'center',
      },
      card: {
        backgroundColor: '#fff',
        opacity: 0.8,
        borderRadius: 6,
        borderColor: 'black',
        borderWidth: 1,
        padding: 5,
      },
    title: {
        color: '#000',
        fontSize: 20,
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
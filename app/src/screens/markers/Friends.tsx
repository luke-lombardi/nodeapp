import React, { Component } from 'react';
import { Marker, Callout } from 'react-native-maps';
import { Image, View, Text, StyleSheet } from 'react-native';

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

            (marker.data.status !== 'inactive') ?
            <Marker
                coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                title={marker.data.title}
                pinColor={marker.data.color}
                // image={require('../../../assets/images/gift.png')}
                anchor={{ x: 0.5, y: 0.5 }}
                onPress={(event) => {this.props.functions.onNodeSelected(event, 'privatePerson'); }}
                // pinColor={this.state.inactive  ? 'red' : 'purple'} TODO: DIFFERENT MARKER COLOR FOR NODE STATE
                description={marker.data.description}
                key={marker.node_id}
            >

            <Image source={require('../../../assets/images/public_person.png')} style={{ width: 35, height: 35 }} />

            <Callout tooltip={false} style={styles.callout}>
            <Text style={styles.title}>{marker.data.title}</Text>
            </Callout>
        </ Marker>
        : undefined

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
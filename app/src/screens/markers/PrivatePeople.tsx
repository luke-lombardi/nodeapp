import React, { Component } from 'react';
import { Marker, Callout } from 'react-native-maps';
import { Text, View, StyleSheet } from 'react-native';

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
            <Marker
                coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                title={marker.data.title}
                pinColor={marker.data.color}
                image={require('../../../assets/images/gift.png')}
                anchor={{ x: 0.5, y: 0.5 }}
                onPress={(event) => {this.props.functions.onNodeSelected(event, 'privatePerson'); }}
                // pinColor={this.state.inactive  ? 'red' : 'purple'} TODO: DIFFERENT MARKER COLOR FOR NODE STATE
                description={marker.data.description}
                key={marker.node_id}
                >
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
            width: 100,
            bottom: 50,
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
import React, { Component } from 'react';
import { Marker }   from 'react-native-maps';
import { StyleSheet, Text, View, AsyncStorage }   from 'react-native';

import * as _ from 'lodash';

interface IProps {
    publicPlaceList: any;
    nodeId: string;
    functions: any;
}

interface IState {
    messages: any;
    nodeId: any;
    tracksViewChanges: boolean;
    blacklist: any;
}

export default class PublicPlaces extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            messages: '',
            nodeId: '',
            tracksViewChanges: true,
            blacklist: '',
        };

        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
        this.getBlacklist = this.getBlacklist.bind(this);
    }

    componentWillReceiveProps(nextProps: any) {
      if (!_.isEqual(this.props, nextProps)) {
        this.setState({ tracksViewChanges: true });
      }
    }

    componentDidUpdate() {
      if (this.state.tracksViewChanges) {
        this.setState({ tracksViewChanges: false });
      }
    }

    async getBlacklist() {
      let blacklist = await AsyncStorage.getItem('blacklist');
      await this.setState({blacklist: blacklist});
    }

    // @ts-ignore
    // shouldComponentUpdate(nextProps, nextState) {
    //   return nextProps.coordinate.latitude !== this.state.coordinate.latitude && nextProps.coordinate.longitude !== this.state.coordinate.longitude;
    // }

    render() {
        return (
            this.props.publicPlaceList.map(marker => (
              marker.node_id !== undefined &&
              marker.node_id !== this.state.blacklist ?
              <View key={marker.node_id}>
                <Marker
                    coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                    title={marker.data.title}
                    // description={}
                    anchor={{ x: .5, y: .6 }}
                    onPress={(event) => {this.props.functions.onNodeSelected(event, 'publicPlace'); }}
                    key={marker.node_id}
                    tracksViewChanges={this.state.tracksViewChanges}
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

// @ts-ignore
const styles = StyleSheet.create({
      markerText: {
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(153,51,255,0.4)',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'grey',
        width: 45,
        height: 45,
      },
      nullMarker: {
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(153,51,255,0.4)',
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
      card: {
        backgroundColor: '#fff',
        borderRadius: 6,
        borderColor: 'black',
        borderWidth: 1,
        padding: 5,
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
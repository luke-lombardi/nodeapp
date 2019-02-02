import React, { Component } from 'react';
import { Marker }   from 'react-native-maps';
// @ts-ignore
import { Image, StyleSheet, Text, View }   from 'react-native';
// import AuthService from '../../services/AuthService';
// import ApiService from '../../services/ApiService';

interface IProps {
    publicPlaceList: any;
    nodeId: string;
    functions: any;
    visible: boolean;
}

interface IState {
    messages: any;
    nodeId: any;
}

export default class PublicPlaces extends Component<IProps, IState> {

    // @ts-ignore
    // private apiService: ApiService;

    constructor(props: IProps) {
        super(props);
        this.state = {
            messages: '',
            nodeId: '',
        };

        // this.authService = new AuthService({});
        // this.apiService = new ApiService({});
        // this.componentDidMount = this.componentDidMount.bind(this);
    }

    // componentDidMount() {
    // }

    render() {
        return (
            this.props.visible &&
            this.props.publicPlaceList.map(marker => (
              marker.node_id !== undefined ?
              <View key={marker.node_id}>
                <Marker
                    coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                    title={marker.data.title}
                    // description={}
                    anchor={{ x: .5, y: .6 }}
                    onPress={(event) => {this.props.functions.onNodeSelected(event, 'publicPlace'); }}
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

// @ts-ignore
const styles = StyleSheet.create({
      markerText: {
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(153,51,255,0.4)',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'grey',
        width: 50,
        height: 50,
      },
      nullMarker: {
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(153,51,255,0.4)',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'grey',
        width: 50,
        height: 50,
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
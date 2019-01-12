import React, { Component } from 'react';
import { Marker }   from 'react-native-maps';
// @ts-ignore
import { Image, StyleSheet, Text, View }   from 'react-native';
import AuthService from '../../services/AuthService';
import ApiService from '../../services/ApiService';

interface IProps {
    publicPlaceList: any;
    nodeId: any;
    functions: any;
    visible: boolean;
}

interface IState {
    messages: any;
    nodeId: any;
}

export default class PublicPlaces extends Component<IProps, IState> {
    private authService: AuthService;
    private apiService: ApiService;

    constructor(props: IProps) {
        super(props);
        this.state = {
            messages: '', 
            nodeId: '',
        };

        this.authService = new AuthService({});
        this.apiService = new ApiService({});
        this.getMessages = this.getMessages.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    componentDidMount() {
        this.getMessages()
        console.log('MESSAGES LENGTH', this.state.messages.length)
    }

    async getMessages() {
        this.props.publicPlaceList.map(marker => (
            this.setState({nodeId: marker.node_id})
        ));

        let currentUUID = await this.authService.getUUID();

        let requestBody = {
            'node_id': this.state.nodeId,
            'user_uuid': currentUUID,
        };
    
        let response = await this.apiService.GetMessagesAsync(requestBody);

        console.log('MESSAGES', response);

        if (response !== undefined) {
        this.setState({messages: response});
    }
    return;
}

    render() {
        return (
            this.props.visible &&
            this.props.publicPlaceList.map(marker => (
          <View>
            <Marker
                coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                title={marker.data.title}
                // description={this.state.messages.length}
                anchor={{ x: .5, y: .6 }}
                onPress={(event) => {this.props.functions.onNodeSelected(event, 'publicPlace'); }}
                key={marker.node_id}
            >
            <View style={this.state.messages.length === 0 ? styles.nullMarker : styles.markerText}>
              <Text style={styles.markerTitle}>{this.state.messages.length}</Text>
            </View>
            </ Marker>
          </View>
            ))
        );
    }
}

// @ts-ignore
const styles = StyleSheet.create({
      markerText: { 
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: 'lightblue',   
        borderRadius: 50,
        width: 50,
        height: 50,
      },
      nullMarker: {
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: 'lightgreen',   
        borderRadius: 50,
        width: 50,
        height: 50,
      },
      markerTitle: {
        alignSelf: 'center',
        justifyContent: 'center',
        padding: '10%',
        color: 'black',
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
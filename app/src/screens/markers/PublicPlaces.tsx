import React, { Component } from 'react';
import { Marker }   from 'react-native-maps';
// @ts-ignore
import { Image, StyleSheet, Text }   from 'react-native';
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
            <Marker
                coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                title={marker.data.title}
                // description={this.state.messages.length}
                anchor={{ x: .5, y: .9 }}
                onPress={(event) => {this.props.functions.onNodeSelected(event, 'publicPlace'); }}
                key={marker.node_id}
            >   
            <Text>{this.state.messages.length}</Text>
                <Image source={require('../../../assets/images/public_place.png')} style={{ width: 50, height: 50 }} />
            </ Marker>
            ))
        );
    }
}

// @ts-ignore
const styles = StyleSheet.create({
    callout: {
        backgroundColor: '#fff',
        position: 'relative',
        flex: 1,
        alignItems: 'center',
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
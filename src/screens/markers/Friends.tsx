import React, { Component } from 'react';
import { Marker }   from 'react-native-maps';
import { Image }   from 'react-native';

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

            </Marker>
             :
            undefined
        )));
    }

}
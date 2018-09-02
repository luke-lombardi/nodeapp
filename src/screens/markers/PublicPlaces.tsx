import React, { Component } from 'react';
import { Marker }   from 'react-native-maps';
import { Image }   from 'react-native';

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
            </Marker>
        )));
    }

}
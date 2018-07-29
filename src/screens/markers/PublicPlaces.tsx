import React, { Component } from 'react';
import { Marker}   from 'react-native-maps';

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
                pinColor={'purple'}
                onPress={(event) => {this.props.functions.onNodeSelected(event, 'publicPlace'); }}
                // pinColor={this.state.inactive  ? 'red' : 'purple'} TODO: DIFFERENT MARKER COLOR FOR NODE STATE
                description={marker.data.description}
                key={marker.node_id}
            />
        )));
    }

}
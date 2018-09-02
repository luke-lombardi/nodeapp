import React, { Component } from 'react';
import { Marker }   from 'react-native-maps';
import { Image }   from 'react-native';

interface IProps {
    publicPersonList: any;
    functions: any;
    visible: boolean;
}

interface IState {
}

export default class PublicPeople extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            this.props.visible &&
            this.props.publicPersonList.map(marker => (
            <Marker
                coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                title={marker.data.title}
                pinColor={'purple'}
                anchor={{ x: 0.5, y: 0.5 }}
                onPress={(event) => {this.props.functions.onNodeSelected(event, 'publicPerson'); }}
                // pinColor={this.state.inactive  ? 'red' : 'purple'} TODO: DIFFERENT MARKER COLOR FOR NODE STATE
                description={marker.data.description}
                key={marker.node_id}
            >

            <Image source={require('../../../assets/images/public_person.png')} style={{ width: 35, height: 35 }} />

            </Marker>
        )));
    }

}
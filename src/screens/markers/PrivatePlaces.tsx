import React, { Component } from 'react';
import { Marker }   from 'react-native-maps';
// import { StyleSheet } from 'react-native';

interface IProps {
    privatePlaceList: any;
    functions: any;
}

interface IState {
}

export default class PrivatePlaces extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            this.props.privatePlaceList.map(marker => (
            // <View style={{overflow: 'hidden' }}>
            <Marker
                title={marker.data.title}
                coordinate={{latitude: parseFloat(marker.data.latitude), longitude: parseFloat(marker.data.longitude)} }
                pinColor={'red'}
                onPress={(event) => {this.props.functions.onNodeSelected(event, 'privatePlace'); }}
                // pinColor={this.state.inactive  ? 'red' : 'purple'} TODO: DIFFERENT MARKER COLOR FOR NODE STATE
                key={marker.node_id}
            >
            {/* <Callout tooltip={true} style={styles.callout}>
            <View style={styles.card}>
            <View style={{flex: 1}}>
            <Text style={styles.title}>{this.props.minutesAway ? this.props.minutesAway  + ' away' : ''}</Text> */}
                {/* <Text style={styles.description}>{marker.data.description}</Text> */}
                {/* <Text style={styles.description}>{this.props.distance ? this.props.distance + ' miles away' : ''}</Text> */}
                {/* <Text style={styles.description}>{this.props.minutesAway ? this.props.minutesAway  + ' minutes away' : ''}</Text> */}
            {/* </View>
            </View> */}
            {/* </Callout> */}
        </ Marker>
        )));
    }

}

// const styles = StyleSheet.create({
//     callout: {
//         alignItems: 'center',
//         overflow: 'hidden',
//       },
//       card: {
//         width:  300,
//         flexDirection: 'row',
//         alignSelf: 'flex-start',
//         backgroundColor: '#fff',
//         borderRadius: 6,
//         borderColor: '#007a87',
//         borderWidth: 1,
//         padding: 10,
//       },
//     title: {
//         color: '#000',
//         fontSize: 20,
//         textAlign: 'center',
//         marginBottom: 3,
//     },
//     description: {
//         color: '#000',
//         fontSize: 18,
//         textAlign: 'center',
//         marginBottom: 3,
//         marginTop: 10,
//     },
// });
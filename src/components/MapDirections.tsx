// import React, { Component } from 'react';
// import IStoreState from '../store/IStoreState';
// import { connect, Dispatch } from 'react-redux';
// import { bindActionCreators } from 'redux';
// import { UserPositionChangedActionCreator } from '../actions/MapActions';
// import { GOOGLE_MAPS_APIKEY } from '../config/map';

// interface IProps {
//   coordinates: Array<any>;
//   userRegion: any;
// }

// interface IState {
//     coordinates: Array<any>;
//     distance: string;
// }

// export class MapDirections extends Component<IProps, IState> {
//   constructor(props) {
//     super(props);

//     // AirBnB's Office, and Apple Park
//     this.state = {
//       coordinates: [
//         {
//           latitude: 37.3317876,
//           longitude: -122.0054812,
//         },
//         {
//           latitude: 37.771707,
//           longitude: -122.4053769,
//         },
//       ],
//           distance: '',
//     };
//   }

//       render() {
//         const userRegion = this.props.userRegion;
//         console.log('*******', userRegion, this.state.coordinates);
//         return (
//               <MapViewDirections
//                 origin={userRegion}
//                 waypoints={ (userRegion.length > 2) ? userRegion.slice(1, -1) : undefined}
//                 destination={this.state.coordinates}
//                 apikey={GOOGLE_MAPS_APIKEY}
//                 strokeWidth={3}
//                 strokeColor='hotpink'
//                 onStart={(params) => {
//                   console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
//                 }}
//                 onReady={(result) => {
//                   console.log('ready', result);
//                   this.setState({distance: result.distance});
//                 }}
//                 onError={(error) => {
//                   console.log('error', error);
//                 }}
//               />
//         );
//       }
//     }

// // Redux setup functions
// function mapStateToProps(state: IStoreState): IProps {
//   // @ts-ignore
//   return {
//     userRegion: state.userRegion,
//   };
// }

// function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
//   return {
//     UserPositionChanged: bindActionCreators(UserPositionChangedActionCreator, dispatch),
//   };
// }

// export default connect(mapStateToProps, mapDispatchToProps)(MapDirections);

// // End Redux setup functions

// // const styles = StyleSheet.create({
// //   searchBar: {
// //     position: 'absolute',
// //   },
// //   nodeListItem: {
// //     borderBottomWidth: 1,
// //     borderBottomColor: 'rgba(51, 51, 51, 0.2)',
// //     minHeight: 80,
// //     maxHeight: 80,
// //   },
// //   null: {
// //     fontSize: 22,
// //     marginTop: 25,
// //     alignSelf: 'center',
// //   },
// //   title: {
// //     fontSize: 14,
// //   },
// //   subtitle: {
// //     fontSize: 10,
// //   },
// // });
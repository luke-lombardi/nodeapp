import React, { Component } from 'react';
// @ts-ignore
import { View, StyleSheet, Text, Linking, AsyncStorage, FlatList, ActivityIndicator, Dimensions } from 'react-native';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import NavigationService from '../services/NavigationService';
import { ButtonGroup, ListItem } from 'react-native-elements';
import { ConfigGlobalLoader } from '../config/ConfigGlobal';

const { height } = Dimensions.get('window');

interface IProps {
    navigation?: any;
    nodeList: Array<any>;
    friendList: Array<any>;
    relationList: Array<any>;
    privatePlaceList: Array<any>;
    privatePersonList: Array<any>;
    publicPlaceList: Array<any>;
    publicPersonList: Array<any>;
    trackedNodeList: Array<any>;
}

interface IState {
  numberOfNotifications: number;
  isLoading: boolean;
  selectedIndex: number;
  data: Array<any>;
}

export class ActiveChats extends Component<IProps, IState> {
  resetAction: any;
  // @ts-ignore
  private readonly configGlobal = ConfigGlobalLoader.config;

    constructor(props: IProps) {
        super(props);

        this.state  = {
          isLoading: true,
          numberOfNotifications: undefined,
          selectedIndex: 1,
          data: this.props.relationList,
        };

        this.componentWillMount = this.componentWillMount.bind(this);
        this.updateIndex = this.updateIndex.bind(this);
    }

    updateIndex (selectedIndex) {
      this.setState({isLoading: true});
      if (selectedIndex === 0) {
        this.setState({
          selectedIndex,
          data: this.props.trackedNodeList,
          isLoading: false,
        });
      } else if (selectedIndex === 1) {
        this.setState({
          selectedIndex,
          data: this.props.relationList,
          isLoading: false,
        });
      }
    }

    componentWillMount() {
      //
    }

    // @ts-ignore
    _onTouchNode(node: any, index: number) {
      if (this.state.selectedIndex === 0) {
        // @ts-ignore
        let nodeType = undefined;

        if (node.data.type === 'place' && node.data.private) {
          nodeType = 'privatePlace';
        } else if (node.data.type === 'person' && node.data.private) {
          nodeType = 'privatePerson';
        } else if (node.data.type === 'place' && !node.data.private) {
          nodeType = 'publicPlace';
        } else if (node.data.type === 'person' && !node.data.private) {
          nodeType = 'publicPerson';
        }

        NavigationService.reset('Chat', { nodeId: node.node_id} );
      } else {
        NavigationService.reset('Chat', { nodeId: node.relation_id, username: node.topic } );
      }

    }

    _renderItem = ({item, index}) => (
      <ListItem
        onPress={() => this._onTouchNode(item, index)}
        containerStyle={styles.nodeListItem}
        titleStyle={{fontWeight: 'bold', fontSize: 14}}
        title={this.state.selectedIndex === 0 ? item.data.topic : item.topic}
        rightTitleStyle={{fontWeight: '600', fontSize: 14}}
        rightTitle={
        this.state.selectedIndex  ===  0 ?
          <View style={{paddingVertical: 5}}>
            <Text style={{fontWeight: 'bold', alignSelf: 'flex-end', alignItems: 'flex-end'}}>{item.data.distance_in_miles.toString()}</Text>
            <Text style={{paddingVertical: 5, color: 'gray'}}>miles away</Text>
          </View>
          : <View>
            {}
          </View>
        }
        subtitle={
          <View style={{paddingVertical: 5}}>
          { this.state.selectedIndex === 0 ?
            <Text style={{fontSize: 14, color: 'gray'}}>Expires in {(item.data.ttl / 3600).toFixed(1)} hours</Text>
            :
            undefined
          }
            { this.state.selectedIndex === 0  &&
              item.data.likes &&
              <Text style={{paddingVertical: 5, fontSize: 14, color: 'gray'}}>Saved by {Object.keys(item.data.likes).length} {Object.keys(item.data.likes).length < 2 ? 'person' : 'people'}</Text>
            } */}
          </View>
        }
      />
    )

    render() {
      const buttons = ['Saved Nodes', 'Friends'];
      const { selectedIndex } = this.state;
      return (
        <View style={{flex: 1}}>
        <View style={{paddingTop: 5, height: 80, backgroundColor: 'black', flexDirection: 'row'}}>
          <ButtonGroup
            innerBorderStyle={{width: 0.0, color: 'black'}}
            containerStyle={{top: 5, flex: 1, alignSelf: 'center', borderWidth: 0, paddingTop: 15, backgroundColor: 'rgba(0, 0, 0, 0.9);'}}
            buttonStyle={{height: 20, backgroundColor: 'black'}}
            // containerStyle={styles.buttonContainer}
            onPress={this.updateIndex}
            selectedIndex={selectedIndex}
            selectedButtonStyle={{backgroundColor: 'black', borderBottomColor: 'black'}}
            buttons={buttons}
            textStyle={{fontWeight: 'bold', fontSize: 18}}
          />
        </View>
        <View style={styles.flatlist}>
          <FlatList
           data={this.state.data}
           renderItem={this._renderItem}
           extraData={this.state}
           onEndReachedThreshold={0}
           ListHeaderComponent={<View style={{ height: 0, marginTop: 0 }}></View>}
           showsVerticalScrollIndicator={true}
           keyExtractor={item => (this.state.selectedIndex === 0 ? item.node_id : item.relation_id) }
           ListEmptyComponent={
            <View style={styles.nullContainer}>
            <Text style={styles.null}>{this.state.selectedIndex === 0 ? 'No tracked nodes yet' : 'No friends yet'}</Text>
            </View>
           }
          />
          </View>
       </View>
      );
    }
  }

  // @ts-ignore
  function mapStateToProps(state: IStoreState): IProps {
    // @ts-ignore
    return {
      privatePersonList: state.privatePersonList,
      privatePlaceList: state.privatePlaceList,
      publicPersonList: state.publicPersonList,
      publicPlaceList: state.publicPlaceList,
      trackedNodeList: state.trackedNodeList,
      relationList: state.relationList,
    };
  }

  // @ts-ignore
  function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
    return {
    };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(ActiveChats);

  const styles = StyleSheet.create({
    flatlist: {
      flex: 1,
      marginBottom: -10,
      backgroundColor: 'white',
      height: '100%',
      width: '100%',
    },
    nullContainer: {
      marginTop: height / 3,
      justifyContent: 'center',
      alignItems: 'center',
    },
    null: {
      fontSize: 22,
      color: 'gray',
      top: '100%',
      alignSelf: 'center',
    },
    nodeListItem: {
      width: '100%',
      marginTop: 10,
      marginBottom: 5,
      borderBottomWidth: .5,
      borderBottomColor: 'rgba(51, 51, 51, 0.1)',
      minHeight: 100,
      maxHeight: 120,
    },
    nullSubtitle: {
      fontSize: 14,
      color: 'gray',
      top: '40%',
      paddingVertical: 10,
    },
    button: {
      backgroundColor: 'black',
    },
    createNodeButton: {
      top: 30,
      width: 150,
      borderRadius: 30,
    },
    buttonContainer: {
      height: 50,
      // bottom: 45,
      paddingHorizontal: 100,
      borderBottomColor: 'black',
      alignSelf: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.9);',
      width: '110%',
    },
    transparentButton: {
    },
    locationButton: {
      width: 20,
      height: 20,
      alignSelf: 'flex-start',
      padding: 0,
    },
  });
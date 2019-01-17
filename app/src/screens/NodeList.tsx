import React, { Component } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { ListItem, ButtonGroup } from 'react-native-elements';
import { Button } from 'react-native-elements';

// import LinearGradient from 'react-native-linear-gradient';

import NavigationService from '../services/NavigationService';

// import Logger from '../services/Logger';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
// import { bindActionCreators } from 'redux';

// const WINDOW_WIDTH = Dimensions.get('window').width;

interface IProps {
    functions: any;
    navigation: any;
    privatePersonList: Array<any>;
    privatePlaceList: Array<any>;
    publicPersonList: Array<any>;
    publicPlaceList: Array<any>;
}

interface IState {
  selectedIndex: number;
  data: Array<any>;
  isRefreshing: boolean;
}

export class NodeList extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    this.state = {
      selectedIndex: 0,
      data: this.props.publicPlaceList,
      isRefreshing: false,
    };

    this.updateIndex = this.updateIndex.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  updateIndex (selectedIndex) {
    if (selectedIndex === 0) {
      this.setState({
        selectedIndex,
        data: this.props.publicPlaceList,
      });
    } else if (selectedIndex === 1) {
      this.setState({
        selectedIndex,
        data: this.props.privatePlaceList,
      });
    }
  }

  _onTouchNode(node: any) {
    let region = {
      latitude: parseFloat(node.data.latitude),
      longitude: parseFloat(node.data.longitude),
      latitudeDelta: parseFloat(node.data.latDelta),
      longitudeDelta: parseFloat(node.data.longDelta),
    };

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

    NavigationService.reset('Map', {
      region: region,
      nodeType: nodeType,
    });
  }

  _renderItem = ({item}) => (
    <ListItem
    // scaleProps={{
    //   friction: 90,
    //   tension: 100,
    //   activeScale: 0.95,
    // }}
      onPress={() => this._onTouchNode(item)}
      containerStyle={styles.nodeListItem}
      leftIcon={
        item.data.type === 'place' ?
        {name: 'circle', type: 'font-awesome', size: 10, color: 'lightgreen'} :
        {name: 'circle', type: 'font-awesome', size: 10, color: 'blue'}
      }
      titleStyle={{fontWeight: '600', fontSize: 16, marginBottom: 5}}
      title={item.data.topic}
      subtitle={item.data.distance_in_miles.toString() + ' miles, expires in ' + (item.data.ttl / 3600).toFixed(1) + ' hours' }
      subtitleStyle={{fontSize: 14, color: 'gray'}}
    />
  )

  async onRefresh() {
    this.setState({isRefreshing: true});
    let newList = await this.props.publicPlaceList;
    // @ts-ignore
    let newPrivateList = await this.props.privatePlaceList;
    if (newList) {
      this.setState({isRefreshing: false});
    } else {
      return;
    }
  }

  render() {
    const buttons = ['Public', 'Private'];
    const { selectedIndex } = this.state;
    return (
      <View style={{flex: 1, backgroundColor: 'black'}}>
        <ButtonGroup
          innerBorderStyle={{width: 0.0, color: 'black'}}
          buttonStyle={styles.button}
          containerStyle={styles.buttonContainer}
          onPress={this.updateIndex}
          selectedIndex={selectedIndex}
          selectedButtonStyle={{backgroundColor: 'black', borderBottomColor: 'black', borderBottomWidth: 3}}
          buttons={buttons}
          textStyle={{fontWeight: 'bold', fontSize: 16}}
        />
      <View style={{flex: 1, top: -5}}>
      <View style={styles.flatlist}>
        <FlatList
         data={this.state.data}
         renderItem={this._renderItem}
         extraData={this.state}
         onEndReachedThreshold={0}
         showsVerticalScrollIndicator={true}
         keyExtractor={item => item.node_id}
         refreshing={this.state.isRefreshing ? true : false}
         onRefresh={this.onRefresh}
        />

        {
          this.state.selectedIndex === 1 && this.props.privatePlaceList.length === 0 &&
          <View style={styles.nullContainer}>
          <Text style={styles.null}>No nodes have been created yet</Text>
          <Button
            containerStyle={styles.createNodeButton}
            buttonStyle={{borderRadius: 10}}
            title={'Create Node'}
            onPress = {() => this.props.navigation.navigate('CreateNode')}
          />
          </View>
        }
        {
          this.state.selectedIndex === 0 && this.props.publicPlaceList.length === 0 &&
          <View style={styles.nullContainer}>
          <Text style={styles.null}>No nodes have been created yet</Text>
          <Button
            containerStyle={styles.createNodeButton}
            buttonStyle={{borderRadius: 10}}
            title={'Create Node'}
            onPress = {() => this.props.navigation.navigate('CreateNode')}
          />
          </View>
        }
        </View>
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
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeList);

const styles = StyleSheet.create({
  flatlist: {
    flex: 1,
    top: -30,
    marginBottom: -50,
    backgroundColor: 'white',
    height: '100%',
    width: '100%',
  },
  nodeListItem: {
    width: '110%',
    marginTop: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 51, 51, 0.2)',
    minHeight: 100,
    maxHeight: 120,
  },
  nullContainer: {
    flex: 1,
    bottom: 200,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  null: {
    fontSize: 18,
    color: 'gray',
    alignSelf: 'center',
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
    height: 100,
    bottom: 45,
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
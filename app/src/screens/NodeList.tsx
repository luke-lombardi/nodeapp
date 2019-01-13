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
    scaleProps={{
      friction: 90,
      tension: 100,
      activeScale: 0.95,
    }}
      onPress={() => this._onTouchNode(item)}
      containerStyle={styles.nodeListItem}
      leftIcon={
        item.data.type === 'place' ?
        {name: 'circle', type: 'font-awesome', size: 10, color: 'lightgreen'} :
        {name: 'circle', type: 'font-awesome', size: 10, color: 'blue'}
      }
      rightIcon={{name: 'chevron-right', color: 'rgba(51, 51, 51, 0.8)'}}
      titleStyle={{fontWeight: 'bold', marginBottom: 2}}
      title={item.data.title}
      subtitle={item.data.distance_in_miles.toString() + ' miles, expires in ' + (item.data.ttl / 3600).toFixed(1) + ' hours' }
    />
  )

  async onRefresh() {
    this.setState({isRefreshing: true});
    let newList = await this.props.privatePlaceList && this.props.publicPlaceList;
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
      <View style={{width: '100%'}}>
        <ButtonGroup
          buttonStyle={styles.button}
          containerStyle={styles.buttonContainer}
          onPress={this.updateIndex}
          selectedIndex={selectedIndex}
          buttons={buttons}
          textStyle={{fontWeight: 'bold'}}
        />
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
    marginBottom: 180,
  },
  nodeListItem: {
    minHeight: 80,
    maxHeight: 80,
    margin: 10,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 20,
  },
  nullContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    top: 175,
  },
  null: {
    fontSize: 18,
    color: 'gray',
    alignSelf: 'center',
  },
  button: {
  },
  createNodeButton: {
    top: 30,
    width: 150,
    borderRadius: 30,
  },
  buttonContainer: {
    top: -10,
    height: 70,
    alignSelf: 'center',
    width: '110%',
  },
});
import React, { Component } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { ListItem, ButtonGroup } from 'react-native-elements';
// import LinearGradient from 'react-native-linear-gradient';

// import Logger from '../services/Logger';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
// import { bindActionCreators } from 'redux';

interface IProps {
    navigation: any;
    privatePersonList: Array<any>;
    privatePlaceList: Array<any>;
    publicPersonList: Array<any>;
    publicPlaceList: Array<any>;
}

interface IState {
  selectedIndex: number;
}

export class NodeList extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      selectedIndex: 2,
    };

    this.updateIndex = this.updateIndex.bind(this);
  }

  updateIndex (selectedIndex) {
    this.setState({selectedIndex});
  }

  _onTouchNode(node: any) {
    let region = {
      latitude: parseFloat(node.data.latitude),
      longitude: parseFloat(node.data.longitude),
      latitudeDelta: parseFloat(node.data.latDelta),
      longitudeDelta: parseFloat(node.data.longDelta),
    };

    let nodeType = node.data.type;
    if (nodeType === 'place') {
      nodeType = 'privatePlace';
    } else if (nodeType === 'person') {
      nodeType = 'privatePerson';
    }

    this.props.navigation.navigate('Map', {region: region, nodeType: nodeType});
  }

  _renderItem = ({item}) => (
    <ListItem
    scaleProps={{
      friction: 90,
      tension: 100,
      activeScale: 0.95,
    }}
    // linearGradientProps={{
    //   colors: ['#FF9800', '#F44336'],
    //   start: [1, 0],
    //   end: [0.2, 0],
    // }}
    // ViewComponent={LinearGradient}
      onPress={() => this._onTouchNode(item)}
      containerStyle={styles.nodeListItem}
      leftIcon={
        item.data.type === 'place' ?
        {name: 'circle', type: 'font-awesome', size: 10, color: 'green'} :
        {name: 'circle', type: 'font-awesome', size: 10, color: 'blue'}
      }
      rightIcon={{name: 'chevron-right', color: 'rgba(51, 51, 51, 0.8)'}}
      title={item.data.title}
      subtitle={item.data.distance_in_miles.toString() + ' miles, expires in ' + (item.data.ttl / 3600).toFixed(1) + ' hours' }
    />
  )

  render() {
    const buttons = ['Public', 'Private'];
    const { selectedIndex } = this.state;
    return (
      <View>
        <ButtonGroup
          buttonStyle={styles.button}
          containerStyle={styles.buttonContainer}
          onPress={this.updateIndex}
          selectedIndex={selectedIndex}
          buttons={buttons}
        />
        <FlatList
         data={
           this.state.selectedIndex === 0 ?
           this.props.publicPlaceList :
           this.props.privatePlaceList
          }
         renderItem={this._renderItem}
         extraData={this.state}
         keyExtractor={item => item.node_id}
        />

        {
          this.props.privatePlaceList.length === 0 &&
          <Text style={styles.null}>No nodes have been created yet</Text>
        }
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
  nodeListItem: {
    minHeight: 80,
    maxHeight: 80,
    margin: 10,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 20,
  },
  null: {
    fontSize: 22,
    marginTop: 25,
    alignSelf: 'center',
  },
  button: {

  },
  buttonContainer: {
    top: -10,
    height: 80,
    alignSelf: 'center',
    width: '100%',
  },
});
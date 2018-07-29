import React, { Component } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { ListItem } from 'react-native-elements';

// import Logger from '../services/Logger';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

interface IProps {
    navigation: any;
    privatePersonList: Array<any>;
    privatePlaceList: Array<any>;
    groupList: Array<any>;
}

export class GroupList extends Component<IProps> {
  constructor(props: IProps) {
    super(props);
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
      onPress={() => this._onTouchNode(item)}
      containerStyle={styles.nodeListItem}
      leftIcon={{name: 'map-pin', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
      rightIcon={{name: 'chevron-right', color: 'rgba(51, 51, 51, 0.8)'}}
      title={item.data.title}
      subtitle={item.data.distance_in_miles.toString() + ' miles'}
    />
  )

  render() {
    return (
      <View>
        <FlatList
         data={this.props.privatePlaceList}
         renderItem={this._renderItem}
         extraData={this.state}
         keyExtractor={item => item.node_id}
        />

        {
          this.props.privatePlaceList.length === 0 &&
          <Text style={styles.null}>No groups have been created yet</Text>
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
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupList);

const styles = StyleSheet.create({
  nodeListItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 51, 51, 0.2)',
    minHeight: 80,
    maxHeight: 80,
  },
  null: {
    fontSize: 22,
    marginTop: 25,
    alignSelf: 'center',
  },
});
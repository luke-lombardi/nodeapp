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
    friendList: Array<any>;
}

export class FriendList extends Component<IProps> {
  constructor(props: IProps) {
    super(props);

  }

  _onTouchNode(group: any) {
    console.log(group);
    this.props.navigation.navigate('MainMap', {action: 'edit_group', group_data: group});
  }

  _renderItem = ({item}) => (
    <ListItem
      scaleProps={{
        friction: 90,
        tension: 100,
        activeScale: 0.95,
      }}
      onPress={() => this._onTouchNode(item)}
      containerStyle={styles.friendListItem}
      leftIcon={{name: 'map-pin', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
      // rightIcon={{name: 'chevron-right', color: 'rgba(51, 51, 51, 0.8)'}}
      title={ item.title ? item.title : item.node_id }
    />
  )

  render() {
    return (
      <View>
        <FlatList
         data={this.props.friendList}
         renderItem={this._renderItem}
         extraData={this.state}
         keyExtractor={item => item.node_id}
        />

        {
          this.props.friendList.length === 0 &&
          <Text style={styles.null}>No friends have been added yet</Text>
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
    friendList: state.friendList,
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FriendList);

const styles = StyleSheet.create({
  friendListItem: {
    minHeight: 80,
    maxHeight: 80,
    margin: 10,
    borderRadius: 20,
  },
  null: {
    fontSize: 22,
    marginTop: 25,
    alignSelf: 'center',
  },
});
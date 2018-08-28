import React, { Component } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
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

export class MeetupList extends Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  _onTouchGroup(group: any) {
    console.log(group);
    this.props.navigation.navigate('GroupEditor', {action: 'edit_group', group_data: group});
  }

  _renderItem = ({item}) => (
    <ListItem
      scaleProps={{
        friction: 90,
        tension: 100,
        activeScale: 0.95,
      }}
      onPress={() => this._onTouchGroup(item)}
      containerStyle={styles.groupListItem}
      leftIcon={{name: 'map-pin', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
      rightIcon={{name: 'chevron-right', color: 'rgba(51, 51, 51, 0.8)'}}
      title={'Transaction #499'}
    />
  )

  render() {
    const groupList = [
      {
        'place': 'times square',
        'people': 'chuck',
        'time': 'August 8, 2018',
      },
      {
        'place': 'times square',
        'people': 'chuck',
        'time': 'August 8, 2018',
      },
      {
        'place': 'times square',
        'people': 'chuck',
        'time': 'August 8, 2018',
      },
    ];
    return (
      <View>
        <FlatList
         data={groupList}
         renderItem={this._renderItem}
         extraData={this.state}
         keyExtractor={item => item.group_id}
        />
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
    groupList: state.groupList,
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MeetupList);

const styles = StyleSheet.create({
  groupListItem: {
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
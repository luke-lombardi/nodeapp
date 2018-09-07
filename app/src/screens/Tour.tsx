import React, { Component } from 'react';
import { View, StyleSheet} from 'react-native';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import ActionButton from 'react-native-circular-action-menu';
// import { Crashlytics } from 'react-native-fabric';

interface IProps {
    navigation: any;
}

interface IState {
}

export class Tour extends Component<IProps, IState> {
  render() {
    return(
      <View style={{flex: 1, backgroundColor: '#f3f3f3'}}>
        {/*Rest of App come ABOVE the action button component!*/}
        <ActionButton buttonColor='rgba(231,76,60,1)'>
          <ActionButton.Item
          buttonColor='#9b59b6' title='Add Friend' textStyle={{color: 'black'}} onPress={() => console.log("notes tapped!")}>
            <Icon
            name='md-create' style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#3498db' title='Notifications' onPress={() => {
            // Crashlytics.crash();
          }}>
            <Icon name='md-notifications-off' style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#1abc9c' title='All Tasks' onPress={() => {}}>
            <Icon name='md-done-all' style={styles.actionButtonIcon} />
          </ActionButton.Item>
        </ActionButton>
      </View>
      );
    }
  }

  const styles = StyleSheet.create({
    actionButtonIcon: {
      fontSize: 20,
      height: 22,
      color: 'white',
    },
  });

// @ts-ignore
function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Tour);
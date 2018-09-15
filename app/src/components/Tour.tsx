import React, { Component } from 'react';
import { View, StyleSheet} from 'react-native';
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import ActionButton from 'react-native-circular-action-menu';

interface IProps {
  functions: any;
}

interface IState {
}

export class Tour extends Component<IProps, IState> {
  render() {
    return(
      <View style={styles.container}>
        {/*Rest of App come ABOVE the action button component!*/}
        <ActionButton
          buttonColor='rgba(231,76,60,1)'>
          <ActionButton.Item
            buttonColor='#9b59b6' title='Drop Node' textStyle={{color: 'black'}}
            onPress={() => {
            this.props.functions.closeCreateModal();
            this.props.functions.navigateToPage('CreateNode');
          }}>
            <Icon
            name='md-create' style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#1abc9c' title='Add Friend'
            onPress={() => {
              this.props.functions.closeCreateModal();
              this.props.functions.navigateToPage('ContactList', {action: 'share_node'});
          }}>
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
    container: {
      flex: 14,
      bottom: 40,
      backgroundColor: 'transparent',
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
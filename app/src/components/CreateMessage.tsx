import React, { Component } from 'react';
import { View, StyleSheet, TextInput, AsyncStorage } from 'react-native';

import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';

import NavigationService from '../services/NavigationService';

interface IProps {
  navigation: any;
  nodeType: any;
  nodeId: any;
}

interface IState {
  messageBody: any;
  isLoading: boolean;
}

export default class CreateMessage extends Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
          messageBody: '',
          isLoading: false,
        };

        this.submitMessage = this.submitMessage.bind(this);
    }

    async submitMessage() {
      let nodeId = this.props.navigation.getParam('nodeId');

      await this.setState({
        isLoading: true,
        messageBody: this.state.messageBody,
      });

      let userUuid = await AsyncStorage.getItem('user_uuid');

      NavigationService.reset('Chat', {
        messageBody: this.state.messageBody,
        action: 'new_message',
        userUuid: userUuid,
        nodeId: nodeId,
      });
    }

    render() {
        return (
          <View style={styles.footer}>
            <View style={styles.container}>
            <TextInput
                value={this.state.messageBody}
                onChangeText={text => this.setState({messageBody: text})}
                blurOnSubmit
                multiline
                keyboardAppearance={'dark'}
                style={styles.input}
                maxLength={280}
                underlineColorAndroid='transparent'
                placeholder='Type yer message...'
            />
            </View>
            <Button
              style={styles.fullWidthButton} buttonStyle={{width: '100%', height: '100%'}}
              onPress={this.submitMessage}
              loading={this.state.isLoading}
              disabled={this.state.isLoading}
              loadingStyle={styles.loading}
              icon={
                <Icon
                  name='arrow-right'
                  size={30}
                  color='white'
                />
              }
              title=''
            />

            <Spinner visible={this.state.isLoading} textContent={'Loading...'} textStyle={{color: 'rgba(44,55,71,1.0)'}} />

          </View>
        );
    }
}

// @ts-ignore
const styles = StyleSheet.create({
  footer: {
      flex: 1,
      padding: 0,
      backgroundColor: '#eee',
    },
    container: {
      flex: 6,
      alignSelf: 'stretch',
    },
    input: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      paddingTop: 20,
      fontSize: 26,
    },
    send: {
      alignSelf: 'center',
      color: 'lightseagreen',
      fontSize: 16,
      fontWeight: 'bold',
      padding: 20,
    },
    fullWidthButton: {
      backgroundColor: 'blue',
      height: 70,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      position: 'absolute',
      bottom: 0,
      padding: 0,
    },
    loading: {
      alignSelf: 'center',
      width: 300,
      height: 50,
    },
    footerButton: {
      alignItems: 'center',
      justifyContent: 'center',
    },
});
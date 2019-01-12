import React, { Component } from 'react';
import { View, StyleSheet, TextInput, AsyncStorage } from 'react-native';

import { Button } from 'react-native-elements';
import { Icon } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';
import Snackbar from 'react-native-snackbar';

// import { NavigationActions } from 'react-navigation';

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
    private nodeId: string;
    // TODO: figure out a smarter way to do this
    static navigationOptions = ({ navigation }) => {
      const { params = {} } = navigation.state;
      return {
        headerStyle: {backgroundColor: 'rgba(44,55,71,1.0)', paddingLeft: 10, paddingRight: 10},
          headerTitleStyle: { color: 'white'},
          title: 'Compose Message',
          headerLeft: <Icon name='x' type='feather' containerStyle={{padding: 5}} size={30} underlayColor={'rgba(44,55,71, 0.7)'} color={'#ffffff'} onPress={ () => {
            params.returnToChat();
          }} 
        />,
      };
    }

    constructor(props: IProps) {
        super(props);
        this.state = {
          messageBody: '',
          isLoading: false,
        };

        this.submitMessage = this.submitMessage.bind(this);
        this.setMessageText = this.setMessageText.bind(this);
        this.returnToChat = this.returnToChat.bind(this);
        this.componentWillMount = this.componentWillMount.bind(this);
    }

    componentWillMount() {
      this.props.navigation.setParams({ returnToChat: this.returnToChat });
    }

    async returnToChat() {
      this.nodeId = this.props.navigation.getParam('nodeId', '');
      this.props.navigation.navigate({key: 'Chat', routeName: 'Chat', params: { nodeId: this.nodeId }}
      );
    }

    async submitMessage() {
      let nodeId = this.props.navigation.getParam('nodeId');

      await this.setState({
        isLoading: true,
        messageBody: this.state.messageBody,
      });

      // If the message body is empty, don't post the message
      if (this.state.messageBody === '') {
        Snackbar.show({
          title: 'Enter a message to send.',
          duration: Snackbar.LENGTH_SHORT,
        });

        await this.setState({
          isLoading: false,
        });

        return;
      }

      let userUuid = await AsyncStorage.getItem('user_uuid');

      NavigationService.reset('Chat', {
        messageBody: this.state.messageBody,
        action: 'new_message',
        userUuid: userUuid,
        nodeId: nodeId,
      });
    }

    async setMessageText(text) {
      try {
        await this.setState({messageBody: text});
      } catch (error) {
        // Ignore
        // The only reason this would fail is if the component unmounted
      }
    }

    render() {
        return (
          <View style={styles.footer}>
            <View style={styles.container}>
            <TextInput
                value={this.state.messageBody}
                onChangeText={text => this.setMessageText(text)}
                blurOnSubmit
                multiline={true}
                keyboardAppearance={'dark'}
                style={styles.input}
                maxLength={280}
                underlineColorAndroid='transparent'
                placeholder='Type your message...'
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
                  type={'feather'}
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
      height: '100%',
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
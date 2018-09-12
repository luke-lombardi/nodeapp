import React, { Component } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

interface IProps {
  navigation: any;
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

    submitMessage() {
      this.setState({
        isLoading: true,
        messageBody: this.state.messageBody,
      });

      this.props.navigation.navigate('Chat', {
        messageBody: this.state.messageBody, action: 'new_message',
      });

      this.setState({isLoading: false});
    }

    render() {
        return (
          <View style={styles.footer}>
            <TextInput
                value={this.state.messageBody}
                onChangeText={text => this.setState({messageBody: text})}
                style={styles.input}
                underlineColorAndroid='transparent'
                placeholder='Type yer message...'
            />
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
          </View>
        );
    }
}

// @ts-ignore
const styles = StyleSheet.create({
  footer: {
      flexDirection: 'column',
      backgroundColor: '#eee',
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
      height: 75,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      position: 'absolute',
      top: 470,
      padding: 0,
    },
    loading: {
      alignSelf: 'center',
      width: 300,
      height: 50,
    },
});
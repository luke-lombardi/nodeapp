import React, { Component } from 'react';
import { View, Button, StyleSheet, TextInput, KeyboardAvoidingView, TouchableOpacity } from 'react-native';

interface IProps {
  navigation: any;
}

interface IState {
}

export default class CreateMessage extends Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {

        };
        this.submitMessage = this.submitMessage.bind(this);
    }

    async submitMessage() {
      alert('submitted your message');
    }

    render() {
        return (
          <KeyboardAvoidingView behavior='padding'>
          <View style={styles.footer}>
            <TextInput
                // value={this.state.typing}
                // onChangeText={text => this.setState({typing: text})}
                style={styles.input}
                underlineColorAndroid='transparent'
                placeholder='Type yer message...'
            />
          </View>
            <TouchableOpacity onPress={this.submitMessage}>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
    }
}

// @ts-ignore
const styles = StyleSheet.create({
  footer: {
      flexDirection: 'row',
      backgroundColor: '#eee',
    },
    input: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      paddingTop: 20,
      fontSize: 26,
      flex: 1,
    },
    send: {
      alignSelf: 'center',
      color: 'lightseagreen',
      fontSize: 16,
      fontWeight: 'bold',
      padding: 20,
    },
});
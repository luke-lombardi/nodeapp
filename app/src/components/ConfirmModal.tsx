import React, { Component } from 'react';
// @ts-ignore
import { View, StyleSheet, Text } from 'react-native';
import { Button, CheckBox } from 'react-native-elements';

import Modal from 'react-native-modal';

interface IProps {
    functions: any;
    action: string;
    data: any;
}

interface IState {
    scrollOffset: number;
    visibleModal: boolean;
    displayTitle: string;
    shareLocationActive: boolean;
}

export default class ConfirmModal extends Component<IProps, IState> {
    private scrollViewRef: any;
    private action: string;

    constructor(props: IProps) {
        super(props);
        this.state = {
            scrollOffset: 0,
            visibleModal: true,
            displayTitle: '',
            shareLocationActive: false,
        };

        // this.componentWillMount = this.componentWillMount.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.setDisplayText = this.setDisplayText.bind(this);
        this.toggleLocationSharing = this.toggleLocationSharing.bind(this);
    }

    handleOnScroll = event => {
        this.setState({
          scrollOffset: event.nativeEvent.contentOffset.y,
        });
    }

    handleScrollTo = p => {
        if (this.scrollViewRef) {
          this.scrollViewRef.scrollTo(p);
        }
    }

    componentDidMount() {
        this.setDisplayText();
    }

    toggleLocationSharing() {
        !this.state.shareLocationActive ?
        this.setState({shareLocationActive: true}) :
        this.setState({shareLocationActive: false});
      }

    render() {
        const displayName = this.props.data.display_name;

        return (
            <Modal
              isVisible={this.state.visibleModal}
              >
              <View style={styles.modalContent}>
                <Text style={{fontWeight: 'bold', paddingVertical: 20}}> {this.state.displayTitle} </Text>
                {
                  this.props.action === 'add_friend' &&
                  <CheckBox
                      center
                      title={
                        <View style={{alignContent: 'center', alignItems: 'center', width: 200}}>
                        <Text>Share my location with</Text>
                        <Text style={{fontWeight: 'bold', paddingVertical: 10}}>{ displayName }</Text>
                        </View>
                      }
                      iconRight
                      textStyle={this.state.shareLocationActive ? {color: 'red'} : {color: 'gray'}}
                      containerStyle={{borderRadius: 10}}
                      checkedIcon='check'
                      uncheckedIcon='circle-o'
                      checkedColor='red'
                      uncheckedColor='gray'
                      onIconPress={this.toggleLocationSharing}
                      onPress={this.toggleLocationSharing}
                      checked={this.state.shareLocationActive}
                      />
                }
                <Button style={styles.fullWidthButton}
                    buttonStyle={styles.buttonStyle}
                    titleStyle={{
                        'color': 'black',
                        'fontWeight': 'bold',
                    }}
                    onPress={() => {

                        if (this.props.action === 'add_friend') {
                          this.props.functions.startPrivateChat(this.props.data, this.state.shareLocationActive);
                        } else if (this.props.action === 'confirm_friend') {
                          this.props.functions.closeConfirmModal(true, this.props.data);
                        }
                    } }
                    loading={false}
                    disabled={false}
                    // loadingStyle={}
                    title='Confirm'
                    icon={{name: 'check-circle', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                    iconRight
                    />
                <Button style={styles.fullWidthButton}
                    buttonStyle={styles.buttonStyle}
                    titleStyle={{
                        'color': 'black',
                        'fontWeight': 'bold',
                    }}
                    onPress={() => {
                        this.props.functions.closeConfirmModal();
                    } }
                    loading={false}
                    disabled={false}
                    // loadingStyle={}
                    title='Cancel'
                    icon={{name: 'x', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                    iconRight
                    />
              </View>
          </Modal>
        );
    }

    private async setDisplayText() {
        if (this.action === 'join_group') {
            await this.setState({displayTitle: 'Are you sure you want to join this group?'});
        } else if (this.props.action === 'add_friend') {
            await this.setState({displayTitle: `Request to chat with ${this.props.data.display_name}`});
        } else if (this.props.action === 'confirm_friend') {
          await this.setState({displayTitle: `${this.props.data.from_username} wants to chat. Accept?`});
      }

    }
}

// @ts-ignore
const styles = StyleSheet.create({
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
        bottom: 0,
    },
    scrollableModal: {
        height: '32%',
        width: '100%',
    },
    scrollableModalContent1: {
        width: '100%',
        height: 90,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullWidthButton: {
        paddingTop: 20,
        paddingBottom: 10,
        // flex: 1,
        alignSelf: 'stretch',
        backgroundColor: '#ffffff',
        height: 90,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonStyle: {
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        borderColor: 'rgba(51, 51, 51, 0.8)',
        borderWidth: 2.0,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
});
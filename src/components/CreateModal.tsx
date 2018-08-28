import React, { Component } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';

import Modal from 'react-native-modal';

interface IProps {
    functions: any;
}

interface IState {
    scrollOffset: number;
    visibleModal: boolean;
}

export default class CreateModal extends Component<IProps, IState> {
    private scrollViewRef: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            scrollOffset: 0,
            visibleModal: true,
        };
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

    render() {
        return (
            <Modal
                    isVisible={this.state.visibleModal}
                    animationIn={'slideInUp'}
                    animationInTiming={300}
                    animationOut={'slideOutDown'}
                    animationOutTiming={300}
                    onSwipe={() => { this.props.functions.closeCreateModal(); } }
                    onBackdropPress={() => { this.props.functions.closeCreateModal(); } }
                    swipeDirection='down'
                    scrollTo={this.handleScrollTo}
                    scrollOffset={this.state.scrollOffset}
                    scrollOffsetMax={10} // content height - ScrollView height
                    style={styles.bottomModal}
                    >
                    <View style={styles.scrollableModal}>
                        <ScrollView
                        ref={ref => (this.scrollViewRef = ref)}
                        onScroll={this.handleOnScroll}
                        scrollEventThrottle={10}
                        >
                        <View style={styles.scrollableModalContent1}>
                            <Button style={styles.fullWidthButton}
                                    buttonStyle={styles.buttonStyle}
                                    titleStyle={{
                                        'color': 'black',
                                    }}
                                    onPress={() => {
                                        this.props.functions.closeCreateModal();
                                        this.props.functions.navigateToPage('CreateNode');
                                    } }
                                    loading={false}
                                    disabled={false}
                                    // loadingStyle={}
                                    title='Drop a Pin'
                                    icon={{name: 'map-pin', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                                    iconRight
                            />
                        </View>
                        <View style={styles.scrollableModalContent1}>
                            <Button style={styles.fullWidthButton}
                                        buttonStyle={styles.buttonStyle}
                                        titleStyle={{
                                            'color': 'black',
                                        }}
                                        onPress={() => {
                                            this.props.functions.closeCreateModal();
                                            this.props.functions.navigateToPage('GroupEditor');
                                        } }
                                        loading={false}
                                        disabled={false}
                                        // loadingStyle={}
                                        title='New Group'
                                        icon={{name: 'users', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                                        iconRight
                            />
                        </View>
                        <View style={styles.scrollableModalContent1}>
                            <Button style={styles.fullWidthButton}
                                        buttonStyle={styles.buttonStyle}
                                        titleStyle={{
                                            'color': 'black',
                                        }}
                                        onPress={() => {
                                            this.props.functions.closeCreateModal();
                                            this.props.functions.navigateToPage('ContactList', {action: 'share_pin'});
                                        } }
                                        loading={false}
                                        disabled={false}
                                        // loadingStyle={}
                                        title='Add Friend'
                                        icon={{name: 'user', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                                        iconRight
                                />
                        </View>
                        </ScrollView>
                    </View>
                </Modal>
        );
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
        height: '40%',
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
});
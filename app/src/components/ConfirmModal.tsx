import React, { Component } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';

import Modal from 'react-native-modal';

interface IProps {
    functions: any;
    linkData: string;
}

interface IState {
    scrollOffset: number;
    visibleModal: boolean;
}

export default class ConfirmModal extends Component<IProps, IState> {
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
                    onSwipe={() => { this.props.functions.closeConfirmModal(); } }
                    onBackdropPress={() => { this.props.functions.closeConfirmModal(); } }
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
                                        this.props.functions.closeConfirmModal(true, this.props.linkData);
                                    } }
                                    loading={false}
                                    disabled={false}
                                    // loadingStyle={}
                                    title='Confirm'
                                    icon={{name: 'check-circle', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
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
                                        this.props.functions.closeConfirmModal(false, this.props.linkData);
                                    } }
                                    loading={false}
                                    disabled={false}
                                    // loadingStyle={}
                                    title='Cancel'
                                    icon={{name: 'slash', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
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
});
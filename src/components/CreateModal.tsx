import React, { Component } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {  Text } from 'react-native-elements';
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
          scrollOffset: event.nativeEvent.contentOffset.y
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
                    onSwipe={() => { this.props.functions.closeCreateModal(); } }
                    onBackdropPress={() => { this.props.functions.closeCreateModal(); } }
                    swipeDirection='down'
                    scrollTo={this.handleScrollTo}
                    scrollOffset={this.state.scrollOffset}
                    scrollOffsetMax={400 - 350} // content height - ScrollView height
                    style={styles.bottomModal}
                    >
                    <View style={styles.scrollableModal}>
                        <ScrollView
                        ref={ref => (this.scrollViewRef = ref)}
                        onScroll={this.handleOnScroll}
                        scrollEventThrottle={10}
                        >
                        <View style={styles.scrollableModalContent1}>
                            <Text>Drop a pin</Text>
                        </View>
                        <View style={styles.scrollableModalContent1}>
                            <Text>Create Group</Text>
                        </View>
                        <View style={styles.scrollableModalContent1}>
                            <Text>Create Meetup</Text>
                        </View>
                        <View style={styles.scrollableModalContent1}>
                            <Text>Add People</Text>
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
    },
    scrollableModal: {
        height: 300,
    },
    scrollableModalContent1: {
        height: 100,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
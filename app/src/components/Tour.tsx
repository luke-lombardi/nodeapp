import React, { Component } from 'react';
// @ts-ignore
import { View, StyleSheet, Text, TextInput, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-elements';
import Modal from 'react-native-modal';
import Swiper from 'react-native-swiper';

interface IProps {
    functions: any;
}

interface IState {
    visibleModal: boolean;
}

export default class Tour extends Component<IProps, IState> {
    // @ts-ignore
    private action: string;

    constructor(props: IProps) {
        super(props);
        this.state = {
            visibleModal: true,
        };

        // this.componentWillMount = this.componentWillMount.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    componentDidMount() {
        //
    }

    render() {
        return (
            <Modal
              isVisible={this.state.visibleModal}
              onBackdropPress={this.props.functions.closeTourModal}
              style={{width: '100%', height: '100%', position: 'absolute', alignSelf: 'center'}}
              >
              <Swiper
                style={{alignSelf: 'center'}}
                showsButtons={false}
                paginationStyle={{position: 'absolute', bottom: 40}}
                loop={false}
              >
              <View style={styles.slide1}>
                <Text style={styles.text}>drop nodes</Text>
                <Text style={styles.subtitle}>tell people about things happening nearby</Text>
              </View>
              <View style={styles.slide2}>
                <Text style={styles.text}>send DMs</Text>
                <Text style={styles.subtitle}>message users anonymously</Text>
              </View>
              <View style={styles.slide3}>
                <Text style={styles.text}>track users</Text>
                <Text style={styles.subtitle}>track other users when you want.</Text>
              </View>
              <View style={styles.slide3}>
                <Button
                  title='close'
                  containerStyle={{width: 100}}
                  onPress={this.props.functions.closeTourModal}
                />
              </View>
            </Swiper>
          </Modal>
        );
    }
}

// @ts-ignore
const styles = StyleSheet.create({
  wrapper: {
  },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
    height: '50%',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9',
  },
  text: {
    color: '#fff',
    position: 'absolute',
    top: 50,
    fontSize: 30,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fff',
    position: 'absolute',
    bottom: 100,
    fontSize: 18,
    paddingHorizontal: 20,
    fontWeight: 'bold',
  },
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
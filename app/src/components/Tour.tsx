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
                style={{alignSelf: 'center', flex: 1, height: '100%', flexDirection: 'row', justifyContent: 'center'}}
                showsButtons={false}
                paginationStyle={{position: 'absolute', bottom: '10%'}}
                loop={false}
              >
              <View style={styles.slide}>
                <Text style={styles.header}>see something interesting in your neighborhood?</Text>
                <Text style={styles.text}>drop a node!</Text>
                <Text style={styles.text}>whether it's a yard sale, lost dog, or free couch, it's easy to stay in touch with your neighborhood on sudo.</Text>
                {/* <Text style={styles.subtitle}>no accounts. always anonymous.</Text> */}
                <Button
                  title='get started'
                  titleStyle={{color: 'white', fontWeight: 'bold', fontSize: 24}}
                  buttonStyle={{backgroundColor: '#F03A47', padding: 10, borderWidth: .5, borderColor: 'gray', borderRadius: 0}}
                  containerStyle={{position: 'absolute', width: '100%', bottom: 15, opacity: .9}}
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
  slide: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#006494',
  },
  header: {
    width: '90%',
    marginTop: 75,
    alignSelf: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: 24,
  },
  text: {
    width: '90%',
    marginTop: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: 24,
  },
  subtitle: {
    width: '90%',
    paddingTop: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: 24,
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
    backgroundColor: '#006494',
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
    backgroundColor: '#006494',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
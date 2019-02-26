import React, { Component } from 'react';
// @ts-ignore
import { View, StyleSheet, Text, TextInput, ActivityIndicator } from 'react-native';
import { Button, Icon } from 'react-native-elements';
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
                paginationStyle={{position: 'absolute', bottom: '15%'}}
                loop={false}
              >
              <View style={styles.slide}>
                <Icon
                  name='lock'
                  type='feather'
                  size={72}
                  color={'#F6F4F3'}
                  containerStyle={{paddingVertical: 40}}
                />
                <Text style={styles.text}>get a live feed of what people are saying around you</Text>
                <Text style={styles.text}>upvote and downvote nodes</Text>
                <Text style={styles.text}>send private messages and track users</Text>
                <Text style={styles.subtitle}>no accounts. always anonymous.</Text>
                <Button
                  title='continue'
                  titleStyle={{color: '#F6F4F3', fontWeight: 'bold', fontSize: 24}}
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

  text: {
    width: '90%',
    paddingVertical: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    color: '#F6F4F3',
    fontSize: 24,
  },
  subtitle: {
    width: '90%',
    paddingTop: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    color: '#F6F4F3',
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
    backgroundColor: '#F6F4F3',
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
    backgroundColor: '#F6F4F3',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
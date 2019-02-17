import React, { Component } from 'react';
// @ts-ignore
import { View, StyleSheet, Text, TextInput, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-elements';
import Snackbar from 'react-native-snackbar';

import Modal from 'react-native-modal';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';
import Logger from '../services/Logger';

interface IProps {
    functions: any;
    wallet: string;
    toUser: string;
    balanceUSD: number;
}

interface IState {
    visibleModal: boolean;
    paymentAmount: number;
    isLoading: boolean;
}

export default class PaymentModal extends Component<IProps, IState> {
    // @ts-ignore
    private action: string;

    constructor(props: IProps) {
        super(props);
        this.state = {
            visibleModal: true,
            isLoading: false,
            paymentAmount: 0,
        };

        // this.componentWillMount = this.componentWillMount.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.sendPayment = this.sendPayment.bind(this);
        this.setPaymentAmount = this.setPaymentAmount.bind(this);
    }

    componentDidMount() {
        //
    }

    async sendPayment() {
      await this.setState({isLoading: true});
      let walletPrivateKey = await AuthService.getWallet();
      let currentUUID = await AuthService.getUUID();

      let requestBody: any =  {
        'private_key': walletPrivateKey,
        'rcpt_address': this.props.wallet,
        'amt': this.state.paymentAmount,
      };

      Logger.trace(`PaymentModal.sendPayment - sending ${JSON.stringify(requestBody)} `);

      let response: any = await ApiService.SendTransactionAsync(requestBody);
      Logger.trace(`PaymentModal.sendPayment - response ${JSON.stringify(response)} `);

      let txHash = undefined;
      if (response !== undefined) {
        // Check if we got a tx hash back from /sendTransaction
        txHash = response.tx_hash;
        if (txHash !== undefined) {
          let result =  await AuthService.storeTransaction(txHash);
          if (result === true) {
            Logger.trace(`PaymentModal.sendPayment - stored new transaction, sending push.`);

            requestBody = {
              'from_user': currentUUID,
              'to_user': this.props.toUser,
              'action': 'send_tx',
              'tx_hash': txHash,
            };

            response = await ApiService.ShareTxAsync(requestBody);
            // TODO: add error handling here
          }
        }
      }

      await this.setState({ isLoading: false, visibleModal: false });

      Snackbar.show({
        title: `Sent funds to ${this.props.wallet} successfully.`,
        duration: Snackbar.LENGTH_SHORT,
      });
    }

    async setPaymentAmount(amount) {
      try {

        if (amount === '') {
          return;
        }

        await this.setState({paymentAmount: parseFloat(amount)});
      } catch (error) {
        // Ignore
        // The only reason this would fail is if the component unmounted
      }
    }

    render() {
        return (
            <Modal
              isVisible={this.state.visibleModal}
              onBackdropPress={this.props.functions.closePaymentModal}
              >
              <View style={styles.modalContent}>
                <Text style={{fontWeight: 'bold', fontSize: 18}}>send payment to</Text>
                <Text style={{alignSelf: 'center', paddingVertical: 20}}>{this.props.wallet}</Text>
                {
                  !this.state.isLoading ?
                  <View style={{width: '70%', height: 40, backgroundColor: 'rgba(192,192,192, 0.5)', borderRadius: 5}}>
                  <TextInput
                    returnKeyType='done'
                    multiline={false}
                    keyboardType={'number-pad'}
                    style={{padding: 10, fontSize: 14}}
                    placeholder={'enter a payment in USD...'}
                    onChangeText={text => this.setPaymentAmount(text)}
                    value={this.state.paymentAmount.toString() }
                  />
                  </View>
                  :
                  <View style={{width: 50, height: 50}}>
                    <ActivityIndicator size='large' />
                  </View>
                }
                <Button style={styles.fullWidthButton}
                    buttonStyle={styles.buttonStyle}
                    titleStyle={{
                        'color': 'black',
                        'fontWeight': 'bold',
                    }}
                    onPress={ async () => {
                      if ( this.state.paymentAmount === 0) {
                        Snackbar.show({
                          title: `enter an amount greater than zero`,
                          duration: Snackbar.LENGTH_SHORT,
                        });

                        return;
                      }

                      if ( this.state.paymentAmount > this.props.balanceUSD) {
                        Snackbar.show({
                          title: `you don't have enough funds`,
                          duration: Snackbar.LENGTH_SHORT,
                        });

                        return;
                      }
                      await this.sendPayment();
                    }}
                    loading={false}
                    disabled={this.state.isLoading}
                    disabledStyle={{backgroundColor: 'lightgray', borderColor: 'black', borderWidth: .5}}
                    // loadingStyle={}
                    title='confirm'
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
                        this.props.functions.closePaymentModal();
                    } }
                    loading={false}
                    disabled={false}
                    // loadingStyle={}
                    title='cancel'
                    icon={{name: 'x', type: 'feather', color: 'rgba(51, 51, 51, 0.8)'}}
                    iconRight
                    />
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
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
});
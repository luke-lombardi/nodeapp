import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
// @ts-ignore
import MapView, { Marker}   from 'react-native-maps';

import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { Icon } from 'react-native-elements';
import Modal from 'react-native-modal';
import moment from 'moment';

interface IProps {
  transactionList: any;
  functions: any;
  txHash: any;
  wallet: any;
}

interface IState {
  visibleModal: boolean;
  data: any;
  date: any;
}

export class TransactionDetail extends Component<IProps, IState> {
  txHash: any;

  constructor(props: IProps) {
    super(props);

    this.state = {
      visibleModal: true,
      data: undefined,
      date: '',
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.getTransactionDetails = this.getTransactionDetails.bind(this);
    this.getTime = this.getTime.bind(this);
  }

  componentWillMount() {
    this.getTransactionDetails();
  }

  async getTransactionDetails() {
    let transactionList = this.props.transactionList;
    let txHash = this.props.txHash;
    let transaction = transactionList.transactions[txHash];

    let txDate = this.getTime(transaction.timestamp * 1000);

    await this.setState({
      data: transaction,
      date: txDate,
    });

  }

  getTime(timestamp) {
    let easternTime = moment(timestamp).utcOffset(14);

    // make sure it does not return a date that is ahead of the current date
    timestamp = moment(easternTime).max(moment(easternTime));

    let parsedTimestamp = moment(timestamp).calendar();

    return parsedTimestamp;
  }

  render() {
    return (
      <Modal
        isVisible={this.state.visibleModal}
        onBackdropPress={this.props.functions.closeDetailModal}
      >
      <View style={styles.modalContent}>
        <View style={styles.statusIcon}>
          {
            this.state.data.status === 1 ?
            <Icon
              size={40}
              name='check-circle'
              type='feather'
              color='green' />
            :
            <Icon
              size={40}
              name='alert-circle'
              type='feather'
              color='orange' />
          }
        </View>
        <View style={styles.transactionDetails}>

        { this.props.wallet.address === this.state.data.from  &&
        <Text style={styles.amountDescription}>You Sent</Text>
        }

        { this.props.wallet.address !== this.state.data.from  &&
                <Text style={styles.amountDescription}>You Received</Text>
        }

        <Text style={styles.amount}>
          ${Math.trunc(this.state.data.amt)} USD
        </Text>
        </View>
        <View style={styles.transactionFieldTop}>
          <Text style={{alignSelf: 'flex-start', fontWeight: 'bold'}}>From</Text>
          <Text ellipsizeMode={'tail'} numberOfLines={1} style={{maxWidth: 200}}>{this.state.data.from}</Text>
        </View>
        <View style={styles.transactionFieldTop}>
          <Text style={{alignSelf: 'flex-start', fontWeight: 'bold'}}>To</Text>
          <Text ellipsizeMode={'tail'} numberOfLines={1} style={{maxWidth: 200}}>{this.state.data.to}</Text>
        </View>
        <View style={styles.transactionFieldBottom}>
          <Text style={{alignSelf: 'flex-start', fontWeight: 'bold'}}>Date</Text>
          <Text ellipsizeMode={'tail'} numberOfLines={1} style={{maxWidth: 200}}>{ this.state.date } </Text>
        </View>
      </View>
      </Modal>
    );
  }
}

// @ts-ignore
function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    transactionList: state.transactionList,
    wallet: state.wallet,
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionDetail);

const styles = StyleSheet.create({
  container: {
  flex: 1,
  },
  statusIcon: {
    alignSelf: 'center',
  },
  transactionDetails: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  transactionFieldTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'lightgray',
  },
  transactionFieldBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'lightgray',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  amountDescription: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingTop: 10,
  },
  amount: {
    fontSize: 20,
    paddingVertical: 5,
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

import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
// @ts-ignore
import MapView, { Marker}   from 'react-native-maps';


import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';
import { Icon } from 'react-native-elements';


interface IProps {
  transactionHash: any;
  transactionList: any;
  navigation: any;
  userRegion: any;
}

interface IState {
  topic: string;
  userRegion: any;
  isLoading: boolean;
  uuid: string;
  private: boolean;
  ttl: number;
  data: any;
}

export class TransactionDetail extends Component<IProps, IState> {
  txHash: any;

  constructor(props: IProps) {
    super(props);

    this.state = {
      topic: '',
      userRegion: {},
      isLoading: false,
      uuid: '',
      private: false,
      ttl: 12.0,
      data: undefined,
    };

    this.componentWillMount = this.componentWillMount.bind(this);
    this.getTransactionDetails = this.getTransactionDetails.bind(this);
  }

  componentWillMount() {
    this.getTransactionDetails();
  }

  async getTransactionDetails() {
    let transactionList = this.props.transactionList;
    let txHash = this.props.navigation.getParam('txHash', '');
    let transaction = transactionList.transactions[txHash];

    await this.setState({
      isLoading: false,
      data: transaction,
    });
  }

  render() {
    let amt = Math.trunc(this.state.data.amt);
    return (
      <View style={styles.container}>
        <View style={styles.statusIcon}>
          {
            this.state.data.status === 1 ?
            <Icon
              containerStyle={{top: '35%'}}
              size={56}
              name='check-circle'
              type='feather'
              color='green' />
            :
            <Icon
              containerStyle={{top: '35%'}}
              size={56}
              name='alert-circle'
              type='feather'
              color='orange' />
          }
        </View>
        <View style={styles.transactionDetails}>
        <Text style={styles.amountDescription}>You Recieved</Text>
        <Text style={styles.amount}>
          ${amt} USD
        </Text>
        </View>
        <View style={styles.transactionFields}>
          <Text style={{alignSelf: 'flex-start', fontWeight: 'bold'}}>From</Text>
          <Text ellipsizeMode={'tail'} numberOfLines={1} style={{maxWidth: 200}}>{this.state.data.from}</Text>
        </View>
        <View style={styles.transactionFields}>
          <Text style={{alignSelf: 'flex-start', fontWeight: 'bold'}}>Date</Text>
          <Text ellipsizeMode={'tail'} numberOfLines={1} style={{maxWidth: 200}}>{this.state.data.from}</Text>
        </View>
      </View>
    );
  }
}

// @ts-ignore
function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    transactionList: state.transactionList,
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
    top: 20,
    alignSelf: 'center',
    height: '20%',
    width: '70%',
    borderRadius: 20,
  },
  transactionDetails: {
    top: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
  },
  transactionFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: 50,
    width: '100%',
    paddingHorizontal: 25,
    paddingVertical: 10,
    height: 40,
    borderTopWidth: 1,
    borderTopColor: 'lightgray',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  amountDescription: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  amount: {
    fontSize: 20,
  },
});

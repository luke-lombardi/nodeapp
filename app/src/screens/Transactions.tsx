import React, { Component } from 'react';
import { ScaledSheet } from 'react-native-size-matters';

// @ts-ignore
import { View, FlatList, StyleSheet, Text, Alert, Animated, Clipboard, TextInput, TouchableOpacity, KeyboardAvoidingView, Keyboard, AsyncStorage, TouchableHighlight } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
// import PlaidAuthenticator from 'react-native-plaid-link';

// const PLAID_CLIENT_ID = '5be83d9fd4530d0014d4a287';
// const PLAID_PUBLIC_KEY = '5a051f20478de47fc55b0e33ffa325';
// const PLAID_SECRET = '5a051f20478de47fc55b0e33ffa325';

// const PUBLIC_TOKEN = 'public-development-e19bf79a-7af2-4538-abd8-3c8ab322dfc4';

// @ts-ignore
import Snackbar from 'react-native-snackbar';
import Spinner from 'react-native-loading-spinner-overlay';

// Redux imports
import IStoreState from '../store/IStoreState';
import { connect, Dispatch } from 'react-redux';

// Services
import NavigationService from '../services/NavigationService';

// @ts-ignore
import moment from 'moment';

moment.locale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s:  'seconds',
    ss: '%ss',
    m:  'a minute',
    mm: '%dm',
    h:  'an hour',
    hh: '%dh',
    d:  'a day',
    dd: '%dd',
    M:  'a month',
    MM: '%dM',
    y:  'a year',
    yy: '%dY',
  },
});

import { ConfigGlobalLoader } from '../config/ConfigGlobal';
import { TransactionDetail } from '../components/TransactionDetail';

interface IProps {
    navigation: any;
    functions: any;
    transactionList: any;
    wallet: any;
}

interface IState {
    data: any;
    plaidToken: any;
    isLoading: boolean;
    detailModalVisible: boolean;
    txHash: any;
}

export class Transactions extends Component<IProps, IState> {
  // @ts-ignore
  private readonly configGlobal = ConfigGlobalLoader.config;

  // TODO: figure out a smarter way to do this
  // @ts-ignore
  static navigationOptions = ({ navigation }) => {
    // const { params = {} } = navigation.state;
    return {
      headerStyle: {backgroundColor: '#006494', height: 50},
      headerTitleStyle: { color: 'white', fontSize: 22, fontWeight: 'bold'},
        title: 'transactions',
        headerLeft:
            <Icon
            name='chevron-left'
            type='feather'
            containerStyle={{padding: 5}}
            size={30}
            underlayColor={'#006494'}
            color={'#ffffff'}
            onPress={ () => { NavigationService.reset('Map', {}); }}
            />,
      };
  }

  constructor(props: IProps) {
    super(props);

    this.state = {
        data: [],
        isLoading: true,
        txHash: undefined,
        detailModalVisible: false,
        plaidToken: undefined,
    };

    this._renderItem = this._renderItem.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);

    this.loadTransactions = this.loadTransactions.bind(this);
    this.showDetailModal = this.showDetailModal.bind(this);
    this.closeDetailModal = this.closeDetailModal.bind(this);
    this.navigateToCamera = this.navigateToCamera.bind(this);
    this.copyAddress = this.copyAddress.bind(this);

    this.onMessage = this.onMessage.bind(this);
    this.getTime = this.getTime.bind(this);
    }

    navigateToCamera() {
      this.props.navigation.navigate('Camera', {} );
    }

    getTime(item) {
      let easternTime = moment(item.timestamp).utcOffset(14);
      let parsedTimestamp = moment(easternTime).calendar();
      return parsedTimestamp;
    }

    async showDetailModal(item) {
      let txHash = item.tx_hash;
      await this.setState({
        detailModalVisible: true,
        txHash: txHash,
      });
    }

    async closeDetailModal() {
      await this.setState({detailModalVisible: false});
    }

    // @ts-ignore
    _renderItem = ({item, index}) => (
      <ListItem
        onPress={ async () => await this.showDetailModal(item) }
        containerStyle={{
          minHeight: 100,
          backgroundColor: index % 2 === 0 ? '#f9fbff' : 'white',
        }}
        leftIcon={
          this.props.wallet.address === this.props.transactionList.transactions[item.tx_hash].from ?
          <Icon
            name='arrow-up-right'
            type='feather'
            color='orange' />
          :
          <Icon
            name='arrow-down-left'
            type='feather'
            color='green' />
        }
        title={
          <View>

          { this.props.wallet.address === this.props.transactionList.transactions[item.tx_hash].from  &&
          <Text style={{fontWeight: 'bold'}}>Sent Ethereum</Text>
          }

          { this.props.wallet.address !== this.props.transactionList.transactions[item.tx_hash].from  &&
          <Text style={{fontWeight: 'bold'}}>Received Ethereum</Text>
          }

          </View>
        }
        rightTitle={
          <View style={styles.titleView}>
          <View style={{alignSelf: 'flex-start', alignItems: 'flex-end'}}>
          <Text numberOfLines={1} ellipsizeMode={'tail'} style={[styles.ratingText, {paddingTop: index === 0 ? 5 : 0}]}>${parseFloat(item.amt).toFixed(2)}</Text>
          </View>
          </View>
        }
        rightSubtitle={
          <View style={{alignSelf: 'flex-end'}}>
          <Text style={{fontSize: 10, right: 1}}>USD</Text>
          </View>
        }
        subtitle={
          <View style={{flexDirection: 'column'}}>
          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={{fontSize: 14, color: 'gray', width: '100%', alignSelf: 'flex-start'}}>
            {item.tx_hash}
          </Text>
          </View>
        }
      />
    )

    componentWillMount () {
      //
    }

    componentDidMount() {
      this.getTransactions();
      //this.loadTransactions();
    }

    componentWillUnmount() {
      //
    }

    // @ts-ignore
    componentWillReceiveProps(newProps: any) {
      this.componentDidMount();
    }

    async copyAddress() {
      Clipboard.setString(this.props.wallet.address);
      Snackbar.show({
        title: `Copied address to clipboard.`,
        duration: Snackbar.LENGTH_SHORT,
      });
    }

    async loadTransactions() {
      let transactionList = this.props.transactionList;

      let data = [];
      if (transactionList !== []) {
        let currentTransactions = transactionList.transactions;
        for (let txHash in currentTransactions) {
          if (currentTransactions.hasOwnProperty(txHash)) {
            currentTransactions[txHash].tx_hash = txHash;
            data.push(currentTransactions[txHash]);
          }
        }
      }

      await this.setState({
        isLoading: false,
        data: data,
      });
    }

    async onMessage(data) {

      console.log('oMessage....', data);
      console.log('metadata...', data.metadata);
      console.log('public token....', data.metadata.public_token);

      console.log('this.state.plaidToken.....', this.state.plaidToken);

      this.setState({plaidToken: data.metadata.public_token});
      console.log('got token', this.state.plaidToken);

      let requestBody = {
        token: this.state.plaidToken,
      };

      let result = await fetch(`http://localhost:3000`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('asking server for auth token....', result);
  }

    async getTransactions() {
      let result = await fetch('http://localhost:3000/transactions', {
        method: 'GET',
      });

      this.setState({data: result});
      console.log('got result', result);
    }

    render() {
      return (
      <View style={{flex: 1}}>
        {/* <PlaidAuthenticator
          onMessage={(data) => this.onMessage(data)}
          publicKey='5a051f20478de47fc55b0e33ffa325'
          env='development'
          product='auth,transactions'
          clientName='Smartshare'
          selectAccount={false}
        /> */}
      {
        this.state.detailModalVisible &&
        <TransactionDetail functions={{
          'closeDetailModal': this.closeDetailModal,
        }}
        txHash={this.state.txHash}
        transactionList={this.props.transactionList}
        wallet={this.props.wallet}
        />
      }
      {
        !this.state.plaidToken !== undefined &&
        <View style={styles.flatlist}>
          <FlatList
           data={this.state.data}
           renderItem={this._renderItem}
           keyExtractor={item => item.id}
           ListEmptyComponent={
            <View style={styles.nullContainer}>
            <Text style={styles.null}>no transactions.</Text>
            <Text style={styles.nullSubtitle}>you can find transactions here.</Text>
            </View>
      }
          />
          </View>
      }
          <Spinner
            visible={this.state.isLoading}
            textStyle={{color: 'rgba(44,55,71,1.0)'}}
          />
        </View>
      );
    }
  }

// @ts-ignore
function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
    wallet: state.wallet,
    transactionList: state.transactionList,
  };
}

// @ts-ignore
function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Transactions);

const styles = ScaledSheet.create({
  nodeListItem: {
    borderBottomWidth: .5,
    borderBottomColor: 'rgba(51, 51, 51, 0.1)',
    minHeight: 100,
    maxHeight: 120,
  },
  null: {
    fontSize: '22@s',
    color: 'gray',
    top: '40@vs',
    alignSelf: 'center',
  },
  nullSubtitle: {
    fontSize: '12@s',
    color: 'gray',
    top: '50@vs',
    paddingHorizontal: '10@vs',
    paddingVertical: '10@vs',
  },
  titleText: {
    color: 'black',
    fontSize: 16,
    paddingTop: 5,
  },
  iconContainer: {
    backgroundColor: 'white',
    bottom: 2,
    position: 'absolute',
    borderWidth: .5,
    marginHorizontal: 5,
    borderColor: 'rgba(220,220,220,1)',
    borderRadius: 30,
  },
  chatMessageContainer: {
    marginTop: -20,
    bottom: 10,
    paddingHorizontal: 10,
    width: '100%',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    backgroundColor: 'rgba(220,220,220,0.1)',
  },
  chatInput: {
    fontSize: 18,
    fontFamily: 'Avenir',
    overflow: 'hidden',
    paddingVertical: 10,
    paddingHorizontal: 10,
    textAlign: 'left',
    flexWrap: 'wrap',
    width: '100%',
    borderWidth: .5,
    borderColor: 'rgba(220,220,220,0.8)',
    borderRadius: 10,
    backgroundColor: 'white',
  },
  submitChatButton: {
    position: 'absolute',
    top: 10,
    bottom: 5,
  },
  inputContainer: {
  },
  titleView: {
    flexDirection: 'column',
    paddingTop: 5,
  },
  subtitleView: {
    flexDirection: 'row',
    paddingTop: 5,
  },
  ratingText: {
    color: 'green',
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    fontSize: 18,
    fontWeight: 'bold',
    width: '50%',
  },
  receiptText: {
    color: 'black',
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 5,
    width: '50%',
  },
  flatlist: {
    backgroundColor: 'white',
    flex: 1,
  },
  nullContainer: {
    flex: 1,
    top: '150@vs',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
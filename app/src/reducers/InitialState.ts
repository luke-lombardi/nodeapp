import IStoreState from '../store/IStoreState';

const InitialState: IStoreState = {
  nav: '' ,
  publicPersonList: [],
  publicPlaceList: [],
  privatePersonList: [],
  privatePlaceList: [],
  trackedNodeList: [],
  friendList: [],
  relationList: [],
  userRegion: {},
  notificationList: [],
  transactionList: [],
  wallet: {},
};

export default InitialState;
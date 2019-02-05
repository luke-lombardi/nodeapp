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
};

export default InitialState;
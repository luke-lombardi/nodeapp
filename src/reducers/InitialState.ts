import IStoreState from '../store/IStoreState';

const InitialState: IStoreState = {
  nav: '' ,
  loggedIn: false,
  publicPersonList: [],
  publicPlaceList: [],
  privatePersonList: [],
  privatePlaceList: [],
  groupList: [],
  friendList: [],
  userRegion: {},
};

export default InitialState;
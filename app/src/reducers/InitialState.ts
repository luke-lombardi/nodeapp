import IStoreState from '../store/IStoreState';

const InitialState: IStoreState = {
  nav: '' ,
  loggedIn: false,
  publicPersonList: [],
  publicPlaceList: [],
  privatePersonList: [],
  privatePlaceList: [],
  trackedNodeList: [],
  friendList: [],
  relationList: [],
  userRegion: {},
};

export default InitialState;
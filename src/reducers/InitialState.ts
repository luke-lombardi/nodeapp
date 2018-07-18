import IStoreState from '../store/IStoreState';

const InitialState: IStoreState = {
  nav: '' ,
  loggedIn: false,
  nodeList: [],
  visitedNodeList: [],
  userRegion: {},
};

export default InitialState;
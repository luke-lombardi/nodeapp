export default interface IStoreState {
  readonly nav: string;
  readonly loggedIn: boolean;
  readonly nodeList: Array<any>;
  readonly visitedNodeList: Array<any>;
  readonly userRegion: any;
}
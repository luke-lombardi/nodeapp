export default interface IStoreState {
  readonly nav: string;
  readonly loggedIn: boolean;
  readonly publicPersonList: Array<any>;
  readonly publicPlaceList: Array<any>;
  readonly privatePersonList: Array<any>;
  readonly privatePlaceList: Array<any>;
  readonly groupList: Array<any>;
  readonly userRegion: any;
}
export default interface IStoreState {
  readonly nav: string;
  readonly publicPersonList: Array<any>;
  readonly publicPlaceList: Array<any>;
  readonly privatePersonList: Array<any>;
  readonly privatePlaceList: Array<any>;
  readonly trackedNodeList: Array<any>;
  readonly friendList: Array<any>;
  readonly relationList: Array<any>;
  readonly userRegion: any;
  readonly notificationList: any;
  readonly transactionList: any;
}
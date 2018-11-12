import React from 'react';
import * as ReactDOM from 'react-dom';
import  { Component }  from 'react';

// Redux imports
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';
import IStoreState from '../../store/IStoreState';
import { PageChangedActionCreator } from '../../actions/NavActions';

// @ts-ignore
import { compose, withProps } from 'recompose';
// @ts-ignore
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';

interface IProps {
    readonly currentPage: string;
    readonly currentFilters: any;
    // Actions
    currentPageChanged?: (currentPage: string) => (dispatch: Dispatch<IStoreState>) => Promise<void>;
}

interface IState {
}

class MainMap extends Component<IProps, IState> {
    // @ts-ignore
    private apiService: ApiService;

    constructor(props: IProps) {
      super(props);
      // this.componentDidMount = this.componentDidMount.bind(this);
      // this.componentWillUnmount = this.componentWillUnmount.bind(this);
      // this.eventList = this.eventList.bind(this);
      this.state = {
      };
    }

    ReactDOM.render() {
        // const MainMap = withScriptjs(withGoogleMap(() =>
        //     <GoogleMap
        //         defaultCenter={someLatLng}
        //         defaultZoom={16}
        //         options={{disableDefaultUI: true}}>
        //     </GoogleMap>));

        // const loadingElement = <div/>
        // const containerElement = <div style={{height: '100vh'}}/>
        // const mapElement = <div style={{height: '100vh'}}/>
        // const map = <MainMap loadingElement={loadingElement}
        //                         containerElement={containerElement}
        //                         googleMapURL={googleMapURL}
        //                         mapElement={mapElement}/>

        return (
            <div>

            </div>
            );
    }

}

function mapStateToProps(state: IStoreState): IProps {
    return {
      currentPage: state.currentPage,
      currentFilters: state.currentFilters,
    };
  }

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
return {
    currentPageChanged: bindActionCreators(PageChangedActionCreator, dispatch),
};
}

// @ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MainMap));
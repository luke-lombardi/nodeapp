import * as React from 'react';
// @ts-ignore
import { hot } from 'react-hot-loader';
// @ts-ignore
import { withRouter } from 'react-router';

import './styles/App.css';

import Dashboard from './components/Dashboard';

// Redux imports
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
// @ts-ignore
import { bindActionCreators } from 'redux';
import IStoreState from './store/IStoreState';

import { ConfigGlobalLoader } from './services/config/ConfigGlobal';

interface IState {
}

interface IProps {
}

class App extends React.Component<IProps, IState> {
  // @ts-ignore
  private readonly configGlobal = ConfigGlobalLoader.config;

  constructor(props: IProps) {
    super(props);
  }

  public render() {
    return (
      <Dashboard/>
    );
  }

}

function mapStateToProps(state: IStoreState): IProps {
  // @ts-ignore
  return {
  };
}

function mapDispatchToProps(dispatch: Dispatch<IStoreState>) {
  return {
  };
}

// @ts-ignore
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));